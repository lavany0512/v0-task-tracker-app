"use client"

import { useState } from "react"
import type { Task, TaskPriority, TaskStatus } from "@/lib/db/schemas"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar, MoreVertical, Pencil, Trash2, Clock, CheckCircle2, Circle, Timer } from "lucide-react"
import { format } from "date-fns"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
}

const priorityColors: Record<TaskPriority, string> = {
  Low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  High: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
}

const statusColors: Record<TaskStatus, string> = {
  "To Do": "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  "In Progress": "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300",
  Done: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
}

const statusIcons: Record<TaskStatus, typeof Circle> = {
  "To Do": Circle,
  "In Progress": Timer,
  Done: CheckCircle2,
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done"
  const StatusIcon = statusIcons[task.status]

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(task._id!)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <Card className="group hover:shadow-md transition-all duration-200 flex flex-col h-full">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <StatusIcon
                className={`h-4 w-4 mt-0.5 shrink-0 ${
                  task.status === "Done"
                    ? "text-emerald-600"
                    : task.status === "In Progress"
                      ? "text-sky-600"
                      : "text-muted-foreground"
                }`}
              />
              <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-2">{task.title}</h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Change Status
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => onStatusChange(task._id!, "To Do")}
                      className={task.status === "To Do" ? "bg-muted" : ""}
                    >
                      <Circle className="mr-2 h-4 w-4" />
                      To Do
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange(task._id!, "In Progress")}
                      className={task.status === "In Progress" ? "bg-muted" : ""}
                    >
                      <Timer className="mr-2 h-4 w-4" />
                      In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange(task._id!, "Done")}
                      className={task.status === "Done" ? "bg-muted" : ""}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Done
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pb-2 flex-1">
          {task.description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
          )}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <Badge variant="secondary" className={`text-xs ${priorityColors[task.priority]}`}>
              {task.priority}
            </Badge>
            <Badge variant="secondary" className={`text-xs ${statusColors[task.status]}`}>
              {task.status}
            </Badge>
          </div>
        </CardContent>
        {task.dueDate && (
          <CardFooter className="pt-2 flex-shrink-0">
            <div className={`flex items-center text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
              {isOverdue ? <Clock className="mr-1.5 h-3 w-3" /> : <Calendar className="mr-1.5 h-3 w-3" />}
              {isOverdue ? "Overdue: " : "Due: "}
              {format(new Date(task.dueDate), "MMM d, yyyy")}
            </div>
          </CardFooter>
        )}
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={isDeleting} className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
