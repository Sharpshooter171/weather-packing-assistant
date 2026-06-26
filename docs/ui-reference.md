# UI Reference — Weather Packing Assistant

**Project:** Weather Packing Assistant  
**Document status:** Initial UI reference  
**Version:** 0.1  
**Frontend target:** Next.js + React + TypeScript + Tailwind CSS

---

## 1. Purpose

This document defines the initial user interface direction for Weather Packing Assistant.

The UI should help evaluators immediately understand:

- What the app does
- How to search for weather
- Where current weather appears
- Where the 5-day forecast appears
- How packing recommendations are generated
- How saved requests can be managed
- How export actions work

The interface should be clean, responsive, and practical rather than visually overloaded.

---

## 2. Product Positioning in the UI

The app should present itself as:

```text
Weather Packing Assistant
```

Suggested subtitle:

```text
Check the weather and get smart packing suggestions for your trip.
```

Optional supporting line:

```text
Powered by real weather data, deterministic weather rules, and optional AI-assisted recommendations.
```

The user should understand in the first screen that this is not just a weather dashboard. It is a weather-to-packing assistant.

---

## 3. Main Page Structure

The MVP can use one main page.

Suggested layout:

```text
Page
  ├── Header
  ├── Hero / Intro Section
  ├── Search Panel
  ├── Result Area
  │   ├── Current Weather Card
  │   ├── Weather Interpretation Card
  │   ├── 5-Day Forecast Grid
  │   └── Packing Checklist Card
  ├── Saved Requests Section
  ├── Export Actions
  ├── About PM Accelerator Section
  └── Footer
```

The UI should work well even before a search is made.

Before search:

```text
- Show intro content
- Show search form
- Show empty-state message for results
- Show saved requests if any exist
```

After search:

```text
- Show current weather
- Show forecast
- Show detected weather profile
- Show packing checklist
- Show saved request in history
```

---

## 4. Visual Style

Recommended style:

```text
Clean
Modern
Lightweight
Friendly
Travel-oriented
Weather-oriented
```

Suggested design direction:

- Light background
- Rounded cards
- Soft shadows
- Clear hierarchy
- Weather icons or emoji as fallback
- Strong contrast for important values
- Minimal colors, used meaningfully

Avoid:

- Overly complex dashboards
- Dense tables as the primary experience
- Too many colors
- Dark-only interface
- Large blocks of raw JSON in the UI

Raw JSON can be available for debugging later, but it should not be the main interface.

---

## 5. Responsive Layout

### Desktop

Suggested desktop layout:

```text
Two-column result area:

Left column:
- Current Weather Card
- Weather Interpretation Card

Right column:
- Packing Checklist Card

Full width:
- 5-Day Forecast Grid
- Saved Requests Table
```

### Tablet

Suggested tablet layout:

```text
Single or two-column cards depending on width.
Forecast cards can wrap.
Saved requests table may become horizontally scrollable.
```

### Mobile

Suggested mobile layout:

```text
Single column.
Search form fields stacked.
Cards stacked vertically.
Forecast displayed as horizontal scroll or stacked cards.
Saved requests shown as cards instead of dense table if needed.
```

Mobile is required because the assessment expects responsive design.

---

## 6. Component Map

Suggested frontend component files:

```text
apps/web/src/components/
├── AppHeader.tsx
├── HeroSection.tsx
├── LocationSearchForm.tsx
├── CurrentWeatherCard.tsx
├── WeatherInterpretationCard.tsx
├── ForecastGrid.tsx
├── ForecastDayCard.tsx
├── PackingChecklist.tsx
├── SavedRequestsTable.tsx
├── SavedRequestCard.tsx
├── ExportActions.tsx
├── AboutPmAccelerator.tsx
├── LoadingState.tsx
├── ErrorMessage.tsx
└── EmptyState.tsx
```

Suggested service file:

```text
apps/web/src/services/apiClient.ts
```

Suggested shared types:

```text
apps/web/src/types/weather.ts
```

---

## 7. Header

Purpose:

- Show app identity
- Make project look complete
- Optionally provide GitHub/demo links later

Suggested content:

```text
Weather Packing Assistant
AI Engineer Intern Technical Assessment
```

Optional nav items:

```text
Search
Saved Requests
About
GitHub
```

For MVP, nav links can scroll to sections on the same page.

---

## 8. Hero Section

Purpose:

- Explain the product quickly
- Make the app feel product-oriented

Suggested copy:

```text
Plan smarter for the weather.
Search a destination, check the forecast, and get practical packing suggestions based on real weather data.
```

Suggested feature chips:

```text
Current weather
5-day forecast
Packing checklist
Saved searches
CSV/JSON export
AI-assisted insights
```

