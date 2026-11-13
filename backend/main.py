"""
main.py
-------
Hidayah FastAPI backend — production-ready entry point.

Sub-systems
-----------
1. FAISS index — built at startup from dataset.json using HuggingFace embeddings.
2. Emotion Detection — lightweight HuggingFace pipeline (j-hartmann/emotion-english-distilroberta-base).
3. /chat endpoint — emotion-aware RAG → LangChain → Groq or Gemini (temperature=0.0).
4. /sync_checklist endpoint — upserts a day's checklist from React Native frontend.
5. CORS — all origins allowed for local emulator compatibility.

Required environment variables (place in backend/.env):
    GROQ_API_KEY        — your Groq API key (primary provider)
    GROQ_MODEL          — optional model override (default: openai/gpt-oss-120b)
    GOOGLE_API_KEY      — alternative provider when the Groq key is absent
    DATABASE_URL        — postgresql://user:password@localhost:5432/hidayah_db
"""

from __future__ import annotations

import json
import logging
import os
from contextlib import asynccontextmanager
from datetime import date
from pathlib import Path
from typing import Any

import numpy as np
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from google.genai.types import HarmCategory, HarmBlockThreshold
from langchain_groq import ChatGroq
import hashlib
from pydantic import BaseModel, EmailStr, Field
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session
from transformers import pipeline

import faiss
from rag_policy import is_pure_greeting, select_route, resolve_source_markers

from database import MoodLog, Milestone, PrivateDua, PrayerStreak, QuranStreak, SpiritualChecklist, User, create_tables, get_db

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("hidayah")

# ---------------------------------------------------------------------------
# Env
# ---------------------------------------------------------------------------

load_dotenv(Path(__file__).parent / ".env", override=True)

GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "").strip()
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL: str = os.getenv("GROQ_MODEL", "").strip() or "openai/gpt-oss-120b"
HADITH_API_KEY: str = os.getenv("HADITH_API_KEY", "").strip()  # optional key for hadithapi.com
DATASET_PATH: Path = Path(__file__).parent / "dataset.json"

if HADITH_API_KEY:
    logger.info("HADITH_API_KEY is configured. Dynamic Hadith search is active.")
else:
    logger.info("HADITH_API_KEY is not set. Hadith search will fall back to local database.")

if not GOOGLE_API_KEY and not GROQ_API_KEY:
    logger.warning(
        "No LLM API key is set. Configure GROQ_API_KEY or GOOGLE_API_KEY."
    )

# ---------------------------------------------------------------------------
# Global singletons (populated at startup)
# ---------------------------------------------------------------------------

_embedding_model: SentenceTransformer | None = None
_faiss_index: faiss.IndexFlatL2 | None = None
_faiss_metadata: list[dict[str, Any]] = []   # parallel list to FAISS vectors
_emotion_pipeline = None                      # HuggingFace pipeline

# ---------------------------------------------------------------------------
# FAISS helper
# ---------------------------------------------------------------------------

def _build_faiss_index() -> None:
    """
    Reads dataset.json, embeds every entry's text field with
    sentence-transformers/all-MiniLM-L6-v2, and stores vectors in a FAISS
    IndexFlatL2 index (exact nearest-neighbour — fine for up to ~100 k docs).
    """
    global _embedding_model, _faiss_index, _faiss_metadata

    logger.info("Loading HuggingFace embedding model (all-MiniLM-L6-v2)…")
    _embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

    if not DATASET_PATH.exists():
        logger.error("dataset.json not found at %s — FAISS index will be empty.", DATASET_PATH)
        _faiss_index = faiss.IndexFlatL2(384)   # MiniLM embedding dim
        return

    with DATASET_PATH.open("r", encoding="utf-8") as fh:
        records: list[dict[str, Any]] = json.load(fh)

    if not records:
        logger.warning("dataset.json is empty — FAISS index will be empty.")
        _faiss_index = faiss.IndexFlatL2(384)
        return

    texts = [r["text"] for r in records]
    logger.info("Embedding %d documents…", len(texts))

    embeddings: np.ndarray = _embedding_model.encode(
        texts, convert_to_numpy=True, show_progress_bar=True, normalize_embeddings=True
    )

    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings.astype(np.float32))

    _faiss_index = index
    _faiss_metadata = records

    logger.info("FAISS index built successfully with %d vectors (dim=%d).", index.ntotal, dim)


