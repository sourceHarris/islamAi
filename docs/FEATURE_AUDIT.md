# App feature audit — 13 November 2026

Current branding and appearance: [Hidayah 2.0 account-screen update](HIDAYAH_2_AUTH.md). The app now supports light appearance only.

Version 2.0 is maintained on `release/hidayah-2.0`. Existing backend files,
database schemas, authentication contracts, account IDs, and stored tracking keys
were preserved. Test accounts/data were confined to isolated Chrome profiles;
no user account was created, reset, or edited by the audit.

## Reading library

- Complete Quran: **114 surahs, 6,236 ayahs**, bundled for offline reading in
  Uthmani Arabic, Jalandhry Urdu, and Sahih International English. Every ayah's
  numbering, Arabic, Urdu, and English presence was checked. Source snapshot is
  4.23 MB; bundling it increases the app download size.
- Native reading, text sizing, translation toggle, search, Makki/Madani filters,
  bookmarks, recent Surahs, sharing, and repeatable Home reading shortcuts.
- Actual streamed recitation by Mishary Alafasy and Abdul Basit, with play,
  pause, previous/next ayah, automatic continuation, and actual elapsed/duration.
  Audio stops on leaving the reader. Audio requires internet; no fabricated
  playback state or progress is used.
- Tafsir opens the corresponding Quran.com page externally, in a separate tab
  on web. It is not a bundled/native Tafsir database.
- Hadith books: **10 collections, 36,104 available Arabic narrations**. All 400
  Arabic chapter endpoints were checked against the index. English/Urdu text and
  named publisher grades display where the source supplies them. Chapters,
  pagination, exact-number lookup (including fractional numbers), Arabic/English/
  Urdu current-page text filtering, sharing, retry, and recent chapter caching.
- The old unreachable `api.hadith.gading.dev` service was replaced, preserving
  `fetchHadithBooks`, `fetchHadiths`, and the existing types' required fields.
  Hadith cache size is bounded so personal storage has room to grow. Only Hadith
  cache keys can be evicted; personal prayers and practice history are untouched.

| Hadith collection | Available Arabic narrations |
| --- | ---: |
| Sunan Abu Dawud | 5,272 |
| Sahih al Bukhari | 7,580 |
| Sunan Ibn Majah | 4,338 |
| Muwatta Malik | 1,829 |
| Sahih Muslim | 7,360 |
| Sunan an Nasai | 5,679 |
| Jami At Tirmidhi | 3,924 |
| Forty Hadith of an-Nawawi | 42 |
| Forty Hadith Qudsi | 40 |
| Forty Hadith of Shah Waliullah Dehlawi | 40 |

Counts describe this digital provider's available text, not a claim that every
printed edition has these totals. The catalogue records **408 empty Arabic
source entries** and excludes them from availability. Publisher numbering is
retained, so numbers can have gaps. There is no Urdu edition for the three
forty-Hadith collections. Missing translations are identified explicitly.

