import { resolveExcerpt, validateTranscript } from './evidence.js';
import { runReview, LIMITS } from './review.js';
import { loadRecord, saveDecision, excerptChoices, findingChoices } from './records.js';
import { buildReport, renderReport } from './report.js';

const $ = selector => document.querySelector(selector);
const settingsPanel = $('#settings-panel');
const settingsButton = $('#open-settings');
settingsButton.addEventListener('click', () => {
  settingsPanel.showModal();
  settingsButton.setAttribute('aria-expanded', 'true');
});
settingsPanel.addEventListener('close', () => {
  settingsButton.setAttribute('aria-expanded', 'false');
  settingsButton.focus({ preventScroll: true });
});
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
function turnCard(turn, selected, onReview) {
  const card = el('article', undefined, 'turn');
  card.id = `source-${turn.id}`;
  card.tabIndex = -1;
  card.dataset.turnId = turn.id;
  card.append(el('p', `${turn.speaker} · ${turn.id} · ${turn.start}–${turn.end}`, 'turn-meta'));
  const text = el('p', undefined, 'source-text');
  if (selected) {
    const offset = turn.text.indexOf(selected);
    if (offset) text.append(labelledSpan(turn.text.slice(0, offset), 'OMITTED'));
    const kept = labelledSpan(selected, 'KEPT');
    if (onReview) {
      kept.tabIndex = 0; kept.setAttribute('role', 'button'); kept.setAttribute('aria-controls', 'analysis');
      kept.setAttribute('aria-label', `Kept: ${selected}. Open meaning review.`);
      kept.addEventListener('click', onReview);
      kept.addEventListener('keydown', event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); onReview(); } });
    }
    text.append(kept);
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
    if (target) target.hidden = false;
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
    let activeExcerpt, nearbyIds = new Set(), focusMode = false;
    const summaries = [
      'Shortening preserves the meaning in the supplied interview.',
      'The selection omits the condition attached to free screenings.',
      'The reply loses the question identifying what Naledi rejects.'
    ];
    function jumpReview() { $('#analysis').focus(); $('#analysis').scrollIntoView({ block: 'start' }); }
    function focusSource() {
      $('#transcript').querySelectorAll('.turn').forEach(turn => { turn.hidden = focusMode && !nearbyIds.has(turn.dataset.turnId); });
      $('#focus-passage').textContent = focusMode ? 'Show full transcript' : 'Focus on this passage';
      $('#focus-passage').setAttribute('aria-pressed', String(focusMode));
      $('#focus-description').textContent = focusMode ? 'Focused view: the selection, its question and nearby turns. Other turns are collapsed.' : 'Full transcript shown.';
    }
    function show(excerpt, updateUrl = true) {
      activeExcerpt = excerpt;
      $('#report-section').hidden = true;
      buttons.forEach(({ node, item }) => {
        if (item === excerpt) {
          node.setAttribute('aria-current', 'true');
          if (nav.scrollWidth > nav.clientWidth) nav.scrollLeft = node.parentElement.offsetLeft;
        }
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
        nearbyIds = new Set([...evidence.nearby.map(turn => turn.id), evidence.question.id]);
        if (updateUrl) history.replaceState(null, '', `?excerpt=${encodeURIComponent(excerpt.id)}`);
        quote.append(el('p', 'ACTIVE PROPOSED EXCERPT', 'eyebrow'), el('h2', excerpt.title),
          el('blockquote', evidence.selected.map(s => s.text).join(' […] ')),
          el('p', `Interviewer question · ${evidence.question.id}: ${evidence.question.text}`));
        transcript.replaceChildren();
        interview.turns.forEach(turn => {
          const card = turnCard(turn, evidence.selected.find(s => s.turn.id === turn.id)?.text, jumpReview);
          const associated = interview.excerpts.filter(item => item.id !== excerpt.id && item.selections?.some(selection => selection.turnId === turn.id));
          associated.forEach(item => {
            const link = button(`Review excerpt: ${item.title}`, () => { show(item); jumpReview(); });
            link.className = 'source-review-link'; card.append(link);
          });
          transcript.append(card);
        });
        focusSource();
        $('#scope').textContent = `Kept / omitted for “${excerpt.title}” only. Omitted does not mean absent from the documentary. These examples are separate selections.`;
        $('#announcement').textContent = `Reviewing ${excerpt.title}. Source annotations updated.`;
        const review = runReview(interview, excerpt);
        let loaded = loadRecord(storage(), interview, excerpt, review);
        let record = loaded.record;
        analysis.append(el('h2', 'Meaning review'), el('p', `For: ${excerpt.title}`, 'active-review-title'), el('p', 'Authored deterministic observations · no model request', 'method'), button('Back to source passage', () => {
          const target = document.getElementById(`source-${evidence.selected[0].turn.id}`);
          target.hidden = false; target.focus(); target.scrollIntoView({ block: 'center' });
        }));
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
          const prompt = el('option', finding ? 'Needs attention — choose a decision' : 'Choose a decision');
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
          card.append(el('p', 'Addressed: record how you dealt with the concern. Dismissed: explain why you believe it does not apply or warrant a change. Both retain the finding, evidence and suggested remedy in the report. Neither applies an edit or verifies a change to the documentary.'), decisionForm(flag));
          analysis.append(card);
        }
        const decisions = el('section', undefined, 'editorial-panel');
        decisions.append(el('h3', 'Your editorial decision'), el('p', 'Keep / Revise / Leave out is separate from finding decisions. Context supplied elsewhere can be recorded in your rationale; the prototype cannot verify it.'), decisionForm());
        analysis.append(decisions);
      } catch (error) {
        focusMode = false; nearbyIds = new Set(interview.turns.map(turn => turn.id)); focusSource();
        quote.append(el('h2', 'Source reference unavailable'), el('p', error.message));
        $('#scope').textContent = 'Excerpt cannot be verified. The full source is readable below; no inclusion claims are valid for this excerpt.';
        // Unresolved selection must not imply that the full interview was omitted.
        transcript.querySelectorAll('.passage-label').forEach(node => node.remove());
        transcript.querySelectorAll('.passage').forEach(node => node.className = 'passage');
        analysis.append(el('p', 'Review unavailable. Choose another excerpt.', 'error'));
      }
    }
    interview.excerpts.forEach((item, index) => {
      const summary = summaries[index] || 'Review this selection against the source interview.';
      const node = button(`${String(index + 1).padStart(2, '0')} · ${item.title}`, () => { if (activeExcerpt !== item) show(item); });
      node.className = 'excerpt-button'; node.title = summary; node.setAttribute('aria-describedby', `excerpt-help-${index}`);
      const hint = el('span', summary, 'excerpt-summary'); hint.id = `excerpt-help-${index}`;
      const group = el('div', undefined, 'excerpt-choice'); group.append(node, hint);
      buttons.push({ node, item }); nav.append(group);
    });
    $('#focus-passage').addEventListener('click', () => { focusMode = !focusMode; focusSource(); });
    $('#jump-review').addEventListener('click', jumpReview);
    $('#labels-only').addEventListener('change', event => {
      $('#transcript').classList.toggle('labels-only', event.target.checked);
    });
    function report() {
      const text = buildReport(interview, storage());
      renderReport($('#report-preview'), text);
      $('#report-section').hidden = false;
      return text;
    }
    $('#preview-report').addEventListener('click', () => { report(); $('#report-heading').focus(); });
    $('#print-report').addEventListener('click', () => { report(); window.print(); });
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
    $('#preview-report').disabled = true; $('#export-report').disabled = true; $('#print-report').disabled = true;
  }
}
start();