# Maximum L2 distance for a chunk to be considered "relevant".
# With normalised embeddings, L2 ∈ [0, 2].
# 0 = identical, 2 = completely opposite. 1.0 is a generous relevance cut-off.
_FAISS_DISTANCE_THRESHOLD: float = 1.0


def _retrieve_context(query: str, top_k: int = 5) -> list[dict[str, Any]]:
    """
    Embed *query*, search FAISS, and return only chunks whose distance
    is below _FAISS_DISTANCE_THRESHOLD (i.e. genuinely relevant results).
    This prevents the LLM from receiving garbage context that triggers hallucination.
    """
    if _faiss_index is None or _embedding_model is None:
        return []

    q_embedding: np.ndarray = _embedding_model.encode(
        [query], convert_to_numpy=True, normalize_embeddings=True
    ).astype(np.float32)

    distances, indices = _faiss_index.search(q_embedding, top_k)
    results = []
    for dist, idx in zip(distances[0], indices[0]):
        if 0 <= idx < len(_faiss_metadata) and dist < _FAISS_DISTANCE_THRESHOLD:
            results.append(_faiss_metadata[idx])
            logger.debug("FAISS chunk accepted: idx=%d dist=%.4f", idx, dist)
        else:
            logger.debug("FAISS chunk rejected: idx=%d dist=%.4f (above threshold)", idx, dist)
    return results


# ---------------------------------------------------------------------------
# Emotion Detection helper
# ---------------------------------------------------------------------------

# Map from model labels → human-friendly label used in the system prompt
_EMOTION_LABEL_MAP: dict[str, str] = {
    "anger": "angry",
    "disgust": "disgusted",
    "fear": "anxious",
    "joy": "joyful",
    "neutral": "neutral",
    "sadness": "sad",
    "surprise": "surprised",
}


def _build_emotion_pipeline() -> None:
    global _emotion_pipeline
    logger.info(
        "Loading emotion detection model "
        "(j-hartmann/emotion-english-distilroberta-base)…"
    )
    _emotion_pipeline = pipeline(
        task="text-classification",
        model="j-hartmann/emotion-english-distilroberta-base",
        top_k=1,          # only need the top prediction
        device=-1,        # CPU
    )
    logger.info("Emotion pipeline ready.")


def detect_emotion(text: str) -> str:
    """
    Returns a human-friendly emotion string, e.g. 'sad', 'anxious', 'neutral'.
    Falls back to 'neutral' on any error.
    """
    if _emotion_pipeline is None:
        return "neutral"
    try:
        result = _emotion_pipeline(text[:512])   # truncate for safety
        # pipeline returns [[{'label': ..., 'score': ...}]] when top_k=1
        raw_label: str = result[0][0]["label"].lower()
        return _EMOTION_LABEL_MAP.get(raw_label, raw_label)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Emotion detection failed (%s) — defaulting to neutral.", exc)
        return "neutral"


# ---------------------------------------------------------------------------
# LangChain / hosted generation
# ---------------------------------------------------------------------------

# ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
_SYSTEM_PROMPT = """You are Hidayah AI — a precise, scholarly Islamic assistant built for an academic Final Year Project.
Your ONE purpose: give accurate, evidence-based Islamic answers sourced ONLY from the context block provided.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRICT SOURCE RULES (NON-NEGOTIABLE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. SOURCE IDENTIFIERS: Cite evidence ONLY using its provided marker, e.g. [S1] or [S2]. The server inserts the canonical citation. Never spell out or invent a Surah name, Ayah number, book name, or Hadith number yourself.
2. VERBATIM QUOTES: When you cite a source, copy the exact Arabic-translated text from the context. Never abbreviate or rephrase the sacred text.
3. RELEVANCE CHECK: Before citing, ask yourself — is this verse/hadith directly about the user's question? If the database does not contain the answer, do NOT guess based on general principles. Simply state: 'I don't have the specific ruling for this in my current knowledge base, please consult a scholar.'
4. NO OUTSIDE MEMORY: Even if you know a relevant Ayah or Hadith from your training data, you MUST NOT cite it unless it is present in the context block.
5. PERSONAL PLANS ARE NOT GREETINGS: Address the meaning of a user's plan or confession. Never automatically praise, congratulate, endorse or encourage an unknown action. If a word is ambiguous or misspelled, ask what they mean; when a likely reading concerns a serious religious matter, explain that interpretation conditionally and use only directly relevant retrieved evidence. For example, 'zinnah' may mean 'zina'; do not treat it as a positive outing. Be compassionate without shaming or assuming facts.
6. LIMIT INFERENCE: Prefer directly relevant, explicit evidence over indirect passages. Do not turn a specific passage about a circumstance, marriage or punishment into an unconditional personal ruling. Do not invent exceptions, penalties or eligibility rules. When a term is uncertain, start with 'If you mean ...' or ask a clarification question.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EMOTION-AWARE OPENING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- If detected_emotion is 'sad', 'anxious', 'angry', or 'fearful': Begin with ONE warm, compassionate sentence (e.g., "May Allah ease your heart..."). Then answer directly.
- If detected_emotion is 'neutral' or 'joyful': Answer immediately. Do NOT mention emotions.
The detected emotion is: {detected_emotion}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY RESPONSE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Answer:** [2-4 sentence direct answer to the question]

**Evidence from Quran & Sunnah:**
• **[S1]:** "[Verbatim text from the most directly relevant source]"
(Only include citations that exist in the context block)
Use ONE most directly relevant source by default. Add another only when needed for a different explicit part of the question. Never pad with tangential evidence. Do not discuss marriage eligibility, punishments, or other legal consequences unless the user explicitly asks about that topic. Answer only the concern actually raised.
If you need clarification, ask a concise question instead of forcing the full response structure or quoting unrelated evidence.

**Application:** [2-3 sentences explaining how this evidence answers the question in practice]

**Translation / ترجمہ:**
- DETECT the language of the user's message automatically.
- If the user wrote in English or Urdu: add a brief Urdu summary in Urdu script ONLY (ا ب پ ت ث ج چ ح خ د ذ ر ز ژ س ش ص ض ط ظ ع غ ف ق ک گ ل م ن و ہ ی). Label it **اردو ترجمہ:**
- If the user wrote in Arabic: reply fully in Arabic. No English needed.
- If the user wrote in French, Turkish, Indonesian, Malay, or any other language: reply ENTIRELY in that language (including Answer, Evidence, Application). Do NOT force English or Urdu.
- The goal: the user always reads in their own language.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOURCES RULE (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- The frontend will automatically display a 📚 Sources list based on what you quote above.
- You MUST ONLY quote citations you actually use in the 'Evidence from Quran & Sunnah' section.
- Do NOT mention, reference, or allude to any source you are not directly quoting verbatim.
- If you use 2 citations in Evidence, only those 2 will appear in Sources. Never pad with extras.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- NEVER issue a fatwa, legal ruling, or specific financial/medical ruling.
- NEVER roleplay as a historical figure or Islamic scholar.
- NEVER state something is "haram" or "halal" without a direct citation from the context.
- ALWAYS add "(PBUH)" or "(S.A.W)" after any mention of the Prophet Muhammad.
- TONE: Warm, scholarly, respectful. Like a knowledgeable Muslim friend, not a legal authority.
- LANGUAGE: Always respond in the same language the user wrote their question in."""

_HUMAN_PROMPT = (
    "Context (retrieved from verified Islamic database — USE ONLY THESE SOURCES):\n"
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
    "{context}\n"
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
    "User question: {user_message}"
)

_prompt_template = ChatPromptTemplate.from_messages(
    [
        ("system", _SYSTEM_PROMPT),
        ("human", _HUMAN_PROMPT),
    ]
)

_INTENT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "Classify as Emotional or Fiqh/Knowledge. Personal plans, confessions, religious conduct, misspellings and questions are substantive, even without a question mark. Output ONLY the category name."),
    ("human", "{user_message}")
])

_CHITCHAT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are Hidayah, an Islamic spiritual companion. Reply briefly to a greeting with a respectful greeting and ask how you can help with Islamic guidance. Do not comment on or approve any plans or actions."),
    ("human", "{user_message}")
])

