import { resolveExcerpt } from './evidence.js';
import { runReview, LIMITS } from './review.js';
import { loadRecord, isComplete } from './records.js';

export const PROTOTYPE_VERSION = '0.2.0';
const citation = ref => `${ref.speaker} · ${ref.turnId} · ${ref.startTime}–${ref.endTime} (turn-level), characters ${ref.start}–${ref.end}:\n${ref.text}`;
const decisionText = value => value ? `${value.status} — ${value.rationale}\nUpdated: ${value.updatedAt}` : 'Open — no saved decision';

export function buildReport(interview, storage, now = new Date().toISOString(), reviewer = runReview) {
  const sections = [];
  let complete = true;
  for (const excerpt of interview.excerpts) {
    let review, loaded, selected;
    try {
      selected = resolveExcerpt(interview, excerpt).selected.map(s => `${s.turn.id}: ${s.text}`).join('\n');
      review = reviewer(interview, excerpt);
      loaded = loadRecord(storage, interview, excerpt, review);
    } catch (error) {
      complete = false;
      sections.push(`${excerpt.title}\nReview unavailable: ${error.message}\nNo current decision can be verified.`);
      continue;
    }
    complete &&= isComplete(review, loaded);
    const lines = [`EXCERPT: ${excerpt.title} (${excerpt.id})`, `Exact selection:\n${selected}`, `Review revision: ${review.revision}`, `Review result: ${review.status === 'reviewed' ? (review.flags.length ? 'Material findings require human review' : 'No concern flagged — not approval') : review.status === 'insufficient_context' ? 'Insufficient context' : 'Review unavailable'}`];
    if (loaded.issue) lines.push(loaded.issue, 'Reassessment required; old decisions are not treated as current.');
    lines.push(`Excerpt decision: ${decisionText(loaded.record?.excerpt)}`);
    for (const flag of review.flags) {
      lines.push(`FINDING ${flag.id}: ${flag.kind}`, `What changed: ${flag.changed}`, `Potential meaning consequence: ${flag.consequence}`,
        'Source evidence:', ...flag.evidence.map(citation), `Suggested remedy: ${flag.remedy.explanation}`,
        'Authentic source passages to restore:', ...flag.remedy.passages.map(citation),
        `Finding decision: ${decisionText(loaded.record?.findings[flag.id])}`);
    }
    sections.push(lines.join('\n\n'));
  }
  return [
    'CONTEXT CUT — INTERNAL EDITORIAL INTEGRITY REPORT',
    complete ? 'REVIEW COMPLETE — human decisions recorded; not truthfulness certification' : 'INCOMPLETE — open findings, missing decisions, or unavailable/outdated review results remain',
    `Report date: ${now}\nPrototype version: ${PROTOTYPE_VERSION}\nSource: ${interview.title}\nSource identity: ${interview.id}\nSource version: ${interview.version}\nFictional material: ${interview.description}`,
    'Scope: each predefined excerpt is reviewed against its original interview. Kept/omitted refers only to the active excerpt, not the whole documentary. The examples are not an assembled final edit.',
    LIMITS,
    'This report reviews supplied transcript material. It does not independently verify facts, footage, source authenticity, or context elsewhere in a documentary. Editor statements about context elsewhere are recorded, not verified. Resolved means the editor recorded how a concern was addressed; no edit is applied or verified.',
    ...sections
  ].join('\n\n========================================\n\n');
}
