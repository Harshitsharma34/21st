import type { CSSProperties } from "react"
import type { Portrait } from "@repo/hype-engine"

export function PortraitMark({ kind }: { kind: Portrait }) {
  return (
    <svg viewBox="0 0 80 80" className="portrait" aria-hidden="true">
      <rect width="80" height="80" fill="#f7efe9" />
      {scene(kind)}
    </svg>
  )
}

function scene(kind: Portrait) {
  switch (kind) {
    case "peaks":
      return (
        <>
          <path d="M0 62 L22 28 L34 46 L48 18 L66 48 L80 34 L80 80 L0 80 Z" fill="#2b1a07" />
          <path d="M48 18 L58 36 L40 34 Z" fill="#fdfbf9" />
          <path d="M8 70 H72" stroke="#ff6f1e" strokeWidth="1.5" fill="none" />
        </>
      )
    case "river":
      return (
        <>
          <path d="M0 18 H80 V80 H0 Z" fill="#2b1a07" />
          <path d="M0 0 H80 V28 C60 40 48 8 28 24 C16 32 8 10 0 16 Z" fill="#f7efe9" />
          <path d="M18 78 C28 50 24 40 40 28 C52 18 60 40 70 24" stroke="#fdfbf9" strokeWidth="3" fill="none" />
        </>
      )
    case "meadow":
      return (
        <>
          <circle cx="58" cy="22" r="8" fill="#ff6f1e" />
          <path d="M0 48 C20 40 28 52 48 44 C64 38 70 50 80 42 V80 H0 Z" fill="#2b1a07" />
          <path d="M14 48 V34 M22 50 V30 M30 48 V36" stroke="#171717" strokeWidth="1.4" />
        </>
      )
    case "cedar":
      return (
        <>
          <path d="M40 8 L58 36 H48 L64 58 H16 L32 36 H22 Z" fill="#2b1a07" />
          <rect x="36" y="58" width="8" height="16" fill="#171717" />
          <path d="M0 74 H80" stroke="#ff6f1e" strokeWidth="2" />
        </>
      )
    case "ridge":
      return (
        <>
          <path d="M0 50 Q20 20 40 36 T80 18 V80 H0 Z" fill="#2b1a07" />
          <path d="M10 46 Q28 28 46 40" stroke="#ff6f1e" strokeWidth="1.5" fill="none" />
        </>
      )
    case "lake":
      return (
        <>
          <path d="M8 22 H72 L64 36 H16 Z" fill="#2b1a07" />
          <ellipse cx="40" cy="54" rx="26" ry="14" fill="#171717" />
          <ellipse cx="36" cy="52" rx="10" ry="4" fill="#fdfbf9" />
        </>
      )
    case "forest":
      return (
        <>
          <path d="M16 70 L28 28 L40 70 Z" fill="#2b1a07" />
          <path d="M36 70 L50 22 L64 70 Z" fill="#171717" />
          <path d="M52 70 L64 34 L76 70 Z" fill="#2b1a07" />
        </>
      )
    case "pine":
      return (
        <>
          <path d="M0 64 H80 V80 H0 Z" fill="#2b1a07" />
          <path d="M12 64 L28 24 L44 64 Z M34 64 L52 16 L70 64 Z" fill="#171717" />
          <rect x="48" y="10" width="10" height="6" fill="#fdfbf9" />
        </>
      )
    case "ghats":
      return (
        <>
          <path d="M0 36 H80 V80 H0 Z" fill="#2b1a07" />
          <path d="M0 36 H80" stroke="#ff6f1e" strokeWidth="2" />
          <path d="M10 36 V58 M22 36 V64 M34 36 V52 M46 36 V66 M58 36 V50 M70 36 V60" stroke="#fdfbf9" strokeWidth="2" />
        </>
      )
    case "fort":
      return (
        <>
          <path d="M12 70 V34 H22 V26 H32 V34 H48 V22 H58 V34 H68 V70 Z" fill="#2b1a07" />
          <circle cx="40" cy="50" r="5" fill="#ff6f1e" />
        </>
      )
    case "palace":
      return (
        <>
          <path d="M16 70 V40 H64 V70 Z" fill="#2b1a07" />
          <path d="M16 40 Q40 18 64 40" fill="#171717" />
          <path d="M28 70 V52 H38 V70 M46 70 V52 H56 V70" fill="#fdfbf9" />
        </>
      )
    case "monument":
      return (
        <>
          <path d="M40 12 L68 70 H12 Z" fill="#2b1a07" />
          <path d="M40 28 L52 70 H28 Z" fill="#f7efe9" />
          <rect x="34" y="58" width="12" height="12" fill="#171717" />
        </>
      )
    case "valley":
      return (
        <>
          <path d="M0 30 L24 58 L40 24 L58 60 L80 28 V80 H0 Z" fill="#2b1a07" />
          <path d="M30 80 C36 60 44 62 50 80" stroke="#ff6f1e" strokeWidth="2" fill="none" />
        </>
      )
    case "city":
    case "capital":
      return (
        <>
          <path d="M10 70 V40 H24 V28 H36 V44 H52 V22 H66 V48 H74 V70 Z" fill="#2b1a07" />
          <path d="M16 50 H20 M42 36 H46 M58 40 H62" stroke="#ff6f1e" strokeWidth="1.5" />
        </>
      )
    default:
      return <circle cx="40" cy="40" r="16" fill="#2b1a07" />
  }
}

export function Sticker({ kind, style }: { kind: "bolt" | "heart" | "ghost"; style?: CSSProperties }) {
  if (kind === "bolt") {
    return (
      <svg className="sticker" style={style} viewBox="0 0 48 48" aria-hidden="true">
        <path d="M26 4 L10 28 H22 L18 44 L38 18 H26 Z" fill="#3b82f6" stroke="#171717" strokeWidth="2" />
      </svg>
    )
  }
  if (kind === "heart") {
    return (
      <svg className="sticker" style={style} viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 40 C8 28 6 16 14 12 C18 10 22 14 24 18 C26 14 30 10 34 12 C42 16 40 28 24 40 Z" fill="#ff66cf" stroke="#171717" strokeWidth="2" />
      </svg>
    )
  }
  return (
    <svg className="sticker" style={style} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M12 20 C12 10 36 10 36 20 V34 C36 40 12 40 12 34 Z" fill="#fdfbf9" stroke="#171717" strokeWidth="2" />
      <circle cx="20" cy="24" r="2" fill="#171717" />
      <circle cx="30" cy="24" r="2" fill="#171717" />
    </svg>
  )
}