# Safety settings — set to BLOCK_NONE so Gemini never refuses Islamic
# religious content (Quran verses, Hadith, worship topics, etc.).
_GEMINI_SAFETY_SETTINGS = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
}


def _get_llm():
    """Returns the configured LLM instance."""
    if GROQ_API_KEY:
        logger.info("Using Groq model %s as LLM.", GROQ_MODEL)
        return ChatGroq(
            model=GROQ_MODEL,
            temperature=0.0,
            max_tokens=1500,
            api_key=GROQ_API_KEY,
            reasoning_effort="low" if GROQ_MODEL.startswith("openai/gpt-oss-") else None,
        )
    elif GOOGLE_API_KEY and len(GOOGLE_API_KEY) > 20:
        logger.info("Groq key absent — using Google Gemini 1.5 Flash as fallback LLM.")
        return ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            temperature=0.0,
            google_api_key=GOOGLE_API_KEY,
            max_output_tokens=1500,
            top_p=1,
            top_k=1,
            safety_settings=_GEMINI_SAFETY_SETTINGS,
        )
    else:
        raise RuntimeError("No valid LLM API key available (GROQ_API_KEY or GOOGLE_API_KEY).")


def _build_langchain_chain():
    return _prompt_template | _get_llm() | StrOutputParser()

def _build_intent_chain():
    return _INTENT_PROMPT | _get_llm() | StrOutputParser()

def _build_chitchat_chain():
    return _CHITCHAT_PROMPT | _get_llm() | StrOutputParser()


# ── Keyword Extraction & External API Fetchers ─────────────────────────────

_KEYWORD_PROMPT = ChatPromptTemplate.from_messages([
    ("system", (
        'Create a search plan for an Islamic text database. Output ONLY JSON with two string keys: '
        '"query" (a concise English semantic search query) and "keyword" (one English word for lexical search). '
        'Translate non-English input and common Roman Urdu/misspellings without adding facts about the user. '
        'Preserve the user\'s question or concern, not greetings or incidental words. '
        'For zina/zinnah/zinaah, query "avoiding unlawful sexual intercourse fornication adultery" '
        'and keyword "fornication". For namaz use a query about prayer. '
        'Do not answer the question, invent a verse reference, or output markdown.'
    )),
    ("human", "{user_message}")
])


def _build_keyword_chain():
    return _KEYWORD_PROMPT | _get_llm() | StrOutputParser()


def _fetch_external_quran(keyword: str) -> list[dict[str, Any]]:
    """
    Queries Al-Quran Cloud Search API to find verses matching the keyword.
    Returns parsed list of standard chunk dicts in English (Sahih International).
    """
    if not keyword or len(keyword.strip()) < 2:
        return []
    
    import requests
    from urllib.parse import quote
    
    clean_keyword = keyword.strip()
    words = clean_keyword.split()
    
    # Try the full keyword query first
    queries_to_try = [clean_keyword]
    if len(words) > 1:
        # Also try the first word as a fallback
        queries_to_try.append(words[0])
        # Also try the last word as a fallback if the first fails
        queries_to_try.append(words[-1])
        
    for q in queries_to_try:
        url = f"https://api.alquran.cloud/v1/search/{quote(q)}/all/en.sahih"
        logger.info("Querying Al-Quran Cloud API for keyword: '%s'", q)
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                if data.get("code") == 200 and data.get("status") == "OK":
                    ayahs = data.get("data", {}).get("ayahs", [])
                    results = []
                    # Return at most 4 verses to avoid overloading context
                    for ayah in ayahs[:4]:
                        surah_info = ayah.get("surah", {})
                        surah_number = surah_info.get("number")
                        ayah_in_surah = ayah.get("numberInSurah")
                        surah_name = surah_info.get("englishName", "Unknown Surah")
                        
                        results.append({
                            "id": f"quran_cloud_{surah_number}_{ayah_in_surah}",
                            "source": "Quran",
                            "citation": f"Quran {surah_number}:{ayah_in_surah} (Surah {surah_name}, Ayah {ayah_in_surah})",
                            "text": ayah.get("text", "").strip()
                        })
                    if results:
                        logger.info("Successfully fetched %d verses from Al-Quran Cloud using keyword: '%s'", len(results), q)
                        return results
                    else:
                        logger.info("Al-Quran Cloud: keyword '%s' returned 0 ayahs. Trying next fallback.", q)
            else:
                logger.warning("Al-Quran Cloud returned HTTP %d for query: '%s'. Trying next fallback.", response.status_code, q)
        except Exception as exc:
            logger.error("Failed to fetch from Al-Quran Cloud for query '%s': %s", q, exc)
            
    return []


