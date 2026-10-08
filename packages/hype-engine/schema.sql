-- Beat the Hype observation store.
-- Postgres + PostGIS. Snapshots are insert-only. Scores are derived.

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE data_kind AS ENUM ('LIVE', 'OBSERVED', 'ESTIMATED', 'PREDICTED', 'HISTORICAL', 'DEMO');
CREATE TYPE provider_mode AS ENUM ('fixture', 'live', 'unavailable');
CREATE TYPE lifecycle AS ENUM ('UNDISCOVERED', 'EMERGING', 'RISING', 'TRENDING', 'PEAK', 'OVERHYPED', 'COOLING');
CREATE TYPE intent_label AS ENUM (
  'PLANNING_TRIP', 'BOOKING', 'RESEARCHING', 'ASKING_CROWD', 'ASKING_WEATHER',
  'ASKING_ROUTE', 'RECENTLY_VISITED', 'COMPLAINING_ABOUT_CROWD', 'RECOMMENDING', 'CANCELLING'
);

CREATE TABLE destinations (
  id text PRIMARY KEY,
  name text NOT NULL,
  region text NOT NULL,
  geom geography(Point, 4326) NOT NULL,
  drive_hours_from_delhi numeric NOT NULL,
  trip_types text[] NOT NULL,
  portrait text NOT NULL,
  blurb text NOT NULL,
  capacity_note text NOT NULL,
  season_intensity numeric NOT NULL,
  search_baseline_weekly numeric NOT NULL,
  intent_baseline_weekly numeric NOT NULL,
  social_baseline_weekly numeric,
  booking_baseline_daily numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE destination_zones (
  id text PRIMARY KEY,
  destination_id text NOT NULL REFERENCES destinations(id),
  name text NOT NULL,
  geom geography(Polygon, 4326) NOT NULL
);

CREATE TABLE destination_spots (
  id text PRIMARY KEY,
  destination_id text NOT NULL REFERENCES destinations(id),
  name text NOT NULL,
  kind text NOT NULL,
  sensitivity text NOT NULL CHECK (sensitivity IN ('low', 'moderate', 'high')),
  safety numeric NOT NULL,
  access_note text NOT NULL,
  geom geography(Point, 4326)
);

CREATE TABLE hotel_snapshots (
  id bigserial PRIMARY KEY,
  destination_id text NOT NULL REFERENCES destinations(id),
  observed_at timestamptz NOT NULL,
  stay_start date NOT NULL,
  stay_end date NOT NULL,
  available_properties integer NOT NULL,
  typical_available integer NOT NULL,
  median_nightly_inr integer NOT NULL,
  source text NOT NULL,
  kind data_kind NOT NULL,
  UNIQUE (destination_id, observed_at, stay_start)
);

CREATE TABLE search_snapshots (
  id bigserial PRIMARY KEY,
  destination_id text NOT NULL REFERENCES destinations(id),
  observed_at timestamptz NOT NULL,
  index numeric NOT NULL,
  terms text[] NOT NULL,
  source text NOT NULL,
  kind data_kind NOT NULL,
  UNIQUE (destination_id, observed_at)
);

CREATE TABLE conversation_snapshots (
  id bigserial PRIMARY KEY,
  destination_id text NOT NULL REFERENCES destinations(id),
  observed_at timestamptz NOT NULL,
  window_days integer NOT NULL,
  counts jsonb NOT NULL,
  samples text[] NOT NULL DEFAULT '{}',
  source text NOT NULL,
  kind data_kind NOT NULL,
  UNIQUE (destination_id, observed_at)
);

CREATE TABLE social_snapshots (
  id bigserial PRIMARY KEY,
  destination_id text NOT NULL REFERENCES destinations(id),
  observed_at timestamptz NOT NULL,
  mentions integer NOT NULL,
  engagement integer NOT NULL,
  creators integer NOT NULL,
  source text NOT NULL,
  kind data_kind NOT NULL,
  UNIQUE (destination_id, observed_at)
);

CREATE TABLE traffic_snapshots (
  id bigserial PRIMARY KEY,
  destination_id text NOT NULL REFERENCES destinations(id),
  observed_at timestamptz NOT NULL,
  normal_minutes integer NOT NULL,
  traffic_minutes integer NOT NULL,
  incidents integer NOT NULL,
  segments jsonb NOT NULL,
  predicted_travel_day_ratio numeric NOT NULL,
  source text NOT NULL,
  kind data_kind NOT NULL,
  UNIQUE (destination_id, observed_at)
);

CREATE TABLE weather_snapshots (
  id bigserial PRIMARY KEY,
  destination_id text NOT NULL REFERENCES destinations(id),
  observed_at timestamptz NOT NULL,
  valid_on date NOT NULL,
  summary text NOT NULL,
  score numeric NOT NULL,
  rain_mm numeric NOT NULL,
  snow boolean NOT NULL,
  road_closure boolean NOT NULL,
  temp_c numeric NOT NULL,
  source text NOT NULL,
  kind data_kind NOT NULL,
  UNIQUE (destination_id, observed_at, valid_on)
);

CREATE TABLE holidays (
  id text PRIMARY KEY,
  name text NOT NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  kind text NOT NULL
);

CREATE TABLE events (
  id text PRIMARY KEY,
  destination_id text REFERENCES destinations(id),
  name text NOT NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  weight numeric NOT NULL DEFAULT 0.2
);

CREATE TABLE model_versions (
  id text PRIMARY KEY,
  name text NOT NULL,
  formula text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE prediction_runs (
  id bigserial PRIMARY KEY,
  model_version_id text NOT NULL REFERENCES model_versions(id),
  started_at timestamptz NOT NULL,
  finished_at timestamptz,
  horizon_id text NOT NULL,
  prefs jsonb NOT NULL
);

CREATE TABLE prediction_features (
  id bigserial PRIMARY KEY,
  run_id bigint NOT NULL REFERENCES prediction_runs(id),
  destination_id text NOT NULL REFERENCES destinations(id),
  signal text NOT NULL,
  velocity numeric,
  acceleration numeric,
  pressure numeric,
  weight numeric NOT NULL
);

CREATE TABLE prediction_sources (
  id bigserial PRIMARY KEY,
  run_id bigint NOT NULL REFERENCES prediction_runs(id),
  destination_id text NOT NULL REFERENCES destinations(id),
  signal text NOT NULL,
  source text NOT NULL,
  kind data_kind NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE crowd_predictions (
  id bigserial PRIMARY KEY,
  run_id bigint NOT NULL REFERENCES prediction_runs(id),
  destination_id text NOT NULL REFERENCES destinations(id),
  horizon_id text NOT NULL,
  value numeric NOT NULL,
  probability numeric NOT NULL,
  confidence numeric NOT NULL,
  kind data_kind NOT NULL,
  UNIQUE (run_id, destination_id, horizon_id)
);

CREATE TABLE hype_predictions (
  id bigserial PRIMARY KEY,
  run_id bigint NOT NULL REFERENCES prediction_runs(id),
  destination_id text NOT NULL REFERENCES destinations(id),
  horizon_id text NOT NULL,
  value integer NOT NULL,
  direction text NOT NULL,
  lifecycle lifecycle NOT NULL,
  kind data_kind NOT NULL,
  UNIQUE (run_id, destination_id, horizon_id)
);

CREATE TABLE worth_it_predictions (
  id bigserial PRIMARY KEY,
  run_id bigint NOT NULL REFERENCES prediction_runs(id),
  destination_id text NOT NULL REFERENCES destinations(id),
  horizon_id text NOT NULL,
  value numeric NOT NULL,
  verdict text NOT NULL,
  kind data_kind NOT NULL,
  UNIQUE (run_id, destination_id, horizon_id)
);

CREATE TABLE saved_trips (
  id bigserial PRIMARY KEY,
  user_id text,
  device_key text,
  destination_id text NOT NULL REFERENCES destinations(id),
  horizon_id text NOT NULL,
  prefs jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_preferences (
  user_id text PRIMARY KEY,
  origin_id text NOT NULL,
  crowd_tolerance text NOT NULL,
  trip_type text NOT NULL,
  max_travel_hours numeric NOT NULL,
  budget_inr integer,
  people integer NOT NULL
);

CREATE TABLE provider_usage (
  id bigserial PRIMARY KEY,
  provider text NOT NULL,
  mode provider_mode NOT NULL,
  called_at timestamptz NOT NULL DEFAULT now(),
  cache_hit boolean NOT NULL,
  cost_units numeric NOT NULL DEFAULT 0
);

CREATE TABLE data_quality_issues (
  id bigserial PRIMARY KEY,
  detected_at timestamptz NOT NULL DEFAULT now(),
  destination_id text,
  signal text NOT NULL,
  detail text NOT NULL
);

CREATE INDEX hotel_snapshots_dest_stay_idx ON hotel_snapshots (destination_id, stay_start, observed_at);
CREATE INDEX search_snapshots_dest_idx ON search_snapshots (destination_id, observed_at);
CREATE INDEX destinations_geom_idx ON destinations USING gist (geom);
