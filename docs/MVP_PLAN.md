# MVP plan

Approved capstone specification: 9 November 2026. The owner subsequently authorised implementation on 9 November. Acceptance criteria remain the requirements baseline; see VERIFICATION.md for actual verification and limits.

## Delivery window

All times are SAST (UTC+2). External deadline: **Wednesday 11 November 2026, end of day**; interpret this as 23:59 SAST unless the organiser specifies otherwise. Aim to submit by **18:00 Wednesday**, leaving a buffer for upload or submission issues. Confirm any organiser-specific requirements before final submission.

| Date | Deliverable | Acceptance gate |
| --- | --- | --- |
| Mon 9 Nov | Milestone 1: source review; brief and plan committed first | Three examples resolve exactly; missing references fail clearly; desktop and narrow-screen checks |
| Tue 10 Nov, by 17:00 | Milestone 2: evidence-based meaning review | Accessible kept/omitted source; material meaning explanations; validated evidence and authentic remedies; honest review/failure states |
| Wed 11 Nov, by 13:00 | Milestone 3: human decisions and internal report | Explicit finding decisions; separate excerpt decisions; rationales persist; readable report preserves unresolved concerns |
| Wed 11 Nov, 13:00–16:00 | Integrate, rehearse, prepare submission | Full demo under three minutes; fresh-start run instructions checked; repository contains only synthetic data |
| Wed 11 Nov, 16:00–18:00 | Record and submit | Submission link and required materials checked; preserve remaining time as buffer |

## Stack and trade-offs

Use vanilla HTML/CSS and JavaScript modules with a Node 22+ standard-library server bound to 127.0.0.1. No framework, bundler, application dependencies, remote fonts, analytics, or API keys. Node's built-in test runner covers evidence resolution; browser tests cover actual interactions. This keeps setup small and source visible, at the cost of manual DOM composition and no production service layer. Serve only an explicit public-file allowlist, never the repository root or local interview directories.

Data: one JSON synthetic fixture with interview ID/version; turns have immutable IDs, speakers, start/end timestamps, and exact text. Excerpts contain ordered selections `{turnId, text}` and `questionTurnId`. A selection must occur verbatim within its referenced turn. Show the full selected turn alongside the shorter excerpt so omissions remain visible. Nearby context is at least one turn before and after each selected turn; the explicit interviewer question is always shown. Milestone 1 provides the full transcript separately; milestone 2 makes the complete annotated source the primary review surface. Timestamps describe transcript turns, not word-level media alignment.

## Milestone 1 — source review baseline

Build a responsive screen with excerpt navigation, proposed quote, selected source, interviewer question, nearby turns, and expandable full transcript. Label everything fictional. Highlight exact source spans and distinguish selected turns from context. Explain that source display is available now and AI/decision features arrive later; avoid inactive controls that imply a working review.

Acceptance: verify all three selections, questions, IDs, nearby turns, timestamps, and full transcript. Missing turn IDs, wrong question references, duplicate IDs, or selected text absent from the source must yield a useful error. Full transcript remains available after a failed excerpt resolution. Test navigation and narrow-screen layout in a browser.

## Approved review boundary

One fictional interview and three predefined excerpts. Assess each active excerpt against its original interview, including relevant questions and surrounding turns.

- **Kept:** source words included in the active excerpt.
- **Omitted:** source words excluded from that excerpt, not necessarily absent from the documentary.
- The three excerpts are separate selections, not an assembled final edit.
- Editors may record that context appears elsewhere; the prototype does not verify that explanation.
- Every material finding requires an explicit human decision.
- The editorial integrity report serves internal editors and producers.

Both real input workflows belong to the next product phase. The capstone does not accept source/edit imports or support creating selections in the app.

## Milestone 2 — evidence-based meaning review

**Target: Tuesday 10 November 2026, by 17:00 SAST.**

Choosing a predefined excerpt shows its exact selected words, one complete annotated source transcript, a meaning-review panel, validated evidence, and an authentic source-based remedy.

