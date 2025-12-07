"use client"

import { useState, useEffect } from "react"
import type { Task, TaskStatus, TaskPriority } from "@/lib/db/schemas"
import { useTasks } from "@/lib/hooks/use-tasks"
import { TaskCard } from "./task-card"
import { TaskModal } from "./task-modal"
import { TaskFilters } from "./task-filters"
import { StatsCards } from "./stats-cards"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Plus, Loader2, ListTodo, ChevronLeft, ChevronRight } from "lucide-react"
import { useDebounce } from "@/lib/hooks/use-debounce"

export function TaskList() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "All">("All")
  const [searchInput, setSearchInput] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [dueDateFrom, setDueDateFrom] = useState<Date | undefined>()
  const [dueDateTo, setDueDateTo] = useState<Date | undefined>()

  const debouncedSearch = useDebounce(searchInput, 300)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const { toast } = useToast()
  const { tasks, pagination, isLoading, createTask, updateTask, deleteTask } = useTasks(
    page,
    12,
    statusFilter,
    debouncedSearch,
    priorityFilter,
    sortBy,
    sortOrder,
    dueDateFrom,
    dueDateTo,
  )

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [statusFilter, priorityFilter, debouncedSearch, sortBy, sortOrder, dueDateFrom, dueDateTo])

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

  const handleClearFilters = () => {
    setSearchInput("")
    setStatusFilter("All")
    setPriorityFilter("All")
    setSortBy("createdAt")
    setSortOrder("desc")
    setDueDateFrom(undefined)
    setDueDateTo(undefined)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCards tasks={tasks} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <TaskFilters
            search={searchInput}
            onSearchChange={setSearchInput}
            status={statusFilter}
            onStatusChange={setStatusFilter}
            priority={priorityFilter}
            onPriorityChange={setPriorityFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            dueDateFrom={dueDateFrom}
            onDueDateFromChange={setDueDateFrom}
            dueDateTo={dueDateTo}
            onDueDateToChange={setDueDateTo}
            onClearFilters={handleClearFilters}
          />
        </div>
        <Button onClick={handleNewTask} className="w-full sm:w-auto shrink-0">
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
            {searchInput || statusFilter !== "All" || priorityFilter !== "All"
              ? "Try adjusting your filters"
              : "Get started by creating your first task"}
          </p>
          {!searchInput && statusFilter === "All" && priorityFilter === "All" && (
            <Button onClick={handleNewTask}>
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="w-10 h-10 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <ChevronLeft className="h-4 w-4 -ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="w-10 h-10 p-0"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="w-10 h-10 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.totalPages)}
                  disabled={page === pagination.totalPages}
                  className="w-10 h-10 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4 -ml-2" />
                </Button>
              </div>

              <span className="text-sm text-muted-foreground ml-2">{pagination.total} tasks total</span>
            </div>
          )}
        </>
      )}

      <TaskModal open={modalOpen} onOpenChange={setModalOpen} task={editingTask} onSubmit={handleCreateOrUpdate} />
    </div>
  )
}
