# Weather Packing Assistant

**Full Stack Weather App — AI Engineer Intern Technical Assessment**  
**Candidate:** Igor Caldas  
**Assessment target:** Full Stack — Tech Assessment #1 + Tech Assessment #2  
**Status:** Initial documentation and implementation planning

---

## 1. Project Overview

Weather Packing Assistant is a full-stack weather application that helps users check real-time weather conditions and generate practical packing suggestions based on the weather at their destination.

Instead of only answering:

> What is the weather?

The app also answers:

> What should I bring based on the weather where I am going?

The application allows users to enter a location, retrieve current weather and forecast data from an external weather API, store weather requests in a database, manage previous searches through CRUD operations, and export saved data.

The creative layer of the project is an **AI-assisted weather interpretation and packing recommendation engine**. It interprets temperature, rain, snow, wind, UV index, fog, storms, and temperature variation to suggest essential travel items such as jackets, umbrellas, sunscreen, light clothing, warm layers, waterproof shoes, gloves, or wind protection.

---

## 2. About PM Accelerator

This project was developed as part of the **AI Engineer Intern Technical Assessment** for the Product Manager Accelerator.

The Product Manager Accelerator supports professionals who want to grow in product management by helping them develop practical skills, understand product strategy, and work through real product challenges.

---

## 3. Core Idea

Most weather apps display raw data. This project turns weather data into practical travel guidance.

The product combines:

- Weather API retrieval
- Location validation
- Date range validation
- Database persistence
- CRUD operations
- Export functionality
- Responsive frontend experience
- Deterministic weather classification
- AI-assisted packing recommendations using DeepSeek API
- Safe fallback rules when the AI layer is unavailable

---

## 4. Main Features

### Frontend Features

- Search weather by location:
  - City
  - Town
  - Landmark
  - Postal code / ZIP code
  - GPS coordinates
  - Current user location
- Display current weather clearly
- Display 5-day forecast
- Show useful weather details:
  - Temperature
  - Feels-like temperature
  - Minimum and maximum temperature
  - Rain probability
  - Wind speed and gusts
  - Humidity
  - UV index
  - Snowfall when available
  - Weather condition
- Responsive design for desktop, tablet, and mobile
- Weather cards and weather icons
- Graceful error handling:
  - Invalid location
  - API request failure
  - Empty input
  - Invalid date range
- Packing checklist based on interpreted weather conditions
- Travel insights explaining what the user should consider before packing

### Backend Features

- RESTful API
- External weather API integration
- Geocoding / location validation
- Date range validation
- CRUD operations with database persistence
- Store weather requests and retrieved weather data
- Weather normalization layer
- Weather interpretation layer
- DeepSeek AI recommendation service
- Checklist validation service
- Fallback deterministic recommendation engine
- Export saved data to CSV and JSON
- Normalized API error responses

---

## 5. AI-Assisted Weather Interpretation

The app includes a weather interpretation layer that transforms raw forecast data into practical travel recommendations.

The first implementation should combine:

1. **Weather API data** as the source of truth
2. **Rule-based classification** for transparent and testable weather scenarios
3. **DeepSeek API** to generate a friendly, structured recommendation from the normalized forecast
4. **Backend validation** to prevent hallucinated weather facts or unrelated packing items
5. **Deterministic fallback** if the AI service fails

### Core Rule

> Weather data comes from the weather API.  
> The backend normalizes and validates it.  
> DeepSeek may interpret and explain it.  
> The backend validates the final checklist before returning it to the frontend.

### Supported Weather Scenarios

The first version should interpret:

- Hot weather
- Cold weather
- Very cold weather
- Rain
- Heavy rain
- Snow
- Heavy snow
- Fog or low visibility
- Strong wind
- Storm or thunderstorm risk
- High UV exposure
- Large temperature variation between day and night
- Mixed conditions across the trip period

### Example Recommendations

If the forecast indicates **cold weather**, the app may recommend:

- Warm jacket
- Sweater or hoodie
- Long pants
- Warm socks
- Comfortable closed shoes

If the forecast indicates **very cold weather or snow**, the app may recommend:

- Heavy coat
- Thermal base layer
- Gloves
- Beanie
- Scarf
- Waterproof or insulated shoes

If the forecast indicates **rain or heavy rain**, the app may recommend:

- Waterproof jacket
- Compact umbrella
- Extra socks
- Water-resistant shoes
- Quick-dry clothing

If the forecast indicates **strong wind**, the app may recommend:

- Windbreaker jacket
- Layered clothing
- Secure hat or cap
- Avoid fragile umbrellas

If the forecast indicates **high UV exposure**, the app may recommend:

- Sunscreen
- Sunglasses
- Hat or cap
- Light long-sleeve shirt
- Reusable water bottle

