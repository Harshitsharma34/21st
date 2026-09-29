"use client"

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion"
import { useRef, useState } from "react"
import {
  CountUp,
  Marquee,
  Parallax,
  Reveal,
  Tilt,
  VerticalTicker,
  useTimer,
} from "./motion"

const ORANGE = "#F26B1D"
const INK = "#15130F"
const CREAM = "#FCF9F4"

const serif = { fontFamily: "var(--font-bz-serif), Georgia, serif" } as const

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2
    style={serif}
    className="text-center text-[34px] leading-[1.1] tracking-tight md:text-[44px]"
  >
    {children}
  </h2>
)

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p
    className="mb-4 text-center text-[10px] font-medium uppercase tracking-[0.18em]"
    style={{ color: ORANGE }}
  >
    ● {children}
  </p>
)

const Btn = ({
  children,
  dark,
  orange,
}: {
  children: React.ReactNode
  dark?: boolean
  orange?: boolean
}) => (
  <motion.button
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.97 }}
    className="rounded-full px-5 py-2.5 text-[12px] font-medium"
    style={{
      background: orange ? ORANGE : dark ? INK : "transparent",
      color: dark || orange ? "#fff" : INK,
      border: dark || orange ? "none" : "1px solid rgba(0,0,0,.15)",
    }}
  >
    {children}
  </motion.button>
)

/* ───────────────────────── Nav ───────────────────────── */
function Nav() {
  return (
    <>
      <div
        className="flex items-center justify-center gap-2 py-1.5 text-center text-[10px] text-white/80"
        style={{ background: INK }}
      >
        <span style={{ color: ORANGE }}>●</span> New — Bizfoc now handles GST,
        ROC and TDS filings in one place
      </div>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-2 z-50 mx-auto mt-3 flex max-w-[1080px] items-center justify-between rounded-full bg-[#3a3835]/90 px-5 py-2.5 text-white backdrop-blur-md"
      >
        <span className="text-sm font-black tracking-[0.2em]">BIZFOC</span>
        <nav className="hidden gap-6 text-[11px] text-white/80 md:flex">
          {["Product", "Solutions", "Pricing", "Resources", "Company"].map(
            (l) => (
              <a key={l} href="#" className="transition hover:text-white">
                {l}
              </a>
            ),
          )}
        </nav>
        <div className="flex items-center gap-2">
          <button className="hidden text-[11px] text-white/80 md:block">
            Sign in
          </button>
          <button
            className="rounded-full px-4 py-1.5 text-[11px] font-medium"
            style={{ background: ORANGE }}
          >
            Book a demo
          </button>
        </div>
      </motion.header>
    </>
  )
}

/* ───────────────────────── Hero ───────────────────────── */
function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const bars = useTransform(scrollYProgress, [0, 1], [0, 140])
  const text = useTransform(scrollYProgress, [0, 1], [0, -60])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const N = 22

  return (
    <section ref={ref} className="relative overflow-hidden pb-10 pt-14">
      <motion.div
        style={{ y: text, opacity: fade }}
        className="relative z-10 mx-auto max-w-[620px] px-4 text-center"
      >
        <Reveal>
          <h1
            style={serif}
            className="text-[40px] leading-[1.05] tracking-tight md:text-[58px]"
          >
            Expert Solution For
            <br />
            Every Business Challenge
          </h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-4 max-w-[420px] text-[12px] leading-relaxed text-black/55">
            Bizfoc handles registrations, filings and ongoing compliance for
            your business, backed by experts and powered by AI.
          </p>
        </Reveal>
        <Reveal delay={0.25}>
          <div className="mt-5 flex justify-center gap-2">
            <Btn dark>Book a demo</Btn>
            <Btn>Explore features</Btn>
          </div>
        </Reveal>
      </motion.div>

      {/* Orange striped V */}
      <motion.div
        style={{ y: bars }}
        className="pointer-events-none relative mx-auto mt-8 flex h-[300px] max-w-[1200px] items-end gap-[2px] px-2 md:h-[380px]"
      >
        {Array.from({ length: N }).map((_, i) => {
          const mid = (N - 1) / 2
          const d = Math.abs(i - mid) / mid // 0 center → 1 edge
          const h = 30 + d * 70
          return (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{
                duration: 1.1,
                delay: 0.3 + Math.abs(i - mid) * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                height: `${h}%`,
                transformOrigin: "bottom",
                background: `linear-gradient(180deg, ${ORANGE} 0%, #F9A66B 45%, ${CREAM} 100%)`,
                opacity: 0.55 + d * 0.45,
              }}
              className="flex-1"
            />
          )
        })}
        <div
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{ background: `linear-gradient(0deg, ${CREAM}, transparent)` }}
        />
      </motion.div>
    </section>
  )
}

