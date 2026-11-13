# Hidayah 2.0

A React Native and Expo app for Quran reading, Hadith, prayer, remembrance,
and AI-assisted reflection.

## Versions

- **1.0:** preserved on `main` and the `v1.0.0` tag.
- **2.0:** developed separately on `release/hidayah-2.0`.

Publishing the 2.0 branch does not merge it into `main` or deploy it.

## Included in 2.0

- Light-only interface, refreshed account screens, and Hidayah 2.0 branding.
- Complete offline Quran: 114 surahs / 6,236 ayahs in Uthmani Arabic,
  Jalandhry Urdu, and Sahih International English.
- Ten Hadith collections, chapter browsing, numbered search, and translations
  where the provider supplies them. Counts reflect available digital text.
- Streamed recitation, city-based prayer times, and Qibla calculation.
- Saved personal prayers, Tasbih counts, checklists, reflections, and AI replies.

See [feature coverage and limitations](docs/FEATURE_AUDIT.md) and
[account-screen verification](docs/HIDAYAH_2_AUTH.md). Notifications, direct voice
transcription, and the other design-only features listed there are unfinished.

## Run locally on Windows

Install Node.js/npm, Python, and PostgreSQL. The frontend dependency versions are
recorded in `package-lock.json`; backend dependencies are in
`backend/requirements.txt`.

```powershell
git clone --branch release/hidayah-2.0 https://github.com/sourceHarris/islamAi.git
cd islamAi
npm.cmd ci
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
Copy-Item backend\.env.example backend\.env
```

Configure `backend/.env` with a reachable PostgreSQL database and your own
AI-provider key. Do not commit this file. Then start the app and API:

```powershell
npm.cmd run dev:all
```

Preview: `http://localhost:8081`. API health: `http://127.0.0.1:8000/`.
The backend builds its retrieval index and loads models before accepting login
and chat requests; initial startup can take several minutes. Logs are written
under the ignored `exports/runtime/` directory.

On other platforms, start the backend from `backend/` with
`python -m uvicorn main:app --host 127.0.0.1 --port 8000`, then run `npm run dev`.
For a phone or hosted frontend, set `EXPO_PUBLIC_API_URL` to the backend URL
reachable from that device. The Windows launcher binds the API to localhost.
Separate deployments need deliberate backend/database configuration; Git branches
do not isolate shared services.

## Checks

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run verify:library
npm.cmd run verify:tracking
```

Browser checks require Chrome and a fresh web export:

```powershell
npx.cmd expo export --platform web --output-dir exports/hidayah-v2-web
npm.cmd run verify:auth
npm.cmd run verify:features
npm.cmd run verify:stitch
```

The browser harnesses use isolated profiles and documented fixtures. Generated
screenshots, browser profiles, builds, virtual environments, credentials, and
local design/tooling exports are excluded from Git. Native compilation and
browser checks do not establish behavior on a physical phone.

Scripture sources and bundled-font licenses are documented in
[the data notes](assets/data/README.md) and `assets/fonts/`.
