import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDb, isMongoConfigured } from "@/lib/db/mongodb"
import { getSession } from "@/lib/auth/jwt"
import { updateTaskSchema } from "@/lib/db/schemas"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isMongoConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { id } = await params

    let db
    try {
      db = await getDb()
    } catch (dbError) {
      console.error("[v0] Database connection error:", dbError)
      return NextResponse.json({ error: "Unable to connect to database" }, { status: 503 })
    }

    const tasksCollection = db.collection("tasks")

    const task = await tasksCollection.findOne({
      _id: new ObjectId(id),
      userId: session.userId,
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({
      task: { ...task, _id: task._id.toString() },
    })
  } catch (error) {
    console.error("[v0] Get task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isMongoConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { id } = await params
    const body = await request.json()
    console.log("[v0] Update task request:", { id, body })

    // Validate input
    const validation = updateTaskSchema.safeParse(body)
    if (!validation.success) {
      console.log("[v0] Validation error:", validation.error.errors)
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    let db
    try {
      db = await getDb()
    } catch (dbError) {
      console.error("[v0] Database connection error:", dbError)
      return NextResponse.json({ error: "Unable to connect to database" }, { status: 503 })
    }

    const tasksCollection = db.collection("tasks")

    const result = await tasksCollection.findOneAndUpdate(
      { _id: new ObjectId(id), userId: session.userId },
      { $set: { ...validation.data, updatedAt: new Date() } },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    console.log("[v0] Task updated successfully:", id)

    return NextResponse.json({
      task: { ...result, _id: result._id.toString() },
      message: "Task updated successfully",
    })
  } catch (error) {
    console.error("[v0] Update task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isMongoConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { id } = await params
    console.log("[v0] Delete task request:", id)

    let db
    try {
      db = await getDb()
    } catch (dbError) {
      console.error("[v0] Database connection error:", dbError)
      return NextResponse.json({ error: "Unable to connect to database" }, { status: 503 })
    }

    const tasksCollection = db.collection("tasks")

    const result = await tasksCollection.deleteOne({
      _id: new ObjectId(id),
      userId: session.userId,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    console.log("[v0] Task deleted successfully:", id)

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("[v0] Delete task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
