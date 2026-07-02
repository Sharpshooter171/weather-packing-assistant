"use client";

import { type FormEvent, useEffect, useState } from "react";

import { createWeatherRequest } from "../services/apiClient";
import type { ApiError, WeatherRequest } from "../types/weather";

const backendFeatures = [
  "Weather API integration",
  "SQLite persistence with Prisma",
  "CRUD API routes",
  "CSV and JSON exports",
  "Deterministic packing fallback"
];

const upcomingUiFeatures = ["Location search", "Current weather card", "5-day forecast", "Packing checklist"];

export default function HomePage() {
  const [city, setCity] = useState("London");
  const [countryOrRegion, setCountryOrRegion] = useState("United Kingdom");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState<WeatherRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() + 4);

    setStartDate(toDateInputValue(today));
    setEndDate(toDateInputValue(end));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedLocation = buildLocationInput(city, countryOrRegion);

    if (!normalizedLocation) {
      setError("Enter both city and country or region to avoid ambiguous weather results.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await createWeatherRequest({
        location: normalizedLocation,
        startDate,
        endDate,
        useAi: false
      });

      setResult(response.data);
    } catch (caughtError) {
      setResult(null);
      setError(getFriendlyErrorMessage(caughtError));
    } finally {
      setIsLoading(false);
    }
  }

  const canSubmit = Boolean(city.trim() && countryOrRegion.trim() && startDate && endDate && !isLoading);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">AI Engineer Intern Assessment</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Weather Packing Assistant</h1>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
            Candidate: Igor Caldas
          </div>
        </header>

        <div className="grid flex-1 items-start gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-8">
            <div className="space-y-5">
              <span className="inline-flex rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
                Frontend search is connected to the backend API.
              </span>
              <h2 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Pack smarter based on weather, not guesswork.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Search a destination with city and country, review current weather and forecast data, then receive a practical packing checklist generated from weather rules and optional AI assistance.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label htmlFor="city" className="text-sm font-semibold text-slate-700">
                      City
                    </label>
                    <input
                      id="city"
                      className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                      onChange={(event) => setCity(event.target.value)}
                      placeholder="London, Brasília, El Alto"
                      required
                      type="text"
                      value={city}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="countryOrRegion" className="text-sm font-semibold text-slate-700">
                      Country or region
                    </label>
                    <input
                      id="countryOrRegion"
                      className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                      onChange={(event) => setCountryOrRegion(event.target.value)}
                      placeholder="United Kingdom, Brazil, Bolivia"
                      required
                      type="text"
                      value={countryOrRegion}
                    />
                  </div>
                </div>

                <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
                  Use city + country or region to avoid ambiguous matches like cities with the same name in different countries.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label htmlFor="startDate" className="text-sm font-semibold text-slate-700">
                      Start date
                    </label>
                    <input
                      id="startDate"
                      className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                      onChange={(event) => setStartDate(event.target.value)}
                      required
                      type="date"
                      value={startDate}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="endDate" className="text-sm font-semibold text-slate-700">
                      End date
                    </label>
                    <input
                      id="endDate"
                      className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                      onChange={(event) => setEndDate(event.target.value)}
                      required
                      type="date"
                      value={endDate}
                    />
                  </div>
                </div>

                <button
                  className="min-h-12 rounded-2xl bg-brand-600 px-6 font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={!canSubmit}
                  type="submit"
                >
                  {isLoading ? "Checking weather..." : "Get packing guidance"}
                </button>
              </div>

              {error ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              ) : null}
            </form>

            {result ? <WeatherResultSummary result={result} /> : <EmptyState />}
          </section>

          <aside className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Backend capabilities already available</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The frontend now calls the existing Express API through a configurable API client.
              </p>
            </div>

            <ul className="space-y-3">
              {backendFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-100">Phase 11</p>
              <h3 className="mt-2 text-xl font-bold">Search and results flow</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {upcomingUiFeatures.map((feature) => (
                  <span key={feature} className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-100">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-950">PM Accelerator</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This project is prepared for the PM Accelerator AI Engineer Intern technical assessment, focusing on full-stack delivery, API integration, persistence, exports, and AI-safe fallback behavior.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function WeatherResultSummary({ result }: { result: WeatherRequest }) {
  return (
    <section className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Saved weather request</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">
            {result.resolvedLocationName}{result.country ? `, ${result.country}` : ""}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {result.startDate} to {result.endDate} · ID {result.id}
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">Saved</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Current temperature" value={formatTemperature(result.currentWeather.temperatureC)} />
        <MetricCard label="Condition" value={result.currentWeather.condition ?? "Unknown"} />
        <MetricCard label="Risk level" value={result.weatherProfile.riskLevel} />
      </div>

      <div className="rounded-2xl bg-slate-50 p-4">
        <h3 className="font-bold text-slate-950">Weather interpretation</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{result.weatherProfile.summary}</p>
      </div>

      <div>
        <h3 className="font-bold text-slate-950">5-day forecast preview</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {result.forecast.slice(0, 5).map((day) => (
            <article key={day.date} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="font-bold text-slate-950">{day.date}</p>
              <p className="mt-1 text-slate-600">{day.condition}</p>
              <p className="mt-2 font-semibold text-slate-900">
                {formatTemperature(day.minTemperatureC)} / {formatTemperature(day.maxTemperatureC)}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-slate-950">Packing checklist preview</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {getChecklistPreview(result).map((item) => (
            <li key={item} className="rounded-2xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-6 text-sm leading-6 text-slate-500">
      Search a destination to create a saved weather request and preview the current weather, forecast, interpretation, and packing checklist.
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function getChecklistPreview(result: WeatherRequest) {
  return [
    ...result.packingChecklist.clothing,
    ...result.packingChecklist.weatherProtection,
    ...result.packingChecklist.accessories,
    ...result.packingChecklist.healthAndSafety
  ].slice(0, 8);
}

function buildLocationInput(city: string, countryOrRegion: string) {
  const trimmedCity = city.trim();
  const trimmedCountryOrRegion = countryOrRegion.trim();

  if (!trimmedCity || !trimmedCountryOrRegion) return "";

  return `${trimmedCity}, ${trimmedCountryOrRegion}`;
}

function formatTemperature(value: number | null) {
  return typeof value === "number" ? `${value}°C` : "--";
}

function getFriendlyErrorMessage(error: unknown) {
  const apiError = error as Partial<ApiError>;

  return apiError.error?.message ?? "Could not fetch weather guidance. Check the location and dates, then try again.";
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}
