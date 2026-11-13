"""Deterministic boundaries around model routing and retrieved source references."""
import re


def is_pure_greeting(message: str) -> bool:
    normalized = re.sub(r"[^\w\s]", "", message.casefold())
    normalized = " ".join(normalized.split())
    return normalized in {
        "hi", "hello", "hey", "salam", "salaam", "assalamu alaikum",
        "assalamualaikum", "assalam o alaikum", "as salam alaikum",
        "السلام علیکم", "السلام عليكم", "وعليكم السلام", "good morning",
        "good evening", "good afternoon",
    }


def select_route(message: str, predicted_intent: str) -> str:
    # Only a whole-message greeting may bypass retrieval. Never trust a broad
    # model classification to route a plan, confession or question to pleasantries.
    if is_pure_greeting(message):
        return "Chit-Chat"
    return "Emotional" if predicted_intent.strip().casefold() == "emotional" else "Fiqh/Knowledge"


def resolve_source_markers(reply: str, chunks: list[dict]) -> tuple[str, list[dict]]:
    """Map cited [S1] IDs to canonical metadata; never fabricate source names.

    This establishes source identity, not whether the source entails a claim.
    """
    used = set()

    def evidence_line(match):
        index = int(match.group(1)) - 1
        if not 0 <= index < len(chunks):
            return ""
        # The model chooses a source ID; quoted evidence is copied by the server,
        # never trusted as model-generated sacred text. Bound long records with
        # an explicitly marked excerpt, cutting only at a word boundary.
        text = " ".join(chunks[index]["text"].split())
        excerpt = text if len(text) <= 1200 else text[:1200].rsplit(" ", 1)[0]
        suffix = " (excerpt)" if len(excerpt) < len(text) else ""
        return f'• **[S{index + 1}]**: "{excerpt}"{suffix}'

    reply = re.sub(r'^\s*[•\-]\s*\*\*\[S(\d+)\]:?\*\*:?[^\n]*',
                   evidence_line, reply, flags=re.MULTILINE)

    def replace(match):
        index = int(match.group(1)) - 1
        if not 0 <= index < len(chunks):
            return "[unavailable source]"
        used.add(index)
        return chunks[index]["citation"]

    resolved = re.sub(r"\[S(\d+)\]", replace, reply)
    sources = [{"citation": chunk["citation"], "source": chunk["source"]}
               for i, chunk in enumerate(chunks) if i in used]
    return resolved, sources
