import { NextResponse } from "next/server"

const buckets = new Map<string, { count: number; reset: number }>()

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwarded || "local"
}

export function rateLimit(key: string, limit = 60): boolean {
  const now = Date.now()
  const current = buckets.get(key)
  if (!current || now > current.reset) {
    buckets.set(key, { count: 1, reset: now + 60_000 })
    return true
  }
  current.count += 1
  return current.count <= limit
}

export function limited(request: Request): NextResponse | null {
  if (rateLimit(clientKey(request))) return null
  return NextResponse.json({ error: "Slow down a little." }, { status: 429 })
}

export function readBody(request: Request, max = 4_000): Promise<unknown> {
  const length = Number(request.headers.get("content-length") ?? 0)
  if (length > max) return Promise.reject(new Error("payload"))
  return request.text().then((text) => {
    if (text.length > max) throw new Error("payload")
    return text ? JSON.parse(text) : {}
  })
}
