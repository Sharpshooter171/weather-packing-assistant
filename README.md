# Weather Packing Assistant

**Full Stack Weather App — AI Engineer Intern Technical Assessment**  
**Candidate:** Igor Caldas  
**Assessment completed:** Tech Assessment #1 + Tech Assessment #2  
**Status:** Working MVP ready for review

---

## Project Overview

Weather Packing Assistant is a full-stack weather application that helps users search for a travel destination, retrieve real weather data, store the request in a database, and receive practical packing guidance based on the forecast.

Instead of only answering:

> What is the weather?

The app also answers:

> What should I pack for this weather?

The project includes a Next.js frontend, an Express/TypeScript backend, Open-Meteo weather and geocoding APIs, SQLite persistence through Prisma, CRUD routes, CSV/JSON export routes, browser current-location support, and a deterministic weather-to-packing recommendation engine.

---

## About PM Accelerator

This project was developed as part of the AI Engineer Intern Technical Assessment for the Product Manager Accelerator.

Product Manager Accelerator helps professionals grow in product management by developing practical product skills, product strategy thinking, and real-world project execution experience.

---

## What Was Built

### Frontend

- Next.js + React + TypeScript application
- Tailwind CSS responsive layout
- Candidate and PM Accelerator information visible in the UI
- Weather search form
- City + country/region input to reduce ambiguous location matches
- Browser current-location button using `navigator.geolocation`
- Date range input
- Loading state while weather data is being fetched
- Friendly error message for invalid locations, unresolved locations, or denied geolocation permission
- Current weather summary
- 5-day forecast preview
- Weather interpretation card
- Packing checklist preview
- Lightweight weather condition icons using emoji

### Backend

- Node.js + Express + TypeScript REST API
- Health check endpoint
- Weather request CREATE route
- Weather request READ/list/detail routes
- Weather request UPDATE route
- Weather request DELETE route
- SQLite database persistence with Prisma
- Date range validation
- Location validation using Open-Meteo Geocoding API
- Coordinate-based current-location weather lookup
- Weather data retrieval using Open-Meteo Forecast API
- Weather normalization and rule-based interpretation
- Deterministic packing checklist generation
- CSV export route
- JSON export route
- Normalized error responses

---

## Tech Stack

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

- SQLite
- Prisma ORM

### External APIs

- Open-Meteo Geocoding API
- Open-Meteo Forecast API
- Browser Geolocation API

### Export Formats

- CSV
- JSON

---

## Application Flow

```text
1. User enters city, country/region, start date, and end date, or clicks "Use my current location".
2. Frontend validates required fields or requests browser geolocation permission.
3. Frontend submits POST /api/weather-requests.
4. Backend validates the request body and date range.
5. Backend resolves typed locations through geocoding or uses provided latitude/longitude directly.
6. Backend retrieves weather data from the forecast API.
7. Backend normalizes weather data.
8. Backend detects weather scenarios such as rain, snow, cold, high UV, wind, storms, or mixed conditions.
9. Backend generates travel insights and packing checklist using deterministic rules.
10. Backend stores the request and retrieved weather data in SQLite.
11. Frontend displays current weather, forecast, interpretation, and checklist.
12. Saved requests can be read, updated, deleted, or exported through the API.
```

---

## REST API

### Health Check

```http
GET /api/health
```

### Create Weather Request by Location

```http
POST /api/weather-requests
```

Example request:

```json
{
  "location": "London, United Kingdom",
  "startDate": "2026-07-02",
  "endDate": "2026-07-06",
  "useAi": false
}
```

### Create Weather Request by Coordinates

```http
POST /api/weather-requests
```

Example request:

```json
{
  "location": "Current location",
  "latitude": -23.55,
  "longitude": -46.63,
  "startDate": "2026-07-02",
  "endDate": "2026-07-06",
  "useAi": false
}
```

### Read Weather Requests

```http
GET /api/weather-requests
GET /api/weather-requests/:id
```

### Update Weather Request

```http
PUT /api/weather-requests/:id
```

### Delete Weather Request

