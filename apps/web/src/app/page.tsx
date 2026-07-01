const backendFeatures = [
  "Weather API integration",
  "SQLite persistence with Prisma",
  "CRUD API routes",
  "CSV and JSON exports",
  "Deterministic packing fallback"
];

const upcomingUiFeatures = ["Location search", "Current weather card", "5-day forecast", "Packing checklist"];

export default function HomePage() {
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

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-8">
            <div className="space-y-5">
              <span className="inline-flex rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
                Backend is ready. Frontend scaffold is live.
              </span>
              <h2 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Pack smarter based on weather, not guesswork.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Search a destination, review current weather and forecast data, then receive a practical packing checklist generated from weather rules and optional AI assistance.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <label htmlFor="location" className="text-sm font-semibold text-slate-700">
                Destination preview
              </label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  id="location"
                  className="min-h-12 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                  placeholder="Try London, Paris, Tokyo, or your current location"
                  type="text"
                  disabled
                />
                <button
                  className="min-h-12 rounded-2xl bg-brand-600 px-6 font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled
                  type="button"
                >
                  Search soon
                </button>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Interactive search arrives in Phase 11. This phase validates the Next.js/Tailwind scaffold and API configuration.
              </p>
            </div>
          </section>

          <aside className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Backend capabilities already available</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The frontend will consume the existing Express API through a configurable API client.
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-100">Next</p>
              <h3 className="mt-2 text-xl font-bold">Phase 11 UI flow</h3>
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
