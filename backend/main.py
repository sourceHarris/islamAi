"""
main.py
-------
Hidayah FastAPI backend — production-ready entry point.

Sub-systems
-----------
1. FAISS index — built at startup from dataset.json using HuggingFace embeddings.
2. Emotion Detection — lightweight HuggingFace pipeline (j-hartmann/emotion-english-distilroberta-base).
3. /chat endpoint — emotion-aware RAG → LangChain → ChatOpenAI (temperature=0.0).
4. /sync_checklist endpoint — upserts a day's checklist from React Native frontend.
5. CORS — all origins allowed for local emulator compatibility.

Required environment variables (place in backend/.env):
    OPENAI_API_KEY      — your OpenAI API key
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
from langchain_groq import ChatGroq
import hashlib
from pydantic import BaseModel, EmailStr, Field
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session
from transformers import pipeline

import faiss

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

load_dotenv()

GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
DATASET_PATH: Path = Path(__file__).parent / "dataset.json"

if not GROQ_API_KEY:
    logger.warning(
        "GROQ_API_KEY is not set. The /chat endpoint will raise errors."
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


def _retrieve_context(query: str, top_k: int = 3) -> list[dict[str, Any]]:
    """Embed *query* and return the top-k metadata records from FAISS."""
    if _faiss_index is None or _embedding_model is None:
        return []

    q_embedding: np.ndarray = _embedding_model.encode(
        [query], convert_to_numpy=True, normalize_embeddings=True
    ).astype(np.float32)

    distances, indices = _faiss_index.search(q_embedding, top_k)
    results = []
    for idx in indices[0]:
        if 0 <= idx < len(_faiss_metadata):
            results.append(_faiss_metadata[idx])
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
# LangChain / OpenAI
# ---------------------------------------------------------------------------

# ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
_SYSTEM_PROMPT = """You are Hidayah AI, a specialized Islamic Assistant developed for a Final Year Project. Your goal is to provide accurate, evidence-based guidance using the Quran and Sunnah.

### OPERATIONAL RULES:
1. DIRECTNESS: Answer the user's question immediately. Do not spend time analyzing the user's "emotions" or "mood" (e.g., avoid saying "I sense you are feeling neutral") unless the user explicitly expresses distress or asks for emotional support. However, if the user is feeling {detected_emotion} and that emotion is 'sad', 'anxious', 'angry', or 'fearful', begin with a single compassionate sentence acknowledging their feeling before answering.
2. SOURCE INTEGRITY: Only cite sources that are directly relevant to the answer. If the retrieved context does not contain a specific ruling, clearly state: "I do not have a specific ruling on this in my database, but here are general Islamic principles that may apply."
3. VERBATIM QUOTES: When citing a Source, you must include the actual text of the Ayah or Hadith from the retrieved context. Do not just list the reference number at the bottom.
4. STRUCTURE:
   - Start with a concise answer.
   - Provide the **Evidence** section with bolded citations and verbatim text from the context.
   - Provide a **Context/Application** section to explain how the evidence applies to the question.
   - End with an Urdu translation of the key points.

### TONE:
Professional, respectful, and scholarly. Use "Peace be upon him (PBUH)" or "(S.A.W)" after mentioning the Prophet.

### CONSTRAINTS:
- Do not hallucinate references. You are strictly forbidden from generating Surah names, Ayah numbers, or Hadith references from your own memory.
- You must ONLY use citations exactly as they appear in the provided context block.
- If the FAISS retrieval returns irrelevant data, prioritize logical reasoning based on general Shariah principles (justice, harm prevention, honesty) rather than forcing a mismatched verse.
- You are strictly forbidden from issuing fatwas, legal rulings, or financial advice.
- Do not adopt historical personas or engage in roleplay."""

_HUMAN_PROMPT = (
    "Context (retrieved from verified Islamic database):\n{context}\n\n"
    "User question: {user_message}"
)

_prompt_template = ChatPromptTemplate.from_messages(
    [
        ("system", _SYSTEM_PROMPT),
        ("human", _HUMAN_PROMPT),
    ]
)

def _build_langchain_chain():
    """Returns a runnable LangChain chain using Groq (free) at temperature 0.0."""
    llm = ChatGroq(
        model="llama-3.1-8b-instant",   # same model your frontend already uses
        temperature=0.0,                 # ← HARDCODED — eliminates hallucinations
        groq_api_key=GROQ_API_KEY,
    )
    return _prompt_template | llm | StrOutputParser()


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
    2. Retrieve top-3 relevant Quran/Hadith chunks from FAISS.
    3. Inject emotion + context into the guardrailed LangChain prompt.
    4. Call Groq Llama 3 (temperature=0.0) and return the response.
    5. Log the interaction to user_moods table for weekly analytics.
    """
    # ── Step 1: Emotion detection ─────────────────────────────────────────────
    detected_emotion: str = detect_emotion(request.message)
    logger.info("User emotion detected: %s", detected_emotion)

    # ── Step 2: FAISS retrieval ───────────────────────────────────────────────
    retrieved_chunks = _retrieve_context(request.message, top_k=3)

    if retrieved_chunks:
        context_block = "\n\n".join(
            f"[{chunk['citation']}]\n{chunk['text']}"
            for chunk in retrieved_chunks
        )
    else:
        context_block = "No relevant context found in the database."

    logger.info("Retrieved %d chunks from FAISS.", len(retrieved_chunks))

    # ── Step 3 & 4: LangChain → Groq LLM ────────────────────────────────────
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GROQ_API_KEY is not configured on the server.",
        )

    try:
        chain = _build_langchain_chain()
        llm_reply: str = chain.invoke(
            {
                "detected_emotion": detected_emotion,
                "context": context_block,
                "user_message": request.message,
            }
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

    # ── Build sources list for the frontend ───────────────────────────────────
    sources = [
        {"citation": chunk["citation"], "source": chunk["source"]}
        for chunk in retrieved_chunks
    ]

    return ChatResponse(
        reply=llm_reply,
        detected_emotion=detected_emotion,
        sources=sources,
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

