import { resolveExcerpt, validateTranscript } from './evidence.js';

// Exact authored fixture binding: changed material needs reassessment, never recycled observations.
const APPROVED_FIXTURE = "{\"id\":\"fictional-community-cinema\",\"version\":1,\"title\":\"A screen in the neighbourhood\",\"description\":\"Entirely fictional interview with Naledi, an imagined community cinema organiser in Johannesburg. All people, events, and dialogue are invented for this demo.\",\"turns\":[{\"id\":\"T01\",\"speaker\":\"Interviewer\",\"start\":\"00:00\",\"end\":\"00:07\",\"text\":\"What does a neighbourhood screening offer that watching alone cannot?\"},{\"id\":\"T02\",\"speaker\":\"Naledi\",\"start\":\"00:08\",\"end\":\"00:22\",\"text\":\"A screening gives us a reason to sit together. The conversation after the film is as important as the film itself. People stay to exchange their own stories.\"},{\"id\":\"T03\",\"speaker\":\"Interviewer\",\"start\":\"00:23\",\"end\":\"00:29\",\"text\":\"Could you keep these screenings free next year?\"},{\"id\":\"T04\",\"speaker\":\"Naledi\",\"start\":\"00:30\",\"end\":\"00:45\",\"text\":\"We can keep the screenings free, but only if the hall remains available without a rental fee. If that changes, we will need a different plan.\"},{\"id\":\"T05\",\"speaker\":\"Interviewer\",\"start\":\"00:46\",\"end\":\"00:55\",\"text\":\"Someone suggested replacing the discussion with a ticketed reception. Would you support that change?\"},{\"id\":\"T06\",\"speaker\":\"Naledi\",\"start\":\"00:56\",\"end\":\"01:05\",\"text\":\"No, I would not support that. The discussion should be open to everyone who comes to the film.\"},{\"id\":\"T07\",\"speaker\":\"Interviewer\",\"start\":\"01:06\",\"end\":\"01:12\",\"text\":\"What would you like a new visitor to know?\"},{\"id\":\"T08\",\"speaker\":\"Naledi\",\"start\":\"01:13\",\"end\":\"01:24\",\"text\":\"You do not need to be a film expert. Come with a question, and make room for someone else's answer.\"}],\"excerpts\":[{\"id\":\"conversation\",\"title\":\"The conversation after\",\"caseLabel\":\"Shortened quote\",\"questionTurnId\":\"T01\",\"selections\":[{\"turnId\":\"T02\",\"text\":\"The conversation after the film is as important as the film itself.\"}]},{\"id\":\"free-screenings\",\"title\":\"Keeping screenings free\",\"caseLabel\":\"Omitted qualification\",\"questionTurnId\":\"T03\",\"selections\":[{\"turnId\":\"T04\",\"text\":\"We can keep the screenings free\"}]},{\"id\":\"support\",\"title\":\"What does “that” mean?\",\"caseLabel\":\"Question-dependent reply\",\"questionTurnId\":\"T05\",\"selections\":[{\"turnId\":\"T06\",\"text\":\"No, I would not support that.\"}]}]}";

export const REVIEW_REVISION = 'authored-1';
export const LIMITS = 'Fixed fictional examples; authored deterministic observations, not general AI detection. Interview-only review: context elsewhere in the documentary, contradictions, reordered edits and arbitrary transcripts are not assessed. No model request occurs.';

export function identity(interview, excerpt) {
  return JSON.stringify([interview.id, interview.version, interview.turns, excerpt, REVIEW_REVISION]);
}

function span(turn, text = turn.text) {
  const start = turn.text.indexOf(text);
  return { turnId: turn.id, start, end: start + text.length };
}

