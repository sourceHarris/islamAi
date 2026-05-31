"""
seed_full_dataset.py
---------------------
Downloads the COMPLETE Quran (6236 English verses) + Hisnul Muslim Du'as
+ major Hadith collections (Bukhari, Muslim, Tirmidhi, Abu Dawud, Ibn Majah)
from 100% free, no-API-key GitHub/CDN sources.

Sources:
  - Quran (Sahih International EN):
      https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/eng-islamiccenterofamerica.json
  - Hadith collections (fawazahmed0/hadith-api):
      https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-bukhari.json
      https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-muslim.json
      https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-tirmidhi.json
      https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-abudawud.json
      https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-ibnmajah.json

Usage:
    python seed_full_dataset.py

After running, restart the backend server so FAISS rebuilds with the new data.
"""

import json
import os
import re
import time
import requests

DATASET_PATH = os.path.join(os.path.dirname(__file__), "dataset.json")

# ─── Surah names for citation building ────────────────────────────────────────
SURAH_NAMES = {
    1: "Al-Fatihah", 2: "Al-Baqarah", 3: "Al-Imran", 4: "An-Nisa",
    5: "Al-Maidah", 6: "Al-Anam", 7: "Al-Araf", 8: "Al-Anfal",
    9: "At-Tawbah", 10: "Yunus", 11: "Hud", 12: "Yusuf",
    13: "Ar-Rad", 14: "Ibrahim", 15: "Al-Hijr", 16: "An-Nahl",
    17: "Al-Isra", 18: "Al-Kahf", 19: "Maryam", 20: "Ta-Ha",
    21: "Al-Anbiya", 22: "Al-Hajj", 23: "Al-Muminun", 24: "An-Nur",
    25: "Al-Furqan", 26: "Ash-Shuara", 27: "An-Naml", 28: "Al-Qasas",
    29: "Al-Ankabut", 30: "Ar-Rum", 31: "Luqman", 32: "As-Sajdah",
    33: "Al-Ahzab", 34: "Saba", 35: "Fatir", 36: "Ya-Sin",
    37: "As-Saffat", 38: "Sad", 39: "Az-Zumar", 40: "Ghafir",
    41: "Fussilat", 42: "Ash-Shura", 43: "Az-Zukhruf", 44: "Ad-Dukhan",
    45: "Al-Jathiyah", 46: "Al-Ahqaf", 47: "Muhammad", 48: "Al-Fath",
    49: "Al-Hujurat", 50: "Qaf", 51: "Adh-Dhariyat", 52: "At-Tur",
    53: "An-Najm", 54: "Al-Qamar", 55: "Ar-Rahman", 56: "Al-Waqiah",
    57: "Al-Hadid", 58: "Al-Mujadila", 59: "Al-Hashr", 60: "Al-Mumtahanah",
    61: "As-Saf", 62: "Al-Jumuah", 63: "Al-Munafiqun", 64: "At-Taghabun",
    65: "At-Talaq", 66: "At-Tahrim", 67: "Al-Mulk", 68: "Al-Qalam",
    69: "Al-Haqqah", 70: "Al-Maarij", 71: "Nuh", 72: "Al-Jinn",
    73: "Al-Muzzammil", 74: "Al-Muddaththir", 75: "Al-Qiyamah", 76: "Al-Insan",
    77: "Al-Mursalat", 78: "An-Naba", 79: "An-Naziat", 80: "Abasa",
    81: "At-Takwir", 82: "Al-Infitar", 83: "Al-Mutaffifin", 84: "Al-Inshiqaq",
    85: "Al-Buruj", 86: "At-Tariq", 87: "Al-Ala", 88: "Al-Ghashiyah",
    89: "Al-Fajr", 90: "Al-Balad", 91: "Ash-Shams", 92: "Al-Layl",
    93: "Ad-Duha", 94: "Ash-Sharh", 95: "At-Tin", 96: "Al-Alaq",
    97: "Al-Qadr", 98: "Al-Bayyinah", 99: "Az-Zalzalah", 100: "Al-Adiyat",
    101: "Al-Qariah", 102: "At-Takathur", 103: "Al-Asr", 104: "Al-Humazah",
    105: "Al-Fil", 106: "Quraysh", 107: "Al-Maun", 108: "Al-Kawthar",
    109: "Al-Kafirun", 110: "An-Nasr", 111: "Al-Masad", 112: "Al-Ikhlas",
    113: "Al-Falaq", 114: "An-Nas",
}

