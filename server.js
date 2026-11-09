import http from 'node:http';
import { readFile } from 'node:fs/promises';

const files = new Map([
  ['/', ['index.html', 'text/html']],
  ['/styles.css', ['styles.css', 'text/css']],
  ['/src/app.js', ['src/app.js', 'text/javascript']],
  ['/src/evidence.js', ['src/evidence.js', 'text/javascript']],
  ['/src/review.js', ['src/review.js', 'text/javascript']],
  ['/src/records.js', ['src/records.js', 'text/javascript']],
  ['/src/report.js', ['src/report.js', 'text/javascript']],
  ['/data/synthetic-interview.json', ['data/synthetic-interview.json', 'application/json']]
]);
const port = Number(process.env.PORT || 3000);
const server = http.createServer(async (req, res) => {
  const entry = files.get((req.url || '').split('?')[0]);
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
  if (!entry) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const body = await readFile(new URL(entry[0], import.meta.url));
    res.writeHead(200, {
      'Content-Type': `${entry[1]}; charset=utf-8`, 'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
      'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer'
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(500); res.end('Unable to load demo file.'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Context Cut: http://127.0.0.1:${server.address().port}`));
server.on('error', error => { console.error(`Could not start Context Cut: ${error.message}`); process.exitCode = 1; });
