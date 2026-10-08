"use client"

import { useEffect, useMemo, useState } from "react"
import type { Board, CrowdTolerance, MapMode, TripType } from "@repo/hype-engine"
import { MapStage } from "./map-stage"
import { CompareBoard, DestinationSheet, LeaveNote } from "./journal"
import { PortraitMark, Sticker } from "./portraits"

const TRIPS: TripType[] = ["mountains", "adventure", "relax", "food", "nightlife", "romantic", "family", "spiritual", "nature", "roadtrip"]
const TOLERANCES: CrowdTolerance[] = ["quiet", "balanced", "festive"]
const MODES: MapMode[] = ["worth", "crowd", "hype", "hotels", "traffic"]

type Prefs = {
  people: number
  budgetInr: number | null
  maxTravelHours: number
  tripType: TripType
  crowdTolerance: CrowdTolerance
}

type Saved = { id: string; left: string; right: string; horizon: string; worth: string }

const DEFAULT_PREFS: Prefs = {
  people: 2,
  budgetInr: null,
  maxTravelHours: 12,
  tripType: "mountains",
  crowdTolerance: "balanced",
}

export function AppShell({ initial }: { initial: Board }) {
  const [board, setBoard] = useState(initial)
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [horizonId, setHorizonId] = useState("weekend")
  const [mode, setMode] = useState<MapMode>("worth")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [panel, setPanel] = useState<"explore" | "beat" | "trips" | "profile">("explore")
  const [overlay, setOverlay] = useState<null | "compare" | "leave" | "reel" | "smart">(null)
  const [saved, setSaved] = useState<Saved[]>([])
  const [reelUrl, setReelUrl] = useState("")
  const [reelNote, setReelNote] = useState("")
  const [reelResult, setReelResult] = useState<string>("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const storedPrefs = window.localStorage.getItem("beat-prefs")
    const storedTrips = window.localStorage.getItem("beat-trips")
    if (storedTrips) setSaved(JSON.parse(storedTrips) as Saved[])
    if (!storedPrefs) return
    const next = JSON.parse(storedPrefs) as Prefs
    setPrefs(next)
    void refresh(next)
  }, [])

  async function refresh(next: Prefs) {
    setBusy(true)
    const params = new URLSearchParams({
      people: String(next.people),
      hours: String(next.maxTravelHours),
      trip: next.tripType,
      tolerance: next.crowdTolerance,
    })
    if (next.budgetInr) params.set("budget", String(next.budgetInr))
    const response = await fetch(`/api/board?${params.toString()}`)
    if (response.ok) setBoard(await response.json() as Board)
    setBusy(false)
  }

  function updatePrefs(next: Prefs) {
    setPrefs(next)
    window.localStorage.setItem("beat-prefs", JSON.stringify(next))
    void refresh(next)
  }

  const days = board.horizons.filter((horizon) => horizon.id === "now" || horizon.id.startsWith("day:")).sort((a, b) => a.start.localeCompare(b.start))
  const selected = board.destinations.find((item) => item.id === selectedId) ?? null
  const forecast = selected?.series[horizonId] ?? selected?.series.weekend ?? null
  const alternative = useMemo(() => {
    if (!selected || !forecast) return null
    return [...board.destinations]
      .filter((item) => item.id !== selected.id)
      .filter((item) => item.driveHoursFromDelhi <= prefs.maxTravelHours + 1.5)
      .map((item) => ({ item, forecast: item.series[horizonId] ?? item.series.weekend! }))
      .sort((a, b) => {
        const region = (place: typeof a.item) => place.region.split(", ").pop()
        const bonus = (place: typeof a.item) => (region(place) === region(selected) ? 0.55 : 0) + (place.tripTypes.some((type) => selected.tripTypes.includes(type)) ? 0.15 : 0)
        return (b.forecast.worthIt.value + bonus(b.item)) - (a.forecast.worthIt.value + bonus(a.item))
      })[0] ?? null
  }, [board.destinations, forecast, horizonId, prefs.maxTravelHours, selected])

  const suggestions = query.trim().length === 0 ? [] : board.destinations.filter((item) => item.name.includes(query.trim().toLowerCase())).slice(0, 5)
  const anywhere = query.trim().toLowerCase() === "anywhere"

  function choose(id: string) {
    setSelectedId(id)
    setQuery("")
    setPanel("explore")
    setOverlay(null)
  }

  const scrubIndex = Math.max(0, days.findIndex((day) => day.start === (board.horizons.find((item) => item.id === horizonId)?.start ?? "")))

  return (
    <div className="app">
      <MapStage board={board} horizonId={horizonId} mode={mode} selectedId={selectedId} onSelect={choose} />
      <a className="brand" href="/" aria-label="beat the hype home">
        <Hand />
        <span>beat the hype</span>
      </a>
      <div className="top-action">
        <button type="button" className="pill" onClick={() => setHorizonId("weekend")}>this weekend</button>
        <p className="demo-caption">{board.clockLabel}</p>
      </div>
      <form className="search map-ui" onSubmit={(event) => { event.preventDefault(); if (anywhere) setPanel("beat"); else if (suggestions[0]) choose(suggestions[0].id) }} role="search">
        <label htmlFor="going">where are you thinking of going?</label>
        <input id="going" value={query} placeholder="manali, tirthan, or anywhere" onChange={(event) => setQuery(event.target.value)} autoComplete="off" />
        {suggestions.length > 0 && !anywhere ? (
          <ul>
            {suggestions.map((item) => (
              <li key={item.id}><button type="button" onClick={() => choose(item.id)}>{item.name}<span>{item.region}</span></button></li>
            ))}
          </ul>
        ) : null}
        <button type="button" className="text-button" onClick={() => setOverlay("reel")}>drop a reel</button>
      </form>
      <div className="modes map-ui" role="tablist" aria-label="map mode">
        {MODES.map((item) => (
          <button key={item} type="button" role="tab" aria-selected={mode === item} className={mode === item ? "is-on" : ""} onClick={() => setMode(item)}>{item === "worth" ? "worth it" : item}</button>
        ))}
      </div>
      {panel === "beat" ? <BeatPanel board={board} onOpen={choose} onSmart={() => setOverlay("smart")} /> : null}
      {panel === "trips" ? <TripsPanel saved={saved} onOpen={choose} /> : null}
      {panel === "profile" ? <ProfilePanel prefs={prefs} onChange={updatePrefs} /> : null}
      {overlay === "reel" ? (
        <aside className="sheet">
          <header className="sheet-top"><h2>drop a reel</h2><button type="button" className="text-button" onClick={() => setOverlay(null)}>close</button></header>
          <p className="sub">Paste a link. We only read the text you give us. Instagram is not connected.</p>
          <form onSubmit={async (event) => {
            event.preventDefault()
            const response = await fetch("/api/reel", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: reelUrl, note: reelNote }) })
            const body = await response.json() as { destinationId?: string | null; warning?: string; destinationName?: string | null }
            setReelResult(body.warning ?? "")
            if (body.destinationId) choose(body.destinationId)
          }}>
            <input value={reelUrl} onChange={(event) => setReelUrl(event.target.value)} placeholder="https://…" aria-label="reel link" />
            <input value={reelNote} onChange={(event) => setReelNote(event.target.value)} placeholder="what place is this?" aria-label="note" />
            <button className="pill" type="submit">read the paste</button>
          </form>
          {reelResult ? <p className="hand">{reelResult}</p> : null}
        </aside>
      ) : null}
      {overlay === "smart" ? <SmartForm prefs={prefs} board={board} onClose={() => setOverlay(null)} onApply={updatePrefs} onOpen={choose} /> : null}
      {selected && forecast && overlay === null && panel === "explore" ? (
        <DestinationSheet
          place={selected}
          forecast={forecast}
          alternative={alternative?.item ?? null}
          alternativeForecast={alternative?.forecast ?? null}
          spots={board.spots}
          onClose={() => setSelectedId(null)}
          onCompare={() => setOverlay("compare")}
          onLeave={() => setOverlay("leave")}
          onOpenAlternative={() => { if (alternative) choose(alternative.item.id) }}
        />
      ) : null}
      {selected && forecast && alternative && overlay === "compare" ? (
        <CompareBoard
          left={selected}
          right={alternative.item}
          leftForecast={forecast}
          rightForecast={alternative.forecast}
          onClose={() => setOverlay(null)}
          onSave={() => {
            const next = [{ id: `${selected.id}-${alternative.item.id}`, left: selected.name, right: alternative.item.name, horizon: horizonId, worth: `${forecast.worthIt.value.toFixed(1)} vs ${alternative.forecast.worthIt.value.toFixed(1)}` }, ...saved].slice(0, 8)
            setSaved(next)
            window.localStorage.setItem("beat-trips", JSON.stringify(next))
            setPanel("trips")
            setOverlay(null)
          }}
        />
      ) : null}
      {selected && forecast && overlay === "leave" ? (
        <LeaveNote
          place={selected}
          forecast={forecast}
          segments={segmentsFor(selected.id)}
          onClose={() => setOverlay(null)}
        />
      ) : null}
      <div className="timebar map-ui">
        <div className="modes-mobile">
          {MODES.map((item) => (
            <button key={item} type="button" className={mode === item ? "is-on" : ""} onClick={() => setMode(item)}>{item === "worth" ? "worth it" : item}</button>
          ))}
        </div>
        <div className="chips">
          {board.horizons.filter((horizon) => ["now", "weekend", "next-weekend", "30d", "90d"].includes(horizon.id)).map((horizon) => (
            <button key={horizon.id} type="button" className={horizonId === horizon.id ? "is-on" : ""} onClick={() => setHorizonId(horizon.id)}>{horizon.label}</button>
          ))}
        </div>
        <label className="scrub">
          <span>drag the days</span>
          <input
            type="range"
            min={0}
            max={Math.max(0, days.length - 1)}
            value={scrubIndex}
            aria-valuetext={days[scrubIndex]?.label ?? ""}
            onChange={(event) => {
              const day = days[Number(event.target.value)]
              if (!day) return
              const named = board.horizons.find((horizon) => ["now", "weekend", "next-weekend"].includes(horizon.id) && horizon.start === day.start)
              setHorizonId(named?.id ?? day.id)
            }}
          />
          <span className="scrub-read">{days[scrubIndex]?.label ?? ""}</span>
        </label>
      </div>
      <nav className="dock" aria-label="primary">
        {(["explore", "beat", "trips", "profile"] as const).map((item) => (
          <button key={item} type="button" className={panel === item ? "is-on" : ""} onClick={() => { setPanel(item); setOverlay(null) }}>{item === "beat" ? "beat the hype" : item}</button>
        ))}
      </nav>
      {busy ? <p className="busy">reading the ripples…</p> : null}
    </div>
  )
}

