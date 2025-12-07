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
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to fetch")
  }
  return res.json()
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
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error)
    mutate()
    return result
  }

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error)
    mutate()
    return result
  }

  const deleteTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error)
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
