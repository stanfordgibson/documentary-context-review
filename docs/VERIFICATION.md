# Verification record

## Milestones 2 and 3 — 9 November 2026

Implemented on `feat/editorial-review` after owner approval of the specification and subsequent authorisation to code. The branch incorporates the approved main documentation and preserves the Milestone 1 source-review history. The entries below describe actual checks, not general AI analysis quality.

Environment: Windows, Node v24.13.0, installed Chrome, Playwright 1.65.0. Test server bound to 127.0.0.1:3075. Application still has no package dependencies or model credentials.

- `npm test`: **13 tests passed** (7 original evidence tests and 6 review/record/report tests).
- `node tests/browser_check.mjs`: **passed**.
- `node --check src/app.js` and `git diff --check`: passed.
- Desktop (1440px) and narrow-screen (390px) screenshots inspected; no horizontal overflow. Screenshots and downloaded test report remain ignored in `work/`.

| Acceptance area | Verification |
| --- | --- |
| M2-01–02 | All eight source turns preserved exactly; each excerpt has correct kept span and omitted remainders. Active-excerpt boundary is visible; unresolved selections do not present omission claims. |
| M2-03–04 | Explicit status text in browser accessibility tree; labels-only option removes colour; keyboard activation and evidence focus verified; forced colours and enlarged-text layout checked. |
| M2-05–07 | Preserved-meaning case has no flags; qualification case explains conditional-to-unconditional implication and cites T04 restoration; question case cites T05/T06 without inventing a reversal. All evidence/remedy quotes derive from validated source ranges. |
| M2-08–10 | Insufficient context, malformed response, invalid evidence and simulated failure checked. Source remains usable. Exact authored fixture binding prevents recycling observations for changed material; instruction-like source remains inert text. No external browser requests or model requests. |
| M3-01–05 | Independent finding and excerpt decisions saved with required rationales, revision identity and timestamps; Keep does not close a finding; records reopen after reload. |
| M3-06–07 | Malformed records, denied storage, failed save confirmation and outdated identities checked. No successful save or current completed review is claimed for those states. |
| M3-08–10 | Complete/incomplete readable reports, exact selections, evidence, remedies, decisions and open concerns checked. Real browser download succeeded; unsaved rationale text is excluded. Unavailable/outdated results prevent completion. |

HTTP checks continue to reject private/repository paths with 404 and POST with 405. No uncaught browser errors occurred. Both input workflows remain deferred; no uploads, arbitrary selections, live model integration or whole-documentary assessment was added.

Limits: accessibility verification used keyboard interaction, browser accessibility-tree text and display emulation; no end-to-end test with a human screen-reader user or formal accessibility audit was performed. Authored examples establish behaviour only, not semantic detection accuracy. No real interviews, media alignment or final documentary were tested. Final submission rehearsal and organiser requirements still need checking.

## Milestone 1 — historical verification

Verified on 9 November 2026 with Node v24.22.1 and Playwright Chromium 151. Reproduce using the commands in README; start the local server before the optional browser check.

## Automated results

`npm test`: **7 tests passed**.

`python3 tests/browser_check.py` (with the workspace Playwright browser path configured): **passed**.

| Excerpt | Selected source | Interviewer question | Nearby turns | Turn timestamp |
| --- | --- | --- | --- | --- |
| The conversation after | T02 | T01 | T01, T02, T03 | 00:08–00:22 |
| Keeping screenings free | T04 | T03 | T03, T04, T05 | 00:30–00:45 |
| What does “that” mean? | T06 | T05 | T05, T06, T07 | 00:56–01:05 |

Browser assertions checked the exact selected text and complete selected source line for each excerpt, question text/timestamps, context IDs, active navigation, and excerpt selection after reload. All eight full-transcript turns matched the fixture.

Injecting a missing T99 source reference produced a clear error, no proposed quote was presented, the full transcript stayed readable, and switching to a valid excerpt recovered. Unknown excerpt links and fixture-loading failure also produced visible errors. Unit tests covered missing question references, wrong question speaker/order, altered quote text, duplicate IDs, empty selections, and invalid timestamps.

At 1440px desktop and 390px mobile width, browser screenshots were inspected and the mobile page had no horizontal overflow. Screenshots remain ignored local artifacts in `work/`. No uncaught page errors or external browser requests occurred.

HTTP checks confirmed 404 responses for repository/private paths (README, environment file, Git config, project brief, server source, encoded traversal) and 405 for POST. Ignore rules were checked for local media, transcripts, environment files, credentials, private data, and work artifacts; the synthetic fixture remains trackable.

## Limits and remote status

These results establish the source-review milestone, not AI analysis quality or decision persistence. Those features are planned in milestones 2 and 3. No real interview or media alignment was tested. Accessibility checks were limited to semantic controls, labels, focus styling, and layout; this was not a formal accessibility audit.

Repository https://github.com/stanfordgibson/documentary-context-review was created by the owner. Account `stanfordgibson`, private visibility, empty initial state, and the exact HTTPS origin were verified before uploading code. The plan baseline on main and the source-review feature branch were both pushed successfully. The integration supports Git pushes, while repository creation and visibility changes required the owner's action through GitHub's website. README includes a feature-branch clone command so a fresh checkout opens the working demo rather than the plan-only baseline.