def _fetch_external_hadith(keyword: str) -> list[dict[str, Any]]:
    """
    Queries HadithAPI.com to find authentic hadiths matching the keyword.
    Only runs if HADITH_API_KEY is configured in the environment.
    """
    if not HADITH_API_KEY:
        logger.debug("HADITH_API_KEY not configured. Skipping Hadith API call.")
        return []
    
    if not keyword or len(keyword.strip()) < 2:
        return []
    
    import requests
    from urllib.parse import quote
    
    url = f"https://hadithapi.com/api/hadiths?apiKey={HADITH_API_KEY}&hadithEnglish={quote(keyword.strip())}&limit=3"
    logger.info("Querying HadithAPI for keyword: '%s'", keyword)
    try:
        response = requests.get(url, timeout=5)
        if response.status_code != 200:
            logger.warning("HadithAPI returned status code: %d", response.status_code)
            return []
            
        data = response.json()
        hadith_list = []
        if "hadiths" in data:
            hadith_list = data["hadiths"]
        elif "data" in data:
            if isinstance(data["data"], list):
                hadith_list = data["data"]
            elif isinstance(data["data"], dict) and "data" in data["data"]:
                hadith_list = data["data"]["data"]
        
        results = []
        for item in hadith_list[:3]:
            text = item.get("hadithEnglish") or item.get("english") or item.get("text")
            if not text:
                continue
                
            book = item.get("bookName") or item.get("book") or "Hadith"
            number = item.get("hadithNumber") or item.get("number") or "N/A"
            chapter = item.get("chapterName") or item.get("chapter") or ""
            chapter_info = f" (Chapter: {chapter})" if chapter else ""
            
            results.append({
                "id": f"hadith_api_{item.get('id') or number}",
                "source": "Hadith",
                "citation": f"{book} {number}{chapter_info}",
                "text": text.strip()
            })
            
        logger.info("Successfully fetched %d hadiths from HadithAPI.", len(results))
        return results
    except Exception as exc:
        logger.error("Failed to fetch from HadithAPI: %s", exc)
        return []


