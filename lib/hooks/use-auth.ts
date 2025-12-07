"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: async () => {
        try {
          console.log("[v0] Logging out...")
          await fetch("/api/auth/logout", { method: "POST" })
          console.log("[v0] Logout complete")
          set({ user: null })
        } catch (error) {
          console.error("[v0] Logout error:", error)
          set({ user: null })
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    },
  ),
)

export function useAuth() {
  const { user, isLoading, setUser, setLoading, logout } = useAuthStore()

  const checkAuth = async () => {
    setLoading(true)
    try {
      console.log("[v0] Checking auth...")
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        console.log("[v0] Auth check success:", data.user.email)
        setUser(data.user)
      } else {
        console.log("[v0] Auth check failed, clearing user")
        setUser(null)
      }
    } catch (error) {
      console.error("[v0] Auth check error:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  return { user, isLoading, checkAuth, logout, setUser, setLoading }
}
