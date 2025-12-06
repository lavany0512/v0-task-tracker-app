import { z } from "zod"

// User Schema
export const userSchema = z.object({
  _id: z.any().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
})

// Task Schema
export const taskPriority = z.enum(["Low", "Medium", "High"])
export const taskStatus = z.enum(["To Do", "In Progress", "Done"])

export const taskSchema = z.object({
  _id: z.any().optional(),
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().max(500, "Description too long").optional(),
  dueDate: z.string().optional(),
  priority: taskPriority.default("Medium"),
  status: taskStatus.default("To Do"),
  userId: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const createTaskSchema = taskSchema.omit({ _id: true, userId: true, createdAt: true, updatedAt: true })
export const updateTaskSchema = createTaskSchema.partial()

export type User = z.infer<typeof userSchema>
export type Task = z.infer<typeof taskSchema>
export type TaskPriority = z.infer<typeof taskPriority>
export type TaskStatus = z.infer<typeof taskStatus>
