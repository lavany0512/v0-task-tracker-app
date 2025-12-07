import { type NextRequest, NextResponse } from "next/server"
import { getDb, isMongoConfigured } from "@/lib/db/mongodb"
import { getSession } from "@/lib/auth/jwt"
import { createTaskSchema, type TaskStatus, type TaskPriority } from "@/lib/db/schemas"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isMongoConfigured()) {
      return NextResponse.json(
        { error: "Database not configured. Please add MONGODB_URI to environment variables." },
        { status: 503 },
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as TaskStatus | null
    const priority = searchParams.get("priority") as TaskPriority | null
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const dueDateFrom = searchParams.get("dueDateFrom")
    const dueDateTo = searchParams.get("dueDateTo")
    const skip = (page - 1) * limit

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

    const tasksCollection = db.collection("tasks")

    // Build query
    const query: Record<string, unknown> = { userId: session.userId }

    // Status filter
    if (status && status !== "All") {
      query.status = status
    }

    // Priority filter
    if (priority && priority !== "All") {
      query.priority = priority
    }

    // Search filter
    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    // Date range filter
    if (dueDateFrom || dueDateTo) {
      query.dueDate = {}
      if (dueDateFrom) {
        ;(query.dueDate as Record<string, unknown>).$gte = new Date(dueDateFrom)
      }
      if (dueDateTo) {
        ;(query.dueDate as Record<string, unknown>).$lte = new Date(dueDateTo)
      }
    }

    // Build sort options
    const sortOptions: Record<string, 1 | -1> = {}
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1

    console.log("[v0] Fetching tasks for user:", session.userId)

    const [tasks, total] = await Promise.all([
      tasksCollection.find(query).sort(sortOptions).skip(skip).limit(limit).toArray(),
      tasksCollection.countDocuments(query),
    ])

    console.log("[v0] Found tasks:", tasks.length, "total:", total)

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
    console.error("[v0] Get tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isMongoConfigured()) {
      return NextResponse.json(
        { error: "Database not configured. Please add MONGODB_URI to environment variables." },
        { status: 503 },
      )
    }

    const body = await request.json()
    console.log("[v0] Create task request:", body)

    // Validate input
    const validation = createTaskSchema.safeParse(body)
    if (!validation.success) {
      console.log("[v0] Validation error:", validation.error.errors)
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

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

    const tasksCollection = db.collection("tasks")

    const taskData = {
      ...validation.data,
      userId: session.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await tasksCollection.insertOne(taskData)
    console.log("[v0] Task created with ID:", result.insertedId.toString())

    return NextResponse.json({
      task: {
        _id: result.insertedId.toString(),
        ...validation.data,
        userId: session.userId,
        createdAt: taskData.createdAt,
        updatedAt: taskData.updatedAt,
      },
      message: "Task created successfully",
    })
  } catch (error) {
    console.error("[v0] Create task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
