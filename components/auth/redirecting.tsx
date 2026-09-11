"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { RedirectLoading } from "@/components/auth/redirect-loading"

export function Redirecting({ destination }: { destination: string }) {
  const router = useRouter()

  useEffect(() => {
    router.replace(destination)
  }, [destination, router])

  return (
    <>
      <meta httpEquiv="refresh" content={`3;url=${destination}`} />
      <RedirectLoading />
    </>
  )
}
