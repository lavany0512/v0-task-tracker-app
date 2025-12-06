"use client"

import type { TaskStatus } from "@/lib/db/schemas"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface TaskFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: TaskStatus | "All"
  onStatusChange: (value: TaskStatus | "All") => void
}

const statusOptions: (TaskStatus | "All")[] = ["All", "To Do", "In Progress", "Done"]

export function TaskFilters({ search, onSearchChange, status, onStatusChange }: TaskFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={status} onValueChange={(v) => onStatusChange(v as TaskStatus | "All")}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((s) => (
            <SelectItem key={s} value={s}>
              {s === "All" ? "All Tasks" : s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
