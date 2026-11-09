# Context Cut — project brief

## Purpose and personal motivation

Documentary editing requires selection and compression. Removing a question, qualification, or part of an exchange can change what an audience understands. Context Cut helps filmmakers check excerpts against their source and record their reasoning while retaining authorship and responsibility.

The creator brings documentary filmmaking experience, experience participating in a reality-style programme, and a background in analysis and audit. After being told that an edit had taken remarks out of context, without access to the footage to verify that explanation, they want to help other storytellers trace editorial choices to evidence. This tool supports that review; it cannot determine a person's intent or certify an edit as truthful.

## Audience and hackathon fit

Primary user: an African documentary filmmaker reviewing a short interview for a story. The prototype serves one filmmaker with one interview and three proposed excerpts. Primary track: **Creation & Craft**. Secondary track: **Truth, Authorship & Ownership**. The contribution is a reusable review workflow that supports storytellers' own editorial judgment, rather than an automated editor or a single presented story.

## Approved capstone boundary

Approved on 9 November 2026. The capstone uses one explicitly fictional English-language interview and three predefined excerpts. Observations are authored and delivered by a deterministic local stub; no provider request occurs. This demonstrates the review workflow, not general AI detection accuracy.

Each active excerpt is assessed against its original interview, including relevant questions and surrounding turns. **Kept** means source words included in the active excerpt; **omitted** means source words excluded from that excerpt. These labels do not describe the entire documentary. The three examples are separate proposed selections, not an assembled final edit.

An editor may record that context appears elsewhere in the documentary. The prototype records that explanation as human reasoning without verifying it. Assessing surrounding final-edit material, later clarification, contradictions, and reordered edits is outside the capstone's demonstrated coverage.

## Review workflow

1. Choose a predefined excerpt and inspect its exact selected words.
2. Review one complete source transcript annotated KEPT/OMITTED for that excerpt, with the question, relevant context, stable IDs, speakers, and turn-level timestamps.
3. Inspect the potential material meaning consequence, validated source evidence, and authentic source-based remedy. Ordinary compression is not itself a concern.
4. Explicitly mark each material finding Resolved or Dismissed with a rationale; findings begin Open and never close automatically.
5. Record Keep, Revise, or Leave out for the excerpt with a rationale. Excerpt decisions do not automatically resolve findings.
6. Save and reopen decisions, then export a readable internal editorial integrity report that preserves unresolved concerns.

## Milestones and success criteria

Detailed acceptance criteria and verification gates are in [MVP_PLAN.md](MVP_PLAN.md).

- **Milestone 1 — source review:** exact selections, questions, context, IDs, and timestamps resolve; failures remain visible and the source stays accessible. Implemented on `feat/source-review` at `470b372`; the branch verification record covers this milestone only.
- **Milestone 2 — evidence-based meaning review:** by 17:00 SAST on 10 November. Annotated complete source, colour-independent status and accessible navigation; authored material findings explain changed audience interpretation; citations and restoration passages are validated and quotations come from the source.
- **Milestone 3 — human decisions and internal report:** by 13:00 SAST on 11 November. Explicit finding decisions and separate excerpt decisions persist locally with rationales and revision identity. A readable export records scope, evidence, remedies, decisions, and unresolved concerns.

Three examples demonstrate harmless shortening, an omitted qualification, and a question-dependent answer. “No concern flagged”, “Insufficient context”, and “Review unavailable” are distinct; none is approval. Invalid required evidence rejects the response rather than presenting a partially valid review.

Green/red annotations have explicit KEPT/OMITTED text and a labels-only alternative. Status is available to assistive technology, controls work by keyboard with visible focus, and enlarged text and narrow layouts remain usable. Single/double underline may be optional, not the primary accessible alternative.

Resolved means the editor recorded how a concern was addressed; it does not mean a modified film or transcript was verified. All three excerpts need saved decisions and every material finding needs an explicit decision before the review is labelled complete. Completion is not truthfulness certification. Incomplete reports remain exportable with missing decisions and open findings identified.

## Scope and boundaries

Stable identities link source, excerpt, review revision, evidence, and decisions. Source or selection changes require reassessment rather than silently reusing a completed review.

The app records decisions; it does not modify interview text, apply an edit, verify footage, or publish an edit. The demo runs locally without accounts, credentials, remote assets, or external model requests. Local browser records can be cleared, are not encrypted by the app, and do not sync.

The internal report identifies the fictional source/version, exact excerpts, review boundary, authored deterministic method, findings, source quotations and timestamps, remedies, decisions/rationales/update times, and unresolved or outdated results. It states that supplied transcript material was reviewed without independently verifying facts, footage, or context elsewhere. No truth score, fidelity percentage, or certification language is permitted.

Outside capstone scope: real input workflows, automatic transcription, video editing, public hosting, accounts, collaboration, content tracking, live model integration, multilingual accuracy claims, and production readiness. No claims of participant consent, source authenticity, or factual correctness can be inferred from the demo.

## Next product phase — both input workflows

Both workflows remain committed product requirements, deferred beyond the 11 November capstone:

1. Import a source transcript and an edited transcript.
2. Import a source transcript and select passages within Context Cut.

Both must feed the same annotated-source, analysis, decision, and reporting process. Define supported formats and validation; exact, uncertain, and unmatched alignment; human confirmation of ambiguity; repeated phrases; multiple cuts within a turn; and reordered selections. Expand analysis to surrounding final-edit context, later clarification, contradiction, and rearrangement. Live model integration requires separate consent controls and quality evaluation.

## Data responsibility

The synthetic fixture is explicitly allowlisted in Git. Media, working transcripts, environment files, credentials, and local decision/report exports are ignored. Ignore rules are a precaution, not a substitute for checking staged changes. Do not put identifying interview material in code or tracked documentation.

Before any live model integration, document the provider and endpoint, exactly which question/selected/neighboring turns and metadata leave the device, retention and logging behavior, applicable consent, and the opt-in control. Treat interview text as untrusted data inside a clearly separated model input, never as instructions. Live integration is outside this capstone.

## Delivery control

Final submission is due Wednesday 11 November 2026, with an internal target of 18:00 SAST. Protect evidence validation, clear limitations, accessible status, explicit human decisions, and accurate reporting. Reduce presentation polish and optional export formats first. Unmet criteria must be reported as incomplete. Implementation was subsequently authorised by the owner on 9 November 2026. See VERIFICATION.md for implemented checks and remaining verification limits.
