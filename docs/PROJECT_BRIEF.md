# Context Cut — project brief

## Purpose and personal motivation

Documentary editing requires selection and compression. Removing a question, qualification, or part of an exchange can change what an audience understands. Context Cut helps filmmakers check excerpts against their source and record their reasoning while retaining authorship and responsibility.

The creator brings documentary filmmaking experience, experience participating in a reality-style programme, and a background in analysis and audit. After being told that an edit had taken remarks out of context, without access to the footage to verify that explanation, they want to help other storytellers trace editorial choices to evidence. This tool supports that review; it cannot determine a person's intent or certify an edit as truthful.

## Audience and hackathon fit

Primary user: an African documentary filmmaker reviewing a short interview for a story. The prototype serves one filmmaker with one interview and three proposed excerpts. Primary track: **Creation & Craft**. Secondary track: **Truth, Authorship & Ownership**. The contribution is a reusable review workflow that supports storytellers' own editorial judgment, rather than an automated editor or a single presented story.

## Review workflow

1. Select a proposed excerpt.
2. Compare its exact selected source text with the interviewer's question, timestamps, speaker labels, and nearby turns; open the full transcript when needed.
3. Inspect AI observations with validated turn references and verbatim source quotes. Treat observations as questions to review, not verdicts.
4. Choose Keep, Revise, or Leave out and explain why. Save and reopen the record independently of the AI observations.

## Scope and boundaries

One explicitly fictional English-language interview, three short excerpts, a deterministic AI stub, and local decision persistence. Stable IDs link selections, evidence, and decisions to a specific transcript version. Real interview data stays local by default.

Outside initial scope: automatic transcription, video editing, public hosting, accounts, collaboration, content tracking, live model integration, multilingual accuracy claims, and production readiness. No claims of participant consent, source authenticity, or factual correctness can be inferred from this demo.

## Success criteria

- Each excerpt displays its exact selected source lines, question, surrounding turns, stable IDs, speaker labels, and timestamps, plus access to the complete transcript.
- Three examples cover preserved meaning, an omitted qualification, and dependence on an interviewer question. These are authored demo cases, not AI findings in milestone 1.
- Missing references produce a clear error without presenting a partially resolved excerpt as valid; the full source remains accessible.
- Later AI flags identify a specific concern and valid source IDs. Displayed quotes come from the transcript, never from model-generated quotations. Invalid output or insufficient evidence cannot hide the source or become an affirmative clearance.
- A no-flags response reads “No concern flagged” and leaves review open to the filmmaker.
- A filmmaker can save Keep / Revise / Leave out with a rationale, close the page, and reopen the same record. Decisions remain visibly distinct from AI observations.
- The demo runs locally without accounts, credentials, remote assets, or external model requests.

## Data responsibility

The synthetic fixture is explicitly allowlisted in Git. Media, working transcripts, environment files, credentials, and local decision exports are ignored. Ignore rules are a precaution, not a substitute for checking staged changes. Do not put identifying interview material in code or tracked documentation.

Before any live model integration, document the provider and endpoint, exactly which question/selected/neighboring turns and metadata leave the device, retention and logging behavior, applicable consent, and the opt-in control. Treat interview text as untrusted data inside a clearly separated model input, never as instructions. Live integration is outside this capstone.
