"use client"

import type { Board, Destination, Forecast } from "@repo/hype-engine"
import { PortraitMark, Sticker } from "./portraits"

type Place = Board["destinations"][number]

function hours(delta: number): string {
  const sign = delta >= 0 ? "+" : "−"
  const abs = Math.abs(delta)
  const whole = Math.floor(abs)
  const minutes = Math.round((abs - whole) * 60)
  return whole === 0 ? `${sign}${minutes}m` : `${sign}${whole}h ${minutes.toString().padStart(2, "0")}m`
}

export function Ripple({ forecast }: { forecast: Forecast }) {
  const rows = [
    ["bookings", forecast.signals.booking],
    ["search", forecast.signals.search],
    ["intent", forecast.signals.intent],
    ["social", forecast.signals.social],
    ["traffic", forecast.signals.traffic],
  ] as const
  return (
    <div className="ripple" aria-hidden="true">
      {rows.map(([label, signal]) => {
        const strength = signal.available ? Math.min(1, Math.abs(signal.velocity ?? 1) / 2.4) : 0.15
        return (
          <div key={label} className={signal.available ? "ripple-cell" : "ripple-cell is-miss"}>
            <svg viewBox="0 0 72 72">
              <path className="track" d={arc(36, 40, 22, 300)} />
              <path className="live" d={arc(36, 40, 22, 28 + strength * 270)} />
            </svg>
            <span>{label}</span>
            <em>{signal.available ? signal.display : "missing"}</em>
          </div>
        )
      })}
    </div>
  )
}

