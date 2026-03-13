# Layered — Activity Weather Clothing Advisor

> Know exactly what to wear before you head out the door.

[![CI](https://github.com/Lukasedv/layered/actions/workflows/ci.yml/badge.svg)](https://github.com/Lukasedv/layered/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://gentle-bay-057fc6e1e.2.azurestaticapps.net)

---

## Table of Contents

1. [Overview](#overview)
2. [Live Demo](#live-demo)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Running Locally](#running-locally)
6. [Usage](#usage)
7. [Project Structure](#project-structure)
8. [Deployment](#deployment)
9. [Environment Variables](#environment-variables)
10. [Contributing](#contributing)
11. [License](#license)

---

## Overview

**Layered** is a mobile-first Progressive Web App (PWA) that combines your real-time local weather with the activity you're about to do and returns a precise, layered clothing recommendation — base layer, mid layer, outer layer, accessories, and contextual tips.

Stop second-guessing whether you need a jacket. Layered does the thinking so you can focus on the activity.

**Who is it for?** Runners, cyclists, skiers, hikers, and casual walkers who want smart, activity-aware outfit suggestions without digging through a weather app manually.

---

## Live Demo

🌐 **Production**: [https://gentle-bay-057fc6e1e.2.azurestaticapps.net](https://gentle-bay-057fc6e1e.2.azurestaticapps.net)

The app is hosted on Azure Static Web Apps. No account or login is required — just allow location access and pick your activity.

---

## Features

| Feature | Description |
|---------|-------------|
| 🏃 **Activity-based recommendations** | Supports Running, Cycling, Skiing, Hiking, and Walking |
| 🌤️ **Real-time weather** | Automatically detects your location and fetches current conditions |
| 👕 **Smart layering system** | Returns base, mid, and outer layer suggestions tailored to conditions |
| 🎒 **Accessories & tips** | Recommends gloves, hats, sunscreen, and activity-specific advice |
| 📱 **Mobile-first PWA** | Installable on iOS and Android; works offline after first visit |
| ⚡ **Zero sign-up** | Open the URL, allow location, done |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS v4 |
| Backend | Azure Functions (Node.js) |
| Hosting | Azure Static Web Apps |
| Weather data | [OpenWeatherMap API](https://openweathermap.org/api) |
| PWA | `vite-plugin-pwa` + Workbox |

---

## Getting Started

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| [Node.js](https://nodejs.org/) | 20+ | Required for both frontend and API |
| npm | Bundled with Node | Used for dependency management |
| [Azure Functions Core Tools](https://learn.microsoft.com/azure/azure-functions/functions-run-local) | v4 | Required **only** if running the Azure Functions API locally |
| OpenWeatherMap API key | — | Free tier at [openweathermap.org](https://openweathermap.org/appid) |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Lukasedv/layered.git
cd layered

# 2. Install frontend dependencies
npm install

# 3. Install API dependencies
cd api && npm install && cd ..

# 4. Configure the API key
cp api/local.settings.json.example api/local.settings.json
```

Open `api/local.settings.json` and replace `your_api_key_here` with your OpenWeatherMap API key:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "OPENWEATHERMAP_API_KEY": "<your-api-key>"
  }
}
```

### Running Locally

The project ships with a lightweight Express development server (`dev-server.js`) that proxies Azure Functions API calls, so you can run the full stack without installing Azure Functions Core Tools.

```bash
# Start both the frontend (Vite) and the local API proxy in one command
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Tip:** If you prefer the real Azure Functions runtime locally, start the API in a separate terminal:
>
> ```bash
> # Terminal 1 — frontend
> npm run dev:frontend
>
> # Terminal 2 — Azure Functions API
> npm run dev:api        # uses the built-in Node proxy, or:
> cd api && func start   # uses Azure Functions Core Tools
> ```

**Build for production**

```bash
npm run build
# Output is placed in ./dist
```

**Lint & type-check**

```bash
npm run lint
npm run typecheck
```

---

## Usage

### 1. Get a clothing recommendation

1. Open the app and **allow location access** when prompted. The app fetches your local weather automatically.
2. The current weather (temperature, feels-like, wind, precipitation) appears at the top.
3. **Select an activity** — Running 🏃, Cycling 🚴, Skiing ⛷️, Hiking 🥾, or Walking 🚶.
4. A layered clothing recommendation is generated instantly:
   - **Base layer** — moisture management (e.g. "Lightweight moisture-wicking t-shirt")
   - **Mid layer** — insulation (e.g. "Fleece jacket")
   - **Outer layer** — wind/rain protection (e.g. "Waterproof shell")
   - **Accessories** — gloves, hat, sunglasses, etc.
   - **Tips** — activity-specific advice for the conditions

### 2. Install as a PWA

On mobile (iOS / Android) or desktop Chrome/Edge:

- **iOS Safari**: tap the Share icon → *Add to Home Screen*
- **Android Chrome**: tap the browser menu → *Install app*
- **Desktop Chrome/Edge**: click the install icon in the address bar

Once installed, the app loads instantly even with no internet connection (weather data requires connectivity).

### 3. Switching activities

Tap any activity button to instantly recalculate recommendations for the same weather conditions. No page reload required.

---

## Project Structure

```
layered/
├── api/                        # Azure Functions backend
│   ├── src/
│   │   ├── functions/
│   │   │   ├── weather.ts      # GET /api/weather — fetches OpenWeatherMap data
│   │   │   └── recommendations.ts  # POST /api/recommendations — generates clothing advice
│   │   └── shared/             # Shared types and utilities
│   ├── local.settings.json.example
│   └── package.json
├── src/                        # React frontend
│   ├── components/             # UI components
│   │   ├── ActivitySelector.tsx
│   │   ├── ClothingRecommendation.tsx
│   │   ├── Layout.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── WeatherDisplay.tsx
│   ├── hooks/                  # Custom React hooks (geolocation, weather, recommendations)
│   ├── services/               # API client (api.ts)
│   ├── types/                  # Shared TypeScript types
│   └── App.tsx
├── public/                     # Static assets & PWA icons
├── dev-server.js               # Local Express proxy for API development
├── vite.config.ts
└── package.json
```

---

## Deployment

The app is deployed automatically to **Azure Static Web Apps** on every push to `main` via GitHub Actions ([`.github/workflows/azure-swa-deploy.yml`](.github/workflows/azure-swa-deploy.yml)).

Pull requests get a **preview environment** automatically — the bot posts the preview URL as a PR comment.

### Manual deployment

```bash
# Install the SWA CLI (once)
npm install -g @azure/static-web-apps-cli

# Deploy to production
npx swa deploy --env production
```

---

## Environment Variables

### API (Azure Functions)

Set these in `api/local.settings.json` for local development, and in the **Azure Static Web Apps → Configuration** blade for production.

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENWEATHERMAP_API_KEY` | ✅ Yes | API key from [openweathermap.org](https://openweathermap.org/appid) |
| `FUNCTIONS_WORKER_RUNTIME` | ✅ Yes | Must be `node` |
| `AzureWebJobsStorage` | Dev only | Can be empty string for local development |

---

## Contributing

Contributions are welcome! Here's how to get involved:

### Reporting bugs or requesting features

1. Search [existing issues](https://github.com/Lukasedv/layered/issues) to avoid duplicates.
2. Open a new issue with a clear title, steps to reproduce (for bugs), and the expected vs. actual behaviour.

### Submitting a pull request

1. **Fork** the repository and create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Follow the [Getting Started](#getting-started) guide to set up a local environment.
3. Make your changes, keeping commits focused and descriptive.
4. Ensure lint and type checks pass:
   ```bash
   npm run lint && npm run typecheck
   ```
5. Open a PR against `main`. The CI pipeline will run lint, type-check, and build checks automatically. A preview environment will be deployed for review.

### Code style

- TypeScript strict mode is enabled — avoid `any` types.
- Tailwind CSS utility classes only; no custom CSS files.
- Follow the existing component structure in `src/components/`.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
