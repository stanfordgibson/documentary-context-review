# Context Cut

A local editorial review prototype for documentary filmmakers. Review a proposed excerpt against its original interview, inspect potential meaning changes and authentic remedies, and record human reasoning in an internal integrity report.

Andela × OpenAI Codex Accelerator capstone. Submission deadline: Wednesday 11 November 2026, end of day SAST; internal target 18:00 SAST.

## Run

Requires Node.js 22 or newer. Application dependencies, credentials, and `npm install` are not required.

```sh
git clone https://github.com/stanfordgibson/documentary-context-review.git
cd documentary-context-review
npm start
```

Open http://127.0.0.1:3000. Stop with Ctrl+C. If that port is occupied, use PowerShell `$env:PORT='3075'; npm start`, or POSIX `PORT=3075 npm start`.

The loopback-only server serves an explicit allowlist of app files. Repository documents, local transcripts, environment files and media are not served.

## Review workflow

1. Choose one of three predefined excerpts from the entirely fictional Naledi interview.
2. Read the full source, labelled KEPT/OMITTED for that excerpt. Choose Labels only for a colour-free view. Labels are exposed as text to assistive technology; evidence links move keyboard focus to source turns.
3. Inspect the authored meaning observation, validated source evidence and authentic restoration passage. The preserved-meaning example shows “No concern flagged”, not approval.
4. Mark each material finding Addressed or Dismissed with a rationale. Addressed records how you dealt with it; Dismissed records why it does not apply or warrant a change. Both preserve evidence and suggested remedies. Separately choose Keep / Revise / Leave out for the excerpt. No edits are applied or verified.
5. Save and reopen decisions after reload. Preview or export the readable internal report. Reports use saved decisions only and remain incomplete until all excerpt and finding decisions are recorded.

The report has Limitations, Metadata and Findings sections, with a numbered subsection for every excerpt. Export text or choose Print / Save as PDF and select your browser's PDF destination. Completion records human review; it does not certify truthfulness.

Kept passages open their meaning review. Other example passages have review links that select the corresponding excerpt. The excerpt selector stays available while scrolling and includes one-line summaries for hover, keyboard and touch users. Focus on this passage collapses distant turns; Show full transcript restores them. Old saved Resolved labels appear as Addressed with their rationale and timestamp retained.

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

Fourteen Node tests cover exact evidence, material cases and authentic remedies, full response validation, instruction-like transcript content, independent decisions, legacy decision labels, malformed/blocked/stale storage, and complete/incomplete reports. GitHub Actions runs these on pushes and pull requests.

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

`main` is the reviewed capstone release branch. `feat/source-review` preserves Milestone 1 at `470b372`; `feat/editorial-review` retains the implementation history. Pull requests document review and verification before integration.

## Hosted demonstration

[Context Cut Naledi demo](https://context-cut-naledi-demo.codex-certif-9427.chatgpt.site) is public to anyone with the link, as authorised by the owner. It uses the fictional fixture and browser-local decisions. Local decisions do not transfer to the hosted address, and one visitor's decisions are not shared with others.

GitHub remains the project history. `.openai/hosting.json` identifies the Site; `node scripts/build-site.mjs` prepares only the eight allowlisted browser assets in ignored `dist/`. Sites publication uses a separately versioned source mirror and the build produced from that source. No real transcripts or saved decisions are included.
