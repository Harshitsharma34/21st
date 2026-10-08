import { buildBoard, DEFAULT_PREFS, type CrowdTolerance, type TripType } from "@repo/hype-engine"
import { NextResponse } from "next/server"
import { z } from "zod"
import { limited } from "../../../lib/http"

const querySchema = z.object({
  people: z.coerce.number().int().min(1).max(12).default(2),
  hours: z.coerce.number().min(2).max(20).default(12),
  trip: z.enum(["mountains", "adventure", "relax", "food", "nightlife", "romantic", "family", "spiritual", "nature", "roadtrip"]).default("mountains"),
  tolerance: z.enum(["quiet", "balanced", "festive"]).default("balanced"),
  budget: z.coerce.number().int().positive().max(2_000_000).optional(),
})

export async function GET(request: Request) {
  const blocked = limited(request)
  if (blocked) return blocked
  const url = new URL(request.url)
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams))
  if (!parsed.success) return NextResponse.json({ error: "Those trip details do not parse." }, { status: 400 })
  const board = buildBoard({
    ...DEFAULT_PREFS,
    people: parsed.data.people,
    maxTravelHours: parsed.data.hours,
    tripType: parsed.data.trip as TripType,
    crowdTolerance: parsed.data.tolerance as CrowdTolerance,
    budgetInr: parsed.data.budget ?? null,
  })
  return NextResponse.json(board)
}