Use a deterministic local stub keyed by interview/version/excerpt and review revision. Observations are authored; no provider request occurs and no general AI detection accuracy is claimed. Validate the full response schema, known enums, required nonempty explanations, and all evidence and remedy references before rendering. Display source-derived quotations, never generated quotations. Separate instructions from untrusted interview text; never execute review output.

### Acceptance criteria

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| M2-01 | Clear review scope | Name the active excerpt and explain that annotations describe inclusion in that excerpt only. |
| M2-02 | Annotated source | Every source passage is identifiable as kept or omitted. Preserve wording, order, speaker, turn ID, and turn-level timestamps. |
| M2-03 | Accessible status | Green/red has explicit KEPT/OMITTED text. A labels-only display works without colour. Status is available to assistive technology. |
| M2-04 | Usable navigation | Keyboard users can choose excerpts, reach findings, and follow evidence references. Focus stays visible. Enlarged text and narrow layouts preserve readability and usable controls. |
| M2-05 | Meaning-first findings | Explain what changed and the specific audience interpretation that may result. Omission alone is insufficient grounds for a finding. |
| M2-06 | Validated evidence | Tie findings to the active interview version and excerpt. Resolve all cited source IDs and passage boundaries. Extract displayed quotations from source text. |
| M2-07 | Authentic remedies | Identify exact source material to restore or clearly describe the clarification needed. Label suggested editorial wording separately from source quotation. |
| M2-08 | Honest outcomes | Distinguish “No concern flagged”, “Insufficient context”, and “Review unavailable”. None is approval or proof of fidelity. |
| M2-09 | Safe failure | Malformed output, invalid required evidence, or simulated failure produces a visible unavailable state. Do not partially present the response as valid; keep source review usable. |
| M2-10 | Transparent demonstration | Clearly identify authored, deterministic observations. No model request occurs. Case labels are not automated discoveries. |

Single/double underline can be an optional preference, not the primary accessible alternative. Material concerns involve consequential changes in conditions, stance, certainty, attribution, contradiction, or contextual meaning; ordinary compression is not itself a concern. The demonstrated capstone coverage is limited to the following three cases.

### Required demonstration cases

**A. Harmless shortening:** the selected T02 sentence about the conversation after the film remains consistent with supplied interview context. Show “No concern flagged”; do not flag neighbouring omissions merely because words were removed; invite source review.

**B. Omitted qualification:** “We can keep the screenings free” excludes the rent-free-hall condition. Explain the possible shift from conditional statement to unconditional promise. Cite T04, display its authentic qualification, and propose restoring the relevant source qualification.

**C. Question-dependent answer:** “No, I would not support that” excludes the question identifying “that”. Explain the missing referent, cite T05 and T06, and identify the question or sufficient authentic context to restore. Do not invent a reversal of Naledi's position.

### Verification gate

All three cases must pass in the interface. Also check unknown references, invalid remedy passages, malformed review output, simulated failure, insufficient context, and interview text containing instruction-like content. Verify keyboard operation, colour-independent status, assistive-technology status, enlarged text, and narrow-screen layout.

Contradictions, reordered edits, and arbitrary transcripts are not claimed capabilities. Make these limits visible in the demonstration and report. Passing authored cases establishes workflow and evidence handling, not general semantic detection accuracy.

## Milestone 3 — human decisions and internal integrity report

**Target: Wednesday 11 November 2026, by 13:00 SAST.**

Editors explicitly review each finding, record an excerpt decision with reasoning, reopen saved records, and produce an internal report. The prototype records decisions; it does not modify the interview, apply an edit, publish an edit, or verify footage changes.

Use browser localStorage for this single-user prototype. Tie records to interview/version, excerpt identity and selection revision, and review revision; include decision, rationale, update time, and record schema version. Browser records can be cleared, are not encrypted by the app, and do not sync.

