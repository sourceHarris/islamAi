"""
setup_db.py
-----------
Creates (or resets) the Hidayah PostgreSQL database and all 7 tables
defined in the FYP proposal.

Usage:
    # First-time setup / add missing tables (safe — no data loss):
    python setup_db.py

    # Full reset (WARNING: deletes ALL data):
    python setup_db.py --reset
"""

import sys
import argparse
from sqlalchemy import text

from database import (
    DATABASE_URL,
    SessionLocal,
    engine,
    create_tables,
    drop_and_recreate_tables,
    User,
    MoodLog,
    SpiritualChecklist,
    PrayerStreak,
    QuranStreak,
    PrivateDua,
    Milestone,
)


def verify_tables():
    """Query each table and print row counts to verify creation."""
    with SessionLocal() as db:
        tables = [
            ("users",                "SELECT COUNT(*) FROM users"),
            ("mood_logs",            "SELECT COUNT(*) FROM mood_logs"),
            ("spiritual_checklists", "SELECT COUNT(*) FROM spiritual_checklists"),
            ("prayer_streaks",       "SELECT COUNT(*) FROM prayer_streaks"),
            ("quran_streaks",        "SELECT COUNT(*) FROM quran_streaks"),
            ("private_dua_book",     "SELECT COUNT(*) FROM private_dua_book"),
            ("milestones",           "SELECT COUNT(*) FROM milestones"),
        ]
        print("\nTable Verification:")
        print(f"{'Table':<25} {'Rows':>6}")
        print("-" * 33)
        for name, sql in tables:
            try:
                count = db.execute(text(sql)).scalar()
                print(f"  {name:<23} {count:>6}")
            except Exception as e:
                print(f"  {name:<23} ERROR: {e}")


def main():
    parser = argparse.ArgumentParser(description="Hidayah DB Setup")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="DROP all tables and recreate them. ALL DATA WILL BE LOST.",
    )
    args = parser.parse_args()

    print(f"\nHidayah Database Setup")
    print(f"   URL: {DATABASE_URL}\n")

    if args.reset:
        confirm = input("This will DELETE all data. Type 'yes' to confirm: ")
        if confirm.strip().lower() != "yes":
            print("Aborted.")
            sys.exit(0)
        print("Dropping all tables...")
        drop_and_recreate_tables()
        print("All tables dropped and recreated.")
    else:
        print("Creating missing tables (existing tables unchanged)...")
        create_tables()
        print("Tables created / verified.")

    verify_tables()
    print("\nDatabase is ready. You can now start the backend server.\n")


if __name__ == "__main__":
    main()
