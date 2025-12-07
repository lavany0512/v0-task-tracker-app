const request = require("supertest")
const mongoose = require("mongoose")
const app = require("../index")
const User = require("../models/User")

describe("Auth Routes", () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI)
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  beforeEach(async () => {
    await User.deleteMany({})
  })

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      })

      expect(res.statusCode).toBe(201)
      expect(res.body.user).toHaveProperty("email", "test@example.com")
    })

    it("should reject duplicate email", async () => {
      await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      })

      const res = await request(app).post("/api/auth/register").send({
        name: "Test User 2",
        email: "test@example.com",
        password: "password456",
      })

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe("Email already registered")
    })
  })

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      })
    })

    it("should login with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      })

      expect(res.statusCode).toBe(200)
      expect(res.body.user).toHaveProperty("email", "test@example.com")
    })

    it("should reject invalid password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      })

      expect(res.statusCode).toBe(401)
    })
  })
})
