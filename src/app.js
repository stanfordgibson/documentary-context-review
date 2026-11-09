import { resolveExcerpt, validateTranscript } from './evidence.js';

const $ = selector => document.querySelector(selector);
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function turnCard(turn, selection, type = '') {
  const card = el('article', undefined, `turn ${selection ? 'selected' : ''}`);
  card.dataset.turnId = turn.id;
  const meta = el('div', undefined, 'turn-meta');
  meta.append(el('strong', turn.speaker), el('span', `${turn.id} · ${turn.start}–${turn.end}`));
  if (type) meta.append(el('span', type, 'turn-label'));
  card.append(meta);
  const text = el('p');
  if (selection) {
    const offset = turn.text.indexOf(selection);
    text.append(document.createTextNode(turn.text.slice(0, offset)), el('mark', selection), document.createTextNode(turn.text.slice(offset + selection.length)));
  } else text.textContent = turn.text;
  card.append(text);
  return card;
}

async function start() {
  try {
    const response = await fetch('/data/synthetic-interview.json');
    if (!response.ok) throw new Error('The local interview file could not be loaded.');
    const interview = await response.json();
    validateTranscript(interview);
    $('#fixture-description').textContent = interview.description;
    const transcript = $('#transcript');
    transcript.append(el('h2', interview.title));
    interview.turns.forEach(turn => transcript.append(turnCard(turn)));
    $('#full-transcript summary span').textContent = `${interview.turns.length} turns · ${interview.turns.at(-1).end}`;
    if (!Array.isArray(interview.excerpts) || !interview.excerpts.length) throw new Error('No proposed excerpts are available.');
    $('#count').textContent = ` / ${String(interview.excerpts.length).padStart(2, '0')}`;
    const buttons = [];
    function show(excerpt, updateUrl = true) {
      buttons.forEach(({ button, item }) => {
        if (item === excerpt) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      });
      const review = $('#review');
      review.replaceChildren();
      if (updateUrl) history.replaceState(null, '', `?excerpt=${encodeURIComponent(excerpt.id)}`);
      try {
        const evidence = resolveExcerpt(interview, excerpt);
        const quote = el('div', undefined, 'quote-panel');
        quote.append(el('p', 'PROPOSED EXCERPT', 'eyebrow'), el('h2', excerpt.title));
        quote.append(el('blockquote', `“${evidence.selected.map(s => s.text).join(' […] ')}”`));
        quote.append(el('p', `${evidence.selected[0].turn.speaker} · ${evidence.selected.map(s => `${s.turn.id} / ${s.turn.start}–${s.turn.end}`).join(' · ')}`, 'quote-meta'));
        review.append(quote);
        const source = el('div', undefined, 'source-panel');
        source.append(el('h3', 'Back to the source'), el('p', 'Highlighted words are the proposed selection. Read the rest of each turn to see what was left out.', 'source-help'));
        const question = el('section', undefined, 'question');
        question.setAttribute('aria-label', 'Interviewer question');
        question.append(el('h4', 'THE INTERVIEWER’S QUESTION'), turnCard(evidence.question));
        source.append(question, el('h4', 'SELECTED LINES & NEARBY TURNS'));
        const context = el('div', undefined, 'context');
        evidence.nearby.forEach(turn => {
          const selection = evidence.selected.find(s => s.turn.id === turn.id);
          context.append(turnCard(turn, selection?.text, selection ? 'SELECTED SOURCE' : 'CONTEXT'));
        });
        source.append(context);
        review.append(source);
      } catch (error) {
        const message = el('div', undefined, 'error');
        message.setAttribute('role', 'alert');
        message.append(el('h2', 'Source reference unavailable'), el('p', error.message), el('p', 'This excerpt cannot be verified. Choose another excerpt or read the full transcript below.'));
        review.append(message);
      }
    }
    interview.excerpts.forEach((item, index) => {
      const button = el('button', undefined, 'excerpt-button');
      button.type = 'button';
      button.append(el('span', String(index + 1).padStart(2, '0'), 'number'), el('strong', item.title), el('span', item.caseLabel, 'case-label'));
      button.addEventListener('click', () => show(item));
      buttons.push({ button, item });
      $('#excerpt-nav').append(button);
    });
    const requested = new URL(location.href).searchParams.get('excerpt');
    show(requested ? interview.excerpts.find(e => e.id === requested) : interview.excerpts[0], false);
  } catch (error) {
    $('#load-error').hidden = false;
    $('#load-error').className = 'error';
    $('#load-error').textContent = `Source review unavailable: ${error.message}`;
  }
}
start();