If the forecast indicates **storm or thunderstorm risk**, the app may recommend:

- Waterproof outer layer
- Portable power bank
- Keep essential items protected from water
- Avoid planning exposed outdoor activities
- Check local alerts before leaving

---

## 6. Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express
- TypeScript

### Database

- SQLite for local development
- Optional future migration to PostgreSQL

### ORM

- Prisma

### External APIs

- Weather API: Open-Meteo Forecast API or similar provider
- Geocoding API: Open-Meteo Geocoding API or similar provider
- AI recommendation service: DeepSeek API

### Export Formats

Initial target:

- CSV
- JSON

Possible future formats:

- Markdown
- PDF

---

## 7. High-Level Architecture

```text
User
  |
  v
Next.js Frontend
  |
  v
Express REST API
  |
  +--> Location Validation Service
  |
  +--> Weather API Service
  |       |
  |       v
  |   External Weather API
  |
  +--> Weather Normalizer
  |
  +--> Rule-Based Weather Classifier
  |
  +--> DeepSeek AI Interpretation Service
  |
  +--> Checklist Validation Service
  |
  +--> Fallback Packing Rule Engine
  |
  +--> Database Service
  |       |
  |       v
  |   SQLite / Prisma
  |
  +--> Export Service
  |
  v
JSON Response to Frontend
```

---

## 8. Application Flow

```text
1. User enters a location and optional date range
2. Frontend validates the basic input
3. Backend receives the request
4. Backend validates required fields and date range
5. Backend geocodes the location
6. Backend retrieves weather data from the external weather API
7. Weather data is normalized
8. Rule-based weather scenarios are detected
9. DeepSeek receives a structured weather summary and generates a recommendation
10. Backend validates the AI response
11. If AI fails, deterministic checklist rules are used
12. Request, weather data, interpretation, and checklist are stored in the database
13. Frontend displays:
    - Current weather
    - 5-day forecast
    - Weather interpretation
    - Travel insights
    - Packing checklist
14. User can later read, update, delete, or export saved records
```

---

## 9. Planned REST API

### Health Check

```http
GET /api/health
```

Example response:

```json
{
  "status": "ok",
  "service": "weather-packing-assistant-api"
}
```

### Create Weather Request

```http
POST /api/weather-requests
```

Example request:

```json
{
  "location": "London",
  "startDate": "2026-07-10",
  "endDate": "2026-07-15"
}
```

Example response:

```json
{
  "id": "req_001",
  "location": "London",
  "country": "United Kingdom",
  "latitude": 51.5072,
  "longitude": -0.1276,
  "startDate": "2026-07-10",
  "endDate": "2026-07-15",
  "currentWeather": {
    "temperature": 18,
    "condition": "Rainy",
    "windSpeed": 22,
    "humidity": 76
  },
  "forecast": [],
  "weatherProfile": {
    "mainScenario": "Cool and rainy",
    "riskLevel": "moderate",
    "detectedConditions": ["rain", "cool", "wind"]
  },
  "travelInsights": [
    "Rain is likely during this trip.",
    "Wind may make the temperature feel colder."
  ],
  "packingChecklist": {
    "clothing": ["Light sweater", "Long pants"],
    "weatherProtection": ["Waterproof jacket", "Compact umbrella"],
    "accessories": ["Power bank", "Reusable water bottle"]
  },
  "createdAt": "2026-06-26T12:00:00.000Z"
}
```

### Read All Weather Requests

```http
GET /api/weather-requests
```

### Read One Weather Request

```http
GET /api/weather-requests/:id
```

### Update Weather Request

```http
PUT /api/weather-requests/:id
```

Example request:

```json
{
  "location": "Paris",
  "startDate": "2026-07-12",
  "endDate": "2026-07-16"
}
```

### Delete Weather Request

```http
DELETE /api/weather-requests/:id
```

### Export Data

```http
GET /api/weather-requests/export.csv
GET /api/weather-requests/export.json
```

---

## 10. Database Model

Initial planned Prisma model:

```prisma
model WeatherRequest {
  id                   String   @id @default(cuid())
  locationInput        String
  resolvedLocationName String
  country              String?
  latitude             Float
  longitude            Float
  startDate            DateTime
  endDate              DateTime
  currentWeatherJson   Json
  forecastJson         Json
  weatherProfileJson   Json
  packingChecklistJson Json
  aiRecommendationJson Json?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

---

## 11. Environment Variables

Example `.env` values:

```env
DATABASE_URL="file:./dev.db"

PORT=4000
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"

WEATHER_API_BASE_URL="https://api.open-meteo.com"
GEOCODING_API_BASE_URL="https://geocoding-api.open-meteo.com"