### Acceptance criteria

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| M3-01 | Excerpt decision | Support Keep / Revise / Leave out for each excerpt, requiring a nonblank rationale. |
| M3-02 | Finding decision | Material findings begin Needs attention. An editor explicitly marks each Addressed or Dismissed with a rationale. Never close findings automatically. |
| M3-03 | Accurate resolution meaning | Addressed means the editor recorded how the concern was addressed; it does not mean a modified film or transcript was verified. |
| M3-04 | Separate records | Observations, finding decisions, and excerpt decisions remain visibly distinct. Keep does not automatically dismiss findings. |
| M3-05 | Local persistence | Decisions, rationales, update times, and record versions survive navigation and reload, tied to the correct source, excerpt, selection, and review revision. |
| M3-06 | Visible storage failures | Unavailable storage, malformed records, and version mismatches produce clear messages. Never claim an unsuccessful save succeeded. |
| M3-07 | Stale review handling | A record for another source, selection, or review revision is not shown as a current completed review. Require reassessment. |
| M3-08 | Internal report | Export a readable report containing the required information below. One simple format suffices; multiple formats and visual polish are optional. |
| M3-09 | Honest completion | Label review complete only when all three excerpts have saved decisions and every material finding has an explicit decision. Completion is not truthfulness certification. |
| M3-10 | Unresolved visibility | Allow incomplete report export, clearly labelled incomplete, listing open findings and missing decisions. |

### Required report contents

- Report date and prototype version.
- Fictional source identity and version.
- Exact excerpts reviewed and interview-only review boundary.
- Disclosure of authored, deterministic observations.
- Findings and potential meaning consequences.
- Source citations, authentic quotations, and turn-level timestamps.
- Suggested remedies.
- Excerpt decisions, finding decisions, rationales, and update times.
- Unresolved concerns and outdated or unavailable review results.
- A statement that the report reviews supplied transcript material without independently verifying facts, footage, or context elsewhere in a documentary.

No truth score, fidelity percentage, or certification language. A raw decision-only JSON export does not satisfy the report requirement.

### Verification gate

Demonstrate evidence/remedy review, finding and excerpt decisions, reopening records after reload, and report export matching the saved state. Export an incomplete report with open concerns visible. Verify storage failure and outdated-record handling.

## Demo script (approximately 3 minutes after milestone 3)

1. Introduce the editorial problem; identify fictional data, fixed examples, authored deterministic review, and interview-only scope.
2. Open preserved meaning. Show the annotated source and “No concern flagged”; save Keep with a rationale without implying approval.
3. Open the qualification case. Show the changed implication, T04 evidence, and authentic restoration. Record a finding decision and Revise with rationales; do not imply the app applied a correction.
4. Open the question-dependent case. Show T05/T06, explain ambiguity, and record explicit finding and excerpt decisions.
5. Reload and reopen saved decisions. Export the internal report; point out its scope, decisions, and unresolved concerns if any. End with human responsibility and no model request.

For milestone 1 alone, show source comparisons and the full transcript; identify analysis, decisions, and reporting as unimplemented.

## Next product phase — both input workflows

Both remain product requirements beyond the capstone:

1. Import a source transcript and an edited transcript.
2. Import a source transcript and select passages within Context Cut.

Both feed the same annotated-source, analysis, decision, and reporting process. Define and test supported formats/import validation; exact, uncertain, and unmatched alignment; human confirmation of ambiguity; multiple selections within a turn; repeated phrases; and reordered passages.

Expand to surrounding final-edit context, including later clarification, contradiction, and rearrangement. Live model integration requires consent controls and separate quality evaluation. No arbitrary-transcript or live-model performance claims follow from the fixed examples.

## Git and scope control

The brief/plan baseline is on main. Milestone 1 is on `feat/source-review` at `470b372`; its `docs/VERIFICATION.md` establishes source-review checks only and is not present on the original main baseline. New acceptance criteria are requirements, not completed verification.

Keep the repository private under the verified owner. Never substitute public hosting or a public repository. Only synthetic interview data belongs in tracked files; keep local decisions and report exports ignored and inspect staged changes.

Protect evidence validation, clear review limitations, accessible status, explicit human decisions, and accurate reporting. Reduce presentation polish and optional export formats first; basic report export remains required. Report unmet criteria as incomplete rather than implying they work.

Implementation was subsequently authorised by the owner on 9 November 2026. See VERIFICATION.md for the implemented checks and remaining verification limits. The capstone makes no automated transcription, video editing, hosting, account, collaboration, content tracking, multilingual accuracy, or production readiness commitments.
