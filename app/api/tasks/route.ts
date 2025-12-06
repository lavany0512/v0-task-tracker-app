import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db/mongodb"
import { getSession } from "@/lib/auth/jwt"
import { createTaskSchema, type TaskStatus } from "@/lib/db/schemas"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as TaskStatus | null
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const db = await getDb()
    const tasksCollection = db.collection("tasks")

    // Build query
    const query: Record<string, unknown> = { userId: session.userId }

    if (status && status !== "All") {
      query.status = status
    }

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    const [tasks, total] = await Promise.all([
      tasksCollection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      tasksCollection.countDocuments(query),
    ])

    return NextResponse.json({
      tasks: tasks.map((task) => ({
        ...task,
        _id: task._id.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validation = createTaskSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const db = await getDb()
    const tasksCollection = db.collection("tasks")

    const result = await tasksCollection.insertOne({
      ...validation.data,
      userId: session.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      task: {
        _id: result.insertedId.toString(),
        ...validation.data,
        userId: session.userId,
      },
      message: "Task created successfully",
    })
  } catch (error) {
    console.error("Create task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
