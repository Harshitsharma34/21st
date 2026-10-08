import { buildBoard, DEFAULT_PREFS } from "@repo/hype-engine"
import { AppShell } from "../components/app-shell"

export const dynamic = "force-dynamic"

export default function Page() {
  const board = buildBoard(DEFAULT_PREFS)
  return <AppShell initial={board} />
}