HADITH_COLLECTION_NAMES = {
    "eng-bukhari": "Sahih al-Bukhari",
    "eng-muslim": "Sahih Muslim",
    "eng-tirmidhi": "Jami at-Tirmidhi",
    "eng-abudawud": "Sunan Abi Dawud",
    "eng-ibnmajah": "Sunan Ibn Majah",
}


def fetch_json(url: str, retries: int = 3, timeout: int = 30) -> dict | list | None:
    """Fetch JSON from a URL with retry logic."""
    for attempt in range(retries):
        try:
            print(f"  Fetching: {url} (attempt {attempt + 1})")
            resp = requests.get(url, timeout=timeout)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            print(f"  Error: {e}")
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
    return None


def fetch_full_quran() -> list[dict]:
    """Download all 6236 Quran verses from fawazahmed0/quran-api (Sahih International)."""
    # Try Sahih International first, then fallback to Islamic Center of America
    urls_to_try = [
        "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/eng-sahihinter.json",
        "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/eng-islamiccenterofamerica.json",
        "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/eng-maududi.json",
    ]

    data = None
    for url in urls_to_try:
        data = fetch_json(url)
        if data:
            break

    if not data:
        print("  ERROR: Could not fetch any Quran translation. Skipping.")
        return []

    # The JSON structure is: { "quran": [ { "chapter": 1, "verse": 1, "text": "..." }, ... ] }
    verses_raw = data.get("quran") or data.get("chapters") or []
    if not verses_raw:
        print("  ERROR: Unexpected Quran JSON structure.")
        return []

    records = []
    skipped = 0
    for verse in verses_raw:
        chapter = verse.get("chapter") or verse.get("surah")
        ayah = verse.get("verse") or verse.get("numberInSurah")
        text = (verse.get("text") or "").strip()

        # Skip Bismillah duplicates and very short verses (1-2 words)
        if not text or len(text.split()) < 3:
            skipped += 1
            continue

        surah_name = SURAH_NAMES.get(chapter, f"Surah {chapter}")
        record_id = f"quran_{chapter}_{ayah}"
        citation = f"Quran {chapter}:{ayah} (Surah {surah_name}, Ayah {ayah})"

        records.append({
            "id": record_id,
            "source": "Quran",
            "citation": citation,
            "text": text,
        })

    print(f"  Parsed {len(records)} Quran verses (skipped {skipped} short/empty).")
    return records


def fetch_hadith_collection(edition: str, max_hadiths: int = 2000) -> list[dict]:
    """Download a Hadith collection from fawazahmed0/hadith-api."""
    collection_name = HADITH_COLLECTION_NAMES.get(edition, edition)
    url = f"https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/{edition}.json"

    data = fetch_json(url, timeout=60)
    if not data:
        print(f"  ERROR: Could not fetch {collection_name}.")
        return []

    # Structure: { "hadiths": [ { "hadithnumber": 1, "text": "..." }, ... ] }
    hadiths_raw = data.get("hadiths") or []
    if not hadiths_raw:
        print(f"  ERROR: Unexpected hadith JSON structure for {edition}.")
        return []

    records = []
    for hadith in hadiths_raw[:max_hadiths]:
        number = hadith.get("hadithnumber")
        text = (hadith.get("text") or "").strip()

        # Skip empty, very short, or repetitive entries
        if not text or len(text.split()) < 8:
            continue

        # Clean up common artifacts
        text = re.sub(r'\s+', ' ', text).strip()
        # Add PBUH notation if Prophet is mentioned
        text = re.sub(r'\bthe Prophet\b', 'the Prophet (PBUH)', text, count=1)

        record_id = f"hadith_{edition}_{number}"
        citation = f"{collection_name} {number}"

        records.append({
            "id": record_id,
            "source": "Hadith",
            "citation": citation,
            "text": text,
        })

    print(f"  Parsed {len(records)} hadiths from {collection_name}.")
    return records


