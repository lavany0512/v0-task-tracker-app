"use client"

import { useState, useEffect } from "react"
import type { Task, TaskStatus } from "@/lib/db/schemas"
import { useTasks } from "@/lib/hooks/use-tasks"
import { TaskCard } from "./task-card"
import { TaskModal } from "./task-modal"
import { TaskFilters } from "./task-filters"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Plus, Loader2, ListTodo } from "lucide-react"
import { useDebounce } from "@/lib/hooks/use-debounce"

export function TaskList() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All")
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebounce(searchInput, 300)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const { toast } = useToast()
  const { tasks, pagination, isLoading, createTask, updateTask, deleteTask } = useTasks(
    page,
    10,
    statusFilter,
    debouncedSearch,
  )

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [statusFilter, debouncedSearch])

  const handleCreateOrUpdate = async (data: Partial<Task>) => {
    try {
      if (editingTask) {
        await updateTask(editingTask._id!, data)
        toast({ title: "Success", description: "Task updated successfully" })
      } else {
        await createTask(data)
        toast({ title: "Success", description: "Task created successfully" })
      }
      setEditingTask(null)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Operation failed",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id)
      toast({ title: "Success", description: "Task deleted successfully" })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Delete failed",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      await updateTask(id, { status })
      toast({ title: "Success", description: "Task status updated" })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Update failed",
        variant: "destructive",
      })
    }
  }

  const handleNewTask = () => {
    setEditingTask(null)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <TaskFilters
          search={searchInput}
          onSearchChange={setSearchInput}
          status={statusFilter}
          onStatusChange={setStatusFilter}
        />
        <Button onClick={handleNewTask}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ListTodo className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No tasks found</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {searchInput || statusFilter !== "All"
              ? "Try adjusting your filters"
              : "Get started by creating your first task"}
          </p>
          {!searchInput && statusFilter === "All" && (
            <Button onClick={handleNewTask}>
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <TaskModal open={modalOpen} onOpenChange={setModalOpen} task={editingTask} onSubmit={handleCreateOrUpdate} />
    </div>
  )
}