/* ───────────────────────── Logos ───────────────────────── */
const logos = ["PYTCH", "Ribbolo", "Pandowealth", "CloudX", "BIZA", "Finora", "Kairo"]
function Logos() {
  const [active, setActive] = useTimer(2500, logos.length)
  return (
    <section className="py-8">
      <Reveal>
        <Eyebrow>Trusted by 2,000+ growing businesses across India</Eyebrow>
      </Reveal>
      <Marquee seconds={28}>
        {logos.map((l, i) => (
          <span
            key={l}
            onMouseEnter={() => setActive(i)}
            className="text-[15px] font-semibold tracking-tight transition-all duration-500"
            style={{
              color: active === i ? INK : "rgba(0,0,0,.35)",
              transform: active === i ? "scale(1.12)" : "scale(1)",
            }}
          >
            {l}
          </span>
        ))}
      </Marquee>
    </section>
  )
}

/* ───────────────────────── Move fast ───────────────────────── */
const fast = [
  { tag: "GST", t: "Every filing, on time — Compliance Trust", hue: "#E9E2D6" },
  { tag: "ROC", t: "Scale into India without scaling your legal headcount", hue: "#EDE5D8" },
  { tag: "TDS", t: "One partner, every filing, for the life of your business", hue: "#E6DED0" },
]
function MoveFast() {
  return (
    <section className="mx-auto max-w-[1000px] px-4 py-16">
      <Reveal>
        <H2>
          Move fast without the
          <br />
          compliance risk
        </H2>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {fast.map((c, i) => (
          <Reveal key={c.tag} delay={i * 0.12}>
            <Tilt className="overflow-hidden rounded-xl bg-white shadow-[0_1px_0_rgba(0,0,0,.06)]">
              <div
                className="relative flex h-[130px] items-center justify-center overflow-hidden"
                style={{ background: c.hue }}
              >
                <Parallax speed={0.4} className="absolute inset-0">
                  <div className="flex h-full items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 18 + i * 4, repeat: Infinity, ease: "linear" }}
                      className="h-14 w-14 rounded-full border-[6px]"
                      style={{ borderColor: i === 1 ? ORANGE : INK, borderStyle: i === 0 ? "dotted" : "solid" }}
                    />
                  </div>
                </Parallax>
              </div>
              <div className="p-4">
                <p className="text-[9px] font-semibold uppercase" style={{ color: ORANGE }}>
                  ● {c.tag}
                </p>
                <p className="mt-1 text-[12px] leading-snug text-black/70">{c.t}</p>
              </div>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ───────────────────────── Understands ───────────────────────── */
const points = [
  { t: "Never miss a filing", d: "Automated reminders and deadline tracking for every registration." },
  { t: "One record, every entry", d: "Your company, directors, documents and filings live in a single source of truth that stays audit-ready." },
  { t: "Accuracy as standard", d: "Every return is reviewed by a specialist before submission." },
  { t: "Faster than manual, always", d: "AI pre-fills forms so filings take hours, not weeks." },
]
function Understands() {
  const [i, setI] = useTimer(3500, points.length)
  return (
    <section className="mx-auto max-w-[1000px] px-4 py-16">
      <Reveal>
        <H2>
          Bizfoc understands Indian
          <br />
          compliance, so you don&apos;t have to
        </H2>
      </Reveal>
      <div className="mt-12 grid items-center gap-10 md:grid-cols-2">
        <Reveal>
          <Parallax speed={0.3}>
            <div
              className="h-[230px] w-[200px] rounded-xl blur-[1px]"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #8a7a66, #4a4038 55%, #2b251f)",
              }}
            />
          </Parallax>
        </Reveal>
        <div>
          {points.map((p, k) => (
            <button
              key={p.t}
              onClick={() => setI(k)}
              className="relative block w-full py-3 pl-4 text-left"
            >
              <span className="absolute left-0 top-0 h-full w-[2px] bg-black/10">
                {i === k && (
                  <motion.span
                    key={`${k}-${i}`}
                    initial={{ height: 0 }}
                    animate={{ height: "100%" }}
                    transition={{ duration: 3.5, ease: "linear" }}
                    className="absolute left-0 top-0 w-full"
                    style={{ background: "#E5484D" }}
                  />
                )}
              </span>
              <span
                className="text-[12px] transition-colors"
                style={{ color: i === k ? INK : "rgba(0,0,0,.4)" }}
              >
                {p.t}
              </span>
              <AnimatePresence initial={false}>
                {i === k && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pt-1 text-[10px] leading-relaxed text-black/50"
                  >
                    {p.d}
                  </motion.p>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── Results ───────────────────────── */
function Results() {
  const stats = [
    { who: "Series A SaaS Company", to: 10, prefix: "$", suffix: "B+", cap: "annual spend routed through compliant entities" },
    { who: "European Manufacturing Entity", to: 30, suffix: "M+", cap: "transactions reconciled for GST" },
    { who: "D2C Retail Brand", to: 115, suffix: "M", cap: "monthly sales tracked and filed" },
  ]
  return (
    <section className="mx-auto max-w-[1000px] px-4 py-16">
      <Reveal>
        <H2>
          Let the results speak
          <br />
          for themselves
        </H2>
      </Reveal>
      <div className="mt-10 grid gap-3 md:grid-cols-3">
        {stats.map((s, i) => (
          <Reveal key={s.who} delay={i * 0.12}>
            <motion.div
              whileHover={{ y: -6 }}
              className="flex h-[190px] flex-col justify-between rounded-lg p-4"
              style={{ background: "#F6EBDD" }}
            >
              <div className="flex justify-between gap-6 text-[8px] text-black/50">
                <span>{s.who}</span>
                <span className="max-w-[110px] text-right">{s.cap}</span>
              </div>
              <div style={serif} className="text-[44px] leading-none">
                <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} everyMs={9000} />
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <p className="mx-auto mt-6 max-w-[560px] text-center text-[8px] leading-relaxed text-black/40">
          Results are illustrative of customer outcomes and may vary depending
          on business size, sector and filing history.
        </p>
      </Reveal>
    </section>
  )
}

/* ───────────────────────── Bento ───────────────────────── */
function Toggle({ on: init }: { on: boolean }) {
  const [on, setOn] = useState(init)
  return (
    <button
      onClick={() => setOn(!on)}
      className="relative h-4 w-7 rounded-full transition-colors"
      style={{ background: on ? ORANGE : "#d4d0c8" }}
    >
      <motion.span
        layout
        className="absolute top-0.5 h-3 w-3 rounded-full bg-white"
        style={{ left: on ? 14 : 2 }}
      />
    </button>
  )
}

function Bento() {
  const card = "rounded-xl border border-black/[0.06] bg-[#F4F1EB] p-4"
  return (
    <section className="mx-auto max-w-[1000px] px-4 py-16">
      <Reveal>
        <H2>
          Every business is different,
          <br />
          and so is Bizfoc
        </H2>
      </Reveal>
      <div className="mt-10 grid gap-3 md:grid-cols-5">
        <Reveal className="md:col-span-3">
          <Tilt className={`${card} h-[270px] overflow-hidden`}>
            <p className="text-[11px] font-medium">Dedicated compliance experts</p>
            <p className="text-[8px] text-black/50">Every account is paired with a named specialist.</p>
            <div className="relative mx-auto mt-3 flex h-[190px] w-[190px] items-center justify-center">
              {[190, 130].map((s, k) => (
                <motion.div
                  key={s}
                  animate={{ rotate: k ? -360 : 360 }}
                  transition={{ duration: 26 - k * 8, repeat: Infinity, ease: "linear" }}
                  className="absolute rounded-full border border-black/15"
                  style={{ width: s, height: s }}
                >
                  <span
                    className="absolute -top-2 left-1/2 h-4 w-4 rounded-full bg-[#8e7a63]"
                    style={{ marginLeft: -8 }}
                  />
                </motion.div>
              ))}
              <div
                className="h-14 w-14 rounded-full"
                style={{ background: `radial-gradient(circle at 35% 30%, #FFC89B, ${ORANGE})`, boxShadow: `0 0 40px ${ORANGE}88` }}
              />
            </div>
          </Tilt>
        </Reveal>
        <Reveal className="md:col-span-2" delay={0.1}>
          <div className={`${card} h-[270px]`}>
            <p className="text-[11px] font-medium">Configurable workflows</p>
            <p className="text-[8px] text-black/50">Shape approvals around how your team works.</p>
            <div className="mt-4 space-y-2">
              {["Auto-file GST returns", "Notify finance on due dates", "Require director sign-off"].map((t, k) => (
                <div key={t} className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-[9px]">
                  {t}
                  <Toggle on={k !== 2} />
                </div>
              ))}
              <div className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-[9px] text-black/40">
                Create new rule…
                <span className="rounded bg-black px-2 py-0.5 text-white">Save</span>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="md:col-span-2">
          <div className={`${card} h-[210px]`}>
            <p className="text-[11px] font-medium">One company profile</p>
            <p className="text-[8px] text-black/50">A single record of your entity.</p>
            <div className="mt-4 flex flex-col items-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="h-12 w-12 rounded-full"
                style={{ background: "linear-gradient(135deg,#2c6e8f,#9fd0e6)" }}
              />
              <p className="mt-2 text-[9px] font-medium">Ananya Sharma</p>
              <p className="text-[8px] text-black/40">Director · Bengaluru</p>
            </div>
          </div>
        </Reveal>
        <Reveal className="md:col-span-2" delay={0.1}>
          <div className={`${card} h-[210px]`}>
            <p className="text-[11px] font-medium">Real-time compliance dashboard</p>
            <p className="text-[8px] text-black/50">See what&apos;s due, done and at risk.</p>
            <div className="mt-5 flex items-end gap-3">
              <div className="text-[26px] leading-none" style={serif}>
                <CountUp to={42} suffix="/48" everyMs={7000} />
              </div>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "87%" }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                  className="h-full"
                  style={{ background: ORANGE }}
                />
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal className="md:col-span-1" delay={0.2}>
          <div className={`${card} h-[210px]`}>
            <p className="text-[11px] font-medium">Robust permissions</p>
            <div className="mt-4 space-y-1.5 text-[8px]">
              {["Admin", "Finance", "Viewer"].map((r, k) => (
                <div key={r} className="flex justify-between rounded bg-white px-2 py-1.5">
                  {r}
                  <span className="text-black/40">{k === 2 ? "Read" : "Edit"}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ───────────────────────── AI gradient card ───────────────────────── */
function GradientCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"])
  return (
    <div ref={ref} className={`relative overflow-hidden rounded-2xl ${className}`}>
      <motion.div
        style={{
          y,
          background:
            "radial-gradient(120% 90% at 20% 0%, #c9873f 0%, #6b5a4a 40%, #2f3a4d 75%, #1f2735 100%)",
        }}
        className="absolute inset-x-0 -inset-y-[15%]"
      />
      <div className="relative">{children}</div>
    </div>
  )
}

function AiCard() {
  const items = [
    { to: 2000, suffix: "+", l: "Businesses served" },
    { to: 50, suffix: "+", l: "Services" },
    { to: 10000, suffix: "+", l: "Filings completed" },
    { text: "PAN-India", l: "Coverage" },
  ]
  return (
    <section className="mx-auto max-w-[1080px] px-4 py-10">
      <Reveal>
        <GradientCard className="px-6 py-14 text-white md:px-12">
          <h2 style={serif} className="text-[36px] leading-[1.1] md:text-[46px]">
            AI-driven built for scale.
            <br />
            Proven by every filing.
          </h2>
          <div className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-4">
            {items.map((s) => (
              <div key={s.l} className="border-t border-white/25 pt-3">
                <p className="text-[8px] text-white/60">{s.l}</p>
                <p style={serif} className="mt-4 text-[30px] leading-none">
                  {"to" in s ? <CountUp to={s.to!} suffix={s.suffix} everyMs={10000} /> : s.text}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Btn orange>Book a demo</Btn>
          </div>
        </GradientCard>
      </Reveal>
    </section>
  )
}

/* ───────────────────────── Old vs Bizfoc ───────────────────────── */
function Ways() {
  const old = ["Deadlines tracked in spreadsheets", "Documents scattered across email", "Multiple vendors per filing", "Manual follow-ups with consultants"]
  const bz = ["One dashboard for every filing and deadline", "Deadlines auto-tracked and reminded", "AI pre-fills, experts review", "Documents collected and stored securely", "Audit-ready records at all times"]
  return (
    <section className="mx-auto max-w-[900px] px-4 py-16">
      <Reveal>
        <H2>
          Improve your compliance
          <br />
          workflow, the Bizfoc way
        </H2>
      </Reveal>
      <div className="mt-10 grid gap-3 md:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-xl bg-[#F1EEE8] p-5">
            <p className="text-[8px] uppercase text-black/40">Before</p>
            <p style={serif} className="mt-1 text-[20px]">The old way</p>
            <ul className="mt-4 space-y-3 text-[10px] text-black/55">
              {old.map((t, i) => (
                <motion.li key={t} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1 }}>
                  ✕ {t}
                </motion.li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="h-full rounded-xl border border-black/[0.06] bg-white p-5">
            <p className="text-[8px] uppercase" style={{ color: ORANGE }}>Now</p>
            <p style={serif} className="mt-1 text-[20px]">✦ The Bizfoc way</p>
            <ul className="mt-4 space-y-3 text-[10px] text-black/70">
              {bz.map((t, i) => (
                <motion.li key={t} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1 }}>
                  <span style={{ color: ORANGE }}>✓</span> {t}
                </motion.li>
              ))}
            </ul>
            <div className="mt-6">
              <Btn dark>Book a demo →</Btn>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ───────────────────────── 10,000+ filings ticker ───────────────────────── */
const left = ["GST-R1 filed · Mumbai", "TDS 26Q filed · Pune", "ROC AOC-4 filed · Delhi", "PF return filed · Chennai", "ITR-6 filed · Bengaluru", "DIR-3 KYC filed · Jaipur", "GSTR-3B filed · Kolkata", "MGT-7 filed · Hyderabad"]
const right = ["Trademark filed · Surat", "LUT renewed · Noida", "ESI return filed · Indore", "MSME registered · Kochi", "Payroll TDS filed · Gurugram", "ADT-1 filed · Lucknow", "GSTR-9 filed · Ahmedabad", "INC-20A filed · Nagpur"]

function FilingsTicker() {
  return (
    <section className="mx-auto max-w-[1080px] px-4 py-10">
      <Reveal>
        <GradientCard className="h-[380px] text-white">
          <div className="absolute inset-y-0 left-0 hidden w-[240px] p-6 text-[8px] leading-none text-white/55 md:block">
            <VerticalTicker items={left} seconds={22} className="h-[380px] -mt-6" />
          </div>
          <div className="absolute inset-y-0 right-0 hidden w-[240px] p-6 text-right text-[8px] leading-none text-white/55 md:block">
            <VerticalTicker items={right} seconds={30} reverse className="h-[380px] -mt-6" />
          </div>
          <div className="flex h-[380px] flex-col items-center justify-center text-center">
            <p style={serif} className="text-[44px] leading-none md:text-[54px]">
              <CountUp to={10000} suffix="+" everyMs={12000} />
            </p>
            <p className="mt-2 text-[14px] text-white/80">
              filings completed, zero
              <br />
              missed deadlines
            </p>
          </div>
        </GradientCard>
      </Reveal>
    </section>
  )
}

/* ───────────────────────── Data protection ───────────────────────── */
function Protect() {
  return (
    <section className="relative mx-auto max-w-[1000px] overflow-hidden px-4 pb-24 pt-16 text-center">
      <Reveal>
        <Eyebrow>Security and privacy</Eyebrow>
        <H2>We protect your data</H2>
        <p className="mx-auto mt-3 max-w-[380px] text-[10px] leading-relaxed text-black/50">
          Enterprise-grade encryption, role-based access and full audit trails
          keep your company information safe.
        </p>
        <div className="mt-5">
          <Btn dark>Learn more</Btn>
        </div>
      </Reveal>
      <Parallax speed={0.6} className="mt-14 h-[120px]">
        <div
          className="mx-auto h-full w-full max-w-[700px] [mask-image:radial-gradient(closest-side,#000,transparent)]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(0,0,0,.18) 0 1px, transparent 1px 14px), repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 1px, transparent 1px 14px)",
            transform: "perspective(400px) rotateX(58deg)",
          }}
        />
      </Parallax>
    </section>
  )
}

/* ───────────────────────── CTA ───────────────────────── */
function Cta() {
  return (
    <section className="mx-auto max-w-[1080px] px-4 py-10">
      <Reveal>
        <GradientCard className="px-8 py-20 text-white">
          <h2 style={serif} className="max-w-[300px] text-[26px] leading-tight">
            Your compliance partner for doing business in India.
          </h2>
          <div className="mt-5 flex items-center gap-4">
            <Btn orange>Book a demo</Btn>
            <a href="#" className="text-[11px] text-white/70 hover:text-white">
              Talk to sales
            </a>
          </div>
        </GradientCard>
      </Reveal>
    </section>
  )
}

/* ───────────────────────── Footer ───────────────────────── */
function Footer() {
  const cols = [
    ["Product", "Features", "Pricing", "Integrations", "Security", "Changelog"],
    ["Company", "About", "Careers", "Contact", "Blog"],
    ["Resources", "Guides", "Help center", "Compliance calendar", "Webinars"],
  ]
  return (
    <footer className="mx-auto max-w-[1080px] px-4 pb-6">
      <div className="relative overflow-hidden rounded-2xl px-8 pb-6 pt-10 text-white" style={{ background: "#100E0B" }}>
        <div className="grid gap-10 md:grid-cols-[1.2fr_2fr]">
          <div>
            <p style={serif} className="text-[20px] leading-tight">
              Take control of your AI
              <br />
              customer experiences
            </p>
            <form className="mt-4 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                placeholder="Work email"
                className="w-full max-w-[180px] rounded-md bg-white/10 px-3 py-2 text-[10px] outline-none placeholder:text-white/40 focus:bg-white/15"
              />
              <button className="rounded-md px-3 text-[10px]" style={{ background: ORANGE }}>
                Subscribe
              </button>
            </form>
          </div>
          <div className="grid grid-cols-3 gap-4 text-[9px]">
            {cols.map(([h, ...ls]) => (
              <div key={h}>
                <p className="mb-3 text-white/40">{h}</p>
                <ul className="space-y-2">
                  {ls.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-white/80 transition hover:text-white">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <Parallax speed={0.3}>
          <p
            aria-hidden
            className="mt-16 select-none text-center font-black leading-none tracking-[0.05em] text-white/[0.06]"
            style={{ fontSize: "clamp(80px, 18vw, 220px)" }}
          >
            BIZFOC
          </p>
        </Parallax>
        <div className="flex justify-between text-[8px] text-white/40">
          <span>© 2026 Bizfoc. All rights reserved.</span>
          <span>Privacy · Terms · Cookies</span>
        </div>
      </div>
    </footer>
  )
}

export default function BizfocPage() {
  return (
    <div
      className="-mx-4 min-h-screen overflow-x-clip"
      style={{ background: CREAM, color: INK, fontFamily: "var(--font-bz-sans), system-ui, sans-serif" }}
    >
      <style>{`
        @keyframes bz-marquee { from { transform: translateX(0) } to { transform: translateX(-100%) } }
        @keyframes bz-vertical { from { transform: translateY(0) } to { transform: translateY(-50%) } }
        @media (prefers-reduced-motion: reduce) { [style*="bz-"] { animation: none !important } }
      `}</style>
      <Nav />
      <Hero />
      <Logos />
      <MoveFast />
      <Understands />
      <Results />
      <Bento />
      <AiCard />
      <Ways />
      <FilingsTicker />
      <Protect />
      <Cta />
      <Footer />
    </div>
  )
}
