# Layered - Activity Weather Clothing Advisor

## Overview
A mobile-first Progressive Web App (PWA) that helps users decide what to wear based on their selected activity and current weather conditions.

---

## Features
- **Activity Selection**: Running, Cycling, Skiing, Hiking, Walking
- **Geolocation**: Auto-detect user location (with manual override)
- **Weather Integration**: Real-time weather data (temp, wind, precipitation, humidity)
- **Smart Clothing Recommendations**: Activity-specific layering suggestions
- **Offline Support**: PWA with service worker caching

---

## Tech Stack

### Frontend
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | **React + Vite** | Fast builds, excellent PWA support, small bundle |
| Styling | **Tailwind CSS** | Utility-first, minimal CSS footprint |
| State | **Zustand** | Lightweight (~1KB), simple API |
| PWA | **Workbox** | Google's service worker toolkit |
| Icons | **Lucide React** | Tree-shakeable, lightweight |

### Backend (Serverless)
| Component | Technology | Rationale |
|-----------|------------|-----------|
| API | **Azure Functions (Node.js)** | Pay-per-execution, auto-scale |
| Runtime | **Node.js 20** | Fast cold starts |

### External APIs
| Service | Provider | Notes |
|---------|----------|-------|
| Weather | **Open-Meteo** | Free, no API key required, good accuracy |
| Geocoding | **Open-Meteo Geocoding** | Free reverse geocoding |

---

## Azure Architecture (Cost-Optimized)

```
┌─────────────────────────────────────────────────────────────┐
│                        Users (Mobile)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Azure Static Web Apps (Free Tier)              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React PWA (Frontend)                                │   │
│  │  - Vite build output                                 │   │
│  │  - Service Worker (offline)                          │   │
│  │  - Global CDN distribution                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Managed Azure Functions (Integrated Backend)        │   │
│  │  - /api/weather - Fetch & process weather            │   │
│  │  - /api/recommend - Generate clothing suggestions    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Open-Meteo API (Free)                    │
│  - Weather data                                              │
│  - Geocoding                                                 │
└─────────────────────────────────────────────────────────────┘
```

### Azure Resources
| Resource | SKU/Tier | Monthly Cost |
|----------|----------|--------------|
| **Azure Static Web Apps** | Free | $0 |
| **Integrated Functions** | Included | $0 |
| **Custom Domain + SSL** | Included | $0 |
| **Bandwidth** | 100GB/month free | $0 |

**Estimated Monthly Cost: $0** (within free tier limits)

### Why Azure Static Web Apps?
1. **Free tier** includes: hosting, SSL, custom domains, staging environments
2. **Integrated Azure Functions** - no separate Function App needed
3. **Global CDN** - automatic edge caching worldwide
4. **GitHub Actions** - built-in CI/CD integration
5. **Managed API** - Functions deployed alongside frontend

---

## Project Structure

```
layered/
├── .github/
│   └── workflows/
│       ├── ci.yml              # PR checks (lint, test, build)
│       └── deploy.yml          # Production deployment
├── api/                        # Azure Functions (backend)
│   ├── weather/
│   │   └── index.js            # GET /api/weather
│   ├── recommend/
│   │   └── index.js            # POST /api/recommend
│   ├── package.json
│   └── host.json
├── src/                        # React frontend
│   ├── components/
│   │   ├── ActivitySelector.jsx
│   │   ├── WeatherDisplay.jsx
│   │   ├── ClothingRecommendation.jsx
│   │   └── LocationPicker.jsx
│   ├── hooks/
│   │   ├── useGeolocation.js
│   │   └── useWeather.js
│   ├── services/
│   │   └── api.js
│   ├── data/
│   │   └── clothingRules.js    # Activity-specific clothing logic
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   ├── manifest.json           # PWA manifest
│   └── icons/                  # App icons (various sizes)
├── staticwebapp.config.json    # SWA routing config
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## API Endpoints

### `GET /api/weather`
Fetch weather for coordinates.

**Query params:**
- `lat` (required): Latitude
- `lon` (required): Longitude

**Response:**
```json
{
  "temperature": 5,
  "feelsLike": 2,
  "windSpeed": 15,
  "humidity": 75,
  "precipitation": 0.5,
  "condition": "cloudy",
  "location": "Seattle, WA"
}
```

### `POST /api/recommend`
Get clothing recommendations.

**Body:**
```json
{
  "activity": "running",
  "weather": { "temperature": 5, "windSpeed": 15, "precipitation": 0.5 }
}
```

**Response:**
```json
{
  "layers": {
    "base": "Moisture-wicking long-sleeve shirt",
    "mid": "Light fleece vest",
    "outer": "Wind-resistant running jacket",
    "bottom": "Running tights",
    "accessories": ["Light gloves", "Ear warmer headband"]
  },
  "tips": [
    "Wind chill makes it feel colder - protect exposed skin",
    "Light rain expected - water-resistant outer layer recommended"
  ]
}
```

---

## Clothing Recommendation Logic

### Temperature Zones (adjusted per activity)
| Zone | Running | Cycling | Skiing |
|------|---------|---------|--------|
| Hot | > 20°C | > 25°C | > 5°C |
| Warm | 15-20°C | 18-25°C | 0-5°C |
| Mild | 10-15°C | 12-18°C | -5-0°C |
| Cool | 5-10°C | 5-12°C | -10--5°C |
| Cold | 0-5°C | 0-5°C | -15--10°C |
| Very Cold | < 0°C | < 0°C | < -15°C |

### Modifiers
- **Wind > 20 km/h**: Add windproof layer
- **Precipitation > 0**: Add water-resistant layer
- **Humidity > 80%**: Prioritize breathable fabrics
- **Activity intensity**: Running = dress 10°C warmer than actual

---

## GitHub CI/CD Pipelines

### Pipeline 1: `ci.yml` (Pull Request Checks)

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run typecheck
      
      - name: Unit tests
        run: npm test -- --coverage
      
      - name: Build
        run: npm run build
      
      # API tests
      - name: Install API dependencies
        run: cd api && npm ci
      
      - name: Test API
        run: cd api && npm test

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install & Build
        run: |
          npm ci
          npm run build
      
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          configPath: ./lighthouserc.json
          uploadArtifacts: true
```

