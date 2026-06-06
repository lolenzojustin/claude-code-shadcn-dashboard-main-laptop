"use client"

import * as React from "react"
import type { Row } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  categories,
  priorities,
  statuses,
} from "@/modules/tasks/services/task-mock-data"
import {
  taskSchema,
  type Task,
} from "@/modules/tasks/services/types/task-types"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onUpdateTask?: (task: Task) => void | Promise<void>
  onDeleteTask?: (taskId: string) => void | Promise<void>
  onDuplicateTask?: (task: Task) => void | Promise<void>
}

export function DataTableRowActions<TData>({
  row,
  onUpdateTask,
  onDeleteTask,
  onDuplicateTask,
}: DataTableRowActionsProps<TData>) {
  const parsed = taskSchema.safeParse(row.original)
  const [editOpen, setEditOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<Task | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  if (!parsed.success) {
    return null
  }

  const task = parsed.data

  function openEditDialog() {
    setDraft(task)
    setError(null)
    setEditOpen(true)
  }

  async function handleSaveEdit() {
    if (!draft?.title.trim()) {
      setError("Title is required")
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      await onUpdateTask?.({ ...draft, title: draft.title.trim() })
      setEditOpen(false)
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Failed to update task"
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem className="cursor-pointer" onClick={openEditDialog}>
            Edit Task
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onDuplicateTask?.(task)}
          >
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            variant="destructive"
            onClick={() => onDeleteTask?.(task.id)}
          >
            Delete
            <DropdownMenuShortcut className="text-destructive">
              ⌘⌫
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the task details and save them to Firestore.
            </DialogDescription>
          </DialogHeader>

          {draft ? (
            <div className="space-y-5">
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor={`task-title-${task.id}`}>Task Title</Label>
                <Input
                  id={`task-title-${task.id}`}
                  value={draft.title}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, title: event.target.value }
                        : current
                    )
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={draft.status}
                    onValueChange={(value) =>
                      setDraft((current) =>
                        current ? { ...current, status: value } : current
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={draft.category}
                    onValueChange={(value) =>
                      setDraft((current) =>
                        current ? { ...current, category: value } : current
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={draft.priority}
                  onValueChange={(value) =>
                    setDraft((current) =>
                      current ? { ...current, priority: value } : current
                    )
                  }
                >
                  <SelectTrigger className="w-full md:w-1/2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
