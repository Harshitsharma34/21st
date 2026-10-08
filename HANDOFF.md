# Handoff — Beat the Hype

Pickup doc for the next engineer. Read this before `apps/beat/ARCHITECTURE.md`. That file is the design of the system. This file is the state of the code, the traps, and the order to continue.

Branch: `cursor/beat-the-hype-9a1a`
PR: https://github.com/Harshitsharma34/21st/pull/3
Repo: this monorepo also contains `apps/web`, a component marketplace. Do not change it for this product.

## What you are holding

A fixture-backed forecast engine and a map UI. The question the product answers is: will this place be worth visiting on these dates, about 4–5 days before travel?

The running demo clock is Monday 5 October 2026, 09:00 Asia/Kolkata (`DEMO_AS_OF` in `packages/hype-engine/src/time.ts`). “This weekend” is Saturday 10 – Sunday 11 October, lead time 5 days, bucket `T7_T4`. That is intentional. Do not switch the clock to the wall date or the product story stops being a T-5 forecast.

Checked story, default prefs (Delhi, 2 people, mountains, balanced, 12 hours, no budget):

| Place | Horizon | What the model currently says |
| --- | --- | --- |
| Manali | weekend | Skip. Worth it 4.5. Crowd 9.0. Hype 96 ↑. Lifecycle OVERHYPED. Booking velocity 1.9×. Search +41%. Intent +33%. Traffic driver `NORMAL — TOO EARLY`. Confidence HIGH. Probability of an unusually heavy weekend about 83%. Line: “looks beautiful. wrong weekend.” |
| Tirthan | weekend | The alternative to Manali. Worth it 7.9. Crowd 4.1. Nightly about 24% under Manali (₹7,200 vs ₹9,500). Drive 11.0h vs 9.7h (+1h 18m). Social signal absent on purpose. Forecast still returns. |
| Shoja | now / weekend / 30d | Rising. Crowd now about 3. Weekend hype about 79. 30-day crowd is more than 2 points above now. |

Tests lock these as ranges, not as the marketing copy’s 4.8 / 8.7 / 78%. If you tune fixtures, update `packages/hype-engine/src/engine.test.ts` in the same change. `pnpm --filter @repo/hype-engine test` is 11 tests and was green.

## Run it

```bash
pnpm --filter @repo/hype-engine test
pnpm --filter beat dev      # http://127.0.0.1:3210
pnpm --filter beat build && pnpm --filter beat start
```

`apps/beat` is Next.js 14.2.6, React 18, port 3210. The engine is TypeScript source exported from `@repo/hype-engine` and transpiled by Next. There is no separate engine build step.

A production `next start` on 3210 may already be running in this environment. It serves the last build, not your unsaved edits. Restart it after a build.

## Done

- Six velocities, intent classifier, lead-time weight table, crowd / hype / worth-it / confidence, editorial lines, leave-window copy, reel paste parser.
- Insert-only in-memory observation store. A second collect skips existing keys. It does not overwrite.
- Fixture ledger for 15 destinations around Delhi. Manali, Tirthan, Shoja, and Jibhi are the detailed set. All fixture metrics are `type: DEMO`.
- Provider mode switch: `DATA_MODE`, then `<NAME>_DATA_MODE` (`hotels`, `search`, `conversation`, `social`, `traffic`, `weather`, `places`). `live` without `<NAME>_API_KEY` resolves to `unavailable`.
- HTTP boundary: `GET /api/board`, `POST /api/reel`. Zod, body size cap, in-memory rate limit, security headers in `apps/beat/next.config.mjs`. No provider credentials on the client.
- Map UI: search Manali, weekend horizon, sheet, why / ripple, go-here-instead, compare, best time to leave, Beat the Hype rail, reel drop, smart-trip prefs, local saves. Design tokens live in `apps/beat/app/globals.css`. Cream paper, charcoal ink, marker orange for handwriting only, outlined pills. Fraunces stands in for Gelica. Inter stands in for Geist. Do not restyle this with a component library.
- `packages/hype-engine/schema.sql` is the Postgres + PostGIS target. It has not been applied anywhere.

## Not done — this is the backend work

The forecast functions are the backend that runs. The data platform does not.

1. Postgres is not connected. Runtime store is `createBundle` / `appendBundle` in `packages/hype-engine/src/store.ts`, cached on the module in `observationView()`.
2. Redis is not connected. The rate limit in `apps/beat/lib/http.ts` is per process and dies on restart.
3. No live vendor call exists. `providerMode()` can return `"live"`, and `describeProviders()` will say “configured live adapter”, but `buildBoard()` still forecasts from fixtures. Do not ship that string until an adapter actually ran.
4. Jobs in `packages/hype-engine/src/jobs.ts` only re-append the fixture bundle and run a small quality check. These spec jobs are not implemented: `calculate-velocities`, `generate-crowd-forecast`, `generate-hype-forecast`, `generate-worth-it`, `run-backtests`. There is no scheduler.
5. Prediction tables in the SQL file are never written. Scores are computed on request.
6. No auth. Saved trips and prefs are `localStorage` keys `beat-trips` and `beat-prefs`. Browsing must stay open. Login is only for saved trips, alerts, and prefs that should leave the device.
7. No backtest harness beyond “COVID years are excluded from the baseline.”

## Continue in this order

