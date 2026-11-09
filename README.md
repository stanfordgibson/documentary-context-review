# Context Cut

A local editorial review prototype for documentary filmmakers. Review a proposed excerpt against its original interview, inspect potential meaning changes and authentic remedies, and record human reasoning in an internal integrity report.

Andela × OpenAI Codex Accelerator capstone. Submission deadline: Wednesday 11 November 2026, end of day SAST; internal target 18:00 SAST.

## Run

Requires Node.js 22 or newer. Application dependencies, credentials, and `npm install` are not required.

```sh
git clone --branch feat/editorial-review https://github.com/stanfordgibson/documentary-context-review.git
cd documentary-context-review
npm start
```

Open http://127.0.0.1:3000. Stop with Ctrl+C. If that port is occupied, use PowerShell `$env:PORT='3075'; npm start`, or POSIX `PORT=3075 npm start`.

The loopback-only server serves an explicit allowlist of app files. Repository documents, local transcripts, environment files and media are not served.

## Review workflow

1. Choose one of three predefined excerpts from the entirely fictional Naledi interview.
2. Read the full source, labelled KEPT/OMITTED for that excerpt. Choose Labels only for a colour-free view. Labels are exposed as text to assistive technology; evidence links move keyboard focus to source turns.
3. Inspect the authored meaning observation, validated source evidence and authentic restoration passage. The preserved-meaning example shows “No concern flagged”, not approval.
4. Explicitly resolve or dismiss each material finding with a rationale. Separately choose Keep / Revise / Leave out for the excerpt. No edits are applied or verified.
5. Save and reopen decisions after reload. Preview or export the readable internal report. Reports use saved decisions only and remain incomplete until all excerpt and finding decisions are recorded.

The report is a plain-text working document. It includes review scope, source/version, exact excerpts, method, evidence, consequences, remedies, decisions and unresolved concerns. Completion records human review; it does not certify truthfulness.

## Boundaries

- All observations are authored and deterministic. No model request, external asset or analytics request occurs. The demo establishes workflow behaviour, not general AI detection accuracy.
- “Omitted” means excluded from the active excerpt, not absent from the documentary. The three excerpts are separate selections, not one final edit. Context supplied elsewhere may be recorded in a rationale but is not verified.
- Source/edit import and in-app passage selection both remain in the next product phase. Contradictions, reordered edits and arbitrary transcripts are not assessed.
- Changed source, excerpt or review identities require reassessment. Unknown evidence and malformed responses cannot become clearance; source remains readable.
- Decisions use browser localStorage. They can be cleared, are not encrypted by this app and do not sync. Malformed, outdated and unavailable records are visibly identified. Downloaded reports remain on the user's device.
- Only synthetic data belongs in this repository. Private data, local work, decision exports and report exports are ignored; inspect staged files before committing.

## Verify

```sh
npm test
```

Thirteen Node tests cover exact evidence, material cases and authentic remedies, full response validation, instruction-like transcript content, independent decisions, malformed/blocked/stale storage, and complete/incomplete reports.

Optional browser verification uses Playwright as a development-only tool in ignored `work/browser`; it is not an application dependency:

```sh
npm install --prefix work/browser --no-package-lock --no-save playwright
```

Start the app separately on port 3075, then run:

```sh
node tests/browser_check.mjs
```

The test defaults to installed Windows Chrome and http://127.0.0.1:3075. Set `BROWSER_PATH` to an installed Chromium-based browser executable and `TEST_URL` to the local server URL on other systems. It creates an isolated browser profile; screenshots and downloaded test reports go to ignored `work/`.

The browser suite checks annotations, evidence links, decisions/reload, report download, failure/recovery, stale/blocked storage, keyboard operation, accessibility-tree status, high contrast, enlarged text, responsive layout, no external requests and server restrictions. These checks are not a formal screen-reader or accessibility audit.

## Project records

- [Project brief](docs/PROJECT_BRIEF.md)
- [Approved plan and acceptance criteria](docs/MVP_PLAN.md)
- [Verification results and limits](docs/VERIFICATION.md)

Private repository: https://github.com/stanfordgibson/documentary-context-review

`main` contains the approved planning baseline. `feat/source-review` preserves Milestone 1 at `470b372`. `feat/editorial-review` includes that source-review implementation, the approved specification and Milestones 2/3. The clone command selects the working implementation branch.
