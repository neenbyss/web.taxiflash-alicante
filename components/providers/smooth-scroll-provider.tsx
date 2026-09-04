"use client"

import dynamic from "next/dynamic"

import { useIsMobile } from "@/hooks/use-mobile"

const ReactLenis = dynamic(
  () => import("lenis/react").then((module) => module.ReactLenis),
  { ssr: false }
)

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()

  if (isMobile) return children

  return <ReactLenis root>{children}</ReactLenis>
}
