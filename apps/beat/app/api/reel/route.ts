import { buildBoard, DEFAULT_PREFS, readReel } from "@repo/hype-engine"
import { NextResponse } from "next/server"
import { z } from "zod"
import { limited, readBody } from "../../../lib/http"

const bodySchema = z.object({
  url: z.string().trim().min(4).max(500),
  note: z.string().trim().max(280).optional(),
})

export async function POST(request: Request) {
  const blocked = limited(request)
  if (blocked) return blocked
  try {
    const json = await readBody(request)
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: "Paste a link, not a novel." }, { status: 400 })
    const board = buildBoard(DEFAULT_PREFS)
    const reading = readReel(parsed.data, board.destinations)
    return NextResponse.json(reading)
  } catch {
    return NextResponse.json({ error: "That paste could not be read." }, { status: 400 })
  }
}
