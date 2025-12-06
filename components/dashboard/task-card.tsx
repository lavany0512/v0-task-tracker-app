"use client"

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
} from "@/components/ui/dropdown-menu"
import { Calendar, MoreVertical, Pencil, Trash2, Clock } from "lucide-react"
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

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done"

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base leading-tight line-clamp-2">{task.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onStatusChange(task._id!, "To Do")}>Mark as To Do</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(task._id!, "In Progress")}>
                Mark as In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(task._id!, "Done")}>Mark as Done</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(task._id!)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {task.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{task.description}</p>}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className={priorityColors[task.priority]}>
            {task.priority}
          </Badge>
          <Badge variant="secondary" className={statusColors[task.status]}>
            {task.status}
          </Badge>
        </div>
      </CardContent>
      {task.dueDate && (
        <CardFooter className="pt-2">
          <div className={`flex items-center text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
            {isOverdue ? <Clock className="mr-1 h-3 w-3" /> : <Calendar className="mr-1 h-3 w-3" />}
            {isOverdue ? "Overdue: " : "Due: "}
            {format(new Date(task.dueDate), "MMM d, yyyy")}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