### Pipeline 2: `deploy.yml` (Production Deployment)

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build frontend
        run: npm run build
      
      - name: Install API dependencies
        run: cd api && npm ci --production
      
      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: "api"
          output_location: "dist"
```

### Pipeline 3: `preview.yml` (PR Preview Environments)

```yaml
name: Preview Environment

on:
  pull_request:
    types: [opened, synchronize, reopened, closed]

jobs:
  deploy-preview:
    if: github.event.action != 'closed'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install & Build
        run: |
          npm ci
          npm run build
          cd api && npm ci --production
      
      - name: Deploy Preview
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: "api"
          output_location: "dist"

  close-preview:
    if: github.event.action == 'closed'
    runs-on: ubuntu-latest
    steps:
      - name: Close Preview
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

---

## Performance Optimizations

### Frontend
- [x] **Code splitting** - Route-based lazy loading
- [x] **Tree shaking** - Vite's built-in optimization
- [x] **Image optimization** - WebP with fallbacks, lazy loading
- [x] **Service Worker** - Cache-first for static assets
- [x] **Preconnect** - `<link rel="preconnect">` for API domains
- [x] **Bundle analysis** - Keep JS < 100KB gzipped

### PWA Features
- [x] **Installable** - Add to home screen
- [x] **Offline** - Cached UI, show last weather data
- [x] **Fast** - Target < 2s First Contentful Paint

### API
- [x] **Edge caching** - Weather data cached 5 min at CDN
- [x] **Minimal responses** - Only return needed fields
- [x] **Cold start** - Node.js for fastest Azure Functions startup

---

## Mobile-First Design

### Viewport Targets
- Primary: 375px - 428px (iPhone, Android phones)
- Secondary: 768px - 1024px (tablets)
- Tertiary: 1024px+ (desktop)

### Touch Optimization
- Minimum tap targets: 44x44px
- Swipeable activity cards
- Pull-to-refresh weather data
- Haptic feedback on selection (if supported)

### UI Flow
```
┌─────────────────────┐
│     🌤️ Layered      │
├─────────────────────┤
│  📍 Seattle, WA     │
│     5°C / Cloudy    │
│   Wind: 15 km/h     │
├─────────────────────┤
│  What are you       │
│  doing today?       │
│                     │
│  ┌───┐ ┌───┐ ┌───┐  │
│  │🏃│ │🚴│ │⛷️│  │
│  │Run│ │Bike│ │Ski│  │
│  └───┘ └───┘ └───┘  │
├─────────────────────┤
│  👕 RECOMMENDED     │
│  ─────────────────  │
│  Base: Long-sleeve  │
│  Mid: Light fleece  │
│  Outer: Wind jacket │
│  ─────────────────  │
│  💡 Dress for 15°C  │
│  (you'll warm up!)  │
└─────────────────────┘
```

---

## Development Phases

### Phase 1: MVP (Week 1-2)
- [ ] Project setup (Vite + React + Tailwind)
- [ ] Activity selection UI
- [ ] Geolocation integration
- [ ] Weather API integration (Open-Meteo)
- [ ] Basic clothing recommendation logic
- [ ] Azure Static Web Apps deployment

### Phase 2: Polish (Week 3)
- [ ] PWA setup (manifest, service worker)
- [ ] Offline support
- [ ] Improved UI/animations
- [ ] Lighthouse optimization (target 90+ all categories)
- [ ] CI/CD pipelines

### Phase 3: Enhancements (Week 4+)
- [ ] Additional activities (hiking, golf, tennis)
- [ ] User preferences (always cold/hot)
- [ ] Hourly forecast view
- [ ] Share recommendations feature

---

## Setup Instructions

### Prerequisites
- Node.js 20+
- Azure account (free tier)
- GitHub account

### Local Development
```bash
# Clone and install
git clone https://github.com/[username]/layered.git
cd layered
npm install
cd api && npm install && cd ..

# Run locally
npx swa start
```

### Azure Deployment
```bash
# Install SWA CLI
npm install -g @azure/static-web-apps-cli

# Initialize (creates config files)
npx swa init --yes

# Deploy to Azure
npx swa deploy --env production
```

### GitHub Secrets Required
| Secret | Description |
|--------|-------------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | From Azure Portal → Static Web App → Manage deployment token |

---

## Estimated Costs

| Scenario | Monthly Cost |
|----------|--------------|
| < 100 users/day | $0 (free tier) |
| 100-1000 users/day | $0-9 (may need Standard tier) |
| 1000+ users/day | ~$9/month (Standard tier) |

**Note:** Open-Meteo API is free for non-commercial use up to 10,000 requests/day.

---

## Future Considerations

- **Analytics**: Add Microsoft Clarity (free) for user behavior
- **A/B Testing**: Azure Static Web Apps supports split testing
- **Monetization**: Premium features (extended forecast, custom activities)
- **Native App**: Consider Capacitor wrapper if app store presence needed
