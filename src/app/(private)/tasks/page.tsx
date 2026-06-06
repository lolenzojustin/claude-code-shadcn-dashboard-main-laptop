"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ArrowUp, BarChart3, CheckCircle2, Clock, ListTodo } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getTaskColumns } from "@/modules/tasks/components/columns"
import { DataTable } from "@/modules/tasks/components/data-table"
import {
  createTask,
  deleteTask,
  getTasks,
  getTaskStats,
  seedTasksWithClient,
  updateTask,
} from "@/modules/tasks/services/task-services"
import type { Task } from "@/modules/tasks/services/types/task-types"

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isSeedingTasks, setIsSeedingTasks] = useState(false)

  const refreshTasks = useCallback(async () => {
    const taskList = await getTasks()
    setTasks(taskList)
  }, [])

  useEffect(() => {
    const loadTasks = async () => {
      try {
        await refreshTasks()
      } catch (error) {
        console.error("Failed to load tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [refreshTasks])

  const handleAddTask = useCallback(
    async (newTask: Task) => {
      await createTask(newTask)
      await refreshTasks()
    },
    [refreshTasks]
  )

  const handleUpdateTask = useCallback(async (task: Task) => {
    await updateTask(task)
    setTasks((prev) => prev.map((item) => (item.id === task.id ? task : item)))
  }, [])

  const handleDeleteTask = useCallback(async (taskId: string) => {
    await deleteTask(taskId)
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }, [])

  const handleDuplicateTask = useCallback(async (task: Task) => {
    const duplicate: Task = {
      ...task,
      id: `TASK-${Date.now()}`,
      title: `${task.title} (Copy)`,
    }

    await createTask(duplicate)
    setTasks((prev) => [duplicate, ...prev])
  }, [])

  const handleSeedTasks = useCallback(async () => {
    try {
      setIsSeedingTasks(true)
      const seededTasks = await seedTasksWithClient()
      setTasks(seededTasks)
    } catch (error) {
      console.error("Failed to seed tasks:", error)
    } finally {
      setIsSeedingTasks(false)
    }
  }, [])

  const taskColumns = useMemo(
    () =>
      getTaskColumns({
        onUpdateTask: handleUpdateTask,
        onDeleteTask: handleDeleteTask,
        onDuplicateTask: handleDuplicateTask,
      }),
    [handleDeleteTask, handleDuplicateTask, handleUpdateTask]
  )

  const stats = getTaskStats(tasks)
  const getPercent = (value: number) =>
    stats.total > 0 ? Math.round((value / stats.total) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    )
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col gap-2 px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground">
          A powerful task and issue tracker built with Tanstack Table.
        </p>
      </div>

      {/* Mobile view placeholder - shows message instead of images */}
      <div className="md:hidden px-4 md:px-6">
        <div className="flex items-center justify-center h-96 border rounded-lg bg-muted/20">
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold mb-2">Tasks Dashboard</h3>
            <p className="text-muted-foreground">
              Please use a larger screen to view the full tasks interface.
            </p>
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden h-full flex-1 flex-col space-y-6 px-4 md:px-6 md:flex">
        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Total Tasks
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats.total}</span>
                    <span className="flex items-center gap-0.5 text-sm text-green-500">
                      <ArrowUp className="size-3.5" />
                      {getPercent(stats.completed)}%
                    </span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <ListTodo className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Completed
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {stats.completed}
                    </span>
                    <span className="flex items-center gap-0.5 text-sm text-green-500">
                      <ArrowUp className="size-3.5" />
                      {getPercent(stats.completed)}%
                    </span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <CheckCircle2 className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    In Progress
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {stats.inProgress}
                    </span>
                    <span className="flex items-center gap-0.5 text-sm text-green-500">
                      <ArrowUp className="size-3.5" />
                      {getPercent(stats.inProgress)}%
                    </span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <Clock className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Pending
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats.pending}</span>
                    <span className="flex items-center gap-0.5 text-sm text-orange-500">
                      <ArrowUp className="size-3.5" />
                      {getPercent(stats.pending)}%
                    </span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <BarChart3 className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Task Management</CardTitle>
            <CardDescription>
              View, filter, and manage all your project tasks in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={tasks}
              columns={taskColumns}
              onAddTask={handleAddTask}
              onSeedTasks={handleSeedTasks}
              isSeedingTasks={isSeedingTasks}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
