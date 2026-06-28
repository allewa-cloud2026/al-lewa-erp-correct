# LEWA SPICES & PULSES ERP

Lewa Merchandising & Delivery Control System is a React + Vite Progressive Web App for AL LEWA GENERAL TRADING LLC.

## Company Information

- Company: AL LEWA GENERAL TRADING LLC
- Brand: LEWA SPICES & PULSES
- Business category: General Trading - Spices, Pulses, Nuts, Coffee & Food Products
- Location: Sultanate of Oman
- Head Office: P.O. Box 430, PC 111
- Phone: +968 2250 7286
- Mobile: +968 9716 7588
- Support Email: lewaspices@gmail.com
- Theme Color: #0B6B2E

## App Stack

- Frontend: React + Vite
- PWA: Vite PWA service worker, manifest, install support, static asset caching
- Backend: Supabase
- Build output: `frontend/dist`

## Local Development

```bash
cd frontend
npm install
npm run dev
```

Local development opens on:

```text
http://127.0.0.1:5173/
```

That local link works only on the Mac running the dev server. For iPhone and Android, deploy the app online first.

## Build

```bash
cd frontend
npm run build
```

The production files are generated in:

```text
frontend/dist
```

## Supabase Environment Variables

Create these variables in Netlify before deploying:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

In Netlify:

1. Open the Netlify site dashboard.
2. Go to `Site configuration`.
3. Open `Environment variables`.
4. Add `VITE_SUPABASE_URL`.
5. Add `VITE_SUPABASE_ANON_KEY`.
6. Redeploy the site.

If these values are not set, the ERP remains in demo mode using local demo data.

## Deploy Frontend to Netlify

### Option 1: Git Deploy

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Netlify, choose `Add new site`.
3. Select `Import an existing project`.
4. Connect the repository.
5. Use these build settings:

```text
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

6. Add the Supabase environment variables.
7. Click `Deploy`.

This repository also includes `netlify.toml`, so Netlify can detect:

```text
Base: frontend
Command: npm run build
Publish: dist
```

### Option 2: Manual Deploy

1. Run:

```bash
cd frontend
npm run build
```

2. Open Netlify.
3. Go to `Add new site`.
4. Choose `Deploy manually`.
5. Upload the `frontend/dist` folder.

Manual deploy is useful for a quick test. Git deploy is better for ongoing updates.

## Open on iPhone Safari

1. Deploy the ERP to Netlify.
2. Copy the public Netlify URL, for example:

```text
https://lewa-erp.netlify.app
```

3. Open Safari on iPhone.
4. Paste the Netlify URL.
5. Login to the ERP.

## Install as PWA on iPhone

1. Open the Netlify URL in Safari.
2. Tap the Share button.
3. Tap `Add to Home Screen`.
4. Confirm the name `LEWA ERP`.
5. Launch the installed app from the iPhone home screen.

## Open on Android Chrome

1. Deploy the ERP to Netlify.
2. Open Chrome on Android.
3. Paste the Netlify URL.
4. Login to the ERP.

## Install as PWA on Android

1. Open the Netlify URL in Chrome.
2. Tap the browser menu.
3. Tap `Install app` or `Add to Home screen`.
4. Confirm `LEWA ERP`.
5. Launch the installed app from the Android home screen.

## PWA Behavior

- App name: LEWA SPICES & PULSES
- Short name: LEWA ERP
- Theme color: #0B6B2E
- Background color: #FFFFFF
- App icon: `/lewa-logo.png`
- Static assets cached offline:
  - JavaScript
  - CSS
  - Images
  - Fonts
  - Lewa logo
- Supabase data remains online-synchronized.
- Business data and API responses are not cached by the service worker.
- The app displays `Offline Mode` when the device is offline.
- The app displays `New Version Available` when a new service worker update is ready.

## Production Result

After Netlify deployment, the ERP can be opened on:

- macOS browser
- Windows browser
- iPhone Safari, with PWA install
- Android Chrome, with PWA install

Single codebase. Single Supabase backend. Single enterprise ERP application.
