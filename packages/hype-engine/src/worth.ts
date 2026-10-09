import { clamp, round1 } from "./math"
import type { TripPrefs } from "./types"

export function worthIt(input: {
  crowd: number
  hype: number
  weather: number
  trafficRatio: number
  hotelPressure: number
  nightlyInr: number
  driveHours: number
  season: number
  tripMatch: boolean
  prefs: TripPrefs
  nights: number
}): number {
  const crowdRatio = clamp(input.crowd / 10, 0, 1)
  const crowdPenalty = input.prefs.crowdTolerance === "quiet"
    ? Math.pow(crowdRatio, 1.05)
    : input.prefs.crowdTolerance === "festive"
      ? crowdRatio * 0.38
      : crowdRatio * 0.82
  const crowdFit = clamp(1 - crowdPenalty, 0, 1)
  const weatherFit = clamp(input.weather, 0, 1)
  const trafficFit = clamp(1 - Math.max(0, input.trafficRatio - 1.05) * 0.9, 0, 1)
  const hotelFit = clamp(1 - input.hotelPressure, 0, 1)
  const rooms = Math.max(1, Math.ceil(input.prefs.people / 2))
  const cost = input.nightlyInr * input.nights * rooms
  const priceFit = input.prefs.budgetInr == null
    ? clamp(1 - (input.nightlyInr - 4500) / 14000, 0.32, 0.92)
    : clamp(1 - (cost - input.prefs.budgetInr) / Math.max(input.prefs.budgetInr, 1), 0, 1)
  const hypeFit = input.prefs.crowdTolerance === "festive"
    ? 0.55 + 0.45 * (input.hype / 100)
    : input.hype < 58
      ? 0.84
      : clamp(1 - ((input.hype - 50) / 50) * (input.prefs.crowdTolerance === "quiet" ? 1 : 0.85), 0, 1)
  const maxHours = input.prefs.maxTravelHours
  const driveFit = input.driveHours <= maxHours
    ? clamp(1 - 0.12 * (input.driveHours / Math.max(maxHours, 0.5)), 0, 1)
    : clamp(1 - (input.driveHours - maxHours) / 5, 0, 1)
  const seasonFit = clamp(0.35 + input.season * 0.7, 0, 1)
  const tripFit = input.tripMatch ? 1 : 0.42

  const score = (
    crowdFit * 0.28 +
    weatherFit * 0.14 +
    trafficFit * 0.12 +
    hotelFit * 0.16 +
    priceFit * 0.08 +
    hypeFit * 0.08 +
    driveFit * 0.06 +
    seasonFit * 0.04 +
    tripFit * 0.04
  )
  return round1(clamp(score * 10, 0, 10))
}
