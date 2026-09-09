# Adinn Excel to Google OOH Site Map — Netlify V2

Fully HTML + JavaScript, hosted on Netlify. The browser reads the Excel file and draws the exact-GPS callouts/table. A small Netlify JavaScript Function fetches the Google Static Maps base image so the API key does not need to be committed into the website source and the final composition can be exported as PNG.

## Features

- Google Maps base map: Roadmap / Hybrid / Satellite / Terrain
- Excel upload directly in the browser
- Required columns: `S.No, City, Media, Area Name, Location, W, H, Lat, Long`
- Header aliases supported
- Strict latitude / longitude validation
- Web-Mercator GPS projection verification
- Compact numbered callouts; exact arrow tip stays on Lat/Long
- Full Location address wrapping
- PNG export
- No Python, Streamlit, database, or traditional server

## Recommended Google Cloud setup

1. Create or select a Google Cloud project.
2. Enable **Maps Static API**.
3. Ensure billing/API access is enabled for the project.
4. Create a **dedicated key for Maps Static API**.
5. Restrict the key to **Maps Static API** and set sensible quota limits.
6. For stronger production security, also get the Google Maps **URL signing secret** and configure it in Netlify.
7. Do **not** commit either secret to this ZIP/repository.

The key field in the web page is only for testing. It is not saved by this code.

## Netlify deployment

### Option A — recommended production setup

1. Upload this folder to GitHub or deploy it directly to Netlify.
2. In Netlify open:
   **Site configuration → Environment variables**
3. Add:

   `GOOGLE_MAPS_API_KEY = your_key_here`

   Optional/recommended for production:

   `GOOGLE_MAPS_URL_SIGNING_SECRET = your_url_signing_secret`

4. Redeploy the site.
5. Leave the Google API key box in the web app blank.

### Option B — quick testing

Deploy the site and paste a compatible Google Maps API key into the password field in the page. The value is sent only to the same-site Netlify Function for that request and is not stored in localStorage/sessionStorage.

## Local development

Because Google map fetching uses a Netlify Function, opening `index.html` directly will not work for map generation.

With Node.js installed:

```bash
npx netlify-cli dev
```

Then open the local URL shown by Netlify CLI.

You can either set `GOOGLE_MAPS_API_KEY` in Netlify CLI's environment or use the testing key field in the page.

## Output sizes

Recommended: `1920 × 1080`.

The standard Google Static Maps API supports a logical map image up to 640 × 640 pixels and `scale=2`. The layouts in this project keep the Google map pane within that limit for the included 1920×1080, 1600×900 and 1280×720 presets.

## Security note

A Maps Demo Key is useful for prototyping but is not intended as a production credential. For a public Netlify site, use a production Google Cloud project/key, API restrictions and quota controls.

### Signed requests

If `GOOGLE_MAPS_URL_SIGNING_SECRET` is configured, the Netlify Function signs every Google Static Maps request server-side using HMAC-SHA1. The signing secret is never exposed to the browser.
