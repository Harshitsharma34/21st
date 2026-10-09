# Beat the Hype

Predictive travel intelligence for one question: will this place be worth it on these dates? The map is the product. Scores are momentum, not fame. Every number is labelled with what kind of evidence it is.

The pickup doc for the current code, known traps, and the next backend increment is `HANDOFF.md` at the repo root. This file is the design. That file is the state.

## A. Architecture

```
apps/beat                Next.js UI and HTTP boundary
packages/hype-engine     velocities, forecast, fixtures, jobs
packages/hype-engine/schema.sql   Postgres + PostGIS target
```

The browser never calls a provider. It asks `/api/board` and `/api/reel`. Those routes validate input, rate-limit, and call the engine. The engine reads an append-only observation bundle. Fixture mode is the default (`DATA_MODE=fixture`). A live provider without a server-side key becomes `unavailable` and the signal is dropped, not invented.

Redis is the production cache in front of scheduled collectors. This build keeps an in-memory snapshot store with the same idempotent key, so a second collect never overwrites a row. Map pans do not call hotel or traffic APIs.

## B. File structure

```
packages/hype-engine/src
  types.ts          metrics, horizons, snapshots
  velocities.ts     the six signals
  weights.ts        lead-time weights
  forecast.ts       crowd, hype, confidence
  worth.ts          personal worth-it
  intent.ts         travel-intent classifier
  fixtures.ts       Delhi-region ledger, tagged DEMO
  store.ts          insert-only observations
  providers.ts      swappable provider modes
  jobs.ts           idempotent collectors
  engine.ts         board, alternatives, smart trip
  advice.ts         leave window, reel paste
  schema.sql

apps/beat
  app/page.tsx      map
  app/api/board     forecast board
  app/api/reel      user-pasted links only
  components        map, sheet, ripple, compare
```

## C. Database

Observations are the asset: `hotel_snapshots`, `search_snapshots`, `conversation_snapshots`, `social_snapshots`, `traffic_snapshots`, `weather_snapshots`. Each has a unique key on destination and observed time, so collection is insert-only.

Derived tables (`crowd_predictions`, `hype_predictions`, `worth_it_predictions`) hang off `prediction_runs`, with `prediction_features` and `prediction_sources` beside them. `2020` and `2021` rows are anomalous and are excluded from seasonality. Places with `sensitivity = high` are stored and not promoted.

## D. Providers

`HotelProvider`, `SearchProvider`, `ConversationProvider`, `SocialProvider`, `TrafficProvider`, `WeatherProvider`, `PlacesProvider`.

Mode resolves from `DATA_MODE`, then `<NAME>_DATA_MODE`. `live` without `<NAME>_API_KEY` is `unavailable`. Social, including Instagram, is optional. A pasted Reel is `user-provided`. The response says the network was not fetched.

## E. Velocities

Velocity is change against that destination's own normal, not the size of the signal.

- **Booking.** Daily availability contraction ÷ baseline daily contraction for the same lead. Reported as availability contraction and booking pressure. Never as confirmed bookings.
- **Search.** 7 / 14 / 30 day growth and acceleration (this week minus the prior week), divided by the seasonal weekly baseline.
- **Intent.** Classified lines. Planning and booking outweigh research, crowd questions, and mentions. Cancelling subtracts. Growth versus the prior window, divided by the baseline.
- **Social.** Mention, engagement, and creator growth. Lower weight. Missing is allowed.
- **Traffic.** Current duration ÷ normal duration, plus a separate predicted travel-day ratio. At T-4 and earlier the crowd model does not treat today's empty road as a quiet weekend.
- **Crowd.** An estimate, labelled estimated, unless a measured footfall source exists.

## F. Forecast

Primary window is T-7 to T-4. Lead buckets retune weights: search and social early, booking and intent in the product window, traffic on the day.

Crowd mixes a **level** (occupancy, seasonality, weather) with **momentum** (search, intent, booking velocity). Realization is about 0.18 today and rises with lead time, so Monday's hype does not pretend the town is already full, and a T-5 forecast does not wait for traffic.

Hype is a squashed blend of velocity ratios, scaled to 0–100. Lifecycle compares that momentum with the crowd on the same horizon: high hype and a still-low crowd is `RISING`; high hype and a high crowd is `OVERHYPED`.

Worth it (0–10) folds crowd, weather, predicted travel-day traffic, hotel pressure, price against budget, hype, drive time, season, and trip type. Quiet tolerance penalises crowd. Festive tolerance does not.

Confidence falls when a signal is missing, history is thin, or the horizon is long. It does not fall to zero because Instagram or search is absent.

The transparent model is the one that runs. Gradient-boosted models wait until the snapshot history is long enough to backtest.

## G. Map interaction

Time is a control, not a filter chip buried in a sidebar. `now`, `this weekend`, `next weekend`, `30d`, `3m`, and a day scrubber all select a horizon. The same destination objects change pressure, hype, worth, and hotel ink.

Modes are behaviours: crowd draws a charcoal density field, hype draws rings on places that are accelerating, hotels draw a ring being eaten by contraction, traffic draws the Delhi–Manali segments, worth it stamps go / skip in marker orange.

Selecting Manali zooms the paper map and opens a journal sheet. The map stays. Compare and the leave window are further sheets, not new sites. Drag pans. High-sensitivity spots never become markers.

## H. Visual components

The Superr reference is the source of truth: cream paper `#fdfbf9`, cocoa ink headlines, charcoal structure, marker orange only for handwritten emphasis, 20px outlined pills, 12px cards, dew-drop secondary surface, no filled CTAs, no gradients, no glass.

Fraunces stands in for Gelica. Inter stands in for Geist. Display type stays lowercase. Portraits are ink drawings, not stock photos. Stickers (bolt, heart) are decoration and sit rotated. The orange dock is the brand band.

## I. Implementation phases

1. **This build.** Fixture ledger, velocity and forecast engine, tests, and the Manali → this weekend → why → Tirthan → compare → when to leave journey. Demo clock is Monday 5 Oct 2026 so the weekend is a real T-5. Every fixture metric is tagged `DEMO`.
2. **Collectors.** Swap fixture providers for licensed hotel, search, weather, and traffic APIs. Keep snapshots. Add Redis TTLs, coalescing, and daily budgets. Run the jobs on a schedule.
3. **History.** Load 2022–2026 seasonality. Keep 2020–2021 tagged and out of the baseline. Backtest the transparent model before any boosted tree.
4. **Accounts.** Browsing stays open. Login is only for saved trips, alerts, and preferences that should leave the device.

## The Monday story

Demo clock: Monday 5 October 2026. Weekend: 10–11 October.

Manali, balanced traveller from Delhi: hotels contracting about 1.9× a normal lead, search about +41%, planning talk about +33%, roads still ordinary because people have not left, crowd around 9, hype in the mid-90s, worth it low enough to skip. Tirthan is the instead: lower crowd, calmer road, cheaper night, a longer drive. Shoja is the early catch: hype up, crowd still behind it.
