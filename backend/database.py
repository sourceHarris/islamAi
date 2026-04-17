"""
database.py
-----------
Complete SQLAlchemy schema for Hidayah — aligned with the FYP Proposal.

Tables implemented (per the Recommended Database Schema):
    1. users               — Registration numbers, names, emails, classes
    2. mood_logs           — Emotion detections linked to users (Weekly Analytics)
    3. spiritual_checklists— Daily spiritual obligations tracker
    4. prayer_streaks      — Prayer consistency (streak #1 of dual-streak system)
    5. quran_streaks       — Quran engagement (streak #2 of dual-streak system)
    6. private_dua_book    — Personalised Du'a entries per user
    7. milestones          — Islamic gamification achievements

Environment variables (set in .env):
    DATABASE_URL  — postgresql://user:password@host:port/hidayah_db
"""

import os
from datetime import date, datetime
from typing import List, Optional

from dotenv import load_dotenv
from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    create_engine,
    func,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    Session,
    mapped_column,
    relationship,
    sessionmaker,
)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

load_dotenv()

DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/hidayah_db",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ---------------------------------------------------------------------------
# Declarative Base
# ---------------------------------------------------------------------------

class Base(DeclarativeBase):
    pass


# ===========================================================================
# TABLE 1 — Users
# ===========================================================================

