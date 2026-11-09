# Context Cut

A local-first source review prototype for documentary filmmakers. Trace a proposed excerpt back to its question and surrounding exchange before making an editorial decision.

Andela × OpenAI Codex Accelerator capstone. Working name: Context Cut. Default repository: `documentary-context-review`.

## Plan

- [Project brief](docs/PROJECT_BRIEF.md)
- [MVP plan and demo](docs/MVP_PLAN.md)

Deadline: **Wednesday, 11 November 2026, end of day SAST (UTC+2)**. Internal submission target: 18:00 SAST that day.

This repository starts with a committed plan. Milestone 1 adds source review; AI-assisted review and persistent editorial decisions follow on separate milestones. Only fictional interview data belongs in the demo repository.

## Run the source-review demo

Requires Node.js 22 or newer. No `npm install` is needed.

```bash
git clone --branch feat/source-review https://github.com/stanfordgibson/documentary-context-review.git
cd documentary-context-review
npm start
```

Open **http://127.0.0.1:3000** in your browser. Stop with Ctrl+C. To change the port: `PORT=3001 npm start` (POSIX shell). The server listens only on loopback and serves an explicit allowlist of app files. It does not expose repository files, local transcripts, or media directories.

Choose any of the three excerpts. The highlighted selection is shown inside its complete source turn, with the question, immediate neighbouring turns, and turn-level timestamps. Open **Read the full source transcript** for all eight turns. Excerpt links survive reload, for example `http://127.0.0.1:3000/?excerpt=free-screenings`.

The interview is entirely invented. The demo case labels are authored examples, not automated judgments. AI observations and decision persistence are not implemented in milestone 1. The app makes no model requests, uses no remote assets, and does not accept uploads. Keep real data out of this fixture. `.gitignore` excludes common private-data locations, media, secrets, and local work; check staged changes before every commit.

## Verify

```bash
npm test
```

This runs seven Node tests covering the three evidence mappings and rejected missing references, wrong question speakers/order, altered quotations, duplicate IDs, empty selections, and invalid timestamps.

Optional browser verification requires Python 3 and Playwright; application users do not need them. In a separate terminal, with the server running on port 3000:

```bash
python3 -m venv work/venv
work/venv/bin/pip install playwright
PLAYWRIGHT_BROWSERS_PATH="$PWD/work/browsers" work/venv/bin/python -m playwright install chromium
PLAYWRIGHT_BROWSERS_PATH="$PWD/work/browsers" work/venv/bin/python tests/browser_check.py
```

The browser check verifies all displayed selections, source lines, questions, timestamps, nearby turn IDs, navigation/reload, the full transcript, 390px layout, failed source resolution and recovery, failed fixture loading, absence of external requests, and server file/method restrictions. Screenshots go to ignored `work/`.

## GitHub repository

Private repository: https://github.com/stanfordgibson/documentary-context-review

Owner and private visibility were verified before pushing. Both branches are available:

- `main`: committed project brief and three-milestone plan baseline.
- `feat/source-review`: working milestone 1 demo, tests, and current documentation.

The run command above clones the feature branch because the application is not yet merged into main. Existing local checkouts can use `git switch feat/source-review`.

The origin is `https://github.com/stanfordgibson/documentary-context-review.git`. The GitHub connection supports the completed pushes. Repository creation and visibility changes required the owner to use GitHub's website; future administration changes may also require that step. Never paste credentials into chat.

Next: milestone 2 adds evidence-validated deterministic AI observations, including no-concern, insufficient-context, and failure states. See the plan for Wednesday's decision-persistence and submission schedule.
