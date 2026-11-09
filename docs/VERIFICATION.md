# Milestone 1 verification

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

GitHub CLI authentication reported an invalid GH_TOKEN. No remote was configured, no repository was created, and nothing was pushed. README contains exact authentication, private-repository creation, verification, and push commands. The plan baseline is on main; source review is on feat/source-review.
