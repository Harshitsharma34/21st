"use client"

import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion"
import { useEffect, useRef, useState, type ReactNode } from "react"

/** Fade + rise reveal when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Moves children vertically at a different rate than scroll. */
export function Parallax({
  children,
  speed = 0.2,
  className,
}: {
  children: ReactNode
  speed?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [-120 * speed, 120 * speed])
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  )
}

/** Card that tilts toward the cursor. */
export function Tilt({
  children,
  className,
  max = 6,
}: {
  children: ReactNode
  className?: string
  max?: number
}) {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 200, damping: 20 })
  const sry = useSpring(ry, { stiffness: 200, damping: 20 })
  return (
    <motion.div
      className={className}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        ry.set(px * max * 2)
        rx.set(-py * max * 2)
      }}
      onMouseLeave={() => {
        rx.set(0)
        ry.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

/** Calls tick every `ms` while mounted; returns the current step index. */
export function useTimer(ms: number, length: number) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % length), ms)
    return () => clearInterval(t)
  }, [ms, length])
  return [i, setI] as const
}

/** Counts up once visible, then re-counts on every timer tick. */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1800,
  everyMs,
}: {
  to: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  everyMs?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [val, setVal] = useState(0)
  const [run, setRun] = useState(0)

  useEffect(() => {
    if (!everyMs || !inView) return
    const t = setInterval(() => setRun((r) => r + 1), everyMs)
    return () => clearInterval(t)
  }, [everyMs, inView])

  useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setVal(to * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, run, to, duration])

  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}

/** Infinite horizontal marquee; `seconds` is the loop timer. */
export function Marquee({
  children,
  seconds = 30,
  reverse = false,
}: {
  children: ReactNode
  seconds?: number
  reverse?: boolean
}) {
  return (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      {[0, 1].map((k) => (
        <div
          key={k}
          aria-hidden={k === 1}
          className="flex shrink-0 items-center gap-16 pr-16 group-hover:[animation-play-state:paused]"
          style={{
            animation: `bz-marquee ${seconds}s linear infinite ${reverse ? "reverse" : "normal"}`,
          }}
        >
          {children}
        </div>
      ))}
    </div>
  )
}

/** Vertical auto-scrolling list; `seconds` is the loop timer. */
export function VerticalTicker({
  items,
  seconds = 24,
  reverse = false,
  className,
}: {
  items: string[]
  seconds?: number
  reverse?: boolean
  className?: string
}) {
  return (
    <div
      className={`overflow-hidden [mask-image:linear-gradient(180deg,transparent,#000_15%,#000_85%,transparent)] ${className ?? ""}`}
    >
      <div
        style={{
          animation: `bz-vertical ${seconds}s linear infinite ${reverse ? "reverse" : "normal"}`,
        }}
      >
        {[0, 1].map((k) => (
          <div key={k} className="space-y-2 pb-2">
            {items.map((t, i) => (
              <div key={`${k}-${i}`} className="whitespace-nowrap">
                {t}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
