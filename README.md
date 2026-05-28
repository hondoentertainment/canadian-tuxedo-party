# Canadian Tuxedo Party

Event website for the **Canadian Tuxedo Party** on **Saturday, May 30, 2026**.

**Live site:** [canadian-tuxedo-party.vercel.app](https://canadian-tuxedo-party.vercel.app)

## Quick start

```bash
npm install
npx serve .
```

Visit `http://localhost:3000`. API routes (gallery, poll, vote) require Vercel or `vercel dev` locally.

## What's included

- Hero with poster, countdown, and QR code
- Party details, dress code, location, and FAQ
- **At the Party** hub — gallery, games, and votes
- Photo gallery with Vercel Blob uploads (optional moderation)
- Best Dressed live vote
- Next-party poll (saved to Blob, not email)
- Ice Breakers and Name That Canadian embeds
- Post-party homepage mode after May 30, 2026
- PWA support (add to home screen)
- Printable QR sign at `/qr.html`

## Deploy

### GitHub + Vercel

Push to GitHub and deploy:

```bash
git push origin main
npx vercel deploy --prod --yes
```

### Environment variables (Vercel dashboard)

| Variable | Purpose |
|----------|---------|
| `BLOB_READ_WRITE_TOKEN` | Auto-set when Vercel Blob is connected |
| `GALLERY_ADMIN_CODE` | Enables photo moderation; unlock at `/admin.html` |

### Custom domain

In the Vercel project → **Settings → Domains**, add your domain and follow DNS instructions.

## Host checklist

1. Print the QR sign: [qr.html](https://canadian-tuxedo-party.vercel.app/qr.html)
2. Set `GALLERY_ADMIN_CODE` if you want to approve photos before they go live
3. Test upload + vote on a phone over cellular
4. Project **Name That Canadian** full-screen on the TV

## Customize

- Party date/time: `js/config.js` (`PARTY_DATE`)
- Site URL (QR + Open Graph): `js/config.js` (`SITE_URL`)
- Address and map: Location section in `index.html`

## Admin

- **Photo review:** [/admin.html](https://canadian-tuxedo-party.vercel.app/admin.html) (requires `GALLERY_ADMIN_CODE`)
- **Poll results:** `/api/poll?admin=1` (JSON tally)
