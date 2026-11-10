// Build only the fictional browser demo. Never copy the repository or local records.
import { mkdir, copyFile } from 'node:fs/promises';
const assets = ['index.html', 'styles.css', 'src/app.js', 'src/evidence.js', 'src/review.js', 'src/records.js', 'src/report.js', 'data/synthetic-interview.json'];
for (const asset of assets) {
  const destination = new URL(`../dist/${asset}`, import.meta.url);
  await mkdir(new URL('.', destination), { recursive: true });
  await copyFile(new URL(`../${asset}`, import.meta.url), destination);
}
console.log(`Prepared ${assets.length} allowlisted demo assets in dist/.`);
