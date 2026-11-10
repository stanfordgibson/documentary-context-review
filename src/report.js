import { resolveExcerpt } from './evidence.js';
import { runReview, LIMITS } from './review.js';
import { loadRecord, isComplete } from './records.js';

export const PROTOTYPE_VERSION = '0.3.0';
const fieldKeys = new Set(['Scope', 'Report date', 'Prototype version', 'Source', 'Source identity', 'Source version', 'Fictional material', 'Review method', 'Review version', 'Excerpt identity', 'Exact selection', 'Review result', 'Excerpt decision', 'Finding decision', 'Updated', 'What changed', 'Potential meaning consequence']);
const citation = ref => `${ref.speaker} · ${ref.turnId} · ${ref.startTime}–${ref.endTime}:\n${ref.text}`;
const decisionText = value => value ? `${value.status} — ${value.rationale}\nUpdated: ${value.updatedAt}` : 'Needs attention — no saved decision';

export function buildReport(interview, storage, now = new Date().toISOString(), reviewer = runReview) {
  const sections = [];
  let complete = true;
  const versions = new Set();
  const counts = { excerpts: interview.excerpts.length, reviewed: 0, noConcern: 0, unavailable: 0, insufficient: 0,
    findings: { attention: 0, addressed: 0, dismissed: 0, total: 0 },
    decisions: { Keep: 0, Revise: 0, 'Leave out': 0, pending: 0 } };
  for (const [index, excerpt] of interview.excerpts.entries()) {
    const heading = `4.${index + 1} ${excerpt.title}`;
    let review, loaded, selected;
    try {
      selected = resolveExcerpt(interview, excerpt).selected.map(s => `${s.turn.id}: ${s.text}`).join('\n');
      review = reviewer(interview, excerpt);
      loaded = loadRecord(storage, interview, excerpt, review);
    } catch (error) {
      complete = false;
      counts.unavailable++; counts.decisions.pending++;
      sections.push(`${heading}\n\nReview unavailable: ${error.message}\nNo current decision can be verified.`);
      continue;
    }
    complete &&= isComplete(review, loaded);
    if (review.revision) versions.add(review.revision.replace(/^authored-/, ''));
    if (review.status === 'reviewed') {
      counts.reviewed++;
      if (!review.flags.length) counts.noConcern++;
      for (const flag of review.flags) {
        counts.findings.total++;
        const status = loaded.record?.findings[flag.id]?.status;
        if (status === 'Addressed') counts.findings.addressed++;
        else if (status === 'Dismissed') counts.findings.dismissed++;
        else counts.findings.attention++;
      }
    } else if (review.status === 'insufficient_context') counts.insufficient++;
    else counts.unavailable++;
    // Summary and detail use this same validated saved snapshot, never form drafts.
    const decision = review.status === 'reviewed' && !loaded.issue ? loaded.record?.excerpt?.status : null;
    if (decision && Object.hasOwn(counts.decisions, decision)) counts.decisions[decision]++;
    else counts.decisions.pending++;
    const lines = [heading, `Excerpt identity: ${excerpt.id}\nExact selection: ${selected}`, `Review result: ${review.status === 'reviewed' ? (review.flags.length ? 'Material findings require human review' : 'No concern flagged — not approval') : review.status === 'insufficient_context' ? 'Insufficient context' : 'Review unavailable'}`];
    if (loaded.issue) lines.push(loaded.issue, 'Reassessment required; old decisions are not treated as current.');
    lines.push(`Excerpt decision: ${decisionText(decision ? loaded.record?.excerpt : null)}`);
    for (const flag of review.flags) {
      lines.push(`FINDING ${flag.id}: ${flag.kind}`, `What changed: ${flag.changed}\nPotential meaning consequence: ${flag.consequence}`,
        'Source evidence:', ...flag.evidence.map(citation), 'Suggested remedy:', flag.remedy.explanation,
        'Authentic source passages to restore:', ...flag.remedy.passages.map(citation),
        `Finding decision: ${decisionText(loaded.record?.findings[flag.id])}`);
    }
    sections.push(lines.join('\n\n'));
  }
  return [
    'CONTEXT CUT — INTERNAL EDITORIAL INTEGRITY REPORT',
    complete ? 'REVIEW COMPLETE — human decisions recorded; not truthfulness certification' : 'INCOMPLETE — open findings, missing decisions, or unavailable/outdated review results remain',
    '1. Limitations',
    'Scope: each predefined excerpt is reviewed against its original interview. Kept/omitted refers only to the active excerpt, not the whole documentary. The examples are not an assembled final edit.',
    LIMITS,
    'This report reviews supplied transcript material. It does not independently verify facts, footage, source authenticity, or context elsewhere in a documentary. Editor statements about context elsewhere are recorded, not verified. Addressed and Dismissed record the editor’s assessment and rationale. Neither applies an edit or verifies a change to the documentary. Findings, evidence and suggested remedies remain in the report for both decisions. Timestamps locate a speaker’s full answer or question; individual words are not time-aligned.',
    '2. Metadata',
    `Report date: ${now}\nPrototype version: ${PROTOTYPE_VERSION}\nSource: ${interview.title}\nSource identity: ${interview.id}\nSource version: ${interview.version}\nFictional material: ${interview.description}`,
    `Review method: Predefined demonstration observations\nReview version: ${[...versions].join(', ') || 'Unavailable'}`,
    '3. Executive summary',
    `${counts.reviewed} of ${counts.excerpts} excerpts reviewed. ${counts.noConcern} with no concern flagged; ${counts.findings.total} material findings identified in available reviews.`,
    `| Finding status | Needs attention | Addressed | Dismissed | Total |\n| --- | --- | --- | --- | --- |\n| Material findings | ${counts.findings.attention} | ${counts.findings.addressed} | ${counts.findings.dismissed} | ${counts.findings.total} |`,
    `| Editorial decisions | Keep | Revise | Leave out | Not decided | Total |\n| --- | --- | --- | --- | --- | --- |\n| Excerpts | ${counts.decisions.Keep} | ${counts.decisions.Revise} | ${counts.decisions['Leave out']} | ${counts.decisions.pending} | ${counts.excerpts} |`,
    `Counts use current saved decisions only. ${counts.unavailable} excerpt reviews unavailable; ${counts.insufficient} with insufficient context. Unavailable reviews may contain unidentified concerns. Findings and excerpts are counted separately.`,
    '4. Findings',
    ...sections
  ].join('\n\n');
}

