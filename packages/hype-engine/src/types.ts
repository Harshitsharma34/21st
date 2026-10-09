export type DataKind =
  | "LIVE"
  | "OBSERVED"
  | "ESTIMATED"
  | "PREDICTED"
  | "HISTORICAL"
  | "DEMO"

export type ProviderMode = "fixture" | "live" | "unavailable"

export type LeadBucket = "T30_T14" | "T14_T7" | "T7_T4" | "T3_T1" | "TRAVEL_DAY"

export type Lifecycle =
  | "UNDISCOVERED"
  | "EMERGING"
  | "RISING"
  | "TRENDING"
  | "PEAK"
  | "OVERHYPED"
  | "COOLING"

export type IntentLabel =
  | "PLANNING_TRIP"
  | "BOOKING"
  | "RESEARCHING"
  | "ASKING_CROWD"
  | "ASKING_WEATHER"
  | "ASKING_ROUTE"
  | "RECENTLY_VISITED"
  | "COMPLAINING_ABOUT_CROWD"
  | "RECOMMENDING"
  | "CANCELLING"

export type TripType =
  | "mountains"
  | "adventure"
  | "relax"
  | "food"
  | "nightlife"
  | "romantic"
  | "family"
  | "spiritual"
  | "nature"
  | "roadtrip"

export type CrowdTolerance = "quiet" | "balanced" | "festive"

export type MapMode = "worth" | "crowd" | "hype" | "hotels" | "traffic"

export type Verdict = "GO" | "WORTH A LOOK" | "MIXED" | "SKIP"

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW"

export interface Metric<T> {
  value: T
  type: DataKind
  confidence: number
  updatedAt: string
  sources: string[]
  explanation: string
}

export interface TripPrefs {
  originId: string
  people: number
  budgetInr: number | null
  maxTravelHours: number
  tripType: TripType
  crowdTolerance: CrowdTolerance
}

export interface Horizon {
  id: string
  label: string
  short: string
  start: string
  end: string
  leadDays: number
  bucket: LeadBucket
  weekend: boolean
  longWeekend: boolean
  publicHoliday: boolean
  festival: boolean
  schoolHoliday: boolean
  majorEvent: boolean
}

export interface HotelSnapshot {
  destinationId: string
  observedAt: string
  stayStart: string
  stayEnd: string
  availableProperties: number
  typicalAvailable: number
  medianNightlyInr: number
  source: string
  type: DataKind
}

export interface SearchSnapshot {
  destinationId: string
  observedAt: string
  index: number
  terms: string[]
  source: string
  type: DataKind
}

export interface ConversationSnapshot {
  destinationId: string
  observedAt: string
  windowDays: number
  counts: Partial<Record<IntentLabel, number>>
  samples: string[]
  source: string
  type: DataKind
}

export interface SocialSnapshot {
  destinationId: string
  observedAt: string
  mentions: number
  engagement: number
  creators: number
  source: string
  type: DataKind
}

export interface TrafficSegment {
  id: string
  name: string
  normalMinutes: number
  trafficMinutes: number
}

export interface TrafficSnapshot {
  destinationId: string
  observedAt: string
  normalMinutes: number
  trafficMinutes: number
  incidents: number
  segments: TrafficSegment[]
  predictedTravelDayRatio: number
  source: string
  type: DataKind
}

export interface WeatherSnapshot {
  destinationId: string
  observedAt: string
  validOn: string
  summary: string
  score: number
  rainMm: number
  snow: boolean
  roadClosure: boolean
  tempC: number
  source: string
  type: DataKind
}

export interface HistoricalSample {
  destinationId: string
  year: number
  month: number
  crowdIndex: number
  anomalous?: boolean
  note?: string
}

export interface Spot {
  id: string
  destinationId: string
  name: string
  kind: string
  sensitivity: "low" | "moderate" | "high"
  safety: number
  access: string
}

export interface Destination {
  id: string
  name: string
  region: string
  lat: number
  lng: number
  driveHoursFromDelhi: number
  tripTypes: TripType[]
  portrait: Portrait
  blurb: string
  capacityNote: string
  seasonIntensity: number
  searchBaselineWeekly: number
  intentBaselineWeekly: number
  socialBaselineWeekly: number | null
  bookingBaselineDaily: number
}

export type Portrait =
  | "peaks"
  | "river"
  | "meadow"
  | "cedar"
  | "ridge"
  | "lake"
  | "forest"
  | "city"
  | "fort"
  | "ghats"
  | "palace"
  | "monument"
  | "valley"
  | "pine"
  | "capital"

export interface ObservationBundle {
  hotels: HotelSnapshot[]
  search: SearchSnapshot[]
  conversations: ConversationSnapshot[]
  social: SocialSnapshot[]
  traffic: TrafficSnapshot[]
  weather: WeatherSnapshot[]
  history: HistoricalSample[]
  spots: Spot[]
  destinations: Destination[]
}

export interface SignalReading {
  available: boolean
  velocity: number | null
  acceleration: number | null
  pressure: number | null
  display: string
  note: string
  metric: Metric<number | null>
}

export interface Driver {
  id: string
  label: string
  level: string
  detail: string
}

export interface Forecast {
  destinationId: string
  horizonId: string
  leadDays: number
  bucket: LeadBucket
  crowd: Metric<number>
  hype: Metric<number>
  direction: "up" | "down" | "flat"
  lifecycle: Lifecycle
  worthIt: Metric<number>
  verdict: Verdict
  probabilityHighPressure: Metric<number>
  confidence: {
    level: ConfidenceLevel
    score: number
    reason: string
    agreeing: number
    considered: number
  }
  drivers: Driver[]
  signals: {
    booking: SignalReading
    search: SignalReading
    intent: SignalReading
    social: SignalReading
    traffic: SignalReading
    weather: SignalReading
    historical: SignalReading
  }
  line: string
  subline: string
  nightlyInr: number
  dataMode: "fixture" | "mixed" | "live"
}

export interface ProviderStatus {
  id: string
  mode: ProviderMode
  source: string
  note: string
}

export interface LeavePlan {
  destinationId: string
  departLabel: string
  returnLabel: string
  line: string
  segments: Array<{
    name: string
    congestion: number
    note: string
  }>
}

export interface Board {
  asOf: string
  clockLabel: string
  dataMode: "fixture" | "mixed" | "live"
  providers: ProviderStatus[]
  horizons: Horizon[]
  destinations: Array<
    Destination & {
      series: Record<string, Forecast>
      crowdNow: number
    }
  >
  spots: Spot[]
  opportunities: Array<{
    id: string
    kicker: string
    destinationId: string
    line: string
  }>
}
