import React from "react"

import { Header } from "@/components/layout/header"
import { Toaster } from "@/components/ui/sonner"

import { Footer } from "@/components/layout/footer"
import { MotionProvider } from "@/components/providers/motion-provider"
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider"

export default function Template({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MotionProvider>
      <SmoothScrollProvider>
        <Header />
        {children}
        <Footer />
        <Toaster />
      </SmoothScrollProvider>
    </MotionProvider>
  )
}
