import { type NextRequest, NextResponse } from "next/server"
import { getDb, isMongoConfigured } from "@/lib/db/mongodb"
import { loginSchema } from "@/lib/db/schemas"
import { verifyPassword } from "@/lib/auth/password"
import { signToken, setAuthCookie } from "@/lib/auth/jwt"

export async function POST(request: NextRequest) {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json(
        { error: "Database not configured. Please add MONGODB_URI to environment variables." },
        { status: 503 },
      )
    }

    const body = await request.json()
    console.log("[v0] Login request body:", { email: body.email })

    // Validate input
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      console.log("[v0] Validation error:", validation.error.errors)
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { email, password } = validation.data

    let db
    try {
      db = await getDb()
    } catch (dbError) {
      console.error("[v0] Database connection error:", dbError)
      return NextResponse.json(
        { error: "Unable to connect to database. Please check your MONGODB_URI." },
        { status: 503 },
      )
    }

    const usersCollection = db.collection("users")

    // Find user
    const user = await usersCollection.findOne({ email })
    if (!user) {
      console.log("[v0] User not found:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      console.log("[v0] Invalid password for user:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("[v0] Login successful for user:", email)

    // Generate JWT
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    })

    await setAuthCookie(token)

    return NextResponse.json({
      user: { id: user._id.toString(), email: user.email, name: user.name },
      message: "Login successful",
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
