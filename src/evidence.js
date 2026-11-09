export function validateTranscript(interview) {
  if (!Array.isArray(interview.turns) || !interview.turns.length) {
    throw new Error('The source transcript has no turns.');
  }
  const byId = new Map();
  for (const turn of interview.turns) {
    if (!turn.id || byId.has(turn.id)) throw new Error(`Missing or duplicate source ID: ${turn.id || '(empty)'}.`);
    if (typeof turn.text !== 'string' || !turn.text || !turn.speaker ||
        !/^\d{2}:\d{2}$/.test(turn.start) || !/^\d{2}:\d{2}$/.test(turn.end)) {
      throw new Error(`Source ${turn.id} needs text, speaker, and MM:SS timestamps.`);
    }
    const seconds = time => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
    if (Number(turn.start.slice(3)) > 59 || Number(turn.end.slice(3)) > 59 || seconds(turn.end) < seconds(turn.start)) {
      throw new Error(`Source ${turn.id} has invalid timestamps.`);
    }
    byId.set(turn.id, turn);
  }
  return byId;
}

export function resolveExcerpt(interview, excerpt) {
  const byId = validateTranscript(interview);
  if (!excerpt) throw new Error('This excerpt does not exist. Choose another excerpt.');
  const getTurn = id => {
    if (!byId.has(id)) throw new Error(`Source reference ${id || '(empty)'} is missing from the transcript.`);
    return byId.get(id);
  };
  const question = getTurn(excerpt.questionTurnId);
  if (question.speaker !== 'Interviewer') throw new Error(`Question reference ${question.id} is not an interviewer turn.`);
  if (!Array.isArray(excerpt.selections) || !excerpt.selections.length) throw new Error('This excerpt has no source selections.');
  let previousIndex = -1;
  const selected = excerpt.selections.map(selection => {
    const turn = getTurn(selection.turnId);
    if (typeof selection.text !== 'string' || !selection.text.trim() || !turn.text.includes(selection.text)) {
      throw new Error(`Selected text does not match source ${turn.id}.`);
    }
    const index = interview.turns.indexOf(turn);
    if (index <= previousIndex) throw new Error('Source selections must use distinct turns in transcript order.');
    if (interview.turns.indexOf(question) >= index) throw new Error(`Question ${question.id} must precede selected source ${turn.id}.`);
    previousIndex = index;
    return { turn, text: selection.text };
  });
  const indexes = new Set();
  for (const { turn } of selected) {
    const index = interview.turns.indexOf(turn);
    for (let i = Math.max(0, index - 1); i <= Math.min(interview.turns.length - 1, index + 1); i++) indexes.add(i);
  }
  return { question, selected, nearby: [...indexes].sort((a, b) => a - b).map(i => interview.turns[i]) };
}
