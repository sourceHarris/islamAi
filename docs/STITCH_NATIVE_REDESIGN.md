# Stitch native redesign

Current branding/appearance: [Hidayah 2.0](HIDAYAH_2_AUTH.md), with light mode only. Feature status and verification: [13 November feature audit](FEATURE_AUDIT.md).

Release branch: `release/hidayah-2.0`.

## Scope and design references

The source exports are in `stich-design/` (the actual folder name), with ten screenshot/HTML pairs and two design-system documents. Screenshots and HTML take precedence over conflicting design-document tokens. The refined light Quran reader uses ivory; Home, Chat, and Tracker use mint in light appearance. Dark appearance uses layered botanical surfaces.

The existing semantic theme and shared design components were extended. EB Garamond (including its real italic face), Plus Jakarta Sans, and Amiri are bundled locally with their OFL licenses through the existing Expo font support. The initial redesign added no runtime dependency; the later feature audit added the SDK-compatible `expo-audio` module for real playback. ESLint and Expo's lint configuration were added as development tools.

The follow-up revision uses the Stitch layout, outline navigation icons, the HTML's 12-point card radii and compact spacing, the original reflection copy, and the reference's decorative watermark and hero gradient. Hidayah 2.0 uses the new H/arch monogram and light appearance only. Appearance controls were removed from Login and Profile; legacy device/saved dark preferences are ignored. The requested spelling correction displays **Huzaifa**, retaining existing account identifiers and backend data.

## Screens

| Area | Implementation |
| --- | --- |
| Shared theme and navigation | Light-only semantic tokens, reusable cards/chips/header, Hidayah 2.0 monogram, account initials, five existing routes with outline icons, raised Ask tab, safe-area clearance. |
| Home | Greeting from the existing account, Ayah reflection/share actions, real prayer completion, AI prompt links, last-opened Surah link, practice tiles. |
| Quran directory | All 114 bundled Surahs, translated meanings, Arabic names, Makki/Madani filtering, search, saved/recent Surahs, retained Hadith access. |
| Quran reader | Complete bundled Arabic, Sahih International English, and Jalandhry Urdu; font sizing, Urdu visibility, Surah bookmarking, native sharing, and real starting page/Juz metadata. An edition-supplied Bismillah prefix is displayed once in a separate card; the original API text is retained for sharing. |
| Ask Hidayah | Shared brand header, guidance notice, actual user/reply cards, source disclosure, prompt suggestions, keyboard-aware composer. Existing backend request, identity, retry, and reset behavior retained. |
| Tracker | Existing checklist history, selectable recent dates, actual prayer completion, real streaks, practice summaries, 30-day grid, saved reflections and existing editor links. |
| Supplementary screens | Shared fonts and presentation applied to Profile, Login, Checklist, Dhikr, Dua, Qibla, swipe cards, and Hadith detail. Existing handlers and content retained. |

## Data and behavior preserved

No backend or database schema change was made. Existing backend edits in the workspace were preserved. The follow-up feature audit extended the frontend Quran, Hadith and tracking services while preserving their public interfaces and existing saved-data formats. Complete Quran editions now read from validated bundled assets; the unreachable Hadith provider was replaced. Source provenance is recorded in `assets/data/manifest.json`.

The existing authentication gate, account storage, Surah saved/recent keys, tracking format, and service contracts remain in use. The app displays actual state rather than sample completion metrics or conversations from the design exports. Personal prayers, Tasbih counts, and saved AI replies now persist per account on this device. The former sample-only Du’a entries were removed; curated Quran cards now obtain matching Arabic, English and references from the complete snapshot.

Arabic and Urdu use Amiri with RTL paragraph direction, generous line height, and native font scaling. The light gold text token uses `#8A6D3B` on white (4.85:1), while lighter gold is used for decoration. The local Apple Design skill and its typography, accessibility, layout, color, dark-mode, tab-bar, and RTL references informed adaptations.

## Current feature status

Real prayer schedules, two-reciter audio playback, external Tafsir links, ten Hadith collections, persistent Tasbih/Du’a, and saved AI replies are implemented. Notifications, Tahajjud alarms, direct voice transcription, Juz navigation, word analysis, page-level progress, reading plans and interface localization remain unavailable. See the [feature audit](FEATURE_AUDIT.md) for complete functionality and native-device limits.

## Verification and artifacts

- TypeScript: `npx tsc --noEmit --incremental false`.
- Lint: `npm run lint -- --no-cache`.
- Web export: `npx expo export --platform web --output-dir exports/stitch-redesign-web`.
- Android export: `npx expo export --platform android --output-dir exports/stitch-redesign-android`.
- Current browser regression: `node scripts/verify-stitch-redesign.cjs` (defaults to `exports/feature-audit-web`; set `EXPORT_ROOT` to test another export).
- Focused visual/live-reader checks in PowerShell: `$env:VISUAL_ONLY='1'; node scripts/verify-stitch-redesign.cjs`.

The browser matrix captured ten routes at 320, 390, and 1024 pixels in both appearances: 60 captures, with no document overflow or runtime exceptions. All 22 interaction checks passed, including the auth screen, checklist persistence, Dhikr, Dua editor, source disclosure, chat request contract, retry without duplicate messages, reset, and composer clearance.

The 18 focused checks use the live Quran API, including Al-Kahf, real English translation, Arabic font loading, Urdu attribution/visibility, reader font sizing, Bismillah display, and persistent Surah bookmarking in both appearances. Results are in `exports/stitch-redesign-review/visual-checks.json`. Four appearance/name checks verify Huzaifa's spelling and persistent Light/Dark/System selection in `appearance-checks.json`.

Screenshots were actually captured and inspected against the Stitch exports. Significant corrections included Unicode-safe Windows writes, the Quran toolbar's wrapping, directory spacing, and edition-specific Bismillah handling. The capture profile is isolated from the user's browser data. Chat interaction tests use explicitly isolated response fixtures; the production app's data sources are not replaced. Live backend chat generation was not exercised by those tests.

See [capture index](../exports/stitch-redesign-review/README.md), [side-by-side comparisons](../exports/stitch-redesign-review/compare.html), [regression results](../exports/stitch-redesign-review/results.json), and [focused checks](../exports/stitch-redesign-review/visual-checks.json).

## Verification limits

Rendered verification used the React Native web export in headless Chrome. Android bundling is a compilation check, not a device run. No physical Android/iOS device, iOS simulator, native large-text configuration, screen reader, real keyboard, compass/location sensor, or native share sheet was available for validation. Backend availability and live login/chat server responses require the user's running backend. There was no commit, push, or merge.

The later feature audit separately tested real backend responses, all 400 Arabic Hadith chapters, complete offline Quran data, native Android bundling, and live browser features. Its current evidence is linked from [FEATURE_AUDIT.md](FEATURE_AUDIT.md).
