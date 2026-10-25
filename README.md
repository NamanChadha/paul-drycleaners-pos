# Paul Drycleaners Management System

Counter-first React + TypeScript app for one dry-cleaning shop.

## Included in this v1 scaffold
- Customer capture with unique phone-based autofill
- Order entry with Sunday-safe delivery dates
- Persistent order numbering
- Receipt and garment-tag print previews
- One-click WhatsApp bill message handoff
- Payment tracking, order search, customer history, dashboard, settings
- Local admin/reception logins when Firebase is not configured
- Local folder persistence in `data/paul-drycleaners-data.json`
- Firebase-ready configuration and admin-only Firestore rules

## Desktop installers

The desktop version starts the POS and its local storage automatically—no browser or background server is needed. Each computer stores its own private data file in its operating system's app-data folder:

- Windows: `%APPDATA%\\Paul Drycleaners POS\\data\\paul-drycleaners-data.json`
- macOS: `~/Library/Application Support/Paul Drycleaners POS/data/paul-drycleaners-data.json`

Build an installer locally:

```bash
npm install
npm run dist:win  # Windows NSIS .exe installer
npm run dist:mac  # macOS .dmg (run on macOS)
```

Installers are written to `release/`. The Windows installer creates both Start Menu and desktop shortcuts.

### GitHub Releases and updates

Push a version tag such as `v1.0.0`; the included GitHub Actions workflow builds the Windows `.exe` and macOS `.dmg` and attaches them to the GitHub Release.

The installed app checks for updates from that GitHub repository and prompts the user to install a downloaded update. Windows update delivery works directly from the release assets. macOS distribution requires Apple code signing and notarization before end users can install/update without security warnings.

## Run locally

For normal daily use, double-click `Start Paul Drycleaners.cmd`. It automatically detects Node.js, starts the local server in the background, and opens the app in your browser at `http://127.0.0.1:4173`.

To stop the server at any time, double-click `Stop Paul Drycleaners.cmd`.

The first run carries any existing browser data into `data/paul-drycleaners-data.json`. Keep this file with the project folder when moving computers.

For development only:

```bash
npm install
npm run dev
```

## Firebase
Copy `.env.example` to `.env.local`, fill the Firebase values, then deploy `firestore.rules`.

## First local logins
- Admin: `admin` / `admin123`
- Reception: `reception` / `reception123`

Change both from Settings after first sign-in.
