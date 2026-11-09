import { resolveExcerpt, validateTranscript } from './evidence.js';
import { runReview, LIMITS } from './review.js';
import { loadRecord, saveDecision, excerptChoices, findingChoices } from './records.js';
import { buildReport } from './report.js';

const $ = selector => document.querySelector(selector);
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function storage() {
  // Access itself can throw in private/restricted browser contexts.
  return { getItem: key => window.localStorage.getItem(key), setItem: (key, value) => window.localStorage.setItem(key, value) };
}
function button(text, action) {
  const node = el('button', text);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}
function labelledSpan(text, status) {
  const node = el('span', undefined, `passage ${status.toLowerCase()}`);
  node.append(el('span', `${status}: `, 'passage-label'), document.createTextNode(text));
  return node;
}
function turnCard(turn, selected) {
  const card = el('article', undefined, 'turn');
  card.id = `source-${turn.id}`;
  card.tabIndex = -1;
  card.dataset.turnId = turn.id;
  card.append(el('p', `${turn.speaker} · ${turn.id} · ${turn.start}–${turn.end} (turn-level)`, 'turn-meta'));
  const text = el('p', undefined, 'source-text');
  if (selected) {
    const offset = turn.text.indexOf(selected);
    if (offset) text.append(labelledSpan(turn.text.slice(0, offset), 'OMITTED'));
    text.append(labelledSpan(selected, 'KEPT'));
    if (offset + selected.length < turn.text.length) text.append(labelledSpan(turn.text.slice(offset + selected.length), 'OMITTED'));
  } else text.append(labelledSpan(turn.text, 'OMITTED'));
  card.append(text);
  return card;
}
function cite(ref) {
  const box = el('div', undefined, 'citation');
  const link = el('a', `${ref.speaker} · ${ref.turnId} · ${ref.startTime}–${ref.endTime}`);
  link.href = `#source-${ref.turnId}`;
  link.addEventListener('click', event => {
    event.preventDefault();
    const target = document.getElementById(`source-${ref.turnId}`);
    target?.focus();
    target?.scrollIntoView({ block: 'center' });
  });
  box.append(link, el('blockquote', ref.text));
  return box;
}

