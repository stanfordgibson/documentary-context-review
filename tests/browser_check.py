"""Optional end-to-end checks: pip install playwright; playwright install chromium.
Run the local server first, then: python3 tests/browser_check.py
Screenshots are local ignored artifacts in work/.
"""
import copy
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
fixture = json.loads((ROOT / 'data/synthetic-interview.json').read_text())
expected_context = [['T01', 'T02', 'T03'], ['T03', 'T04', 'T05'], ['T05', 'T06', 'T07']]
(ROOT / 'work').mkdir(exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1440, 'height': 1100})
    errors, external = [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('request', lambda req: external.append(req.url) if not req.url.startswith('http://127.0.0.1:3000/') else None)
    page.goto('http://127.0.0.1:3000/')
    expect(page.locator('.fixture-note')).to_contain_text('Entirely fictional')
    for index, excerpt in enumerate(fixture['excerpts']):
        page.get_by_role('button', name=excerpt['title'], exact=False).click()
        selection = excerpt['selections'][0]
        selected_turn = next(t for t in fixture['turns'] if t['id'] == selection['turnId'])
        question = next(t for t in fixture['turns'] if t['id'] == excerpt['questionTurnId'])
        expect(page.locator('blockquote')).to_have_text('“' + selection['text'] + '”')
        expect(page.locator('.question .turn p')).to_have_text(question['text'])
        expect(page.locator('.question .turn-meta')).to_contain_text(f"{question['id']} · {question['start']}–{question['end']}")
        expect(page.locator('.context .selected p')).to_have_text(selected_turn['text'])
        expect(page.locator('.context mark')).to_have_text(selection['text'])
        expect(page.locator('.context .selected .turn-meta')).to_contain_text(f"{selected_turn['id']} · {selected_turn['start']}–{selected_turn['end']}")
        assert page.locator('.context .turn').evaluate_all('(nodes) => nodes.map(n => n.dataset.turnId)') == expected_context[index]
        expect(page.locator('button[aria-current="true"]')).to_have_count(1)
        page.reload()
        expect(page.locator('blockquote')).to_have_text('“' + selection['text'] + '”')
    page.locator('summary').click()
    expect(page.locator('#transcript .turn')).to_have_count(8)
    for turn in fixture['turns']:
        expect(page.locator(f'#transcript [data-turn-id="{turn["id"]}"] p')).to_have_text(turn['text'])
    page.get_by_role('button', name='Keeping screenings free', exact=False).click()
    page.screenshot(path=str(ROOT / 'work/source-review-desktop.png'), full_page=True)
    page.set_viewport_size({'width': 390, 'height': 844})
    expect(page.locator('.context .selected')).to_be_visible()
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    page.screenshot(path=str(ROOT / 'work/source-review-mobile.png'), full_page=True)
    broken = copy.deepcopy(fixture)
    broken['excerpts'][0]['selections'][0]['turnId'] = 'T99'
    page.route('**/data/synthetic-interview.json', lambda route: route.fulfill(json=broken))
    page.goto('http://127.0.0.1:3000/?excerpt=conversation')
    expect(page.get_by_role('alert')).to_contain_text('Source reference T99 is missing')
    expect(page.locator('blockquote')).to_have_count(0)
    page.locator('summary').click()
    expect(page.locator('#transcript [data-turn-id="T02"]')).to_be_visible()
    page.get_by_role('button', name='Keeping screenings free', exact=False).click()
    expect(page.locator('blockquote')).to_be_visible()
    page.goto('http://127.0.0.1:3000/?excerpt=does-not-exist')
    expect(page.get_by_role('alert')).to_contain_text('does not exist')
    page.unroute('**/data/synthetic-interview.json')
    page.route('**/data/synthetic-interview.json', lambda route: route.fulfill(status=500, body='Unavailable'))
    page.goto('http://127.0.0.1:3000/')
    expect(page.get_by_role('alert')).to_contain_text('could not be loaded')
    assert not errors, errors
    assert not external, external
    for private_path in ['/README.md', '/.env', '/.git/config', '/docs/PROJECT_BRIEF.md', '/server.js', '/%2e%2e/.env']:
        assert page.request.get('http://127.0.0.1:3000' + private_path).status == 404
    assert page.request.post('http://127.0.0.1:3000/').status == 405
    browser.close()
print('PASS: three excerpts, evidence, navigation, reload, full transcript, mobile layout, missing references, load failure, local requests, and server allowlist.')
