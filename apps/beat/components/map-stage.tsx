"use client"

import { useEffect, useRef, useState } from "react"
import type { Board, Forecast, MapMode } from "@repo/hype-engine"
import { PortraitMark } from "./portraits"

const WORLD = { minLng: 73.35, maxLng: 80.05, minLat: 24.15, maxLat: 33.15 }

/** Screen-pixel offsets so name labels fan off the true point and stay one size when the map zooms. */
const NUDGE: Record<string, [number, number]> = {
  manali: [24, -72],
  shimla: [-156, 22],
  shoja: [-110, 28],
  jibhi: [20, -16],
  tirthan: [-72, 64],
  bir: [-28, -64],
  mussoorie: [56, -70],
  dehradun: [-164, 48],
  rishikesh: [24, 32],
  chakrata: [8, -52],
}

const VOICED = new Set(["manali", "tirthan", "shoja", "jibhi"])

const ROUTE = [
  [28.6139, 77.209],
  [29.0, 77.06],
  [30.733, 76.779],
  [31.341, 76.761],
  [31.708, 76.932],
  [31.957, 77.11],
  [32.243, 77.189],
]

export function project(lat: number, lng: number): { x: number; y: number } {
  return {
    x: ((lng - WORLD.minLng) / (WORLD.maxLng - WORLD.minLng)) * 100,
    y: ((WORLD.maxLat - lat) / (WORLD.maxLat - WORLD.minLat)) * 100,
  }
}

function caption(mode: MapMode, forecast: Forecast): { figure: string; status: string; hot: boolean } {
  if (mode === "crowd") {
    return { figure: forecast.crowd.value.toFixed(1), status: forecast.crowd.value >= 7 ? "packed" : forecast.crowd.value <= 4 ? "easy" : "building", hot: false }
  }
  if (mode === "hype") {
    const arrow = forecast.direction === "up" ? "↑" : forecast.direction === "down" ? "↓" : "→"
    return { figure: `${forecast.hype.value} ${arrow}`, status: forecast.lifecycle.toLowerCase(), hot: forecast.direction === "up" && forecast.hype.value >= 70 }
  }
  if (mode === "hotels") {
    const pressure = forecast.signals.booking.pressure
    return { figure: pressure == null ? "—" : String(pressure), status: (pressure ?? 0) >= 70 ? "filling" : "open", hot: (pressure ?? 0) >= 80 }
  }
  if (mode === "traffic") {
    const early = forecast.drivers.some((driver) => driver.level.includes("TOO EARLY"))
    return { figure: early ? "early" : forecast.signals.traffic.display, status: early ? "not yet" : "on the road", hot: false }
  }
  return {
    figure: forecast.worthIt.value.toFixed(1),
    status: forecast.verdict === "SKIP" ? "skip" : forecast.verdict === "GO" ? "go" : forecast.verdict.toLowerCase(),
    hot: forecast.direction === "up" && forecast.hype.value >= 75 && forecast.crowd.value < 6,
  }
}

