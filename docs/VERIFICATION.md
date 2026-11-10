# Verification record

## Settings and help — 10 November 2026

Added the approved top-right settings wheel and labelled Settings and help modal. About covers purpose, the fictional predefined demonstration, limitations and browser-local data. Eight expandable Help topics cover quick start, transcript terms, review terms, finding versus editorial decisions, navigation, saving/reporting, accessibility and troubleshooting. No private repository or support contact is exposed.

All **17 Node tests passed**. The expanded browser suite passed, including native dialog focus containment, initial Close focus, Escape and Close restoring focus to the wheel, topic expansion, preservation of unsaved rationale and selection, no accidental save, 390px dialog layout and Help access during fixture-loading failure. Desktop and mobile screenshots were visually inspected. Existing evidence, report, persistence and failure regression checks continue to pass. Review logic, record identities and reporting behaviour are unchanged.

## Report-only refinements — 10 November 2026

Added an executive summary after Metadata with separate finding-status and excerpt-decision tables. Counts use the same validated saved records as the detail; missing, malformed or stale records remain pending, and unavailable/insufficient reviews are disclosed. Metadata now explains the predefined review method and version, replacing repeated `Review revision: authored-1` labels. Report field keys are bold italic and grouped as identity, review and decision; evidence and remedy subheadings remain separate from their content. The executive summary and short field groups stay together when printing.

`npm test`: **17 passed**. New count checks include open/addressed/dismissed findings, all editorial choices, stale/malformed records, unavailable/insufficient reviews and several findings in one excerpt. Expanded browser checks passed for table totals, semantic headings, bold-italic labels, grouped lines, mobile report width, saved-only export and PDF printing, alongside the existing regressions. The generated four-page A4 PDF was rendered with Poppler and visually inspected. Changes are limited to report generation/rendering, report-scoped styles, verification tests and this record; source analysis, navigation, saved decision identities and other UI remain unchanged.

## Review refinements — 10 November 2026, v0.3.0

Owner-approved refinements add the Context. Truth. headline; Needs attention / Addressed / Dismissed finding labels and explanations; sticky excerpt navigation with summaries; keyboard-accessible kept-passage review links; other-excerpt source links; focused/full transcript modes; and numbered report sections with browser Print / Save as PDF.

`npm test`: **14 passed**, including legacy Resolved-to-Addressed label migration preserving rationale/time and a dismissed finding retaining its authentic remedy. Expanded browser checks passed for focus mode, source/review return navigation, associated excerpt selection, report headings and print invocation. A three-page A4 PDF was generated through Chromium print rendering, rendered to PNG using Poppler and visually inspected. Existing saved-report/download, blocked/stale storage, evidence failure and accessibility checks remain included. This is browser PDF printing, not a separate direct PDF-download service.

GitHub Actions now runs the logic suite for pushes and pull requests. The Sites build allowlists eight fictional browser assets; uploads and live model integration remain deferred. No formal assistive-technology user audit has been performed.

### Public demonstration and integration

Pull request [#1](https://github.com/stanfordgibson/documentary-context-review/pull/1) passed GitHub Actions and was reviewed and merged into main at `78b673faaaad456645c80610184c8f2639f37ab6`. The capstone is tagged `v0.3.0`.

The owner explicitly authorised public access to the fictional demo. Sites version 1 was successfully deployed at https://context-cut-naledi-demo.codex-certif-9427.chatgpt.site from source-mirror commit `f8a1f907ce247078d02e3bbf12eb065f7c15358f`, which records GitHub source commit `d561ec16d8e435e71c313c58b38ac7eed361a3ad` in PROVENANCE.md. No source code differs from the reviewed GitHub implementation; the deployment archive contains the manifest and eight browser assets only.

A fresh anonymous Chromium context verified public access without sign-in, decision save/reload, focused source mode, kept-passage review navigation, a dismissed finding retaining its suggested remedy, numbered report headings, report download, PDF-print invocation and 390px layout. No uncaught page errors occurred. Browser test decisions were confined to the isolated test browser; no shared records or real transcripts were created.

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
