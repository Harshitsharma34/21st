import type { Lifecycle, Verdict } from "./types"

const LINES: Record<string, Partial<Record<Verdict | Lifecycle, { line: string; subline: string }>>> = {
  manali: {
    SKIP: {
      line: "looks beautiful.\nwrong weekend.",
      subline: "Rooms are disappearing fast, and the weekend has not even started.",
    },
    MIXED: {
      line: "beautiful place.\nterrible timing.",
      subline: "The peaks will still be there. This weekend will not be kind.",
    },
    OVERHYPED: {
      line: "looks beautiful.\nwrong weekend.",
      subline: "Everyone already had the same idea.",
    },
  },
  tirthan: {
    GO: {
      line: "go here instead.",
      subline: "The river is up. The road is still ordinary.",
    },
    "WORTH A LOOK": {
      line: "go here instead.",
      subline: "Quieter than the highway towns, without being a secret.",
    },
  },
  shoja: {
    RISING: {
      line: "go before everyone else.",
      subline: "Interest is rising quickly, but visitor pressure has not caught up yet.",
    },
    GO: {
      line: "go before everyone else.",
      subline: "Interest is rising quickly, but visitor pressure has not caught up yet.",
    },
  },
  jibhi: {
    RISING: {
      line: "still a village.\nnot for long.",
      subline: "The reels arrived before the weekend traffic.",
    },
  },
  chakrata: {
    GO: {
      line: "the rooms are still there.",
      subline: "Hotels are unusually available for a hill town this close to Delhi.",
    },
  },
  bir: {
    GO: {
      line: "the sky is the point.",
      subline: "Weather is doing the work. The ridge is not packed yet.",
    },
  },
}

const FALLBACK: Record<Verdict, { line: string; subline: string }> = {
  GO: { line: "worth the drive.", subline: "The signals agree more than they argue." },
  "WORTH A LOOK": { line: "go with your eyes open.", subline: "Good enough, with one or two things pulling the other way." },
  MIXED: { line: "only if you already love it.", subline: "The place is fine. The timing is not doing you favours." },
  SKIP: { line: "save it for another week.", subline: "Crowds and rooms are both moving the wrong way." },
}

export function editorialLine(destinationId: string, verdict: Verdict, lifecycle: Lifecycle): { line: string; subline: string } {
  const table = LINES[destinationId]
  return table?.[verdict] ?? table?.[lifecycle] ?? FALLBACK[verdict]
}
