const express = require("express")
const mongoose = require("mongoose")
const Task = require("../models/Task")
const { authMiddleware } = require("../middleware/auth")
const { createTaskSchema, updateTaskSchema, validate } = require("../middleware/validate")

const router = express.Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

// GET /api/tasks - Get all tasks with filters and pagination
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      dueDateFrom,
      dueDateTo,
      tags,
    } = req.query

    const pageNum = Number.parseInt(page)
    const limitNum = Number.parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    // Build query
    const query = { userId: new mongoose.Types.ObjectId(req.user.userId) }

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
        query.dueDate.$gte = new Date(dueDateFrom)
      }
      if (dueDateTo) {
        query.dueDate.$lte = new Date(dueDateTo)
      }
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(",").map((t) => t.trim())
      query.tags = { $in: tagArray }
    }

    // Build sort
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1

    // Execute query with pagination
    const [tasks, total] = await Promise.all([
      Task.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Task.countDocuments(query),
    ])

    res.json({
      tasks: tasks.map((task) => ({
        ...task,
        _id: task._id.toString(),
        userId: task.userId.toString(),
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error("Get tasks error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/tasks/stats - Get task statistics
router.get("/stats", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId)

    const stats = await Task.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          todo: { $sum: { $cond: [{ $eq: ["$status", "To Do"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
          done: { $sum: { $cond: [{ $eq: ["$status", "Done"] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ["$priority", "High"] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [{ $lt: ["$dueDate", new Date()] }, { $ne: ["$status", "Done"] }],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ])

    res.json({
      stats: stats[0] || {
        total: 0,
        todo: 0,
        inProgress: 0,
        done: 0,
        highPriority: 0,
        overdue: 0,
      },
    })
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/tasks/:id - Get single task
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid task ID" })
    }

    const task = await Task.findOne({
      _id: id,
      userId: req.user.userId,
    }).lean()

    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }

    res.json({
      task: {
        ...task,
        _id: task._id.toString(),
        userId: task.userId.toString(),
      },
    })
  } catch (error) {
    console.error("Get task error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /api/tasks - Create new task
router.post("/", validate(createTaskSchema), async (req, res) => {
  try {
    const taskData = {
      ...req.validatedData,
      userId: req.user.userId,
    }

    if (taskData.dueDate) {
      taskData.dueDate = new Date(taskData.dueDate)
    }

    const task = await Task.create(taskData)

    res.status(201).json({
      task: {
        ...task.toObject(),
        _id: task._id.toString(),
        userId: task.userId.toString(),
      },
      message: "Task created successfully",
    })
  } catch (error) {
    console.error("Create task error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// PUT /api/tasks/:id - Update task
router.put("/:id", validate(updateTaskSchema), async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid task ID" })
    }

    const updateData = { ...req.validatedData }

    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate)
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean()

    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }

    res.json({
      task: {
        ...task,
        _id: task._id.toString(),
        userId: task.userId.toString(),
      },
      message: "Task updated successfully",
    })
  } catch (error) {
    console.error("Update task error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// DELETE /api/tasks/:id - Delete task
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid task ID" })
    }

    const result = await Task.deleteOne({
      _id: id,
      userId: req.user.userId,
    })

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Task not found" })
    }

    res.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Delete task error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

module.exports = router