```http
DELETE /api/weather-requests/:id
```

### Export Saved Data

```http
GET /api/weather-requests/export.csv
GET /api/weather-requests/export.json
```

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
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

The default local setup uses:

```env
PORT=4000
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
DATABASE_URL="file:./dev.db"
WEATHER_API_BASE_URL="https://api.open-meteo.com"
GEOCODING_API_BASE_URL="https://geocoding-api.open-meteo.com"
```

### Run Database Migration

```bash
npm run db:migrate
```

### Start Backend

```bash
npm run dev:api
```

Backend runs on:

```text
http://localhost:4000
```

### Start Frontend

In another terminal:

```bash
npm run dev:web
```

Frontend runs on:

```text
http://localhost:3000
```

### Typecheck

```bash
npm run typecheck
```

### Local Cleanup

```bash
npm run clean:local
```

---

## Manual Demo Script

1. Start the API with `npm run dev:api`.
2. Start the web app with `npm run dev:web`.
3. Open `http://localhost:3000`.
4. Search:
   - City: `London`
   - Country or region: `United Kingdom`
   - Date range: 5 days
5. Show current weather, forecast, weather interpretation, condition icons, and packing checklist.
6. Click `Use my current location`, allow browser permission, and show the coordinate-based result.
7. Search another location, for example:
   - City: `Cerro de Pasco`
   - Country or region: `Peru`
8. Show that the recommendation changes based on cold/rain/snow risk.
9. Show an invalid location to demonstrate friendly error handling.
10. Demonstrate backend persistence and export routes with curl.

---

## Example curl Commands

### Health

```bash
curl http://localhost:4000/api/health
```

### Create by Location

```bash
curl -s http://localhost:4000/api/weather-requests \
  -H "Content-Type: application/json" \
  -d '{"location":"London, United Kingdom","startDate":"2026-07-02","endDate":"2026-07-06","useAi":false}' | jq
```

### Create by Coordinates

```bash
curl -s http://localhost:4000/api/weather-requests \
  -H "Content-Type: application/json" \
  -d '{"location":"Current location","latitude":-23.55,"longitude":-46.63,"startDate":"2026-07-02","endDate":"2026-07-06","useAi":false}' | jq
```

### List

```bash
curl -s http://localhost:4000/api/weather-requests | jq
```

### Export JSON

```bash
curl -L http://localhost:4000/api/weather-requests/export.json -o weather-requests.json
```

### Export CSV

```bash
curl -L http://localhost:4000/api/weather-requests/export.csv -o weather-requests.csv
```

---

## Assessment Requirements Coverage

### Tech Assessment #1 — Frontend

| Requirement | Status |
|---|---|
| User can enter a location | Done |
| Browser current-location weather | Done |
| Current weather display | Done |
| Useful weather details | Done |
| 5-day forecast | Done |
| Error handling | Done |
| Responsive web layout | Done |
| PM Accelerator information visible | Done |
| Candidate name visible | Done |
| Weather icons/images | Done with lightweight emoji icons |

### Tech Assessment #2 — Backend

| Requirement | Status |
|---|---|
| RESTful API | Done |
| External weather API integration | Done |
| External geocoding API integration | Done |
| Coordinate-based weather lookup | Done |
| CREATE operation | Done |
| READ operation | Done |
| UPDATE operation | Done |
| DELETE operation | Done |
| SQL database persistence | Done |
| Date range validation | Done |
| Location validation | Done |
| Export data | Done, CSV and JSON |
| Normalized error handling | Done |

---

## Notes and Tradeoffs

- The MVP focuses on reliable full-stack behavior over visual polish.
- The packing checklist is generated by deterministic weather rules, which makes the output predictable and testable.
- The app asks for city plus country/region to reduce ambiguous typed location matches.
- Browser current-location lookup uses latitude/longitude directly and does not require a database migration.
- A future version could add location autocomplete, maps, and AI-generated narrative recommendations.

---

## Author

**Igor Caldas**  
AI and Software Development enthusiast focused on Generative AI, AI agents, API integrations, and product-oriented software development.
