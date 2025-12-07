"use client"

import useSWR from "swr"
import type { Task, TaskStatus, TaskPriority } from "@/lib/db/schemas"

interface TasksResponse {
  tasks: Task[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const fetcher = async (url: string) => {
  console.log("[v0] Fetching tasks from:", url)
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    console.error("[v0] Fetch error:", error)
    throw new Error(error.error || "Failed to fetch")
  }
  const data = await res.json()
  console.log("[v0] Tasks fetched:", data.tasks?.length || 0)
  return data
}

export function useTasks(
  page = 1,
  limit = 10,
  status?: TaskStatus | "All",
  search?: string,
  priority?: TaskPriority | "All",
  sortBy = "createdAt",
  sortOrder: "asc" | "desc" = "desc",
  dueDateFrom?: Date,
  dueDateTo?: Date,
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  })

  if (status && status !== "All") {
    params.set("status", status)
  }

  if (priority && priority !== "All") {
    params.set("priority", priority)
  }

  if (search) {
    params.set("search", search)
  }

  if (dueDateFrom) {
    params.set("dueDateFrom", dueDateFrom.toISOString())
  }

  if (dueDateTo) {
    params.set("dueDateTo", dueDateTo.toISOString())
  }

  const { data, error, isLoading, mutate } = useSWR<TasksResponse>(`/api/tasks?${params.toString()}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 2000,
  })

  const createTask = async (taskData: Partial<Task>) => {
    console.log("[v0] Creating task:", taskData)
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    })
    const result = await res.json()
    if (!res.ok) {
      console.error("[v0] Create task error:", result.error)
      throw new Error(result.error)
    }
    console.log("[v0] Task created:", result.task._id)
    mutate()
    return result
  }

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    console.log("[v0] Updating task:", id, taskData)
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    })
    const result = await res.json()
    if (!res.ok) {
      console.error("[v0] Update task error:", result.error)
      throw new Error(result.error)
    }
    console.log("[v0] Task updated:", id)
    mutate()
    return result
  }

  const deleteTask = async (id: string) => {
    console.log("[v0] Deleting task:", id)
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" })
    const result = await res.json()
    if (!res.ok) {
      console.error("[v0] Delete task error:", result.error)
      throw new Error(result.error)
    }
    console.log("[v0] Task deleted:", id)
    mutate()
    return result
  }

  return {
    tasks: data?.tasks || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
    createTask,
    updateTask,
    deleteTask,
  }
}