def fetch_hisnul_muslim() -> list[dict]:
    """
    Download Hisnul Muslim (Fortress of the Muslim) Du'as from GitHub.
    Uses wafaaelmaandy/Hisn-Muslim-Json repository.
    """
    url = "https://cdn.jsdelivr.net/gh/wafaaelmaandy/Hisn-Muslim-Json@master/hisn_muslim.json"
    data = fetch_json(url)

    if not data:
        print("  Hisn-Muslim-Json not available, using built-in curated list.")
        return _get_builtin_duas()

    records = []
    # Expected structure: list of { "id": ..., "title": ..., "content": [ { "dua": ..., "translation": ... }, ... ] }
    chapters = data if isinstance(data, list) else data.get("chapters", [])
    for chapter in chapters:
        title = chapter.get("title") or chapter.get("name") or "Du'a"
        content_list = chapter.get("content") or chapter.get("duas") or []
        for i, item in enumerate(content_list):
            translation = (
                item.get("translation") or
                item.get("english") or
                item.get("meaning") or ""
            ).strip()
            arabic_text = (item.get("dua") or item.get("arabic") or "").strip()

            if not translation or len(translation.split()) < 4:
                continue

            combined = translation
            if arabic_text:
                combined = f"{translation} (Arabic: {arabic_text})"

            record_id = f"hisnul_muslim_{re.sub(r'[^a-z0-9]', '_', title.lower()[:30])}_{i}"
            records.append({
                "id": record_id,
                "source": "Hisnul Muslim",
                "citation": f"Hisnul Muslim ({title})",
                "text": combined,
            })

    if records:
        print(f"  Parsed {len(records)} Du'as from Hisnul Muslim.")
    else:
        print("  Unexpected JSON structure from Hisnul Muslim. Using built-in list.")
        return _get_builtin_duas()

    return records


