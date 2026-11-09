# MVP plan

## Delivery window

All times are SAST (UTC+2). External deadline: **Wednesday 11 November 2026, end of day**; interpret this as 23:59 SAST unless the organiser specifies otherwise. Aim to submit by **18:00 Wednesday**, leaving a buffer for upload or submission issues. Confirm any organiser-specific requirements before final submission.

| Date | Deliverable | Acceptance gate |
| --- | --- | --- |
| Mon 9 Nov | Milestone 1: source review; brief and plan committed first | Three examples resolve exactly; missing references fail clearly; desktop and narrow-screen checks |
| Tue 10 Nov, by 17:00 | Milestone 2: deterministic AI-assisted review | Structured flags cite valid source IDs; source-derived quotes; no flags, insufficient context, invalid evidence, and failure states checked |
| Wed 11 Nov, by 13:00 | Milestone 3: decisions and persistence | Keep / Revise / Leave out plus required rationale saved and reopened after reload; AI observations remain separate |
| Wed 11 Nov, 13:00–16:00 | Integrate, rehearse, prepare submission | Full demo under three minutes; fresh-start run instructions checked; repository contains only synthetic data |
| Wed 11 Nov, 16:00–18:00 | Record and submit | Submission link and required materials checked; preserve remaining time as buffer |

## Stack and trade-offs

Use vanilla HTML/CSS and JavaScript modules with a Node 22+ standard-library server bound to 127.0.0.1. No framework, bundler, application dependencies, remote fonts, analytics, or API keys. Node's built-in test runner covers evidence resolution; browser tests cover actual interactions. This keeps setup small and source visible, at the cost of manual DOM composition and no production service layer. Serve only an explicit public-file allowlist, never the repository root or local interview directories.

Data: one JSON synthetic fixture with interview ID/version; turns have immutable IDs, speakers, start/end timestamps, and exact text. Excerpts contain ordered selections `{turnId, text}` and `questionTurnId`. A selection must occur verbatim within its referenced turn. Show the full selected turn alongside the shorter excerpt so omissions remain visible. Nearby context is at least one turn before and after each selected turn; the explicit interviewer question is always shown. The entire transcript is readable separately. Timestamps describe transcript turns, not word-level media alignment.

## Milestone 1 — source review (this session)

Build a responsive screen with excerpt navigation, proposed quote, selected source, interviewer question, nearby turns, and expandable full transcript. Label everything fictional. Highlight exact source spans and distinguish selected turns from context. Explain that source display is available now and AI/decision features arrive later; avoid inactive controls that imply a working review.

Acceptance: verify all three selections, questions, IDs, nearby turns, timestamps, and full transcript. Missing turn IDs, wrong question references, duplicate IDs, or selected text absent from the source must yield a useful error. Full transcript remains available after a failed excerpt resolution. Test navigation and narrow-screen layout in a browser.

## Milestone 2 — AI-assisted review

Add a deterministic local stub keyed by fixture/version/excerpt. No provider request occurs. Suggested structured contract: `{status: 'reviewed' | 'insufficient_context', flags: [{kind, concern, sourceTurnIds}]}`; kinds include `omitted_qualification`, `missing_question`, and `changed_implication`. Validate the full response schema, known enums, nonempty concerns, and every evidence reference before rendering. Derive quotations from the source map. Reject unknown references rather than silently dropping them.

Author stub observations for the qualification and question cases. For the preserved-meaning case show “No concern flagged”, followed by an invitation to review the source. An empty flag list is not proof of fidelity. Separate “Insufficient context” from “No concern flagged”. On malformed output or simulated model failure show “AI review unavailable” and keep the source usable. Include tests for all these outcomes and for interview text containing instruction-like content. If a model is added later, use structured responses and separate instructions from untrusted interview data; never execute its output.

## Milestone 3 — editorial decision and demo

Use browser localStorage for this single-user prototype, keyed by interview/version/excerpt. Store decision, rationale, update time, and schema version. Require a nonblank rationale for Keep / Revise / Leave out. Reopen and edit records on navigation and reload. Handle unavailable storage, malformed records, and version mismatch visibly without claiming a successful save. Document that browser data can be cleared, is not encrypted by this app, and does not sync. A JSON export may be added only if core persistence is complete.

Keep the filmmaker's decision in its own panel and data record, separate from AI observations. The app does not modify the interview or publish an edit.

## Demo script (approximately 3 minutes after milestone 3)

1. Introduce the filmmaker's problem: a short excerpt can lose the context that makes it fair. Identify the interview as entirely fictional.
2. Open the preserved-meaning excerpt. Compare its source and question; show “No concern flagged” without claiming approval. Keep it with a rationale.
3. Open the qualification excerpt. Show the omitted condition directly in the source, inspect the stub observation and evidence, and choose Revise with a rationale that restores the qualification.
4. Open the question-dependent excerpt. Read the question and nearby turns, then explain why the short reply alone is ambiguous. Choose Leave out with a rationale.
5. Reload and reopen a saved decision. End with the filmmaker's authorship and responsibility, and the fact that no interview text was sent to a model.

For milestone 1 alone, demonstrate the first three comparisons and the full-transcript control; explicitly state that AI review and saving decisions are planned, not implemented.

## Git and scope control

Commit brief/plan on main before implementation. Implement milestone 1 on `feat/source-review`; use descriptive commits. Create a private `documentary-context-review` repository only under the verified authenticated account, verify visibility/owner/remote before pushing main and the feature branch. If authentication fails, preserve all local progress and document reconnection commands. Do not substitute a public repository or deploy a public site.

Cut visual polish and optional exports first if time slips. Preserve exact evidence resolution, clear failure states, and saved editorial reasoning. The capstone intentionally makes no automated transcription, editing, hosting, account, collaboration, or content tracking commitments.