---

## 9. Search Panel

Component:

```text
LocationSearchForm.tsx
```

Fields:

```text
Location input
Start date
End date
Use current location button
Submit button
Optional AI toggle if useful
```

Location input placeholder:

```text
Enter a city, town, landmark, ZIP code, or coordinates
```

Button labels:

```text
Get Weather & Packing Tips
Use My Current Location
```

Validation behavior:

- Empty location should show frontend validation before API call.
- Invalid date range may be caught in frontend, but backend remains final validator.
- If geolocation is denied, show friendly message and keep manual search available.

Suggested layout:

```text
[ Location input                         ]
[ Start date ] [ End date ] [ Use current location ]
[ Get Weather & Packing Tips ]
```

On mobile, stack fields vertically.

---

## 10. Loading State

Component:

```text
LoadingState.tsx
```

Suggested message:

```text
Checking the forecast and preparing your packing suggestions...
```

Loading state should appear after submit while backend processes:

- Geocoding
- Weather API retrieval
- Weather classification
- Optional AI recommendation
- Persistence

Avoid showing multiple technical loading messages unless debugging.

---

## 11. Error Message

Component:

```text
ErrorMessage.tsx
```

Error messages should be friendly and actionable.

Examples:

### Invalid location

```text
We could not find this location. Try a city, postal code, landmark, or GPS coordinates.
```

### Invalid date range

```text
Please choose an end date that is the same as or after the start date.
```

### Weather API failure

```text
Weather data is temporarily unavailable. Please try again soon.
```

### Geolocation denied

```text
Location permission was denied. You can still type a destination manually.
```

### AI fallback warning

This should not look like a fatal error.

```text
AI recommendations were unavailable, so we used the built-in weather rules instead.
```

---

## 12. Current Weather Card

Component:

```text
CurrentWeatherCard.tsx
```

Purpose:

- Show current weather quickly and clearly

Suggested fields:

```text
Resolved location
Country
Current temperature
Feels-like temperature
Condition
Humidity
Wind speed
Wind gust
Rain probability
UV index
Observed time
```

Suggested visual hierarchy:

```text
London, United Kingdom
18°C
Rainy
Feels like 17°C
Humidity 76% · Wind 22 km/h · UV 5
```

Weather icon:

- Use icon library if available
- Use simple emoji fallback if needed

Emoji fallback examples:

```text
☀️ Clear
⛅ Partly cloudy
🌧️ Rain
⛈️ Thunderstorm
❄️ Snow
🌫️ Fog
💨 Wind
```

---

## 13. Weather Interpretation Card

Component:

```text
WeatherInterpretationCard.tsx
```

Purpose:

- Explain what the weather means for the trip

Suggested fields:

```text
Main scenario
Risk level
Detected conditions
Summary
Travel insights
AI status badge
```

Example:

```text
Cool and rainy
Risk: Moderate
Detected: cool · rain · wind

Expect cool temperatures with likely rain. Pack a light layer and rain protection.

Travel insights:
- Rain may affect outdoor plans.
- Wind may make the temperature feel colder.
```

AI status badge examples:

```text
AI-assisted
Fallback rules
AI disabled
```

The badge should not be the main focus; it is mostly useful for demo/evaluation.

---

## 14. 5-Day Forecast Grid

Components:

```text
ForecastGrid.tsx
ForecastDayCard.tsx
```

Purpose:

- Satisfy assessment requirement for 5-day forecast
- Help user see changes across the trip period

Each day card should show:

```text
Date
Condition icon
Min / max temperature
Rain probability
Wind gust or wind speed
UV index if available
Snow if available
```

Example:

```text
Jul 10
🌧️ Rain
12° / 18° C
Rain 70%
Wind 25 km/h
UV 5
```

Desktop:

```text
5 cards in a grid
```

Mobile:

```text
Horizontal scroll or vertical stacked cards
```

---

## 15. Packing Checklist Card

Component:

```text
PackingChecklist.tsx
```

Purpose:

- Show the product differentiator clearly
- Convert weather into practical action

Checklist categories:

```text
Clothing
Weather protection
Accessories
Health & safety
Optional
```

Example:

```text
Clothing
✓ Light sweater
✓ Long pants

Weather protection
✓ Waterproof jacket
✓ Compact umbrella

Accessories
✓ Power bank
✓ Reusable water bottle

Optional
✓ Extra socks
```

The checklist should feel useful and concrete.

Avoid vague items like:

```text
Prepare for weather
Bring appropriate clothing
```

Prefer specific items:

```text
Waterproof jacket
Warm socks
Sunscreen
Windbreaker
```

---

## 16. Saved Requests Section

Components:

