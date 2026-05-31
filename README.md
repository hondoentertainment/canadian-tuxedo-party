# Canadian Tuxedo Party

Event website for the **Canadian Tuxedo Party** on **Saturday, May 30, 2026**.

**Live site:** [canadian-tuxedo-party.vercel.app](https://canadian-tuxedo-party.vercel.app)

## Quick start

```bash
npm install
npx serve .
```

Visit `http://localhost:3000`. API routes require Vercel or `vercel dev` locally.

Smoke-test production:

```bash
python scripts/smoke-test.py
```

## What's included

- Hero with poster, countdown, QR code, and post-party mode
- **At the Party** hub — gallery, games, votes, and TV slideshow
- Photo gallery with optional moderation
- Best Dressed vote **by contestant number** (closes 9 PM party night, shows winner)
- Printable contestant number tags
- Next-party poll saved to Blob
- **Host dashboard** — checklist, system status, live vote tally, quick links
- **Poll results dashboard** — date rankings and feedback
- PWA support, offline caching, and printable QR sign

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
| `VOTE_CLOSE_TIME` | Optional ISO datetime for vote cutoff (default: May 30, 2026 at 9:00 PM PT) |
| `VOTE_MAX_NUMBER` | Optional max contestant number (default: 99) |

Gallery uploads support photos and videos up to **5 GB** via direct-to-Blob client uploads (multipart for files over 100 MB).

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
| Print number tags | [/numbers.html](https://canadian-tuxedo-party.vercel.app/numbers.html) |
| Photo slideshow (TV) | [/slideshow.html](https://canadian-tuxedo-party.vercel.app/slideshow.html) |

## Party-night checklist

1. Set `GALLERY_ADMIN_CODE` in Vercel and redeploy
2. Print QR sign from [qr.html](https://canadian-tuxedo-party.vercel.app/qr.html) → post at Woodlawn entrance
3. Print number tags from [numbers.html](https://canadian-tuxedo-party.vercel.app/numbers.html) → hand out at the door
4. Test gallery upload + vote by number on a phone over **cellular**
5. Open [slideshow.html](https://canadian-tuxedo-party.vercel.app/slideshow.html) on the TV
6. Open [name-that-canadian.html](https://canadian-tuxedo-party.vercel.app/name-that-canadian.html) full-screen on the TV
7. Use [host.html](https://canadian-tuxedo-party.vercel.app/host.html) during the party

## Custom domain

1. Vercel → **Settings → Domains** → add your domain
2. Update DNS per Vercel instructions
3. Change `SITE_URL` and `SHARE_MESSAGE` in `js/config.js`, regenerate `assets/qr-code.png`, and redeploy

## Customize

- Party date / countdown: `js/config.js` → `PARTY_DATE`
- Party end (post-party mode): `js/config.js` → `PARTY_END`
- Vote close time: `js/config.js` → `VOTE_CLOSE_TIME` (and matching env var on Vercel)
- Max contestant number: `js/config.js` → `VOTE_MAX_NUMBER`
- Default tag count: `js/config.js` → `VOTE_TAG_COUNT`
- Site URL / QR / Open Graph: `js/config.js` → `SITE_URL`
- Guest invite text: `js/config.js` → `SHARE_MESSAGE`
