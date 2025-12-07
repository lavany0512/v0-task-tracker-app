const { z } = require("zod")

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().max(500, "Description too long").optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  status: z.enum(["To Do", "In Progress", "Done"]).default("To Do"),
  tags: z.array(z.string()).optional(),
})

const updateTaskSchema = createTaskSchema.partial()

// Validation middleware factory
const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: result.error.errors[0].message,
        errors: result.error.errors,
      })
    }
    req.validatedData = result.data
    next()
  } catch (error) {
    return res.status(400).json({ error: "Validation error" })
  }
}

module.exports = {
  registerSchema,
  loginSchema,
  createTaskSchema,
  updateTaskSchema,
  validate,
}
