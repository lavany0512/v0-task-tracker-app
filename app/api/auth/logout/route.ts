import { NextResponse } from "next/server"
import { clearAuthCookie } from "@/lib/auth/jwt"

export async function POST() {
  try {
    console.log("[v0] Logout request")
    await clearAuthCookie()
    console.log("[v0] Logout successful")
    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
