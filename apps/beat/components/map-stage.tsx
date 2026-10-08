"use client"

import { useEffect, useRef, useState } from "react"
import type { Board, Forecast, MapMode } from "@repo/hype-engine"
import { PortraitMark } from "./portraits"

const WORLD = { minLng: 73.35, maxLng: 80.05, minLat: 24.15, maxLat: 33.15 }

const NUDGE: Record<string, [number, number]> = {
  manali: [0.4, -6.4],
  shimla: [-6.8, 2.8],
  shoja: [-3.2, -0.6],
  jibhi: [2.4, -4.6],
  tirthan: [6.2, 3.2],
  mussoorie: [4.8, -1.8],
  dehradun: [-3.6, 3.2],
  rishikesh: [2.8, 2.6],
}

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
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null)

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
  }, [selectedId])

  const selected = board.destinations.find((item) => item.id === selectedId)
  const focus = selected ? project(selected.lat, selected.lng) : project(31.15, 77.35)
  const scale = selected ? 1.85 : 1.22
  const fx = (focus.x / 100) * size.w
  const fy = (focus.y / 100) * size.h
  const tx = size.w / 2 - fx * scale + pan.x
  const ty = size.h / 2 - fy * scale + pan.y

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
          <path d="M0 18 C12 12 18 22 30 14 C40 8 46 18 58 12 C70 6 78 16 100 10 V28 C80 24 60 32 40 26 C20 20 10 30 0 24 Z" fill="#f7efe9" />
          <path d="M0 16 C16 22 22 8 36 14 C48 20 54 8 68 13 C82 18 90 8 100 12" fill="none" stroke="#171717" strokeWidth="0.35" />
          <path d="M0 13 C18 8 24 18 40 11 C55 5 62 16 78 10 C88 7 94 12 100 9" fill="none" stroke="#171717" strokeWidth="0.25" />
          <path d="M38 8 C40 30 36 48 34 70" fill="none" stroke="#2b1a07" strokeWidth="0.45" opacity="0.55" />
          <path d="M52 6 C48 24 56 40 58 62 C59 74 54 86 50 96" fill="none" stroke="#2b1a07" strokeWidth="0.4" opacity="0.45" />
          <text x="18" y="42" className="map-label">punjab</text>
          <text x="46" y="34" className="map-label">himachal</text>
          <text x="68" y="46" className="map-label">uttarakhand</text>
          <text x="28" y="78" className="map-label">rajasthan</text>
          {mode === "traffic" ? <path d={routePath} className="route-ink" /> : null}
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
          const nudge = NUDGE[destination.id] ?? [0, 0]
          const meta = caption(mode, forecast)
          const active = destination.id === selectedId
          const showStatus = active || forecast.verdict === "SKIP" || forecast.verdict === "GO"
          const status = forecast.verdict === "SKIP" ? "skip" : forecast.verdict === "GO" ? "go" : meta.status
          return (
            <button
              key={destination.id}
              type="button"
              className={`stamp ${active ? "is-active" : ""} ${meta.hot ? "is-hot" : ""}`}
              style={{ left: `${point.x + nudge[0]}%`, top: `${point.y + nudge[1]}%`, zIndex: active ? 3 : 1 }}
              onClick={() => onSelect(destination.id)}
            >
              <span className="portal"><PortraitMark kind={destination.portrait} /></span>
              <span className="stamp-name">{destination.name}</span>
              <span className="stamp-figure">{meta.figure}</span>
              {showStatus ? <span className="stamp-status">{status}</span> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
