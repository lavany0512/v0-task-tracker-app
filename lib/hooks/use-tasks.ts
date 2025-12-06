"use client"

import useSWR from "swr"
import type { Task, TaskStatus } from "@/lib/db/schemas"

interface TasksResponse {
  tasks: Task[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useTasks(page = 1, limit = 10, status?: TaskStatus | "All", search?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })

  if (status && status !== "All") {
    params.set("status", status)
  }

  if (search) {
    params.set("search", search)
  }

  const { data, error, isLoading, mutate } = useSWR<TasksResponse>(`/api/tasks?${params.toString()}`, fetcher, {
    revalidateOnFocus: false,
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
