import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { readReel } from "./advice"
import { buildBoard, DEFAULT_PREFS, observationView } from "./engine"
import { forecastDestination, lifecycleFor } from "./forecast"
import { classifyIntent } from "./intent"
import { runCollectors, runQualityChecks } from "./jobs"
import { isAnomalousYear, seasonalBaseline } from "./velocities"
import { LEAD_WEIGHTS } from "./weights"
import { appendBundle, createBundle } from "./store"
import { loadFixtureBundle } from "./fixtures"

describe("hype engine", () => {
  const board = buildBoard(DEFAULT_PREFS)
  const manali = board.destinations.find((item) => item.id === "manali")!
  const tirthan = board.destinations.find((item) => item.id === "tirthan")!
  const shoja = board.destinations.find((item) => item.id === "shoja")!
  const weekend = manali.series.weekend!
  const tirthanWeekend = tirthan.series.weekend!
  const shojaNow = shoja.series.now!
  const shojaWeekend = shoja.series.weekend!
  const shojaMonth = shoja.series["30d"]!

  it("treats this weekend as a T-5 forecast from the demo Monday", () => {
    const horizon = board.horizons.find((item) => item.id === "weekend")!
    assert.equal(horizon.leadDays, 5)
    assert.equal(horizon.bucket, "T7_T4")
    assert.equal(horizon.start, "2026-10-10")
  })

  it("warns that Manali is the wrong weekend", () => {
    assert.ok(weekend.crowd.value >= 8, `crowd ${weekend.crowd.value}`)
    assert.ok(weekend.hype.value >= 80, `hype ${weekend.hype.value}`)
    assert.ok(weekend.worthIt.value <= 5.2, `worth ${weekend.worthIt.value}`)
    assert.equal(weekend.verdict, "SKIP")
    assert.ok(weekend.probabilityHighPressure.value >= 0.7)
    assert.equal(weekend.confidence.level, "HIGH")
    assert.equal(weekend.crowd.type, "DEMO")
    assert.match(weekend.line.toLowerCase(), /wrong weekend|terrible/)
    assert.ok(weekend.drivers.some((driver) => driver.level.includes("TOO EARLY")))
    assert.ok((weekend.signals.booking.velocity ?? 0) >= 1.5)
  })

  it("prefers Tirthan to Manali for the same weekend", () => {
    assert.ok(tirthanWeekend.worthIt.value >= 7.5, `tirthan worth ${tirthanWeekend.worthIt.value}`)
    assert.ok(tirthanWeekend.worthIt.value > weekend.worthIt.value + 2)
    assert.ok(tirthanWeekend.crowd.value < 5, `tirthan crowd ${tirthanWeekend.crowd.value}`)
    assert.equal(tirthanWeekend.signals.social.available, false)
    assert.ok(tirthanWeekend.confidence.score > 0.45)
  })

  it("catches Shoja while the crowd is still behind the hype", () => {
    assert.ok(shojaNow.crowd.value <= 4.2, `now ${shojaNow.crowd.value}`)
    assert.ok(shojaWeekend.hype.value >= 60, `hype ${shojaWeekend.hype.value}`)
    assert.equal(shojaWeekend.lifecycle, "RISING")
    assert.ok(shojaMonth.crowd.value > shojaNow.crowd.value + 2, `30d ${shojaMonth.crowd.value}`)
  })

  it("does not let missing search collapse a forecast", () => {
    const view = observationView()
    const stripped = {
      ...view,
      search: view.search.filter((row) => row.destinationId !== "manali"),
    }
    const horizon = board.horizons.find((item) => item.id === "weekend")!
    const forecast = forecastDestination(manali, horizon, DEFAULT_PREFS, stripped)
    assert.equal(forecast.signals.search.available, false)
    assert.ok(forecast.crowd.value > 0)
    assert.match(forecast.confidence.reason, /Search is missing/)
  })

  it("keeps 2020 and 2021 out of the seasonal baseline", () => {
    assert.equal(isAnomalousYear(2020), true)
    assert.equal(isAnomalousYear(2021, false), true)
    const samples = [
      { destinationId: "manali", year: 2020, month: 10, crowdIndex: 1 },
      { destinationId: "manali", year: 2021, month: 10, crowdIndex: 1 },
      { destinationId: "manali", year: 2024, month: 10, crowdIndex: 8 },
      { destinationId: "manali", year: 2025, month: 10, crowdIndex: 8 },
    ]
    assert.equal(seasonalBaseline(samples, 10), 8)
  })

  it("weights traffic lightly five days out and heavily on the day", () => {
    assert.ok(LEAD_WEIGHTS.T7_T4.traffic < LEAD_WEIGHTS.TRAVEL_DAY.traffic)
    assert.ok(LEAD_WEIGHTS.T7_T4.booking > LEAD_WEIGHTS.TRAVEL_DAY.booking)
    const sum = Object.values(LEAD_WEIGHTS.T7_T4).reduce((total, value) => total + value, 0)
    assert.ok(Math.abs(sum - 1) < 0.001)
  })

  it("classifies planning talk above generic noise", () => {
    assert.equal(classifyIntent("Going to Manali this weekend."), "PLANNING_TRIP")
    assert.equal(classifyIntent("Best hotels in Tirthan?"), "BOOKING")
    assert.equal(classifyIntent("How crowded is Mussoorie right now?"), "ASKING_CROWD")
    assert.equal(classifyIntent("Delhi to Rishikesh this Saturday?"), "ASKING_ROUTE")
    assert.equal(classifyIntent("We are cancelling the booking"), "CANCELLING")
  })

  it("stores snapshots once", () => {
    const first = createBundle(loadFixtureBundle(), board.asOf)
    const again = appendBundle(first, loadFixtureBundle())
    assert.ok(again.skipped > 0)
    assert.equal(again.inserted, 0)
    const secondPass = runCollectors(first)
    assert.ok(secondPass.every((job) => job.inserted === 0 && job.ok))
    assert.equal(runQualityChecks(first)[0]?.ok, true)
  })

  it("does not pretend a pasted reel was fetched", () => {
    const reading = readReel({
      url: "https://www.instagram.com/reel/abc123/",
      note: "Jibhi looked unreal",
    }, board.destinations)
    assert.equal(reading.fetchedFromNetwork, false)
    assert.equal(reading.destinationId, "jibhi")
    assert.match(reading.warning, /did not retrieve/i)
  })

  it("labels rising versus overhyped from crowd, not fame", () => {
    assert.equal(lifecycleFor(90, 8.8, "up"), "OVERHYPED")
    assert.equal(lifecycleFor(74, 3.2, "up"), "RISING")
    assert.equal(lifecycleFor(20, 2, "flat"), "UNDISCOVERED")
  })
})