def _get_builtin_duas() -> list[dict]:
    """Fallback comprehensive built-in Du'as from Hisnul Muslim."""
    return [
        {
            "id": "hisnul_muslim_waking_up",
            "source": "Hisnul Muslim",
            "citation": "Hisnul Muslim (Waking Up)",
            "text": "Du'a upon waking up: 'Al-hamdu lillahil-lathee ahyana ba'da ma amatana wa ilayhin-nushur.' (All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.) - This is the authentic Du'a for waking up in the morning.",
        },
        {
            "id": "hisnul_muslim_sleeping",
            "source": "Hisnul Muslim",
            "citation": "Hisnul Muslim (Before Sleeping)",
            "text": "Du'a before sleeping: 'Bismika Allahumma amutu wa ahya.' (In Your name O Allah, I die and I live.) Also recite Ayat al-Kursi before sleeping for protection throughout the night.",
        },
        {
            "id": "hisnul_muslim_morning_1",
            "source": "Hisnul Muslim",
            "citation": "Hisnul Muslim (Morning Supplication)",
            "text": "Morning Du'a: 'Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namut, wa ilayka an-nushur.' (O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the return.) Recite this every morning.",
        },
        {
            "id": "hisnul_muslim_morning_2",
            "source": "Hisnul Muslim",
            "citation": "Hisnul Muslim (Morning Dhikr)",
            "text": "Say in the morning 100 times: 'SubhanAllahi wa bihamdihi' (Glory and praise be to Allah). The Prophet (PBUH) said: Whoever says this 100 times in the morning will have his sins forgiven even if they are like the foam of the sea.",
        },
        {
            "id": "hisnul_muslim_anxiety",
            "source": "Hisnul Muslim",
            "citation": "Hisnul Muslim (Du'a for Anxiety and Grief)",
            "text": "Du'a for grief and anxiety: 'Allahumma inni abduka, ibnu abdika, ibnu amatika, nasiyati bi yadika, madin fiyya hukmuka, adlun fiyya qadauka, asaluka bi kulli ismin huwa laka...' (O Allah, I am Your servant, son of Your servant, son of Your female servant, my forelock is in Your hand, Your command over me is forever executed and Your decree over me is just. I ask You by every name belonging to You...) This Du'a is narrated in Musnad Ahmad.",
        },
        {
            "id": "hisnul_muslim_distress",
            "source": "Hisnul Muslim",
            "citation": "Hisnul Muslim (Du'a for Distress)",
            "text": "Du'a for distress: 'La ilaha illallahul-Azimul-Halim, la ilaha illallahu Rabbul-Arshil-Azim, la ilaha illallahu Rabbus-samawati wa Rabbul-ardi wa Rabbul-Arshil-Karim.' (There is none worthy of worship but Allah the Mighty, the Forbearing. There is none worthy of worship but Allah, Lord of the Magnificent Throne. There is none worthy of worship but Allah, Lord of the heavens and Lord of the earth, and Lord of the Noble Throne.) - Narrated by Bukhari and Muslim.",
        },
        {
            "id": "hisnul_muslim_entering_masjid",
            "source": "Hisnul Muslim",
            "citation": "Hisnul Muslim (Entering the Masjid)",
            "text": "Du'a for entering the Masjid: 'Bismillah, wassalatu wassalamu ala Rasulillah. Allahumma iftah li abwaba rahmatika.' (In the name of Allah, and prayers and peace be upon the Messenger of Allah. O Allah, open the gates of Your mercy for me.)",
        },
        {
            "id": "hisnul_muslim_leaving_masjid",
            "source": "Hisnul Muslim",
            "citation": "Hisnul Muslim (Leaving the Masjid)",
            "text": "Du'a for leaving the Masjid: 'Bismillah, wassalatu wassalamu ala Rasulillah. Allahumma inni asaluka min fadlik.' (In the name of Allah, and prayers and peace be upon the Messenger of Allah. O Allah, I ask You from Your favor.)",
        },
        {
            "id": "hisnul_muslim_food_before",
            "source": "Hisnul Muslim",
            "citation": "Hisnul Muslim (Before Eating)",
            "text": "Du'a before eating: Say 'Bismillah' (In the name of Allah) before eating. If you forget to say it at the beginning of the meal, then when you remember say: 'Bismillahi fi awwalihi wa akhirihi' (In the name of Allah at its beginning and at its end).",
        },
        {
            "id": "hisnul_muslim_food_after",
            "source": "Hisnul Muslim",
            "citation": "Hisnul Muslim (After Eating)",
            "text": "Du'a after eating: 'Alhamdu lillahil-ladhi at'amana wa saqana wa ja'alana Muslimin.' (All praise is for Allah Who has fed us and given us drink, and made us Muslims.)",
        },
        {
            "id": "hisnul_muslim_travel",
            "source": "Hisnul Muslim",
            "citation": "Hisnul Muslim (Du'a for Travel)",
            "text": "Du'a for travel: 'Allahu Akbar, Allahu Akbar, Allahu Akbar. SubhaanAlladhi sakhkhara lana hadha wa maa kunna lahu muqrineen, wa inna ila Rabbina la-munqaliboon. Allahumma inna nas'aluka fi safarina hadhal-birra wat-taqwa, wa minal-amalis ma tarda.' (Allah is the greatest... Glory to Him Who has brought this under our control though we were unable to control it. Surely, to our Lord we are returning. O Allah, we ask You for goodness and piety in this journey of ours...)",
        },
        {
            "id": "hisnul_muslim_istikharah",
            "source": "Hisnul Muslim",
            "citation": "Hisnul Muslim (Salat al-Istikhara)",
            "text": "Istikhara Du'a: 'Allahumma inni astakhiruka bi ilmika wa astaqdiruka bi qudratika, wa asaluka min fadlikal-azim, fa innaka taqdiru wa la aqdir, wa talamu wa la alam, wa anta allamul ghuyub. Allahumma in kunta talamu anna hadhal-amra (mention the matter) khayrun li fi dini wa maashi wa aqibati amri...' (O Allah, I seek Your counsel by Your knowledge and by Your power I seek strength and I ask You from Your immense favor...) Pray 2 rakats and then recite this Du'a.",
        },
        {
            "id": "hisnul_muslim_protection",
            "source": "Hisnul Muslim",
            "citation": "Hisnul Muslim (Morning & Evening Protection)",
            "text": "Protection Du'a (morning and evening): 'Bismillahil-ladhi la yadurru maa ismihi shay'un fil-ardi wa la fis-samai, wa huwas-Sameeul-Aleem.' (In the name of Allah with whose name nothing is harmed on earth nor in the heavens, and He is the All-Seeing, the All-Knowing.) Recite 3 times each morning and evening for full day protection.",
        },
        {
            "id": "hisnul_muslim_night_prayer",
            "source": "Hisnul Muslim",
            "citation": "Hisnul Muslim (Tahajjud Night Prayer)",
            "text": "Du'a for Tahajjud (night prayer): 'Allahumma lakal-hamdu Anta qayyimus-samawati wal-ardi wa man fihin. Wa lakal-hamdu, Anta nurus-samawati wal-ardi wa man fihin...' (O Allah, all praise is for You. You are the Sustainer of the heavens and the earth. All praise is for You; You are the Light of the heavens and the earth...) - Narrated by Bukhari.",
        },
    ]