# ---------------------------------------------------------------------------
# Lifespan — startup / shutdown
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run heavy initialisation once at startup, clean up at shutdown."""
    logger.info("=== Hidayah backend starting up ===")

    # 1. Ensure database tables exist
    create_tables()
    logger.info("Database tables verified/created.")

    # 2. Build FAISS index from dataset.json
    _build_faiss_index()

    # 3. Load emotion detection pipeline
    _build_emotion_pipeline()

    logger.info("=== Hidayah backend ready ===")
    yield
    logger.info("=== Hidayah backend shutting down ===")


# ---------------------------------------------------------------------------
# FastAPI Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Hidayah API",
    description=(
        "Production backend for the Hidayah Islamic Spiritual Wellness App. "
        "Provides RAG-powered Islamic Q&A with emotion-aware guardrails, "
        "and daily spiritual checklist sync."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # All origins — required for local RN emulator
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User's message to Hidayah")
    # Student/app user identifier — e.g. SE120222032. Used for mood analytics logging.
    user_id: str = Field(default="anonymous", description="User identifier for analytics")


class ChatResponse(BaseModel):
    reply: str
    detected_emotion: str
    sources: list[dict[str, str]]   # citation + source for frontend display
    retrieval: dict[str, Any] = Field(default_factory=dict)


class ChecklistPayload(BaseModel):
    user_email: EmailStr = Field(..., description="User's email address (acts as identifier)")
    checklist_date: date = Field(..., description="Date the checklist applies to (YYYY-MM-DD)")
    # Individual prayers (matches new SpiritualChecklist schema)
    fajr_prayed: bool = False
    dhuhr_prayed: bool = False
    asr_prayed: bool = False
    maghrib_prayed: bool = False
    isha_prayed: bool = False
    read_quran: bool = False
    did_dhikr: bool = False
    sunnah_prayers: bool = False
    charitable_act: bool = False
    mood_logged: bool = False
    reflection_note: str | None = None


class ChecklistResponse(BaseModel):
    message: str
    checklist_id: int


# ── Auth schemas ──────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=4)
    # Optional fields — auto-generated if not provided
    registration_number: str | None = Field(None, description="e.g. SE120222032 — optional")
    class_name: str | None = Field(None, description="e.g. BSSE-6A — optional")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    registration_number: str
    name: str
    class_name: str | None
    email: str
    message: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

# ── Password hashing (sha256 — no external deps) ────────────────────────────────
def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def _verify_password(plain: str, hashed: str) -> bool:
    return hashlib.sha256(plain.encode()).hexdigest() == hashed


# ── Health check ────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"], summary="Root health check")
def root():
    """Returns a simple status message to confirm the API is running."""
    return {
        "status": "online",
        "app": "Hidayah API",
        "version": "1.0.0",
        "faiss_docs": _faiss_index.ntotal if _faiss_index else 0,
    }


# ── POST /register ────────────────────────────────────────────────────────────

@app.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Auth"],
    summary="Register a new user",
)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Creates a new user. registration_number is auto-generated if not provided."""
    import random

    # Auto-generate registration number from email prefix + random digits if not given
    reg_no = req.registration_number
    if not reg_no:
        prefix = req.email.split('@')[0][:8].upper()
        reg_no = f"{prefix}{random.randint(1000, 9999)}"

    # Ensure uniqueness
    if db.query(User).filter(User.registration_number == reg_no).first():
        reg_no = f"{reg_no}{random.randint(10, 99)}"
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="This email is already registered. Please login.")

    user = User(
        registration_number=reg_no,
        name=req.name,
        class_name=req.class_name,
        email=req.email,
        password_hash=_hash_password(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("Registered: %s (%s)", user.registration_number, user.email)
    return UserResponse(id=user.id, registration_number=user.registration_number,
                        name=user.name, class_name=user.class_name,
                        email=user.email, message=f"Welcome to Hidayah, {user.name}!")


# ── POST /login ───────────────────────────────────────────────────────────────

@app.post(
    "/login",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    tags=["Auth"],
    summary="Login with registration number and password",
)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Validates email + password. Returns full user profile for AsyncStorage session."""
    user: User | None = (
        db.query(User).filter(User.email == req.email).first()
    )
    if not user or not user.password_hash or not _verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password. Please check your details.")
    logger.info("Logged in: %s", user.email)
    return UserResponse(id=user.id, registration_number=user.registration_number,
                        name=user.name, class_name=user.class_name,
                        email=user.email, message=f"Welcome back, {user.name}!")


# ── POST /chat ────────────────────────────────────────────────────────────────

@app.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    tags=["AI Chat"],
    summary="Emotion-aware Islamic Q&A via RAG + LLM",
)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Full pipeline:
    1. Detect emotion from the user's message (HuggingFace).
    2. Retrieve top-5 relevant chunks from FAISS and enrich through external search.
    3. Inject emotion + context into the guardrailed LangChain prompt.
    4. Call the configured LLM (temperature=0.0) and return the response.
    5. Log the interaction to mood_logs for known users.
    """
    # ── Step 1: Intent classification & Emotion detection ─────────────────────
    detected_emotion: str = detect_emotion(request.message)
    logger.info("User emotion detected: %s", detected_emotion)

    if not GOOGLE_API_KEY and not GROQ_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No LLM API key configured. Set GOOGLE_API_KEY or GROQ_API_KEY in backend/.env.",
        )

    predicted_intent = "Fiqh/Knowledge"
    if not is_pure_greeting(request.message):
        try:
            predicted_intent = _build_intent_chain().invoke({"user_message": request.message}).strip()
        except Exception as exc:
            logger.warning("Intent classification failed: %s", exc)
    intent = select_route(request.message, predicted_intent)
    
    logger.info("User intent classified as: %s", intent)

    retrieved_chunks = []
    retrieval_info = {"route": intent, "used": False, "local_matches": 0,
                      "external_matches": 0, "context_count": 0}
    
    # ── Step 2: Route based on intent ─────────────────────────────────────────
    if "chit-chat" in intent.lower() or "chitchat" in intent.lower():
        logger.info("Bypassing RAG for Chit-Chat intent.")
        try:
            chitchat_chain = _build_chitchat_chain()
            llm_reply: str = chitchat_chain.invoke({"user_message": request.message})
        except Exception as exc:
            logger.error("LLM call failed: %s", exc, exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"LLM service error: {exc}",
            ) from exc
    else:
        # ── Hybrid retrieval for Fiqh/Knowledge and Emotional ─────────────────
        # Extract an English topic before retrieval, so misspellings and Roman
        # Urdu are not searched only in their original form.
        search_keyword = ""
        retrieval_query = request.message
        try:
            keyword_chain = _build_keyword_chain()
            plan_text = keyword_chain.invoke({"user_message": request.message}).strip()
            plan = json.loads(plan_text)
            if isinstance(plan.get("query"), str) and plan["query"].strip():
                retrieval_query = plan["query"].strip()[:500]
            keyword = plan.get("keyword", "")
            if isinstance(keyword, str):
                search_keyword = "".join(c for c in keyword if c.isalpha())[:50]
            logger.info("Extracted search keyword for external APIs: '%s'", search_keyword)
        except Exception as exc:
            logger.warning("Keyword extraction failed: %s", exc)

        retrieved_chunks = _retrieve_context(retrieval_query, top_k=5)
        retrieval_info.update(used=True, local_matches=len(retrieved_chunks))
            
        # 3. Query external APIs if we have a valid keyword
        external_chunks = []
        if search_keyword and len(search_keyword) >= 2:
            # Query Al-Quran Cloud API (Keyless)
            quran_results = _fetch_external_quran(search_keyword)
            external_chunks.extend(quran_results)
            
            # Query Hadith API (Optional & Keyed)
            hadith_results = _fetch_external_hadith(search_keyword)
            external_chunks.extend(hadith_results)
            
        # 4. Combine and deduplicate chunks by citation
        combined_chunks = []
        seen_citations = set()
        
        # Prioritise local FAISS matches first, then enrich with dynamic external API results
        for chunk in retrieved_chunks + external_chunks:
            citation_key = chunk.get("citation", "").strip().lower()
            if citation_key and citation_key not in seen_citations:
                seen_citations.add(citation_key)
                combined_chunks.append(chunk)
                
        retrieved_chunks = combined_chunks[:8]
        retrieval_info.update(external_matches=len(external_chunks), context_count=len(retrieved_chunks))

        if retrieved_chunks:
            context_block = "\n\n".join(
                f"[S{i}] {chunk['citation']}\n{chunk['text']}"
                for i, chunk in enumerate(retrieved_chunks, start=1)
            )
        else:
            context_block = "No relevant context found in the database."

        logger.info("Retrieved %d chunks from Hybrid Search (FAISS + External APIs).", len(retrieved_chunks))

        # ── LangChain → LLM ───────────────────────────────────────────────────
        try:
            if not retrieved_chunks:
                llm_reply = (
                    "I couldn't find directly relevant evidence in my Islamic knowledge base for that message. "
                    "Could you clarify what you mean or what guidance you need? "
                    "For a personal religious ruling, please consult a qualified scholar."
                )
            else:
                chain = _build_langchain_chain()
                llm_reply = chain.invoke(
                    {
                        "detected_emotion": detected_emotion,
                        "context": context_block,
                        "user_message": request.message,
                    }
                )
            # Guard against empty string responses
            if not llm_reply or not llm_reply.strip():
                logger.warning("LLM returned an empty response — using fallback message.")
                llm_reply = (
                    "I don't have the specific ruling for this in my current knowledge base, please consult a scholar."
                )
        except Exception as exc:
            logger.error("LLM call failed: %s", exc, exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"LLM service error: {exc}",
            ) from exc

    # ── Step 5: Log to mood_logs table (proposal: Weekly Analytics) ──────────
    top_verse = retrieved_chunks[0]["citation"] if retrieved_chunks else None
    try:
        # Look up the user by registration_number; fall back to anonymous log
        db_user = (
            db.query(User)
            .filter(User.registration_number == request.user_id)
            .first()
        )
        if db_user:
            mood_entry = MoodLog(
                user_id=db_user.id,
                detected_emotion=detected_emotion,
                verse_recommended=top_verse,
                user_message=request.message[:500],
            )
            db.add(mood_entry)
            db.commit()
            logger.info(
                "Mood logged: user=%s emotion=%s verse=%s",
                request.user_id, detected_emotion, top_verse,
            )
        else:
            logger.info(
                "Mood log skipped: user %s not in DB (anonymous session).",
                request.user_id,
            )
    except Exception as exc:
        db.rollback()
        logger.warning("Mood logging failed (non-fatal): %s", exc)

    # ── Build sources list — only include sources the LLM actually cited ──────
    llm_reply, sources = resolve_source_markers(llm_reply, retrieved_chunks)
    logger.info(
        "Sources filtered: %d used out of %d retrieved.",
        len(sources), len(retrieved_chunks)
    )

    return ChatResponse(
        reply=llm_reply,
        detected_emotion=detected_emotion,
        sources=sources,
        retrieval=retrieval_info,
    )


# ── POST /sync_checklist ──────────────────────────────────────────────────────

@app.post(
    "/sync_checklist",
    response_model=ChecklistResponse,
    status_code=status.HTTP_200_OK,
    tags=["Checklist"],
    summary="Sync a day's spiritual checklist from the React Native app",
)
def sync_checklist(payload: ChecklistPayload, db: Session = Depends(get_db)):
    """
    Accepts checklist data from the React Native frontend and persists it in
    PostgreSQL for long-term analytics. Matches the spiritual_checklists table.
    """

    # ── Get or create user by email ────────────────────────────────────────────
    user: User | None = db.query(User).filter(User.email == payload.user_email).first()
    if not user:
        user = User(
            email=payload.user_email,
            registration_number=payload.user_email.split("@")[0],
            name="App User",
        )
        db.add(user)
        db.flush()
        logger.info("Auto-created user for email: %s", payload.user_email)

    # ── Upsert SpiritualChecklist ──────────────────────────────────────────────
    checklist: SpiritualChecklist | None = (
        db.query(SpiritualChecklist)
        .filter(
            SpiritualChecklist.user_id == user.id,
            SpiritualChecklist.checklist_date == payload.checklist_date,
        )
        .first()
    )

    if checklist:
        checklist.fajr_prayed = payload.fajr_prayed
        checklist.dhuhr_prayed = payload.dhuhr_prayed
        checklist.asr_prayed = payload.asr_prayed
        checklist.maghrib_prayed = payload.maghrib_prayed
        checklist.isha_prayed = payload.isha_prayed
        checklist.read_quran = payload.read_quran
        checklist.did_dhikr = payload.did_dhikr
        checklist.sunnah_prayers = payload.sunnah_prayers
        checklist.charitable_act = payload.charitable_act
        checklist.mood_logged = payload.mood_logged
        checklist.reflection_note = payload.reflection_note
        action = "updated"
    else:
        checklist = SpiritualChecklist(
            user_id=user.id,
            checklist_date=payload.checklist_date,
            fajr_prayed=payload.fajr_prayed,
            dhuhr_prayed=payload.dhuhr_prayed,
            asr_prayed=payload.asr_prayed,
            maghrib_prayed=payload.maghrib_prayed,
            isha_prayed=payload.isha_prayed,
            read_quran=payload.read_quran,
            did_dhikr=payload.did_dhikr,
            sunnah_prayers=payload.sunnah_prayers,
            charitable_act=payload.charitable_act,
            mood_logged=payload.mood_logged,
            reflection_note=payload.reflection_note,
        )
        db.add(checklist)
        action = "created"

    try:
        db.commit()
        db.refresh(checklist)
    except Exception as exc:
        db.rollback()
        logger.error("DB commit failed: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist checklist data.",
        ) from exc

    logger.info("Checklist %s for user_id=%d on %s.", action, user.id, payload.checklist_date)

    return ChecklistResponse(
        message=f"Checklist {action} successfully for {payload.checklist_date}.",
        checklist_id=checklist.id,
    )

