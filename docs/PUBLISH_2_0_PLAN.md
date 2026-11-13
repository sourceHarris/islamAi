# Approved 2.0 publication procedure

Repository: `sourceHarris/islamAi` (the old `d3xture/islamAi` remote redirects here).
Verified GitHub default branch: `main`, at
`07b59996c1ddc47f97f8d387619a6fa62999e13b`.
Release work branch: `release/hidayah-2.0`. The user approved committing and
pushing this branch separately. This document records the approved procedure;
the actual branch/tag refs on GitHub establish publication status.

## Preserve 1.0

Keep `main` at its current commit. Create an annotated `v1.0.0`
tag pointing to that exact commit, provided the name is still unused. Never
overwrite an existing tag. This gives the original version a named snapshot even
if the default branch changes later.

## Publish 2.0 separately

Proposed commit title:
`Release Hidayah 2.0 with refreshed UI and expanded reading features`

Commit the reviewed application changes on `release/hidayah-2.0`, then push
that branch explicitly. Do not push commits to `main`, force-push, merge a pull
request, change the default branch, or deploy as part of this action. A later
merge or production deployment would be a separate user decision.

Include the frontend, Quran/Hadith data and provenance, licensed fonts, favicon,
shared components/services, lockfile, validation scripts, and setup notes.
The current working backend and its `rag_policy.py` dependency must be included
together to reproduce the locally tested chat behavior. These backend edits
predate the UI redesign; the redesign did not alter database schemas.

Keep real credentials, `.env` files, local virtual environments, generated
bundles, runtime logs, browser profiles, the independent design-skill clone, and
downloaded Stitch reference exports out of the publication. `.env.example`
contains placeholders only. Excluding files from Git does not delete local data.

The exact candidate source list is generated locally at
`exports/release-review/publish-manifest.json`; it is not staged automatically.

## Running each version

Branches/tags preserve source code, not running servers or databases. A branch
push does not automatically host the app or replace an installed/deployed 1.0.
Version 2.0 still requires its runtime dependencies and backend configuration.
Separate deployments should use independent URLs/builds and deliberate backend
configuration; branch names alone do not isolate a shared database or service.

For 2.0 on this Windows machine, run `npm ci`, create `venv` if necessary,
install `backend/requirements.txt`, configure `backend/.env`, and run
`npm run dev:all`. The existing PostgreSQL database and AI-provider credentials
are required for login/chat. Complete Quran reading is bundled locally; external
Hadith chapters, recitation and prayer schedules require network access.

No clean-clone or separate-production-deployment verification has been performed
yet. Local frontend checks, browser interactions, live API connectivity, and
Android bundle checks are recorded in `docs/HIDAYAH_2_AUTH.md` and
`docs/FEATURE_AUDIT.md`.