async function start() {
  try {
    const response = await fetch('/data/synthetic-interview.json');
    if (!response.ok) throw new Error('The local interview file could not be loaded.');
    const interview = await response.json();
    validateTranscript(interview);
    if (!Array.isArray(interview.excerpts) || !interview.excerpts.length) throw new Error('No proposed excerpts are available.');
    $('#fixture-description').textContent = interview.description;
    $('#limits').textContent = LIMITS;
    const nav = $('#excerpt-nav');
    const buttons = [];
    let labelsOnly = false;
    function show(excerpt, updateUrl = true) {
      $('#report-section').hidden = true;
      buttons.forEach(({ node, item }) => {
        if (item === excerpt) node.setAttribute('aria-current', 'true');
        else node.removeAttribute('aria-current');
      });
      const quote = $('#quote');
      const transcript = $('#transcript');
      const analysis = $('#analysis');
      quote.replaceChildren(); transcript.replaceChildren(); analysis.replaceChildren();
      // Keep the full source available even when an excerpt cannot resolve.
      interview.turns.forEach(turn => transcript.append(turnCard(turn)));
      try {
        const evidence = resolveExcerpt(interview, excerpt);
        if (updateUrl) history.replaceState(null, '', `?excerpt=${encodeURIComponent(excerpt.id)}`);
        quote.append(el('p', 'ACTIVE PROPOSED EXCERPT', 'eyebrow'), el('h2', excerpt.title),
          el('blockquote', evidence.selected.map(s => s.text).join(' […] ')),
          el('p', `Interviewer question · ${evidence.question.id}: ${evidence.question.text}`));
        transcript.replaceChildren();
        interview.turns.forEach(turn => transcript.append(turnCard(turn, evidence.selected.find(s => s.turn.id === turn.id)?.text)));
        $('#scope').textContent = `Kept / omitted for “${excerpt.title}” only. Omitted does not mean absent from the documentary. These examples are separate selections.`;
        $('#announcement').textContent = `Reviewing ${excerpt.title}. Source annotations updated.`;
        const review = runReview(interview, excerpt);
        let loaded = loadRecord(storage(), interview, excerpt, review);
        let record = loaded.record;
        analysis.append(el('h2', 'Meaning review'), el('p', 'Authored deterministic observations · no model request', 'method'));
        const issue = el('p', loaded.issue || '', 'storage-message');
        issue.setAttribute('role', 'status');
        analysis.append(issue);

        function decisionForm(finding) {
          const id = finding ? finding.id : 'excerpt';
          const previous = finding ? record?.findings[id] : record?.excerpt;
          const form = el('form', undefined, 'decision-form');
          const choices = finding ? findingChoices : excerptChoices;
          const selectLabel = el('label', finding ? `${id} finding decision` : 'Excerpt decision');
          const select = el('select');
          select.id = `decision-${id}`; selectLabel.htmlFor = select.id;
          const prompt = el('option', finding ? 'Open — choose a decision' : 'Choose a decision');
          prompt.value = ''; select.append(prompt);
          choices.forEach(choice => { const option = el('option', choice); option.value = choice; select.append(option); });
          select.value = previous?.status || ''; select.required = true;
          const rationaleLabel = el('label', finding ? `${id} rationale` : 'Excerpt rationale');
          const rationale = el('textarea');
          rationale.id = `rationale-${id}`; rationaleLabel.htmlFor = rationale.id;
          rationale.required = true; rationale.rows = 3; rationale.value = previous?.rationale || '';
          const saved = el('p', previous ? `Saved: ${previous.status} · ${previous.updatedAt}` : 'No saved decision.', 'save-state');
          saved.setAttribute('role', 'status');
          const submit = el('button', finding ? `Save ${id} decision` : 'Save excerpt decision');
          submit.type = 'submit';
          if (review.status !== 'reviewed') { select.disabled = true; rationale.disabled = true; submit.disabled = true; }
          form.append(selectLabel, select, rationaleLabel, rationale, submit, saved);
          form.addEventListener('input', () => { saved.textContent = 'Unsaved changes. Report uses saved decisions only.'; });
          form.addEventListener('submit', event => {
            event.preventDefault();
            try {
              record = saveDecision(storage(), interview, excerpt, review, record, finding?.id, select.value, rationale.value);
              loaded = { record, issue: null };
              const current = finding ? record.findings[id] : record.excerpt;
              saved.textContent = `Saved: ${current.status} · ${current.updatedAt}`;
              $('#report-section').hidden = true;
              issue.textContent = '';
            } catch (error) { saved.textContent = `Not saved: ${error.message}`; }
          });
          return form;
        }

        if (review.status === 'unavailable') analysis.append(el('p', 'Review unavailable. Source remains usable. No clearance or current completed review is available.', 'error'));
        else if (review.status === 'insufficient_context') analysis.append(el('p', 'Insufficient context. No clearance is given; source remains available.'));
        else if (!review.flags.length) analysis.append(el('h3', 'No concern flagged'), el('p', 'Review the source yourself. Harmless shortening does not require keeping every word; this result is not approval.'));
        for (const flag of review.flags) {
          const card = el('article', undefined, 'finding');
          card.append(el('h3', `${flag.id} · ${flag.kind.replaceAll('_', ' ')}`), el('h4', 'What changed'), el('p', flag.changed),
            el('h4', 'Why it may matter'), el('p', flag.consequence), el('h4', 'Source evidence'));
          flag.evidence.forEach(ref => card.append(cite(ref)));
          card.append(el('h4', 'Suggested remedy'), el('p', flag.remedy.explanation), el('p', 'Authentic source passages to restore:', 'method'));
          flag.remedy.passages.forEach(ref => card.append(cite(ref)));
          card.append(el('p', 'Resolved records your explanation of how the concern was addressed. No modified edit is applied or verified.'), decisionForm(flag));
          analysis.append(card);
        }
        const decisions = el('section', undefined, 'editorial-panel');
        decisions.append(el('h3', 'Your editorial decision'), el('p', 'Keep / Revise / Leave out is separate from finding decisions. Context supplied elsewhere can be recorded in your rationale; the prototype cannot verify it.'), decisionForm());
        analysis.append(decisions);
      } catch (error) {
        quote.append(el('h2', 'Source reference unavailable'), el('p', error.message));
        $('#scope').textContent = 'Excerpt cannot be verified. The full source is readable below; no inclusion claims are valid for this excerpt.';
        // Unresolved selection must not imply that the full interview was omitted.
        transcript.querySelectorAll('.passage-label').forEach(node => node.remove());
        transcript.querySelectorAll('.passage').forEach(node => node.className = 'passage');
        analysis.append(el('p', 'Review unavailable. Choose another excerpt.', 'error'));
      }
    }
    interview.excerpts.forEach((item, index) => {
      const node = button(`${String(index + 1).padStart(2, '0')} · ${item.title}`, () => show(item));
      node.className = 'excerpt-button';
      buttons.push({ node, item }); nav.append(node);
    });
    $('#labels-only').addEventListener('change', event => {
      labelsOnly = event.target.checked;
      $('#transcript').classList.toggle('labels-only', labelsOnly);
    });
    function report() {
      const text = buildReport(interview, storage());
      $('#report-preview').textContent = text;
      $('#report-section').hidden = false;
      return text;
    }
    $('#preview-report').addEventListener('click', () => { report(); $('#report-heading').focus(); });
    $('#export-report').addEventListener('click', () => {
      const text = report();
      const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
      const link = el('a'); link.href = url; link.download = 'context-cut-internal-report.txt';
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      $('#announcement').textContent = 'Report export requested. Includes saved decisions only.';
    });
    const requested = new URL(location.href).searchParams.get('excerpt');
    show(requested ? interview.excerpts.find(item => item.id === requested) : interview.excerpts[0], false);
  } catch (error) {
    $('#load-error').hidden = false;
    $('#load-error').textContent = `Source review unavailable: ${error.message}`;
    $('#preview-report').disabled = true; $('#export-report').disabled = true;
  }
}
start();
