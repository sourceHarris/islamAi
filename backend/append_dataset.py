import json
import os

NEW_DATA = [
    {
        "id": "hisnul_muslim_morning_1",
        "source": "Hisnul Muslim",
        "citation": "Hisnul Muslim (Morning & Evening Supplications)",
        "text": "O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die and unto You is our resurrection. (Allahumma bika asbahna wa bika amsayna, wa bika nahya wa bika namut, wa ilaykan-nushur)"
    },
    {
        "id": "hisnul_muslim_sleep_1",
        "source": "Hisnul Muslim",
        "citation": "Hisnul Muslim (Before Sleeping)",
        "text": "In Your name O Allah, I live and die. (Bismika Allahumma amutu wa ahya)"
    },
    {
        "id": "fiqh_wudu_1",
        "source": "Fiqh us-Sunnah",
        "citation": "Fiqh us-Sunnah (Purification - Wudu)",
        "text": "The obligatory acts of Wudu (Ablution) are: 1. Intention (Niyyah). 2. Washing the face. 3. Washing the arms up to the elbows. 4. Wiping the head. 5. Washing the feet up to the ankles. 6. Performing these acts in the prescribed sequence. (Quran 5:6)"
    },
    {
        "id": "fiqh_fasting_1",
        "source": "Fiqh us-Sunnah",
        "citation": "Fiqh us-Sunnah (Fasting - Sawm)",
        "text": "Fasting is invalidated by: 1. Intentional eating or drinking. 2. Intentional vomiting. 3. Menstruation and postpartum bleeding. 4. Sexual intercourse during the fasting hours. If one eats or drinks out of forgetfulness, their fast remains valid."
    },
    {
        "id": "hisnul_muslim_entering_home",
        "source": "Hisnul Muslim",
        "citation": "Hisnul Muslim (Entering the Home)",
        "text": "In the Name of Allah we enter, in the Name of Allah we leave, and upon our Lord we depend. (Bismillahi walajna, wa bismillahi kharajna, wa 'ala Rabbina tawakkalna)"
    },
    {
        "id": "hisnul_muslim_leaving_home",
        "source": "Hisnul Muslim",
        "citation": "Hisnul Muslim (Leaving the Home)",
        "text": "In the Name of Allah, I have placed my trust in Allah, there is no might and no power except by Allah. (Bismillahi, tawakkaltu 'alallahi, wa la hawla wa la quwwata illa billah)"
    },
    {
        "id": "fiqh_wudu_nullifiers",
        "source": "Fiqh us-Sunnah",
        "citation": "Fiqh us-Sunnah (Nullifiers of Wudu)",
        "text": "Things that invalidate Wudu: 1. Any discharge from the front or back passages (urine, stool, wind). 2. Deep sleep where one loses awareness. 3. Loss of consciousness. 4. Touching the private parts directly without a barrier."
    },
    {
        "id": "fiqh_fasting_travel",
        "source": "Fiqh us-Sunnah",
        "citation": "Fiqh us-Sunnah (Fasting while Traveling)",
        "text": "It is permissible for a traveler to break their fast during Ramadan, but they must make up the missed days later. However, if fasting does not cause hardship, it is better to fast. (Quran 2:184)"
    }
]

DATASET_PATH = "dataset.json"

if __name__ == "__main__":
    if os.path.exists(DATASET_PATH):
        with open(DATASET_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = []

    # Avoid adding duplicates
    existing_ids = {item["id"] for item in data}
    added_count = 0

    for item in NEW_DATA:
        if item["id"] not in existing_ids:
            data.append(item)
            added_count += 1

    with open(DATASET_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"Added {added_count} new entries to {DATASET_PATH}.")
