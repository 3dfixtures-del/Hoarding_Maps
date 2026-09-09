# Adinn Excel to Google OOH Site Map — Git / Netlify V3

Git-ready static HTML + JavaScript application for generating exact-GPS OOH site maps from Excel using **Google Maps Static API**.

The browser reads Excel and draws the callouts/table. A Netlify JavaScript Function fetches the Google map image so the production API key does not need to be committed to Git and the final canvas can be downloaded as PNG.

## Project files

```text
.
├── index.html
├── app.js
├── styles.css
├── sample_input.xlsx
├── netlify.toml
├── package.json
├── .nvmrc
├── .gitignore
├── .env.example
└── netlify/
    └── functions/
        └── google-static-map.js
```

## Features

- Google Maps: Roadmap / Hybrid / Satellite / Terrain
- Excel upload in the browser
- Required columns: `S.No, City, Media, Area Name, Location, W, H, Lat, Long`
- Header aliases supported
- Strict latitude / longitude validation
- Exact Web-Mercator GPS anchor verification
- Compact numbered callouts with exact arrow-tip anchoring
- Collision/crossing reduction
- Full Location address wrapping
- PNG export
- No Python, Streamlit, database, or traditional backend server

## 1. Google Cloud setup

Enable **Maps Static API** for your Google Cloud project and use a dedicated API key for this tool.

For production, restrict the key to the Maps Static API and configure sensible quota limits.

Do not put the real key in `app.js`, `index.html`, `.env.example`, or any Git commit.

## 2. Local development — IMPORTANT

Do **not** run this project with VS Code Live Server, `python -m http.server`, or by double-clicking `index.html`. Those servers cannot execute the Netlify Function and will produce a 404/405 error.

Install Node.js 18+ (Node 20 recommended), then from this project folder run:

```bash
npm install
```

Copy the example environment file:

### Windows CMD

```bat
copy .env.example .env
```

### PowerShell

```powershell
Copy-Item .env.example .env
```

Edit `.env` and set:

```env
GOOGLE_MAPS_API_KEY=YOUR_REAL_GOOGLE_MAPS_STATIC_API_KEY
```

Then run:

```bash
npm run dev
```

Open:

```text
http://localhost:8888
```

The `.env` file is ignored by Git.

You can alternatively leave the environment variable unset and enter a testing API key in the password field on the page.

## 3. Upload to GitHub

Create a new empty GitHub repository, then run inside this folder:

```bash
git init
git add .
git commit -m "Initial Google OOH map tool"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Before `git add .`, confirm that `.env` is not listed:

```bash
git status
```

## 4. Deploy GitHub repository to Netlify

1. Netlify → **Add new project** → **Import an existing project**.
2. Choose GitHub and select this repository.
3. Netlify reads `netlify.toml`; no framework/build command is required.
4. In **Site configuration → Environment variables**, add:

```text
GOOGLE_MAPS_API_KEY = your production key
```

Optional:

```text
GOOGLE_MAPS_URL_SIGNING_SECRET = your URL signing secret
```

5. Trigger a new deploy.
6. On production, leave the API-key field in the page blank.

## 5. Security

- `.env` is excluded by `.gitignore`.
- Production API key stays in Netlify environment variables.
- Optional URL signing secret stays server-side.
- The browser calls only `/.netlify/functions/google-static-map`.
- The production key is never returned to browser JavaScript.

If an API key has previously been posted publicly or committed to Git, replace/rotate it before production use.

## Troubleshooting

### `Google Maps request failed (405)` while local

You are almost certainly using a normal static server. Stop it and run:

```bash
npm run dev
```

Then use `http://localhost:8888`.

### `Google Maps request failed (400)`

Check that the API key is configured and Maps Static API is enabled.

### Google error about billing/key restrictions

Check the Google Cloud project's billing status, API restrictions, quota, and that the key belongs to the project where Maps Static API is enabled.
