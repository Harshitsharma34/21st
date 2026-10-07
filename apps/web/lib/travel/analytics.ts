type AnalyticsEvent =
  | "ad_cta_clicked"
  | "landing_cta_clicked"
  | "card_selected"
  | "card_removed"
  | "recommendations_generated"
  | "recommendation_viewed"
  | "why_recommended_opened"
  | "all_offers_viewed"
  | "offer_selected"
  | "ota_redirect_clicked"
  | "offer_error_reported"
  | "trip_opportunity_impression"
  | "trip_opportunity_opened"
  | "trip_opportunity_dismissed"
  | "trip_preference_started"
  | "trip_preference_completed"
  | "30sundays_redirect_clicked"

export function trackEvent(
  name: AnalyticsEvent,
  payload?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return
  const entry = { event: name, ts: Date.now(), ...payload }
  console.info("[travel-analytics]", entry)
  const key = "travel_analytics_log"
  try {
    const prev = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[]
    prev.push(entry)
    localStorage.setItem(key, JSON.stringify(prev.slice(-100)))
  } catch {
    /* ignore */
  }
}
