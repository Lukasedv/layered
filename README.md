# Layered - Activity Weather Clothing Advisor

A mobile-first Progressive Web App that suggests what to wear based on weather conditions and your chosen activity.

## Live Demo

🌐 **Production**: [https://gentle-bay-057fc6e1e.2.azurestaticapps.net](https://gentle-bay-057fc6e1e.2.azurestaticapps.net)

## Features

- 🏃 **Activity-based recommendations** - Running, cycling, skiing, hiking, walking
- 🌤️ **Real-time weather** - Uses your location to fetch current conditions
- 👕 **Smart layering advice** - Base, mid, and outer layer suggestions
- 📱 **Mobile-first PWA** - Install on your phone, works offline
- ⚡ **Fast & free** - Hosted on Azure Static Web Apps

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Azure Functions (Node.js)
- **Hosting**: Azure Static Web Apps
- **Weather API**: OpenWeatherMap

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Install frontend dependencies
npm install

# Install API dependencies
cd api && npm install && cd ..

# Create API local settings
cp api/local.settings.json.example api/local.settings.json
# Edit api/local.settings.json and add your OpenWeatherMap API key
```

### Run locally

```bash
# Start frontend dev server
npm run dev

# In another terminal, start API (requires Azure Functions Core Tools)
cd api && func start
```

Or use Azure Static Web Apps CLI:

```bash
npx swa start http://localhost:5173 --api-location ./api
```

### Build

```bash
npm run build
```

## Deployment

The app automatically deploys to Azure Static Web Apps via GitHub Actions on push to `main`.

### Manual deployment

```bash
npx swa deploy --env production
```

## Environment Variables

Set these in Azure Static Web Apps configuration:

| Variable | Description |
|----------|-------------|
| `OPENWEATHERMAP_API_KEY` | Your OpenWeatherMap API key |

## License

MIT