export function authoredReview(interview, excerpt) {
  resolveExcerpt(interview, excerpt);
  const base = { identity: identity(interview, excerpt), revision: REVIEW_REVISION, status: 'reviewed', flags: [] };
  // Interview text is data only. The stub never interprets it as instructions.
  if (JSON.stringify(interview) !== APPROVED_FIXTURE || interview.id !== 'fictional-community-cinema' || interview.version !== 1) {
    return { ...base, status: 'insufficient_context' };
  }
  const byId = validateTranscript(interview);
  if (excerpt.id === 'conversation') return base;
  if (excerpt.id === 'free-screenings') {
    const turn = byId.get('T04');
    return { ...base, flags: [{ id: 'CC-001', kind: 'omitted_qualification',
      changed: 'The excerpt retains the promise of free screenings but excludes its condition.',
      consequence: 'An audience may hear an unconditional promise. In the source, free screenings depend on the hall remaining available without a rental fee.',
      evidence: [span(turn)],
      remedy: { explanation: 'Restore the source qualification about the rent-free hall. The app records this recommendation; it does not apply an edit.', passages: [span(turn, 'but only if the hall remains available without a rental fee.')] }
    }] };
  }
  if (excerpt.id === 'support') {
    return { ...base, flags: [{ id: 'CC-002', kind: 'missing_question',
      changed: 'The answer is retained without the question that identifies what “that” refers to.',
      consequence: 'An audience cannot reliably tell what Naledi rejects. The source question concerns replacing the discussion with a ticketed reception; this is ambiguity, not evidence that her position reversed.',
      evidence: [span(byId.get('T05')), span(byId.get('T06'))],
      remedy: { explanation: 'Restore the interviewer’s question, or communicate the same referent clearly in the edit. The quoted restoration below is authentic source material.', passages: [span(byId.get('T05'))] }
    }] };
  }
  return { ...base, status: 'insufficient_context' };
}

export function validateReview(interview, excerpt, response) {
  resolveExcerpt(interview, excerpt);
  const byId = validateTranscript(interview);
  const object = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
  const nonblank = value => typeof value === 'string' && Boolean(value.trim());
  if (!object(response, ['identity', 'revision', 'status', 'flags']) ||
      response.identity !== identity(interview, excerpt) || response.revision !== REVIEW_REVISION ||
      !['reviewed', 'insufficient_context'].includes(response.status) || !Array.isArray(response.flags) ||
      (response.status === 'insufficient_context' && response.flags.length)) throw new Error('Invalid review response or revision.');
  function resolveSpan(ref) {
    if (!object(ref, ['turnId', 'start', 'end'])) throw new Error('Invalid evidence passage.');
    const turn = byId.get(ref.turnId);
    if (!turn || !Number.isInteger(ref.start) || !Number.isInteger(ref.end) ||
        ref.start < 0 || ref.end <= ref.start || ref.end > turn.text.length) throw new Error('Evidence passage cannot be verified.');
    return { ...ref, speaker: turn.speaker, startTime: turn.start, endTime: turn.end, text: turn.text.slice(ref.start, ref.end) };
  }
  const ids = new Set();
  const flags = response.flags.map(flag => {
    if (!object(flag, ['id', 'kind', 'changed', 'consequence', 'evidence', 'remedy']) ||
        !nonblank(flag.id) || ids.has(flag.id) || !['omitted_qualification', 'missing_question', 'changed_implication'].includes(flag.kind) ||
        !nonblank(flag.changed) || !nonblank(flag.consequence) || !Array.isArray(flag.evidence) || !flag.evidence.length ||
        !object(flag.remedy, ['explanation', 'passages']) || !nonblank(flag.remedy.explanation) ||
        !Array.isArray(flag.remedy.passages) || !flag.remedy.passages.length) throw new Error('Invalid material finding or remedy.');
    ids.add(flag.id);
    return { ...flag, evidence: flag.evidence.map(resolveSpan), remedy: { ...flag.remedy, passages: flag.remedy.passages.map(resolveSpan) } };
  });
  return { ...response, flags };
}

export function runReview(interview, excerpt, producer = authoredReview) {
  try { return validateReview(interview, excerpt, producer(interview, excerpt)); }
  catch { return { status: 'unavailable', flags: [], revision: REVIEW_REVISION, identity: identity(interview, excerpt) }; }
}
