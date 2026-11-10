import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolveExcerpt } from '../src/evidence.js';

const fixture = JSON.parse(await readFile(new URL('../data/synthetic-interview.json', import.meta.url)));
const expectations = [
  { id: 'conversation', question: 'T01', selected: 'T02', start: '00:08', end: '00:22', nearby: ['T01', 'T02', 'T03'], quote: 'The conversation after the film is as important as the film itself.' },
  { id: 'free-screenings', question: 'T03', selected: 'T04', start: '00:30', end: '00:45', nearby: ['T03', 'T04', 'T05'], quote: 'We can keep the screenings free' },
  { id: 'support', question: 'T05', selected: 'T06', start: '00:56', end: '01:05', nearby: ['T05', 'T06', 'T07'], quote: 'No, I would not support that.' }
];
for (const expected of expectations) {
  test(`${expected.id}: exact evidence and adjacent context`, () => {
    const excerpt = fixture.excerpts.find(e => e.id === expected.id);
    const result = resolveExcerpt(fixture, excerpt);
    assert.equal(result.question.id, expected.question);
    assert.equal(result.question.speaker, 'Interviewer');
    assert.equal(result.selected[0].turn.id, expected.selected);
    assert.equal(result.selected[0].turn.speaker, 'Naledi');
    assert.equal(result.selected[0].turn.start, expected.start);
    assert.equal(result.selected[0].turn.end, expected.end);
    assert.equal(result.selected[0].text, expected.quote);
    assert.deepEqual(result.nearby.map(t => t.id), expected.nearby);
  });
}
test('shortening retains the exact qualification in the available source', () => {
  const result = resolveExcerpt(fixture, fixture.excerpts[1]);
  assert.match(result.selected[0].turn.text, /but only if the hall remains available without a rental fee/);
  assert.doesNotMatch(result.selected[0].text, /but only if/);
});
test('missing source and question references fail explicitly', () => {
  assert.throws(() => resolveExcerpt(fixture, { ...fixture.excerpts[0], selections: [{ turnId: 'T99', text: 'invented' }] }), /Source reference T99 is missing/);
  assert.throws(() => resolveExcerpt(fixture, { ...fixture.excerpts[0], questionTurnId: 'T98' }), /Source reference T98 is missing/);
});
test('wrong speaker, later question, and altered selection cannot pass as valid evidence', () => {
  assert.throws(() => resolveExcerpt(fixture, { ...fixture.excerpts[0], questionTurnId: 'T02' }), /not an interviewer/);
  assert.throws(() => resolveExcerpt(fixture, { ...fixture.excerpts[0], questionTurnId: 'T05' }), /must precede/);
  assert.throws(() => resolveExcerpt(fixture, { ...fixture.excerpts[0], selections: [{ turnId: 'T02', text: 'The film is all that matters.' }] }), /does not match/);
});
test('duplicate source IDs, invalid timestamps, unknown excerpt, and empty selections fail', () => {
  const duplicate = structuredClone(fixture);
  duplicate.turns.push(duplicate.turns[0]);
  assert.throws(() => resolveExcerpt(duplicate, duplicate.excerpts[0]), /duplicate/);
  const invalidTime = structuredClone(fixture);
  invalidTime.turns[1].start = '00:99';
  assert.throws(() => resolveExcerpt(invalidTime, invalidTime.excerpts[0]), /invalid timestamps/);
  assert.throws(() => resolveExcerpt(fixture, undefined), /does not exist/);
  assert.throws(() => resolveExcerpt(fixture, { ...fixture.excerpts[0], selections: [] }), /no source selections/);
});
