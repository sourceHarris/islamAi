# Hidayah 2.0 — light appearance and account screens

The product now displays **Hidayah 2.0**. Expo and package versions are `2.0.0`;
the existing app slug, route scheme, account identifiers and backend contracts
are unchanged.

The semantic theme has one runtime palette: light. Device appearance and legacy
saved dark/system preferences cannot switch the app. Login/Profile appearance
controls were removed, Expo requests light interface styling, and web declares
a light color scheme. Existing personal/account data was not reset.

Login and registration use the app's mint, emerald and gold palette, Garamond
headings, Jakarta body text and Amiri Arabic. Phone layouts have a single form;
wider screens add a quiet editorial panel. Text fields have persistent labels,
appropriate keyboards/autofill, focus borders, show/hide password controls and
inline error feedback. The new monogram is shared by the account screen, app
header and favicon. Small gold text uses `#806334`, with 4.63:1 contrast against
the gold badge surface and 4.80:1 against the muted mint surface.

Registration fields are **Full name, Email, Password, Confirm password**.
Registration/class inputs and their Profile presentation were removed. Original
stored values remain intact for existing service/account identity behavior.
The frontend requires matching passwords before sending the request and retains
the existing four-character minimum. Confirmation is not sent to the server.
The request contains only `name`, `email` and `password`; the existing API already
handles omitted registration/class fields and generates its internal identifier.

Favicon source: `public/hidayah-favicon.svg`. The matching PNG used by Expo is
`assets/images/hidayah-favicon.png`; regenerate it with
`node scripts/generate-favicon.cjs`. The web icon link includes a version query
to avoid displaying the old cached favicon.

No backend/database changes or new dependencies were needed for the account
screen revision. Publication is handled separately through the release branch;
merging or deploying is a separate decision.

## Verification

`npm run verify:auth` uses an isolated browser profile and captures Login/Register
at 320, 390 and 1280 pixels. It checks four-field registration, mismatch/email/
required validation, independent password visibility, API payload shape, error
recovery, session storage/navigation, version/title/favicon, scroll reachability,
and light rendering under dark device and legacy preference settings.

Registration submissions and successful-login responses are intercepted in that
test profile. No real user was registered or edited. The login rejection check
uses the live backend with a nonexistent test identity. A successful real-account
login or registration was not performed with user credentials.

Results and inspected captures: `exports/hidayah-v2-auth-review/`.
Broader feature checks: `exports/hidayah-v2-review/`.
Responsive/interaction regressions: `exports/hidayah-v2-regression/`.
The latter runs under both device appearances; the app remains light in both.
Some inherited focused capture filenames say “dark” to indicate the simulated
device preference; they do not represent an available app theme.

TypeScript, lint and web/native bundle checks are part of this revision.
Browser captures do not establish native-device keyboard, autofill or sensor
behavior. See [the feature audit](FEATURE_AUDIT.md) for other known limits.

Final results: 47 authentication checks, 54 feature checks, 22 interaction
regressions, 18 focused reader checks and three appearance/name checks passed.
The responsive run captured 60 screens across 320/390/1024 pixels under both OS
appearances, with no document overflow or unhandled runtime errors. TypeScript,
lint, web export and Android Hermes export passed. The phone/desktop auth
captures and updated Home branding were inspected directly.
