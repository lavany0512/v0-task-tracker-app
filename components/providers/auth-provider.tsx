"use client"

import { useEffect, type ReactNode } from "react"
import { useAuth } from "@/lib/hooks/use-auth"

export function AuthProvider({ children }: { children: ReactNode }) {
  const { checkAuth } = useAuth()

  useEffect(() => {
    checkAuth()
  }, [])

  return <>{children}</>
}