DEEPSEEK_API_KEY=""
DEEPSEEK_API_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-v4-flash"
DEEPSEEK_REASONING_EFFORT="medium"
```

Secrets must never be committed to Git.

---

## 12. Error Handling Strategy

The app should handle errors gracefully and return useful messages.

Invalid location:

```json
{
  "error": "LOCATION_NOT_FOUND",
  "message": "We could not find this location. Please try a city, postal code, landmark, or GPS coordinates."
}
```

Invalid date range:

```json
{
  "error": "INVALID_DATE_RANGE",
  "message": "The end date must be after the start date."
}
```

Weather API failure:

```json
{
  "error": "WEATHER_API_ERROR",
  "message": "Weather data is temporarily unavailable. Please try again later."
}
```

AI interpretation failure:

```json
{
  "warning": "AI_RECOMMENDATION_UNAVAILABLE",
  "message": "The packing checklist was generated using deterministic fallback rules."
}
```

---

## 13. Local Development Setup

### Prerequisites

- Node.js 18+
- npm or pnpm
- Git

### Clone Repository

```bash
git clone https://github.com/Sharpshooter171/weather-packing-assistant.git
cd weather-packing-assistant
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

```bash
cp .env.example .env
```

### Run Database Migration

```bash
npx prisma migrate dev
```

### Run Development Server

If using a monorepo structure:

```bash
npm run dev
```

Possible separated commands:

```bash
npm run dev:api
npm run dev:web
```

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

---

## 14. Suggested Project Structure

```text
weather-packing-assistant/
├── README.md
├── .env.example
├── .gitignore
├── package.json
├── prisma/
│   └── schema.prisma
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── types/
│   │   └── package.json
│   └── api/
│       ├── src/
│       │   ├── server.ts
│       │   ├── routes/
│       │   ├── services/
│       │   ├── validators/
│       │   ├── repositories/
│       │   └── types/
│       └── package.json
├── packages/
│   └── shared/
└── docs/
    ├── product-requirements.md
    ├── architecture.md
    ├── api-contract.md
    ├── ai-weather-interpretation-contract.md
    ├── weather-rules.md
    ├── data-model.md
    ├── devops.md
    ├── testing-plan.md
    ├── ui-reference.md
    └── opencode-implementation-plan.md
```

---

## 15. DevOps and Engineering Practices

This project follows basic DevOps and software engineering practices:

- Clear README
- Environment variables through `.env.example`
- No secrets committed to Git
- API contract documented before implementation
- Small incremental patches
- Frontend and backend responsibilities separated
- TypeScript-first implementation
- Basic validation and error handling
- Database migrations
- Build, lint, and test scripts
- Public GitHub repository for evaluation
- Demo video showing code and working app

Planned scripts:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:web\"",
    "dev:api": "npm --workspace apps/api run dev",
    "dev:web": "npm --workspace apps/web run dev",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces"
  }
}
```

---

## 16. Assessment Requirements Coverage

### Tech Assessment #1 — Frontend

| Requirement | Status |
|---|---|
| User can enter location | Planned |
| Current location support | Planned |
| Current weather display | Planned |
| Weather details | Planned |
| Icons or images | Planned |
| Responsive design | Planned |
| 5-day forecast | Planned |
| Error handling | Planned |

### Tech Assessment #2 — Backend

| Requirement | Status |
|---|---|
| RESTful API | Planned |
| External weather API integration | Planned |
| CREATE operation | Planned |
| READ operation | Planned |
| UPDATE operation | Planned |
| DELETE operation | Planned |
| Database persistence | Planned |
| Date range validation | Planned |
| Location validation | Planned |
| Export data | Planned |

---

## 17. Demo Video Plan

The demo video should be 1–2 minutes and include:

1. Quick introduction
2. App overview
3. Location search
4. Current weather result
5. 5-day forecast
6. AI-assisted weather interpretation
7. Packing checklist
8. Saved request in database
9. CRUD example
10. Export example
11. Brief code walkthrough:
    - frontend
    - backend routes
    - weather service
    - weather interpretation layer
    - DeepSeek service
    - database model

---

## 18. Roadmap

### MVP

- Frontend weather search
- Current weather
- 5-day forecast
- Weather interpretation layer
- Packing checklist
- DeepSeek recommendation service
- Deterministic fallback rules
- Backend API
- SQLite database
- CRUD
- CSV / JSON export
- Error handling

### Nice-to-Have

- Use current user location
- Location suggestions
- Google Maps link
- YouTube travel video suggestions
- User preferences for packing style
- Markdown export
- PDF export

---

## 19. License

This project is intended for technical assessment and educational purposes.

---

## 20. Author

**Igor Caldas**  
AI and Software Development enthusiast focused on Generative AI, AI agents, API integrations, and product-oriented software development.