1. Persist the observation store behind the existing `BundleView` shape. Apply `schema.sql` with a migration role separate from the runtime role. TLS. Keep inserts idempotent on the unique keys already in the SQL. `forecastDestination()` should keep reading a view, not SQL.
2. Add one real provider, weather first, server-side only, with timeout, TTL, and a daily budget. If the call fails, drop the signal and lower confidence. Do not fill it with fixture numbers while labelling the response live. Per-provider mode must be able to say weather live and hotels fixture.
3. Fix the live status lie in `describeProviders()` so `"live"` means a call happened or a fresh snapshot from that adapter is in the store.
4. Turn collectors into real jobs that append snapshots and then write `prediction_runs`, `prediction_features`, `prediction_sources`, and the three prediction tables. Map requests read the latest run. They must not call hotel or traffic APIs.
5. Put Redis in front of collector calls only: coalesce, TTL, stale-while-revalidate, budget counters. Not in front of map pan.
6. Slim `GET /api/board`. The page currently serializes every destination across every horizon into the RSC payload (on the order of 1.7MB of HTML). Add horizons only after the payload is cut down to the active horizon plus a sparkline.

After that, and only with enough of our own snapshots: backtest the transparent model, then experiment with LightGBM or XGBoost. Do not replace the transparent model before that.

## Traps already paid for

- **Weights are not the crowd formula.** `LEAD_WEIGHTS` in `weights.ts` is the horizon policy and is unit-tested (traffic weight at `T7_T4` is lower than on `TRAVEL_DAY`; each bucket sums to 1). The number on screen comes from `forecast.ts`: a level (occupancy, seasonal baseline, weather) mixed with momentum (search, intent, booking velocity, optional social) by `realization(leadDays)`. At lead 0 realization is 0.18, so today’s hype does not fill the town. At lead 5 it is `0.16 + 5 * 0.028`. Traffic is forced to a ratio of 1 when `leadDays >= 4`, and the driver text says `NORMAL — TOO EARLY` when a travel-day jam is still predicted. Keep both behaviors. Deleting the weight table, or making crowd a direct dot product of those weights, changes the product.
- **Latest snapshot must be `<= asOf`.** As-of is 09:00 on 5 Oct. Search, conversation, and social rows for that morning are stamped 07:10–07:30. A row at 21:00 the same day is invisible and the model silently uses the previous week. That bug already happened once and collapsed Manali search from +41% to +5%.
- **2020 and 2021 are anomalous even if the row forgets the flag.** `isAnomalousYear()` in `velocities.ts`.
- **Booking pressure is not confirmed bookings.** Copy and explanations must keep saying availability contraction.
- **Alternative ranking is duplicated.** `rankAlternatives()` in `advice.ts` and the `useMemo` in `apps/beat/components/app-shell.tsx` both add +0.55 for the same region and +0.15 for a shared trip type. Chakrata can outscore Tirthan on raw worth it. The region term is why Manali’s “go here instead” is Tirthan. Change one, change the other, and re-check that card.
- **Leave segments in the UI are hardcoded.** `segmentsFor()` in `app-shell.tsx` draws the Delhi–Manali chain for Manali and one generic hop for everyone else. The engine already has `leavePlan()` and fixture segments on the Manali traffic snapshot. Wire the sheet to that. Do not invent a second congestion model in the client.
- **High-sensitivity spots are withheld.** Gulaba and Serolsar are in the fixture list and filtered out in `buildBoard()` (`sensitivity !== "high"`). Do not put them on the map.
- **Reel drop does not fetch.** `readReel()` matches a destination name in the pasted URL or note and returns `fetchedFromNetwork: false`. Instagram copy must keep saying we did not retrieve the Reel.
- **Oct 10–11 2026 is an ordinary weekend.** Gandhi Jayanti was Friday 2 Oct and has passed. Dussehra is tagged only for horizons whose start falls on 19–21 Oct. Do not mark this weekend a long weekend to match an example in the original brief.
- **Marker positions are editorial, not survey-grade.** Jibhi, Tirthan, and Shoja sit on top of each other geographically. `NUDGE` in `map-stage.tsx` fans them apart. Do not “correct” that without looking at the map.
- **Design source.** `apps/beat/app/globals.css` plus the attached Superr design reference. No filled CTAs, no glass, no purple SaaS, no dashboard grid. Marker orange is for handwriting and the bottom brand band.

## File map

```
HANDOFF.md                         this file
apps/beat/ARCHITECTURE.md          design of the system
apps/beat/app/page.tsx             server-renders buildBoard(DEFAULT_PREFS)
apps/beat/app/api/board/route.ts   prefs in, board out
apps/beat/app/api/reel/route.ts    paste in, no network out
apps/beat/components/app-shell.tsx state, search, sheets, local saves
apps/beat/components/map-stage.tsx projection, modes, stamps
apps/beat/components/journal.tsx   sheet, ripple, compare, leave
packages/hype-engine/src/engine.ts buildBoard, observation cache
packages/hype-engine/src/forecast.ts crowd, hype, confidence
packages/hype-engine/src/velocities.ts signal math
packages/hype-engine/src/fixtures.ts the ledger you will replace with collectors
packages/hype-engine/src/store.ts  insert-only contract to preserve
packages/hype-engine/schema.sql    apply this, do not reinvent the tables
```

## Definition of the next backend increment

A weather adapter can be live while hotels stay fixture. A collector run inserts new snapshot rows and leaves old ones in place. The Manali weekend test still skips, still says traffic is too early, and still offers Tirthan. The UI still prints `demo` on fixture metrics and does not print `live` unless that snapshot came from the adapter. `pnpm --filter @repo/hype-engine test` stays green.
