"use client"

import { GoogleAnalytics } from "@next/third-parties/google"
import { useSyncExternalStore } from "react"

const CONSENT_KEY = "taxiflash-consent"
const CONSENT_EVENT = "taxiflash-consent-change"

function subscribe(callback: () => void) {
  window.addEventListener(CONSENT_EVENT, callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener(CONSENT_EVENT, callback)
    window.removeEventListener("storage", callback)
  }
}

function hasAnalyticsConsent() {
  try {
    const value = localStorage.getItem(CONSENT_KEY)
    return value ? JSON.parse(value).cookies === true : false
  } catch {
    return false
  }
}

export function ConsentAwareGoogleAnalytics({ gaId }: { gaId?: string }) {
  const allowed = useSyncExternalStore(
    subscribe,
    hasAnalyticsConsent,
    () => false
  )
  if (!gaId || !allowed) return null
  return <GoogleAnalytics gaId={gaId} />
}