```text
SavedRequestsTable.tsx
SavedRequestCard.tsx
```

Purpose:

- Demonstrate backend READ operation
- Help evaluator see persistence

Desktop table columns:

```text
Location
Date range
Main scenario
Risk
AI status
Created
Actions
```

Actions:

```text
View
Update
Delete
```

Mobile alternative:

```text
Saved request cards with action buttons
```

Empty state:

```text
No saved weather requests yet. Search a destination to create your first record.
```

---

## 17. Update Flow UI

The MVP can implement update in a simple way.

Options:

### Option A — Inline edit

User clicks `Update`, the existing values populate the search form.

Button changes to:

```text
Update Weather Request
```

### Option B — Modal

User clicks `Update`, a modal opens with location/date fields.

For MVP, Option A is simpler.

Expected update behavior:

```text
- User edits location or date range
- Backend refreshes weather data
- UI shows updated record
- Saved requests section updates
```

---

## 18. Delete Flow UI

Delete should require a simple confirmation.

Suggested browser confirm or inline confirmation:

```text
Are you sure you want to delete this saved request?
```

After delete:

```text
- Remove item from saved list
- Show success message or subtle toast
```

Do not leave stale deleted records visible.

---

## 19. Export Actions

Component:

```text
ExportActions.tsx
```

Buttons:

```text
Export CSV
Export JSON
```

Placement:

- Near Saved Requests section
- Visible after at least one saved record exists

Behavior:

```text
CSV: triggers file download
JSON: opens/downloads JSON export
```

Optional helper text:

```text
Export your saved weather requests for review or reuse.
```

---

## 20. About PM Accelerator Section

Component:

```text
AboutPmAccelerator.tsx
```

Purpose:

- Satisfy assessment requirement to include PM Accelerator information

Suggested copy:

```text
This project was built for the AI Engineer Intern Technical Assessment from the Product Manager Accelerator.

The Product Manager Accelerator helps professionals develop product management skills through practical learning, product strategy, and real-world product challenges.
```

Candidate line:

```text
Candidate: Igor Caldas
```

---

## 21. Empty States

### No Search Yet

```text
Search for a destination to see weather data and packing suggestions.
```

### No Saved Requests

```text
No saved weather requests yet. Your searches will appear here after you create them.
```

### No Forecast Data

```text
Forecast data is not available for this request.
```

Empty states should guide the user toward the next action.

---

## 22. Success Feedback

Use subtle feedback after actions.

Examples:

```text
Weather request saved.
Weather request updated.
Weather request deleted.
Export ready.
```

This can be implemented with a small status message or toast.

---

## 23. Accessibility Notes

Minimum accessibility requirements:

- Inputs have labels.
- Buttons have descriptive text.
- Error messages are visible and readable.
- Color is not the only way to communicate risk.
- Forecast cards use readable text in addition to icons.
- Keyboard navigation should work for forms and buttons.

Risk levels should use both text and visual styling:

```text
Low
Moderate
High
```

Do not rely only on green/yellow/red.

---

## 24. Suggested Tailwind Layout Classes

These are suggestions, not strict requirements.

Page container:

```text
min-h-screen bg-slate-50 text-slate-900
```

Main content:

```text
mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8
```

Card:

```text
rounded-2xl border border-slate-200 bg-white p-5 shadow-sm
```

Primary button:

```text
rounded-xl bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700
```

Secondary button:

```text
rounded-xl border border-slate-300 px-4 py-2 font-medium hover:bg-slate-100
```

Input:

```text
w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400
```

---

## 25. Demo-Focused UI Requirements

The UI should make the demo easy to record.

In the first 30 seconds, the viewer should see:

```text
- App name
- Search input
- Current weather card after search
- 5-day forecast
- Packing checklist
```

In the CRUD part of the demo, the viewer should see:

```text
- Saved requests list
- Update action
- Delete action
- Export buttons
```

Do not hide assessment-critical features behind complex navigation.

---

## 26. MVP UI Acceptance Criteria

The UI is ready for MVP when:

```text
- User can enter a location.
- User can select a date range.
- User can use current location if permission is granted.
- User can submit a search.
- Loading state appears.
- Current weather appears.
- 5-day forecast appears.
- Weather interpretation appears.
- Packing checklist appears.
- Saved requests appear.
- User can update a saved request.
- User can delete a saved request.
- User can export CSV.
- User can export JSON.
- Invalid location error is readable.
- Invalid date range error is readable.
- Layout works on mobile.
- Candidate name is visible.
- PM Accelerator information is visible.
```

---

## 27. Final Rule

The UI should make the product value obvious.

```text
Weather data is useful.
Packing guidance makes it actionable.
```