def load_existing() -> tuple[list[dict], set[str]]:
    """Load existing dataset and return records + set of existing IDs."""
    if not os.path.exists(DATASET_PATH):
        return [], set()
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        records = json.load(f)
    existing_ids = {r["id"] for r in records}
    print(f"Loaded {len(records)} existing records from dataset.json.")
    return records, existing_ids


def save_dataset(records: list[dict]) -> None:
    with open(DATASET_PATH, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    print(f"\nSaved {len(records)} total records to dataset.json.")


def main():
    print("=" * 60)
    print("Hidayah Full Dataset Seeder")
    print("=" * 60)

    # 1. Load existing data
    all_records, existing_ids = load_existing()
    added = 0

    def add_records(new_records: list[dict]) -> int:
        count = 0
        for rec in new_records:
            if rec["id"] not in existing_ids:
                all_records.append(rec)
                existing_ids.add(rec["id"])
                count += 1
        return count

    # 2. Fetch full Quran
    print("\n[1/7] Fetching full Quran (Sahih International translation)...")
    quran_records = fetch_full_quran()
    n = add_records(quran_records)
    print(f"  Added {n} new Quran verses.")

    # 3. Fetch Hisnul Muslim Du'as
    print("\n[2/7] Fetching Hisnul Muslim Du'as...")
    duas = fetch_hisnul_muslim()
    n = add_records(duas)
    print(f"  Added {n} new Du'as.")

    # 4. Fetch Hadith collections
    hadith_editions = [
        ("eng-bukhari", 3000),
        ("eng-muslim", 3000),
        ("eng-tirmidhi", 2000),
        ("eng-abudawud", 2000),
        ("eng-ibnmajah", 2000),
    ]

    for idx, (edition, max_count) in enumerate(hadith_editions, start=3):
        collection_name = HADITH_COLLECTION_NAMES[edition]
        print(f"\n[{idx}/7] Fetching {collection_name} (up to {max_count} hadiths)...")
        hadith_recs = fetch_hadith_collection(edition, max_hadiths=max_count)
        n = add_records(hadith_recs)
        print(f"  Added {n} new hadiths from {collection_name}.")
        # Be polite to CDN
        time.sleep(1)

    # 5. Save
    print("\n" + "=" * 60)
    save_dataset(all_records)
    print(f"\nDone! Dataset now has {len(all_records)} total records.")
    print("\nNOW RESTART THE BACKEND SERVER so the FAISS index rebuilds:")
    print("  python -m uvicorn main:app --host 0.0.0.0 --port 8000")
    print("=" * 60)


if __name__ == "__main__":
    main()
