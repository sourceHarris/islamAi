# Scripture data

`quran.json` contains all 114 surahs and 6,236 ayahs, with Uthmani Arabic,
Fateh Muhammad Jalandhry Urdu, and Sahih International English. It is bundled
with the frontend for offline reading. Text is copied from the publisher without
paraphrasing or normalization. Quran reader Bismillah presentation does not change
the stored text or the text used for sharing.

`hadith-catalogue.json` contains the Hadith API's collection names, chapter names,
language editions, and narration index. Actual Hadith text loads by chapter from
the provider. Available counts exclude empty Arabic source records; original
numbers, including fractional variants, are retained. Some collections do not
have Urdu editions. Translations and grades are shown only when supplied.

`manifest.json` records retrieval time, edition identifiers, source URLs, and
SHA-256 hashes. Run `node scripts/download-library-data.cjs` to refresh both
snapshots, then run the library and chapter-coverage checks before using them.

Sources: [Al Quran Cloud API](https://alquran.cloud/api),
[Hadith API documentation and source](https://github.com/fawazahmed0/hadith-api).

No generated religious text is stored in these assets. AI replies are a separate
feature and retain their AI disclosure.