function BeatPanel({ board, onOpen, onSmart }: { board: Board; onOpen: (id: string) => void; onSmart: () => void }) {
  return (
    <aside className="rail">
      <Sticker kind="heart" style={{ transform: "rotate(8deg)" }} />
      <p className="hand">go before everyone else.</p>
      <ul>
        {board.opportunities.map((item) => {
          const place = board.destinations.find((destination) => destination.id === item.destinationId)
          const forecast = place?.series.weekend
          if (!place || !forecast) return null
          return (
            <li key={item.id}>
              <button type="button" onClick={() => onOpen(place.id)}>
                <PortraitMark kind={place.portrait} />
                <span>
                  <em>{item.kicker}</em>
                  <strong>{place.name}</strong>
                  <span>hype {forecast.hype.value} {forecast.direction === "up" ? "↑" : ""} · crowd {place.crowdNow.toFixed(1)} now · {forecast.crowd.value.toFixed(1)} this weekend</span>
                  <span>{item.line}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <button type="button" className="pill" onClick={onSmart}>find me somewhere worth going</button>
    </aside>
  )
}

function TripsPanel({ saved, onOpen }: { saved: Saved[]; onOpen: (id: string) => void }) {
  return (
    <aside className="rail">
      <h2>kept on this device</h2>
      {saved.length === 0 ? <p className="sub">Nothing kept yet. Compare two places, then keep the page.</p> : null}
      <ul>
        {saved.map((item) => (
          <li key={item.id}><button type="button" onClick={() => onOpen(item.left.toLowerCase().split(" ")[0] ?? "")}><strong>{item.left} / {item.right}</strong><span>{item.worth}</span></button></li>
        ))}
      </ul>
      <p className="sub">An account, later, is only for alerts. Browsing stays open.</p>
    </aside>
  )
}

function ProfilePanel({ prefs, onChange }: { prefs: Prefs; onChange: (prefs: Prefs) => void }) {
  return (
    <aside className="rail">
      <h2>how you travel</h2>
      <p className="sub">From Delhi. Worth it bends around this.</p>
      <label>people <input type="number" min={1} max={12} value={prefs.people} onChange={(event) => onChange({ ...prefs, people: Number(event.target.value) })} /></label>
      <label>budget, rupees <input type="number" min={0} placeholder="optional" value={prefs.budgetInr ?? ""} onChange={(event) => onChange({ ...prefs, budgetInr: event.target.value ? Number(event.target.value) : null })} /></label>
      <label>max hours <input type="number" min={2} max={18} value={prefs.maxTravelHours} onChange={(event) => onChange({ ...prefs, maxTravelHours: Number(event.target.value) })} /></label>
      <div className="choice">
        {TRIPS.map((trip) => <button type="button" key={trip} className={prefs.tripType === trip ? "is-on" : ""} onClick={() => onChange({ ...prefs, tripType: trip })}>{trip}</button>)}
      </div>
      <div className="choice">
        {TOLERANCES.map((tolerance) => <button type="button" key={tolerance} className={prefs.crowdTolerance === tolerance ? "is-on" : ""} onClick={() => onChange({ ...prefs, crowdTolerance: tolerance })}>{tolerance}</button>)}
      </div>
    </aside>
  )
}

function SmartForm({ prefs, board, onClose, onApply, onOpen }: { prefs: Prefs; board: Board; onClose: () => void; onApply: (prefs: Prefs) => void; onOpen: (id: string) => void }) {
  const [draft, setDraft] = useState(prefs)
  const best = [...board.destinations].filter((item) => item.driveHoursFromDelhi <= draft.maxTravelHours + 0.4).sort((a, b) => (b.series.weekend?.worthIt.value ?? 0) - (a.series.weekend?.worthIt.value ?? 0))[0]
  return (
    <aside className="sheet">
      <header className="sheet-top"><h2>find me somewhere</h2><button type="button" className="text-button" onClick={onClose}>close</button></header>
      <p className="sub">Delhi, this weekend, the way you actually travel.</p>
      <label>budget <input type="number" value={draft.budgetInr ?? ""} placeholder="15000" onChange={(event) => setDraft({ ...draft, budgetInr: event.target.value ? Number(event.target.value) : null })} /></label>
      <label>people <input type="number" min={1} value={draft.people} onChange={(event) => setDraft({ ...draft, people: Number(event.target.value) })} /></label>
      <label>hours <input type="number" min={2} value={draft.maxTravelHours} onChange={(event) => setDraft({ ...draft, maxTravelHours: Number(event.target.value) })} /></label>
      <div className="choice">
        {TOLERANCES.map((tolerance) => <button type="button" key={tolerance} className={draft.crowdTolerance === tolerance ? "is-on" : ""} onClick={() => setDraft({ ...draft, crowdTolerance: tolerance })}>{tolerance}</button>)}
      </div>
      <button type="button" className="pill" onClick={() => onApply(draft)}>use this</button>
      {best?.series.weekend ? (
        <button type="button" className="instead-card" onClick={() => onOpen(best.id)}>
          <PortraitMark kind={best.portrait} />
          <span>
            <strong>{best.name}</strong>
            <em>worth it {best.series.weekend.worthIt.value.toFixed(1)}</em>
            <span>{best.series.weekend.line.replace("\n", " ")}</span>
          </span>
        </button>
      ) : null}
    </aside>
  )
}

function segmentsFor(id: string): Array<{ name: string; congestion: number; note: string }> {
  if (id === "manali") {
    return [
      ["Delhi → Murthal", 1.11],
      ["Murthal → Chandigarh", 1.25],
      ["Chandigarh → Bilaspur", 1.47],
      ["Bilaspur → Mandi", 1.28],
      ["Mandi → Kullu", 1.37],
      ["Kullu → Manali", 1.57],
    ].map(([name, congestion]) => ({
      name: String(name),
      congestion: Number(congestion),
      note: Number(congestion) >= 1.45 ? "this is where the queue forms" : Number(congestion) >= 1.2 ? "slower than a clear run" : "ordinary",
    }))
  }
  return [{ name: `Delhi → ${id}`, congestion: 1.08, note: "ordinary" }]
}

function Hand() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="hand-mark">
      <path d="M10 20 V8 M10 10 C10 6 16 6 16 10 V18 M16 12 C16 8 22 8 22 12 V19 M22 14 C22 11 27 12 26 16 V20 C26 26 8 27 8 20 Z" fill="none" stroke="#171717" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
