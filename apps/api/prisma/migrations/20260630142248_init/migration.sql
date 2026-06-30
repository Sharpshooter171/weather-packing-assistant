-- CreateTable
CREATE TABLE "WeatherRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locationInput" TEXT NOT NULL,
    "resolvedLocationName" TEXT NOT NULL,
    "country" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "currentWeatherJson" JSONB NOT NULL,
    "forecastJson" JSONB NOT NULL,
    "weatherProfileJson" JSONB NOT NULL,
    "travelInsightsJson" JSONB NOT NULL,
    "packingChecklistJson" JSONB NOT NULL,
    "aiRecommendationJson" JSONB,
    "aiStatus" TEXT NOT NULL DEFAULT 'not_requested',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "WeatherRequest_resolvedLocationName_idx" ON "WeatherRequest"("resolvedLocationName");

-- CreateIndex
CREATE INDEX "WeatherRequest_country_idx" ON "WeatherRequest"("country");

-- CreateIndex
CREATE INDEX "WeatherRequest_startDate_idx" ON "WeatherRequest"("startDate");

-- CreateIndex
CREATE INDEX "WeatherRequest_endDate_idx" ON "WeatherRequest"("endDate");

-- CreateIndex
CREATE INDEX "WeatherRequest_createdAt_idx" ON "WeatherRequest"("createdAt");
