const request = require("supertest")
const mongoose = require("mongoose")
const app = require("../index")
const User = require("../models/User")
const Task = require("../models/Task")

describe("Task Routes", () => {
  let authCookie
  let userId

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI)
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  beforeEach(async () => {
    await User.deleteMany({})
    await Task.deleteMany({})

    // Register and login
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    })

    userId = registerRes.body.user.id
    authCookie = registerRes.headers["set-cookie"]
  })

  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const res = await request(app).post("/api/tasks").set("Cookie", authCookie).send({
        title: "Test Task",
        description: "Test description",
        priority: "High",
        status: "To Do",
      })

      expect(res.statusCode).toBe(201)
      expect(res.body.task).toHaveProperty("title", "Test Task")
    })

    it("should reject task without title", async () => {
      const res = await request(app).post("/api/tasks").set("Cookie", authCookie).send({
        description: "No title task",
      })

      expect(res.statusCode).toBe(400)
    })
  })

  describe("GET /api/tasks", () => {
    beforeEach(async () => {
      await Task.create([
        { title: "Task 1", userId, priority: "High", status: "To Do" },
        { title: "Task 2", userId, priority: "Low", status: "Done" },
        { title: "Task 3", userId, priority: "Medium", status: "In Progress" },
      ])
    })

    it("should get all tasks for user", async () => {
      const res = await request(app).get("/api/tasks").set("Cookie", authCookie)

      expect(res.statusCode).toBe(200)
      expect(res.body.tasks).toHaveLength(3)
    })

    it("should filter tasks by status", async () => {
      const res = await request(app).get("/api/tasks?status=To Do").set("Cookie", authCookie)

      expect(res.statusCode).toBe(200)
      expect(res.body.tasks).toHaveLength(1)
      expect(res.body.tasks[0].status).toBe("To Do")
    })

    it("should filter tasks by priority", async () => {
      const res = await request(app).get("/api/tasks?priority=High").set("Cookie", authCookie)

      expect(res.statusCode).toBe(200)
      expect(res.body.tasks).toHaveLength(1)
      expect(res.body.tasks[0].priority).toBe("High")
    })
  })

  describe("PUT /api/tasks/:id", () => {
    let taskId

    beforeEach(async () => {
      const task = await Task.create({
        title: "Original Task",
        userId,
        priority: "Low",
        status: "To Do",
      })
      taskId = task._id.toString()
    })

    it("should update task", async () => {
      const res = await request(app).put(`/api/tasks/${taskId}`).set("Cookie", authCookie).send({
        title: "Updated Task",
        status: "Done",
      })

      expect(res.statusCode).toBe(200)
      expect(res.body.task.title).toBe("Updated Task")
      expect(res.body.task.status).toBe("Done")
    })
  })

  describe("DELETE /api/tasks/:id", () => {
    let taskId

    beforeEach(async () => {
      const task = await Task.create({
        title: "Task to Delete",
        userId,
        priority: "Low",
        status: "To Do",
      })
      taskId = task._id.toString()
    })

    it("should delete task", async () => {
      const res = await request(app).delete(`/api/tasks/${taskId}`).set("Cookie", authCookie)

      expect(res.statusCode).toBe(200)

      const task = await Task.findById(taskId)
      expect(task).toBeNull()
    })
  })
})