class User(Base):
    """
    Stores registration numbers, names, classes, and email addresses.
    Supports: User authentication and profile management.
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    registration_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True,
        comment="e.g. SE120222032"
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    class_name: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True, comment="e.g. BSSE-6A"
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True, comment="bcrypt hashed password"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )

    # ── Relationships ──────────────────────────────────────────────────────
    mood_logs: Mapped[List["MoodLog"]] = relationship(
        "MoodLog", back_populates="user", cascade="all, delete-orphan"
    )
    checklists: Mapped[List["SpiritualChecklist"]] = relationship(
        "SpiritualChecklist", back_populates="user", cascade="all, delete-orphan"
    )
    prayer_streak: Mapped[Optional["PrayerStreak"]] = relationship(
        "PrayerStreak", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    quran_streak: Mapped[Optional["QuranStreak"]] = relationship(
        "QuranStreak", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    duas: Mapped[List["PrivateDua"]] = relationship(
        "PrivateDua", back_populates="user", cascade="all, delete-orphan"
    )
    milestones: Mapped[List["Milestone"]] = relationship(
        "Milestone", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User reg={self.registration_number!r} name={self.name!r}>"


# ===========================================================================
# TABLE 2 — Mood_Logs
# ===========================================================================

class MoodLog(Base):
    """
    Records detected emotional states (e.g., anxiety or depression) linked to
    user IDs.
    Supports: Weekly mood analytics and personalized daily Ayahs.
    """

    __tablename__ = "mood_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    detected_emotion: Mapped[str] = mapped_column(
        String(50), nullable=False,
        comment="sad | anxious | neutral | joyful | angry | surprised | disgusted"
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )
    verse_recommended: Mapped[Optional[str]] = mapped_column(
        String(300), nullable=True, comment="Citation of the top FAISS-retrieved verse"
    )
    user_message: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Truncated user input — for analytics"
    )

    user: Mapped["User"] = relationship("User", back_populates="mood_logs")

    def __repr__(self) -> str:
        return (
            f"<MoodLog user_id={self.user_id} emotion={self.detected_emotion!r}"
            f" ts={self.timestamp}>"
        )


# ===========================================================================
# TABLE 3 — Spiritual_Checklists
# ===========================================================================

class SpiritualChecklist(Base):
    """
    Tracks daily obligations like five daily prayers and Quran interaction.
    Supports: Personalized evening spiritual accountability and reflection.
    """

    __tablename__ = "spiritual_checklists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    checklist_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)

    # ── Core Islamic Obligations ───────────────────────────────────────────
    fajr_prayed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    dhuhr_prayed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    asr_prayed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    maghrib_prayed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    isha_prayed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    read_quran: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # ── Optional Customizable Practices ───────────────────────────────────
    did_dhikr: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sunnah_prayers: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    charitable_act: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    mood_logged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Personal reflection note for the evening
    reflection_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="checklists")

    __table_args__ = (
        UniqueConstraint("user_id", "checklist_date", name="uq_user_checklist_date"),
    )

    @property
    def all_prayers_completed(self) -> bool:
        return all([
            self.fajr_prayed, self.dhuhr_prayed, self.asr_prayed,
            self.maghrib_prayed, self.isha_prayed
        ])

    def __repr__(self) -> str:
        return (
            f"<SpiritualChecklist user_id={self.user_id} date={self.checklist_date}"
            f" prayers_done={self.all_prayers_completed}>"
        )


# ===========================================================================
# TABLE 4 — Prayer_Streaks
# ===========================================================================

class PrayerStreak(Base):
    """
    Monitors consistency specifically for prayer habits.
    Supports: Dual streak tracking and psychological prayer reminders.
    One record per user (upserted daily by the app).
    """

    __tablename__ = "prayer_streaks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, unique=True   # one streak record per user
    )
    current_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_prayer_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    total_prayers_logged: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="prayer_streak")

    def __repr__(self) -> str:
        return (
            f"<PrayerStreak user_id={self.user_id}"
            f" current={self.current_streak} longest={self.longest_streak}>"
        )


# ===========================================================================
# TABLE 5 — Quran_Streaks
# ===========================================================================

class QuranStreak(Base):
    """
    Monitors daily engagement with the Quran.
    Supports: The second component of the dual streak tracking system.
    One record per user (upserted daily by the app).
    """

    __tablename__ = "quran_streaks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, unique=True
    )
    current_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_reading_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    total_sessions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="quran_streak")

    def __repr__(self) -> str:
        return (
            f"<QuranStreak user_id={self.user_id}"
            f" current={self.current_streak} longest={self.longest_streak}>"
        )


# ===========================================================================
# TABLE 6 — Private_Dua_Book
# ===========================================================================

class PrivateDua(Base):
    """
    Stores personal Du'as and prayers entered by the user.
    Supports: Customizable spiritual tools and personalized content.
    """

    __tablename__ = "private_dua_book"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )
    is_answered: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False,
        comment="User marks Du'a as answered — positive reinforcement feature"
    )

    user: Mapped["User"] = relationship("User", back_populates="duas")

    def __repr__(self) -> str:
        return (
            f"<PrivateDua user_id={self.user_id} title={self.title!r}"
            f" answered={self.is_answered}>"
        )


# ===========================================================================
# TABLE 7 — Milestones
# ===========================================================================

class Milestone(Base):
    """
    Tracks achievements and Islamic-themed progress markers.
    Supports: Gamification elements and comprehensive progress analytics.
    """

    __tablename__ = "milestones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    milestone_type: Mapped[str] = mapped_column(
        String(100), nullable=False,
        comment="e.g. '7_day_prayer_streak', '30_day_quran_streak', '100_duas'"
    )
    title: Mapped[str] = mapped_column(
        String(200), nullable=False,
        comment="e.g. 'Week of Devotion 🌟'"
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    icon: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True,
        comment="Emoji or icon identifier e.g. '🕌' '📖' '⭐'"
    )
    achieved_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )

    user: Mapped["User"] = relationship("User", back_populates="milestones")

    # Prevent duplicate milestones of the same type for the same user
    __table_args__ = (
        UniqueConstraint("user_id", "milestone_type", name="uq_user_milestone_type"),
    )

    def __repr__(self) -> str:
        return (
            f"<Milestone user_id={self.user_id} type={self.milestone_type!r}"
            f" title={self.title!r}>"
        )


# ---------------------------------------------------------------------------
# Session dependency (FastAPI Depends)
# ---------------------------------------------------------------------------

def get_db():
    """Yields a SQLAlchemy Session and guarantees closure after each request."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Table creation
# ---------------------------------------------------------------------------

def create_tables() -> None:
    """Create all tables that do not yet exist. Safe to call on every startup."""
    Base.metadata.create_all(bind=engine)


def drop_and_recreate_tables() -> None:
    """
    Drops ALL tables and recreates them fresh.
    Uses CASCADE to handle FK dependencies from old tables.
    WARNING: USE ONLY DURING DEVELOPMENT — all data will be lost.
    """
    from sqlalchemy import text
    with engine.begin() as conn:
        # Drop all known tables with CASCADE to handle FK deps from old schema
        conn.execute(text("""
            DROP TABLE IF EXISTS
                daily_checklists,
                user_moods,
                milestones,
                private_dua_book,
                quran_streaks,
                prayer_streaks,
                spiritual_checklists,
                mood_logs,
                users
            CASCADE
        """))
    Base.metadata.create_all(bind=engine)