function arc(cx: number, cy: number, radius: number, degrees: number): string {
  const sweep = Math.min(330, degrees) * (Math.PI / 180)
  const x = cx + radius * Math.sin(sweep)
  const y = cy - radius * Math.cos(sweep)
  const large = degrees > 180 ? 1 : 0
  return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 ${large} 1 ${x.toFixed(2)} ${y.toFixed(2)}`
}

export function DestinationSheet({
  place,
  forecast,
  alternative,
  alternativeForecast,
  spots,
  onClose,
  onCompare,
  onLeave,
  onOpenAlternative,
}: {
  place: Place
  forecast: Forecast
  alternative: Place | null
  alternativeForecast: Forecast | null
  spots: Board["spots"]
  onClose: () => void
  onCompare: () => void
  onLeave: () => void
  onOpenAlternative: () => void
}) {
  const localSpots = spots.filter((spot) => spot.destinationId === place.id).slice(0, 2)
  return (
    <aside className="sheet" aria-label={place.name}>
      <div className="sheet-handle" />
      <header className="sheet-top">
        <div>
          <p className="kicker">{place.region}</p>
          <h2>{place.name}</h2>
          <p className="lifecycle">{forecast.lifecycle.toLowerCase()}</p>
        </div>
        <div className="sheet-score">
          <button type="button" className="text-button" onClick={onClose}>close</button>
          <div className="worth-card">
            <span>worth it</span>
            <strong>{forecast.worthIt.value.toFixed(1)}</strong>
            <em>{forecast.verdict.toLowerCase()}</em>
          </div>
        </div>
      </header>
      <p className="editorial">{forecast.line}</p>
      <p className="sub">{forecast.subline}</p>
      <p className="prob">
        {Math.round(forecast.probabilityHighPressure.value * 100)}% chance of an unusually heavy weekend.
        <span className="demo-tag">{forecast.crowd.type.toLowerCase()}</span>
      </p>
      <section className="metrics" aria-label="this weekend">
        <p><span>crowd</span><strong>{forecast.crowd.value.toFixed(1)}</strong><em>estimated</em></p>
        <p><span>hype</span><strong>{forecast.hype.value} {forecast.direction === "up" ? "↑" : forecast.direction === "down" ? "↓" : "→"}</strong><em>{forecast.lifecycle.toLowerCase()}</em></p>
        <p><span>hotels</span><strong>{forecast.signals.booking.pressure == null ? "—" : forecast.signals.booking.pressure}</strong><em>{forecast.signals.booking.display}</em></p>
        <p className="is-prose"><span>weather</span><strong>{forecast.signals.weather.display}</strong><em>{forecast.signals.traffic.display}</em></p>
      </section>
      <section>
        <h3>why we think this</h3>
        <ul className="drivers">
          {forecast.drivers.map((driver) => (
            <li key={driver.id}>
              <strong>{driver.label}</strong>
              <em>{driver.level.toLowerCase()}</em>
              <span>{driver.detail}</span>
            </li>
          ))}
        </ul>
        <Ripple forecast={forecast} />
      </section>
      <section>
        <h3>how do we know?</h3>
        <ul className="sources">
          <li><strong>hotels</strong> {forecast.signals.booking.metric.sources[0] ?? "missing"} <span>{forecast.signals.booking.metric.explanation}</span></li>
          <li><strong>search</strong> {forecast.signals.search.metric.sources[0] ?? "missing"} <span>{forecast.signals.search.note}</span></li>
          <li><strong>weather</strong> {forecast.signals.weather.metric.sources[0] ?? "missing"}</li>
          <li><strong>traffic</strong> {forecast.signals.traffic.metric.sources[0] ?? "missing"}</li>
          <li><strong>historical</strong> tourism statistics, 2020 and 2021 held out</li>
        </ul>
        <p className="confidence">{forecast.confidence.level.toLowerCase()} confidence. {forecast.confidence.reason}</p>
      </section>
      {alternative && alternativeForecast ? (
        <section className="instead">
          <Sticker kind="bolt" style={{ transform: "rotate(-8deg)" }} />
          <p className="hand">go here instead.</p>
          <button type="button" className="instead-card" onClick={onOpenAlternative}>
            <PortraitMark kind={alternative.portrait} />
            <span>
              <strong>{alternative.name}</strong>
              <em>worth it {alternativeForecast.worthIt.value.toFixed(1)}</em>
              <span>crowd {alternativeForecast.crowd.value.toFixed(1)} · hotels {priceGap(forecast.nightlyInr, alternativeForecast.nightlyInr)} · drive {hours(alternative.driveHoursFromDelhi - place.driveHoursFromDelhi)}</span>
            </span>
          </button>
        </section>
      ) : null}
      {localSpots.length > 0 ? (
        <section>
          <h3>quiet corners</h3>
          <ul className="spots">
            {localSpots.map((spot) => (
              <li key={spot.id}>{spot.name} <span>{spot.access}</span></li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className="sheet-actions">
        <button type="button" className="pill" onClick={onCompare}>compare</button>
        <button type="button" className="pill" onClick={onLeave}>best time to leave</button>
      </div>
      <p className="capacity">{place.capacityNote}</p>
    </aside>
  )
}

function priceGap(base: number, other: number): string {
  if (base <= 0) return "similar rates"
  const pct = Math.round((1 - other / base) * 100)
  if (pct > 0) return `~${pct}% cheaper`
  if (pct < 0) return `~${Math.abs(pct)}% more`
  return "similar rates"
}

export function CompareBoard({
  left,
  right,
  leftForecast,
  rightForecast,
  onClose,
  onSave,
}: {
  left: Place
  right: Place
  leftForecast: Forecast
  rightForecast: Forecast
  onClose: () => void
  onSave: () => void
}) {
  const rows = [
    ["worth it", leftForecast.worthIt.value.toFixed(1), rightForecast.worthIt.value.toFixed(1)],
    ["crowd", leftForecast.crowd.value.toFixed(1), rightForecast.crowd.value.toFixed(1)],
    ["hype", String(leftForecast.hype.value), String(rightForecast.hype.value)],
    ["hotels", leftForecast.signals.booking.display, rightForecast.signals.booking.display],
    ["weather", leftForecast.signals.weather.display, rightForecast.signals.weather.display],
    ["drive from delhi", `${left.driveHoursFromDelhi}h`, `${right.driveHoursFromDelhi}h`],
    ["a night", `₹${leftForecast.nightlyInr.toLocaleString("en-IN")}`, `₹${rightForecast.nightlyInr.toLocaleString("en-IN")}`],
  ]
  return (
    <aside className="sheet compare" aria-label="compare">
      <header className="sheet-top">
        <h2>side by side</h2>
        <button type="button" className="text-button" onClick={onClose}>close</button>
      </header>
      <div className="compare-names">
        <p><span>{left.name}</span><strong>{leftForecast.verdict.toLowerCase()}</strong></p>
        <p><span>{right.name}</span><strong>{rightForecast.verdict.toLowerCase()}</strong></p>
      </div>
      <div className="compare-rows">
        {rows.map((row) => (
          <p key={row[0]}>
            <em>{row[0]}</em>
            <span>{row[1]}</span>
            <span>{row[2]}</span>
          </p>
        ))}
      </div>
      <p className="hand">same weekend. different valley.</p>
      <button type="button" className="pill" onClick={onSave}>keep this on the device</button>
    </aside>
  )
}

export function LeaveNote({
  place,
  forecast,
  segments,
  onClose,
}: {
  place: Destination
  forecast: Forecast
  segments: Array<{ name: string; congestion: number; note: string }>
  onClose: () => void
}) {
  const heavy = (forecast.signals.traffic.pressure ?? 100) >= 140
  return (
    <aside className="sheet" aria-label="when to leave">
      <header className="sheet-top">
        <div>
          <p className="kicker">best time to leave</p>
          <h2>{place.name}</h2>
        </div>
        <button type="button" className="text-button" onClick={onClose}>close</button>
      </header>
      {heavy ? (
        <>
          <p className="editorial">friday, 5:40am.</p>
          <p className="sub">Leave Delhi before the city wakes. Saturday noon meets the rush around Chandigarh. Come back Sunday by 2pm, before the downhill wave.</p>
        </>
      ) : (
        <>
          <p className="editorial">saturday, late morning.</p>
          <p className="sub">The road is not the story. Leave when you have had coffee.</p>
        </>
      )}
      <p className="demo-tag">predicted · demo</p>
      <ol className="segments">
        {segments.map((segment) => (
          <li key={segment.name}>
            <span style={{ ["--load" as string]: Math.min(1, segment.congestion / 2) }} />
            <strong>{segment.name}</strong>
            <em>{segment.congestion.toFixed(2)}×</em>
            <small>{segment.note}</small>
          </li>
        ))}
      </ol>
    </aside>
  )
}
