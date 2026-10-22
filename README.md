# Se Sufre Bonito 🎺

A music discovery publication for songs that are danced with the feet and felt with the heart. Next.js App Router + React + TypeScript + CSS/Tailwind foundation.

## Run locally

Install Node 22 or 24 LTS, then:

```bash
npm install
npm run dev
```

Visit http://localhost:3000. Production check: `npm run typecheck && npm run build`.

## Publish

1. Create a blank GitHub repository (e.g., `se-sufre-bonito`).
2. In this folder run:
   ```bash
   git init
   git add .
   git commit -m "feat: first editorial edition"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/se-sufre-bonito.git
   git push -u origin main
   ```
3. In Vercel, select **Add New > Project**, import your GitHub repo, keep framework auto-detection as Next.js and deploy.
4. Vercel supplies a temporary `*.vercel.app` domain; attach a custom domain later if desired.

No secrets or database are needed for this release. This environment cannot sign into GitHub or Vercel on your behalf; no public deployment has been made yet.

## Functions in this edition
- Responsive home page for mobile / tablet / desktop.
- Curated song catalog, full-text artist/title search, emotion filters, rating sort.
- Song detail modal and link to a Spotify search.
- Saved songs persisted locally in the browser.
- Original typographic album-like art to avoid distributing copyrighted album covers.

## Notes
Ratings are an editorial record of the music chat, not external reviews. The site does not play or host tracks. `DESIGN.md` documents tokens, responsive breakpoints, and next iterations.