export function renderReport(container, text) {
  container.replaceChildren();
  let target = container;
  for (const block of text.split('\n\n')) {
    if (block === '3. Executive summary') {
      target = document.createElement('section'); target.className = 'report-executive-summary';
      target.setAttribute('aria-label', 'Executive summary'); container.append(target);
    } else if (block === '4. Findings') target = container;
    if (block.startsWith('| Finding status |') || block.startsWith('| Editorial decisions |')) {
      const table = document.createElement('table'); table.className = 'report-summary';
      const rows = block.split('\n').filter(line => !line.startsWith('| ---'));
      const caption = document.createElement('caption');
      caption.textContent = block.startsWith('| Finding status |') ? 'Material finding decisions' : 'Editorial excerpt decisions';
      table.append(caption);
      rows.forEach((line, index) => {
        const section = document.createElement(index === 0 ? 'thead' : 'tbody');
        const row = document.createElement('tr');
        line.split('|').slice(1, -1).forEach((cell, column) => {
          const node = document.createElement(index === 0 || column === 0 ? 'th' : 'td');
          if (node.tagName === 'TH') node.scope = index === 0 ? 'col' : 'row';
          node.textContent = cell.trim(); row.append(node);
        });
        section.append(row); table.append(section);
      });
      const wrapper = document.createElement('div'); wrapper.className = 'report-table-scroll';
      wrapper.append(table); target.append(wrapper); continue;
    }
    const tag = /^\d\.\d+ /.test(block) ? 'h3' : /^\d\. /.test(block) ? 'h2' : block.startsWith('CONTEXT CUT') ? 'h1' :
      block.startsWith('FINDING ') || ['Source evidence:', 'Suggested remedy:', 'Authentic source passages to restore:'].includes(block) ? 'h4' : 'p';
    const node = document.createElement(tag);
    if (tag === 'p') {
      block.split('\n').forEach((line, index) => {
        if (index) node.append(document.createElement('br'));
        const separator = line.indexOf(':');
        const key = line.slice(0, separator);
        if (separator > 0 && fieldKeys.has(key)) {
          const strong = document.createElement('strong'), emphasis = document.createElement('em');
          emphasis.textContent = `${key}:`; strong.append(emphasis);
          node.append(strong, document.createTextNode(line.slice(separator + 1)));
        } else node.append(document.createTextNode(line));
      });
      if (fieldKeys.has(block.slice(0, block.indexOf(':')))) node.className = 'report-field-group';
    } else node.textContent = block;
    target.append(node);
  }
}
