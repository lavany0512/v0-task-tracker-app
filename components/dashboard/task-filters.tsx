"use client"

import { useState } from "react"
import type { TaskStatus, TaskPriority } from "@/lib/db/schemas"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Search, SlidersHorizontal, X, CalendarIcon, ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TaskFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: TaskStatus | "All"
  onStatusChange: (value: TaskStatus | "All") => void
  priority: TaskPriority | "All"
  onPriorityChange: (value: TaskPriority | "All") => void
  sortBy: string
  onSortByChange: (value: string) => void
  sortOrder: "asc" | "desc"
  onSortOrderChange: (value: "asc" | "desc") => void
  dueDateFrom?: Date
  onDueDateFromChange: (date?: Date) => void
  dueDateTo?: Date
  onDueDateToChange: (date?: Date) => void
  onClearFilters: () => void
}

const statusOptions: (TaskStatus | "All")[] = ["All", "To Do", "In Progress", "Done"]
const priorityOptions: (TaskPriority | "All")[] = ["All", "Low", "Medium", "High"]
const sortOptions = [
  { value: "createdAt", label: "Date Created" },
  { value: "dueDate", label: "Due Date" },
  { value: "priority", label: "Priority" },
  { value: "title", label: "Title" },
]

export function TaskFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  dueDateFrom,
  onDueDateFromChange,
  dueDateTo,
  onDueDateToChange,
  onClearFilters,
}: TaskFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const hasActiveFilters = status !== "All" || priority !== "All" || dueDateFrom || dueDateTo || search.length > 0

  const activeFilterCount = [status !== "All", priority !== "All", dueDateFrom, dueDateTo, search.length > 0].filter(
    Boolean,
  ).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        {/* Status filter */}
        <Select value={status} onValueChange={(v) => onStatusChange(v as TaskStatus | "All")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "All" ? "All Status" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority filter */}
        <Select value={priority} onValueChange={(v) => onPriorityChange(v as TaskPriority | "All")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((p) => (
              <SelectItem key={p} value={p}>
                {p === "All" ? "All Priority" : p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced filters toggle */}
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Advanced</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {showAdvanced && (
        <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Sort by */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={onSortByChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort order */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Order</label>
              <Button
                variant="outline"
                onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
                className="w-full flex items-center justify-center gap-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortOrder === "asc" ? "Ascending" : "Descending"}
              </Button>
            </div>

            {/* Due date from */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Due From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDateFrom && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDateFrom ? format(dueDateFrom, "MMM d, yyyy") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dueDateFrom} onSelect={onDueDateFromChange} initialFocus />
                  {dueDateFrom && (
                    <div className="p-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => onDueDateFromChange(undefined)}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            {/* Due date to */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Due To</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dueDateTo && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDateTo ? format(dueDateTo, "MMM d, yyyy") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dueDateTo} onSelect={onDueDateToChange} initialFocus />
                  {dueDateTo && (
                    <div className="p-2 border-t">
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => onDueDateToChange(undefined)}>
                        Clear
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Clear all filters button */}
          {hasActiveFilters && (
            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="mr-2 h-4 w-4" />
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}

      {hasActiveFilters && !showAdvanced && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {search}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onSearchChange("")} />
            </Badge>
          )}
          {status !== "All" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {status}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onStatusChange("All")} />
            </Badge>
          )}
          {priority !== "All" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Priority: {priority}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onPriorityChange("All")} />
            </Badge>
          )}
          {dueDateFrom && (
            <Badge variant="secondary" className="flex items-center gap-1">
              From: {format(dueDateFrom, "MMM d")}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onDueDateFromChange(undefined)} />
            </Badge>
          )}
          {dueDateTo && (
            <Badge variant="secondary" className="flex items-center gap-1">
              To: {format(dueDateTo, "MMM d")}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onDueDateToChange(undefined)} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
