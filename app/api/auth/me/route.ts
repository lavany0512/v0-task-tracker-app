import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/jwt"

export async function GET() {
  try {
    const session = await getSession()
    console.log("[v0] Session check:", session ? "Found" : "Not found")

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
      },
    })
  } catch (error) {
    console.error("[v0] Get session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
