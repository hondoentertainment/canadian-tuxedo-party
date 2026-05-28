# Canadian Tuxedo Party

Event website for the **Canadian Tuxedo Party** on **Saturday, May 30, 2026**.

**Live site:** [canadian-tuxedo-party.vercel.app](https://canadian-tuxedo-party.vercel.app)

## Quick start

```bash
npm install
npx serve .
```

Visit `http://localhost:3000`. API routes require Vercel or `vercel dev` locally.

## What's included

- Hero with poster, countdown, QR code, and post-party mode
- **At the Party** hub — gallery, games, and votes
- Photo gallery with optional moderation
- Best Dressed vote (closes 10 PM party night, shows winner)
- Next-party poll saved to Blob
- **Host dashboard** — checklist, quick links, live vote status
- **Poll results dashboard** — date rankings and feedback
- PWA support and printable QR sign

## Deploy

```bash
git push origin main
npx vercel deploy --prod --yes
```

## Environment variables (Vercel)

| Variable | Purpose |
|----------|---------|
| `BLOB_READ_WRITE_TOKEN` | Auto-set when Vercel Blob is connected |
| `GALLERY_ADMIN_CODE` | Host admin code — gallery moderation, poll results, host dashboard |
| `VOTE_CLOSE_TIME` | Optional ISO datetime for vote cutoff (default: May 30, 2026 at 10:00 PM PT) |

Set admin code:

```bash
npx vercel env add GALLERY_ADMIN_CODE production
```

## Host pages

| Page | URL |
|------|-----|
| Host dashboard | [/host.html](https://canadian-tuxedo-party.vercel.app/host.html) |
| Gallery admin | [/admin.html](https://canadian-tuxedo-party.vercel.app/admin.html) |
| Poll results | [/poll-results.html](https://canadian-tuxedo-party.vercel.app/poll-results.html) |
| Print QR sign | [/qr.html](https://canadian-tuxedo-party.vercel.app/qr.html) |

## Party-night checklist

1. Set `GALLERY_ADMIN_CODE` in Vercel and redeploy
2. Print QR sign from [qr.html](https://canadian-tuxedo-party.vercel.app/qr.html) → post at Woodlawn entrance
3. Test gallery upload + vote on a phone over **cellular**
4. Open [Name That Canadian](https://name-that-canadian.vercel.app) full-screen on the TV
5. Use [host.html](https://canadian-tuxedo-party.vercel.app/host.html) during the party

## Custom domain

1. Vercel → **Settings → Domains** → add your domain
2. Update DNS per Vercel instructions
3. Change `SITE_URL` in `js/config.js` and redeploy

## Customize

- Party date: `js/config.js` → `PARTY_DATE`
- Vote close time: `js/config.js` → `VOTE_CLOSE_TIME` (and matching `VOTE_CLOSE_TIME` env var on Vercel)
- Site URL / QR / Open Graph: `js/config.js` → `SITE_URL`
