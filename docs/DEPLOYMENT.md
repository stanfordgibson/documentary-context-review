# Public MVP deployment — 11 November 2026

Primary: https://context-cut-inky.vercel.app/?excerpt=conversation

Fallback retained and checked: https://context-cut-naledi-demo.codex-certif-9427.chatgpt.site/?excerpt=conversation

Vercel project: https://vercel.com/context-cut/context-cut

## Hosting decision

Vercel visibly confirmed the `context cut` account uses Hobby and the deployment reached Production. Hobby is free for personal, non-commercial projects. This deployment is the personal educational capstone demonstration described in the project brief; commercial use requires reassessing eligibility. No upgrade, paid trial, custom domain, storage or paid service was enabled.

Official references checked on 11 November 2026:

- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/git
- https://vercel.com/docs/limits/fair-use-guidelines
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

GitHub confirms the source repository is private and owned by a personal User account. Vercel Hobby permits private personal repositories but restricts private organization repositories. GitHub Pages requires a paid GitHub plan for a private source repository; no repository visibility change or paid plan was used.

## Architecture and publication

The MVP is static HTML, CSS and browser JavaScript with one synthetic JSON fixture. Findings are authored and deterministic. Decisions use origin-specific localStorage; reports are generated in the browser. There are no application dependencies, API keys or runtime model costs. `server.js` is a loopback-only local development server and is not required by the public deployment.

Clean local main at inspection: `0a546b2` (Merge accessible Settings and help panel). `npm test` passed all 17 tests. `node scripts/build-site.mjs` produced exactly eight allowlisted files, approximately 65 KB. Vercel's upload screen independently listed the same eight assets.

Published using Vercel Drop to Deploy with project name `context-cut` on Hobby. This is a manual static upload, not a connected Git deployment. GitHub credentials and repository permissions were not granted to Vercel. To update, build from the intended reviewed revision and upload only `dist/` to this existing project. Keep the fallback until the new upload is verified. Vercel Hobby usage limits still apply; free hosting does not guarantee uninterrupted availability.

## Public verification

Verified on 11 November 2026 at approximately 11:09 SAST in a separate browser without Vercel sign-in:

- Public production URL loads Context Cut v0.3.0 and the fictional Naledi interview.
- All three excerpt selectors work: preserved meaning, omitted qualification (CC-001), and missing question (CC-002).
- Findings retain source evidence and authentic restoration passages.
- Saved excerpt and finding decisions survive reload.
- Report preview shows 3 of 3 reviewed excerpts, 1 no-concern result, 2 material findings, 2 Addressed decisions, and excerpt decisions of 1 Keep / 2 Revise using test rationales.
- Export internal report triggers a completed download of `context-cut-internal-report.txt`.
- Existing chatgpt.site fallback remains publicly reachable and was not changed.

Test decisions exist only in the verification browser's storage, not on the server or other visitors' browsers. Print / Save as PDF was not exercised in this deployment check; text report download was exercised. This verifies the predefined demonstration workflow, not live AI analysis or arbitrary transcript review.