export function MapStage({
  board,
  horizonId,
  mode,
  selectedId,
  onSelect,
}: {
  board: Board
  horizonId: string
  mode: MapMode
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 800, h: 600 })
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [shift, setShift] = useState<Record<string, [number, number]>>({})
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null)
  const pass = useRef(0)

  useEffect(() => {
    let live = true
    void document.fonts?.ready.then(() => {
      if (!live) return
      pass.current = 0
      setShift((prev) => ({ ...prev }))
    })
    return () => {
      live = false
    }
  }, [])

  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setPan({ x: 0, y: 0 })
    setShift({})
    pass.current = 0
  }, [selectedId, size.w, size.h, horizonId, mode])

  useEffect(() => {
    if (pass.current > 18) return
    const frame = frameRef.current
    if (!frame) return
    const nodes = [...frame.querySelectorAll<HTMLElement>(".stamp")]
    if (nodes.length === 0) return
    const rightLimit = selectedId && size.w > 860 ? size.w - 460 : size.w - 16
    const items = nodes.map((node) => {
      const rect = node.getBoundingClientRect()
      return { id: node.dataset.id ?? "", x: rect.left, y: rect.top, w: rect.width, h: rect.height, dx: 0, dy: 0 }
    })
    const pad = 12
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i]!
        const b = items[j]!
        const ix = Math.min(a.x + a.w + a.dx, b.x + b.w + b.dx) - Math.max(a.x + a.dx, b.x + b.dx)
        const iy = Math.min(a.y + a.h + a.dy, b.y + b.h + b.dy) - Math.max(a.y + a.dy, b.y + b.dy)
        if (ix + pad <= 0 || iy + pad <= 0) continue
        const horizontal = ix + pad < iy + pad
        if (horizontal) {
          const dir = a.x + a.dx <= b.x + b.dx ? -1 : 1
          const push = (ix + pad) / 2
          const aLeft = a.x + a.dx + dir * push
          const bLeft = b.x + b.dx - dir * push
          const fits = aLeft >= 8 && aLeft + a.w <= rightLimit && bLeft >= 8 && bLeft + b.w <= rightLimit
          if (fits) {
            a.dx += dir * push
            b.dx -= dir * push
            continue
          }
        }
        const dir = a.y + a.dy <= b.y + b.dy ? -1 : 1
        const push = (iy + pad) / 2
        a.dy += dir * push
        b.dy -= dir * push
      }
    }
    const floor = size.h - 150
    for (const item of items) {
      const left = item.x + item.dx
      const top = item.y + item.dy
      if (left < 8) item.dx += 8 - left
      if (left + item.w > rightLimit) item.dx -= left + item.w - rightLimit
      if (top < 72) item.dy += 72 - top
      if (top + item.h > floor) item.dy -= top + item.h - floor
    }
    const moved = items.some((item) => Math.abs(item.dx) > 0.5 || Math.abs(item.dy) > 0.5)
    if (!moved) return
    pass.current += 1
    setShift((prev) => {
      const next = { ...prev }
      for (const item of items) {
        const cur = next[item.id] ?? [0, 0]
        next[item.id] = [cur[0] + item.dx, cur[1] + item.dy]
      }
      return next
    })
  }, [shift, selectedId, size.w, size.h, horizonId, mode, board])

  const selected = board.destinations.find((item) => item.id === selectedId)
  const focus = selected ? project(selected.lat, selected.lng) : project(31.15, 77.35)
  const scale = selected ? 1.85 : 1.22
  const wide = size.w > 860
  const fx = (focus.x / 100) * size.w
  const fy = (focus.y / 100) * size.h
  const tx = size.w / 2 - fx * scale + pan.x - (selected && wide ? Math.min(210, size.w * 0.15) : 0)
  const ty = size.h / 2 - fy * scale + pan.y - (selected && !wide ? Math.min(70, size.h * 0.06) : 0)

  const route = ROUTE.map(([lat, lng]) => project(lat!, lng!))
  const routePath = route.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")

  return (
    <div
      className={`map-frame mode-${mode}`}
      ref={frameRef}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest(".stamp, .map-ui")) return
        drag.current = { x: event.clientX, y: event.clientY, px: pan.x, py: pan.y }
        ;(event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        if (!drag.current) return
        setPan({ x: drag.current.px + event.clientX - drag.current.x, y: drag.current.py + event.clientY - drag.current.y })
      }}
      onPointerUp={() => {
        drag.current = null
      }}
    >
      <div className="map-world" style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}>
        <svg className="terrain" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <rect width="100" height="100" fill="#fdfbf9" />
          <path d="M0 22 C8 8 14 18 22 9 C30 2 34 16 42 8 C50 1 56 14 64 7 C74 0 80 12 88 6 C94 2 97 10 100 8 V34 C88 28 76 36 64 30 C52 24 44 34 32 28 C18 22 10 32 0 26 Z" fill="#f7efe9" />
          <path d="M0 14 C10 20 16 6 26 12 C36 18 40 4 50 10 C60 16 66 5 76 11 C86 17 92 8 100 12" fill="none" stroke="#171717" strokeWidth="0.28" />
          <path d="M0 11 C14 6 18 16 30 9 C42 3 48 15 60 8 C72 2 82 13 100 7" fill="none" stroke="#2b1a07" strokeWidth="0.22" />
          <path d="M4 18 L14 8 L18 14 L28 4 L34 13 L46 3 L52 12 L64 2 L72 11 L84 4 L96 12" fill="none" stroke="#171717" strokeWidth="0.35" />
          <path d="M36 6 C38 22 34 36 33 52 C32 66 36 78 34 96" fill="none" stroke="#ce500a" strokeWidth="0.35" opacity="0.55" />
          <path d="M55 4 C50 20 58 34 57 48 C56 64 62 76 54 98" fill="none" stroke="#2b1a07" strokeWidth="0.32" opacity="0.4" />
          <path d="M70 10 C74 28 68 40 72 58 C75 72 70 84 76 98" fill="none" stroke="#2b1a07" strokeWidth="0.28" opacity="0.35" />
          <circle cx="8" cy="8" r="3.2" fill="none" stroke="#171717" strokeWidth="0.25" />
          <path d="M8 5.2 V10.8 M5.2 8 H10.8" stroke="#171717" strokeWidth="0.2" />
          <text x="16" y="44" className="map-label">punjab</text>
          <text x="44" y="30" className="map-label">himachal</text>
          <text x="70" y="42" className="map-label">uttarakhand</text>
          <text x="24" y="80" className="map-label">rajasthan</text>
          {mode === "traffic" ? <path d={routePath} className="route-ink" /> : null}
          {board.destinations.map((destination) => {
            const forecast = destination.series[horizonId] ?? destination.series.weekend
            if (!forecast) return null
            const voiced = VOICED.has(destination.id) || destination.id === selectedId
            if (!voiced) return null
            const point = project(destination.lat, destination.lng)
            const nudge = NUDGE[destination.id] ?? [24, -36]
            const extra = shift[destination.id] ?? [0, 0]
            return (
              <line
                key={`${destination.id}-lead`}
                x1={point.x}
                y1={point.y}
                x2={point.x + ((nudge[0] + extra[0]) / scale / size.w) * 100}
                y2={point.y + ((nudge[1] + extra[1]) / scale / size.h) * 100}
                className="leader"
              />
            )
          })}
          {board.destinations.map((destination) => {
            const forecast = destination.series[horizonId] ?? destination.series.weekend
            if (!forecast) return null
            const point = project(destination.lat, destination.lng)
            if (mode === "crowd") {
              return <circle key={destination.id} cx={point.x} cy={point.y} r={1.1 + forecast.crowd.value * 0.55} className="pressure" style={{ opacity: 0.08 + forecast.crowd.value / 28 }} />
            }
            if (mode === "hype" && forecast.direction === "up" && forecast.hype.value >= 60) {
              return <circle key={destination.id} cx={point.x} cy={point.y} r={2.2 + forecast.hype.value / 40} className="hype-ring" />
            }
            if (mode === "hotels") {
              const pressure = (forecast.signals.booking.pressure ?? 30) / 100
              return (
                <circle
                  key={destination.id}
                  cx={point.x}
                  cy={point.y}
                  r="2.4"
                  className="hotel-ring"
                  strokeDasharray={`${(1 - pressure) * 15} 20`}
                />
              )
            }
            return null
          })}
        </svg>
        <span className="origin" style={{ left: `${project(28.6139, 77.209).x}%`, top: `${project(28.6139, 77.209).y}%` }}>delhi</span>
        {board.destinations.map((destination) => {
          const forecast = destination.series[horizonId] ?? destination.series.weekend
          if (!forecast) return null
          const point = project(destination.lat, destination.lng)
          const nudge = NUDGE[destination.id] ?? [24, -36]
          const extra = shift[destination.id] ?? [0, 0]
          const meta = caption(mode, forecast)
          const active = destination.id === selectedId
          const voiced = VOICED.has(destination.id) || active
          const status = forecast.verdict === "SKIP" ? "skip" : forecast.verdict === "GO" ? "go" : forecast.lifecycle === "RISING" ? "rising" : ""
          const inv = 1 / scale
          return (
            <span key={destination.id}>
              <button
                type="button"
                className={`pin ${active ? "is-active" : ""}`}
                style={{ left: `${point.x}%`, top: `${point.y}%`, transform: `translate(-50%, -50%) scale(${inv})`, zIndex: 2 }}
                aria-label={destination.name}
                onClick={() => onSelect(destination.id)}
              />
              {voiced ? (
                <button
                  type="button"
                  data-id={destination.id}
                  className={`stamp ${active ? "is-active" : ""} ${meta.hot ? "is-hot" : ""}`}
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    zIndex: active ? 5 : 3,
                    transform: `translate(${(nudge[0] + extra[0]) * inv}px, ${(nudge[1] + extra[1]) * inv}px) scale(${inv})`,
                  }}
                  onClick={() => onSelect(destination.id)}
                >
                  {meta.hot ? <span className="halo" /> : null}
                  <span className="portal"><PortraitMark kind={destination.portrait} /></span>
                  <span className="name-label">
                    <span className="stamp-name">{destination.name.split(" ")[0]}</span>
                    <span className="stamp-figure">{meta.figure}</span>
                    {status ? <span className="stamp-status">{status}</span> : null}
                  </span>
                </button>
              ) : null}
            </span>
          )
        })}
      </div>
    </div>
  )
}
