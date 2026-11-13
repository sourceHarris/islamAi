# Hidayah 2.0 — glass revision

This revision replaces the first redesign following feedback that it felt plain and lost Hidayah's original character. The direction is emerald, dimensional, and recognizably Hidayah: floating glass navigation above an architectural Quran panel and a compact practice dashboard.

The local skill remains at `tools/apple-design-skill/SKILL.md`. `AGENTS.md` points future UI work to that clone.

## What changed

- Floating capsule tab bar with backdrop blur, reflective highlights, a fine rim, and a soft shadow. Content scrolls underneath; bottom padding keeps the final actions reachable.
- Shared `GlassSurface` for the dock, profile/back controls, Gift Ayah action, library search, and chat composer. Foreground controls sit explicitly above the blur layer.
- Midnight emerald and luminous mint backgrounds with restrained blue undertones. Solid content surfaces retain readable contrast.
- Bespoke home dashboard: Hidayah wordmark, Arabic greeting, layered mihrab-inspired arch artwork, scripture panel, actual saved prayer progress in a circular indicator, and compact feature tiles.
- Less promotional wording. Library, profile, and activity screens use direct names.
- The first redesign's data connections, working links, saved reading, and tracking behavior remain in place. This pass changes presentation.

## Material choices

This is an Expo / React Native implementation using the installed `expo-blur` package. It approximates the glass appearance across platforms; it is not Apple's native refractive `UIGlassEffect` implementation.

The local skill's `liquid-glass.md > The two layers` and `materials.md > Liquid Glass` distinguish content from floating controls. Glass is used for navigation and controls. The Quran panel's depth comes from gradients and vector architecture rather than background blur. This preserves the original app's richer visual character while keeping scripture readable.

On iOS, Reduce Transparency or Reduce Motion enables an opaque fallback. On web, reduced transparency, increased contrast, or reduced motion enables that fallback. Android uses the translucent/opaque treatment to avoid unsupported or expensive blur behavior. Existing navigation transitions continue to respect reduced motion.

No continuous particles or shimmer were added. Depth comes from composition, light, edges, and the material itself.

## Tokens

| Role | Light | Dark |
| --- | --- | --- |
| Base | `#EDF5F4` | `#071115` |
| Content surface | `#FFFFFF` | `#11282B` |
| Primary text | `#102E2A` | `#F0F8F6` |
| Secondary text | `#506A65` | `#B0C9C3` |
| Accent | `#08765D` | `#76E7C1` |
| Separation | `#CEDFDB` | `#294446` |

Measured contrast against the content surface: main text 14.52:1 / 14.29:1, secondary text 5.85:1 / 8.80:1, accent text 5.59:1 / 10.26:1 (light / dark). These figures describe opaque token pairs; translucent materials need visual inspection over their actual background.

The signature panel uses a deep teal gradient, pale scripture, and thin architectural lines. The warm accent is restricted to the arch's star. System type remains in controls; Arabic scripture is the main expressive typography.

```text
Phone                           Tablet
[ hidayah.              avatar ][ hidayah.                    avatar ]
[ Arabic greeting / name       ][ Arabic greeting / name            ]
[ Arched scripture panel       ][ Arched scripture ][ Prayer ring  ]
[ Prayer ring / daily checklist ][ Quran & Hadith                     ]
[ Quran & Hadith               ][ Dhikr       Du'a book       Qibla  ]
[ Dhikr     Du'a book     Qibla ][ Ask Hidayah                        ]
[ Ask Hidayah                  ][       Floating glass dock          ]
[   Floating glass dock        ]
```

## Conversation and dark-mode refinement

The conversation screen now has one hierarchy: a compact header, a quiet starting view, readable messages, and one liquid composer. Robot avatars, sparkle icons, the welcome checklist, stacked suggestion cards, tinted paragraph boxes, and the prominent warning banner were removed. Two small text prompts remain as optional starting points. AI use is still disclosed in a single line below the composer.

User messages use a muted emerald surface (`#193B36` in dark appearance), while responses sit directly on the reading background. Inline emphasis, lists, evidence text, and Arabic/Urdu paragraphs remain readable and selectable. Sources are deduplicated and expand on demand, including the older text-based source format. Errors sit beside the conversation with a retry action; retry does not duplicate the question. A new-conversation control asks before clearing the current conversation.

The request still posts `message` and `user_id` to the existing `/chat` endpoint. Preview interaction tests use local response fixtures; they do not send preview messages to the backend or evaluate model accuracy.

The glass composer is a single surface with a compact initial height. On native devices the tab bar hides when the keyboard opens, and the composer releases its reserved dock spacing. New content follows the bottom only while the reader is already near the end of the conversation. Reduced motion disables animated scrolling.

The main midnight emerald, mint accent, arch details, and liquid dock colors are unchanged. Dark-mode fixes target exceptional states:

- Sign-in errors now use `#38262C` with `#FFA9AF` text instead of a bright pink panel. Contrast: 7.79:1.
- Message text on the muted dark bubble measures 11.31:1.
- The light error pair measures 5.61:1.
- Delete controls use appearance-aware danger colors.
- Selected checklist icons keep a visible check stroke instead of a solid fill that hid the check.
- Layout styles can no longer override an opaque glass accessibility fallback.

Screen titles and section names were shortened to direct labels such as Dhikr, Qibla, Daily checklist, and Current streaks. The home link uses a conversation icon rather than a sparkle symbol.

These changes follow `writing.md > Best practices` (clear, action-oriented language), `generative-ai.md > Transparency` (AI disclosure and expectations), and `dark-mode.md > Best practices` (legibility in both appearances) from the local skill.

Validation for this refinement: TypeScript and the web export pass; 60 screen/size/appearance renders show no horizontal overflow or runtime exceptions. All 22 focused interaction checks pass, including sources, retry without duplicate questions, a short viewport, dark error surfaces, and composer hit testing after a reply. A transient headless screenshot omitted composited glass; the alternate capture path and hit test confirmed the controls remained visible and reachable.

Current screenshots and results are under `exports/hidayah-conversation-review`; earlier passes remain available for comparison. Native keyboard behavior, VoiceOver/TalkBack, and the exact device blur still require physical-device verification.

## Files and verification

- Material and backdrop: `components/Glass.tsx`.
- Shared surfaces: `components/DesignSystem.tsx`, `components/ScreenHeader.tsx`.
- Home and dock: `app/(tabs)/index.tsx`, `app/(tabs)/_layout.tsx`.
- Tokens: `contexts/ThemeContext.tsx`.
- Browser verification: `node scripts/verify-redesign.cjs`; focused checks: set `INTERACTIONS_ONLY=1`.
- New screenshots/results: `exports/hidayah-2-review`. Earlier screenshots remain in `exports/apple-design-review` for comparison.
- Final validation: 40 renders across ten routes at 320px, 390px (light/dark), and 1024px; zero runtime exceptions and zero horizontal overflow. Eight focused checks pass, including actual backdrop-blur rendering and the opaque reduced-motion fallback. TypeScript and Expo web export pass. Browser checks cover phone/tablet widths, both appearances, control visibility, and the established practice interactions. The initial revised sweep found an overflow issue at tablet widths and blur stacking over foreground controls; both were corrected before the final check.

Native-device verification is still required for the exact iOS blur appearance, physical compass accuracy, large text with the keyboard visible, and VoiceOver/TalkBack. Sign-in backend responses and AI output quality are outside this visual revision.



