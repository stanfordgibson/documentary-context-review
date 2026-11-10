import { identity } from './review.js';

export const SCHEMA = 1;
export const excerptChoices = ['Keep', 'Revise', 'Leave out'];
export const findingChoices = ['Addressed', 'Dismissed'];
export const recordKey = (interview, excerpt) => `context-cut:decision:${JSON.stringify([interview.id, excerpt.id])}`;
const nonblank = value => typeof value === 'string' && Boolean(value.trim());

export function validateRecord(interview, excerpt, review, record) {
  if (!record || record.schema !== SCHEMA || record.identity !== identity(interview, excerpt)) throw new Error('Saved review is outdated. Reassessment required.');
  const decision = (value, choices) => value && choices.includes(value.status) && nonblank(value.rationale) &&
    typeof value.updatedAt === 'string' && Number.isFinite(Date.parse(value.updatedAt));
  if (!record.findings || typeof record.findings !== 'object' || Array.isArray(record.findings) ||
      (record.excerpt !== null && !decision(record.excerpt, excerptChoices))) throw new Error('Saved decisions are malformed.');
  for (const [id, value] of Object.entries(record.findings)) {
    if (!review.flags.some(flag => flag.id === id) || !decision(value, [...findingChoices, 'Resolved'])) throw new Error('Saved finding decision is invalid or outdated.');
  }
  // Preserve existing saved rationales and dates when renaming the old label.
  const current = structuredClone(record);
  Object.values(current.findings).forEach(value => { if (value.status === 'Resolved') value.status = 'Addressed'; });
  return current;
}

export function loadRecord(storage, interview, excerpt, review) {
  try {
    const raw = storage.getItem(recordKey(interview, excerpt));
    if (raw === null) return { record: null, issue: null };
    return { record: validateRecord(interview, excerpt, review, JSON.parse(raw)), issue: null };
  } catch (error) { return { record: null, issue: `Saved review unavailable: ${error.message}` }; }
}

export function saveDecision(storage, interview, excerpt, review, record, findingId, status, rationale, now = new Date().toISOString()) {
  if (review.status !== 'reviewed') throw new Error('A current available review is required before saving decisions.');
  if (!nonblank(rationale)) throw new Error('Enter a rationale before saving.');
  const next = record ? structuredClone(validateRecord(interview, excerpt, review, record)) :
    { schema: SCHEMA, identity: identity(interview, excerpt), excerpt: null, findings: {} };
  const decision = { status, rationale: rationale.trim(), updatedAt: now };
  if (findingId) next.findings[findingId] = decision;
  else next.excerpt = decision;
  validateRecord(interview, excerpt, review, next);
  const key = recordKey(interview, excerpt);
  const serialized = JSON.stringify(next);
  storage.setItem(key, serialized);
  if (storage.getItem(key) !== serialized) throw new Error('Storage could not confirm the save.');
  return next;
}

export function isComplete(review, loaded) {
  return review.status === 'reviewed' && !loaded.issue && Boolean(loaded.record?.excerpt) &&
    review.flags.every(flag => Boolean(loaded.record.findings[flag.id]));
}
