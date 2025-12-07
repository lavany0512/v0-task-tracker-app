import { type NextRequest, NextResponse } from "next/server"
import { getDb, isMongoConfigured } from "@/lib/db/mongodb"
import { registerSchema } from "@/lib/db/schemas"
import { hashPassword } from "@/lib/auth/password"
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
    console.log("[v0] Register request body:", body)

    // Validate input
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      console.log("[v0] Validation error:", validation.error.errors)
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { email, password, name } = validation.data

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

    // Check if user exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log("[v0] User created with ID:", result.insertedId.toString())

    // Generate JWT
    const token = await signToken({
      userId: result.insertedId.toString(),
      email,
      name,
    })

    await setAuthCookie(token)

    return NextResponse.json({
      user: { id: result.insertedId.toString(), email, name },
      message: "Registration successful",
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
