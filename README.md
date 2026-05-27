# Canadian Tuxedo Party

Event website for the **Canadian Tuxedo Party** on **Saturday, May 30, 2026**.

## Quick start

Open `index.html` in a browser, or run a local server:

```bash
npx serve .
```

Then visit `http://localhost:3000`.

## What's included

- Hero with event poster and countdown to May 30, 2026
- Party details, dress code, and location (Woodlawn side entrance)
- RSVP form (opens your email client with pre-filled details)
- Mobile-responsive denim & rustic wood theme

## Deploy

This is a static site — deploy to any static host:

- **Vercel:** `vercel`
- **GitHub Pages:** push and enable Pages on the repo
- **Netlify:** drag the folder into Netlify Drop

## Customize

- Update the party date/time in `js/main.js` (`PARTY_DATE`)
- Add a real address and map embed in the Location section of `index.html`
- Set an RSVP email by changing the `mailto:` link in `js/main.js`