Sources: [Quran API](https://alquran.cloud/api),
[Hadith API](https://github.com/fawazahmed0/hadith-api). Snapshot provenance and
hashes are in [the data manifest](../assets/data/manifest.json).

## Other options

| Area | Working behavior / corrections |
| --- | --- |
| Home/navigation | Practice links, Quran continuation, repeated Hadith shortcuts, Profile, and AI prompts use the existing routes. |
| Prayer times | User-selected city/country, calculation method and Asr convention; real AlAdhan times with city timezone, method, date, retry, and daily caching. No location/time is assumed before setup. |
| Daily checklist | Existing prayers, Quran interaction, dhikr, custom practices, reflection and local save remain. Load/write failures are surfaced; failed reads cannot overwrite history. |
| Tracker | Selected-day editing now loads that date. Weekly totals use seven calendar days rather than the latest seven old records. Streaks and thirty-day data keep the existing formats. |
| Tasbih | Count, selection and cumulative total now survive reloads, scoped to the account on this device. Reset and target indicators work. |
| Du’a book | Create, edit, confirm deletion, validation and persistence per account on this device. The old hardcoded sample entries were removed. Save failures retain the editor. |
| AI | Existing real backend, source disclosure, suggestions, retry, reset and sharing remain. Answers can now be bookmarked, revisited, shared and removed under Saved replies. |
| Gift Ayah | Corrected mismatched Arabic/reference; all cards now use matching full verses and English from the bundled Quran. Existing navigation/sharing retained. |
| Qibla | Existing explicit location permission, calculated true-north bearing, refresh and error handling retained. Browser calculation tested with supplied coordinates; physical sensors remain unverified. |
| Appearance | Light is enforced throughout the app. Appearance selectors are removed. Arabic/Urdu continue using Amiri and RTL text layout. |
| Authentication | Existing registration/login contracts retained. Server connectivity and validation tested. Requests have timeouts; connection errors explain backend availability. Sign-out preserves device practice history. |

Prayer times use [AlAdhan's documented API](https://aladhan.com/prayer-times-api).
The existing UI still labels calculated times as estimates to check against a
local mosque. New runtime dependency: **`expo-audio ~1.0.13`**, the compatible
version listed by the installed Expo SDK. Recording permissions are disabled.
Custom native development clients need rebuilding to include the new module;
the existing compatible Expo Go runtime includes Expo audio support.

## Remaining features and verification limits

- Push/local notifications, Tahajjud alarms and direct AI voice transcription are
  not implemented. The bell explains availability; the microphone is not an
  active recording control. Keyboard dictation remains available through the OS.
- Juz navigation, word analysis, page-level reading progress, reading plans, and
  full interface localization remain design-only features. Starting Juz/page
  metadata and Arabic/Urdu content are real.
- Du’a, Tasbih, saved AI replies, bookmarks and checklist data save on this
  device. No new cloud synchronization or database/API schema was introduced.
- Hadith text requires a connection initially; only recently cached chapters may
  remain readable offline. The Quran text/English/Urdu are fully bundled.
- Browser tests exercised live API responses, actual media loading/playback time,
  and isolated account fixtures. Native Android compilation passed. No physical
  Android/iOS device, compass, native share sheet, real screen reader or native
  audio output was available. Qibla location coordinates were supplied by the
  test harness; they were not the user's location.
- A successful real-account login or new registration was not performed: that
  would require the user's credentials or creating database data. Login reached
  the actual backend and rejected a non-existent test identity correctly;
  registration rejected invalid data without creating a user. Anonymous chat
  returned HTTP 200 with an answer and sources. This is functional testing, not
  a theological accuracy assessment of AI output.

## Verification results

- 55 live-service browser interaction checks passed, with no unhandled browser exceptions or failed network requests.
- All 114 surahs / 6,236 verses validated in three editions; 28 library/offline/cache-integrity checks passed.
- All 400 indexed Arabic Hadith chapters passed coverage checks (36,104 available narrations).
- Eight tracking/storage-failure checks and four existing backend policy tests passed.
- The existing redesign suite passed 22 interaction checks, 18 focused reader checks and four appearance/name checks. Its 60 captures covered ten routes at 320, 390 and 1024 pixels in both appearances, with no document overflow or runtime exceptions.
- TypeScript, lint, web export and the final Android Hermes export passed. Compilation does not establish physical-device behavior.

## Repeatable checks and evidence

Run `npm run typecheck`, `npm run lint`, `npm run verify:library`,
`npm run verify:tracking`, `node scripts/check-hadith-coverage.cjs`, and
`npm run verify:features`. The browser harness requires a fresh export at
`exports/feature-audit-web` and installed Chrome. It uses its own profile.

Evidence: [scripture checks](evidence/library-checks.json),
[all Hadith chapters](evidence/hadith-chapter-coverage.json),
[tracking/error checks](evidence/tracking-checks.json),
[API checks](evidence/api-feature-checks.json),
[browser checks](../exports/feature-audit/results.json).
Captured app screens are in `exports/feature-audit`; they were inspected during
the audit. Additional redesign regression checks use isolated fixtures
for deterministic chat failure/retry and do not replace the live checks.

Start both app and backend with **`npm run dev:all`**. The command reuses running
servers and writes startup logs to `exports/runtime`. The backend may need
several minutes to build its AI index. Preview: http://localhost:8081.
For a physical phone, an explicitly configured reachable API URL and a backend
bound to the LAN are needed; the local launcher binds to localhost.
