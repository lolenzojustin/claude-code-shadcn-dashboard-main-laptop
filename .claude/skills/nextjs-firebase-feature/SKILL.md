---
name: nextjs-firebase-feature
description: Build or update a Next.js App Router dashboard feature module backed by Firebase Firestore client SDK. Use for feature folders like src/modules/tasks that need typed services, inline mock seed data, manual client-side seeding, TanStack tables, CRUD dialogs/actions, and shadcn/ui components without Firebase Admin or server seeders.
---

# Next.js Firebase Feature

Use this skill when creating or updating a dashboard module that follows the current `src/modules/tasks` structure.

## Project Pattern

- Use Next.js App Router client pages under `src/app/(dashboard)/<feature>/page.tsx`.
- Use module code under `src/modules/<feature>/`.
- Use Firebase Web SDK from `@/lib/firebase/client`.
- Do not use `firebase-admin`, server-only seeders, server actions, or `src/lib/firebase/admin.ts`.
- Do not auto-seed on page load. Seed mock data only when the user triggers a seed function/button.
- Keep mock seed data inline in `<feature>-mock-data.ts`; do not create JSON seed files.
- Use `zod` schemas for feature item types.
- Use `@tanstack/react-table` for tables.
- Use shadcn/ui and lucide-react for UI.

## Module Shape

```text
src/app/(dashboard)/<feature>/page.tsx
src/modules/<feature>/
  components/
    add-<feature>-modal.tsx
    columns.tsx
    data-table.tsx
    data-table-column-header.tsx
    data-table-pagination.tsx
    data-table-row-actions.tsx
    data-table-toolbar.tsx
    data-table-view-options.tsx
  services/
    <feature>-mock-data.ts
    <feature>-services.ts
    <feature>-chart-services.ts        optional
    <feature>-statistics-services.ts   optional
    types/
      <feature>-types.ts
```

## Types

Define the item schema in `services/types/<feature>-types.ts`.

```ts
import { z } from "zod"

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  category: z.string(),
  priority: z.string(),
})

export type Task = z.infer<typeof taskSchema>
```

Keep Firestore document fields aligned with this schema unless the feature explicitly needs more fields and rules allow them.

## Mock Data

Put option lists and seed rows in `services/<feature>-mock-data.ts`.

```ts
import { CheckCircle2, Circle } from "lucide-react"
import { taskSchema } from "./types/task-types"

export const statuses = [
  { value: "todo", label: "Todo", icon: Circle },
  { value: "completed", label: "Completed", icon: CheckCircle2 },
]

const tasksData = [
  {
    id: "TASK-1001",
    title: "Implement user authentication",
    status: "completed",
    category: "feature",
    priority: "critical",
  },
]

export const taskMockData = taskSchema.array().parse(tasksData)
```

Do not import seed rows from `services/data/*.json`.

## Firestore Services

Use direct client SDK CRUD in `services/<feature>-services.ts`.

```ts
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore"

import { db } from "@/lib/firebase/client"
import { taskMockData } from "./task-mock-data"
import type { Task } from "./types/task-types"

const TASKS_COLLECTION = "tasks"

export async function getTasks(): Promise<Task[]> {
  const snapshot = await getDocs(collection(db, TASKS_COLLECTION))

  return snapshot.docs.map((document) => {
    const data = document.data() as Task
    return { ...data, id: data.id ?? document.id }
  })
}

export async function seedTasksWithClient(): Promise<Task[]> {
  const batch = writeBatch(db)

  taskMockData.forEach((task) => {
    batch.set(doc(db, TASKS_COLLECTION, task.id), task, { merge: true })
  })

  await batch.commit()
  return getTasks()
}

export async function createTask(task: Task): Promise<Task> {
  await setDoc(doc(db, TASKS_COLLECTION, task.id), task)
  return task
}

export async function updateTask(task: Task): Promise<Task> {
  await updateDoc(doc(db, TASKS_COLLECTION, task.id), task)
  return task
}

export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, TASKS_COLLECTION, taskId))
}
```

Rules:

- `get<Features>()` reads Firestore only. It must not fall back to mock data and must not auto-seed.
- `seed<Features>WithClient()` writes inline mock data with `writeBatch` and returns a fresh Firestore read.
- `create`, `update`, and `delete` write to Firestore before updating UI state.
- Avoid `serverTimestamp()` unless the schema and Firestore rules explicitly allow timestamp fields.
- Do not use `onSnapshot` unless the user explicitly asks for realtime behavior.

## Page Composition

Use the page as the orchestration layer:

- load items with `get<Features>()` in `useEffect`;
- pass CRUD callbacks into columns/table;
- refresh from Firestore after create when correctness matters;
- update local state after update/delete for responsive UI;
- expose a manual seed callback for the toolbar button.

```ts
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { DataTable } from "@/modules/tasks/components/data-table"
import { getTaskColumns } from "@/modules/tasks/components/columns"
import {
  createTask,
  deleteTask,
  getTasks,
  seedTasksWithClient,
  updateTask,
} from "@/modules/tasks/services/task-services"
import type { Task } from "@/modules/tasks/services/types/task-types"

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isSeedingTasks, setIsSeedingTasks] = useState(false)

  const refreshTasks = useCallback(async () => {
    setTasks(await getTasks())
  }, [])

  useEffect(() => {
    refreshTasks().finally(() => setLoading(false))
  }, [refreshTasks])

  const handleAddTask = useCallback(
    async (task: Task) => {
      await createTask(task)
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

  const handleSeedTasks = useCallback(async () => {
    setIsSeedingTasks(true)
    try {
      setTasks(await seedTasksWithClient())
    } finally {
      setIsSeedingTasks(false)
    }
  }, [])

  const columns = useMemo(
    () =>
      getTaskColumns({
        onUpdateTask: handleUpdateTask,
        onDeleteTask: handleDeleteTask,
      }),
    [handleDeleteTask, handleUpdateTask]
  )

  if (loading) return <div>Loading...</div>

  return (
    <DataTable
      data={tasks}
      columns={columns}
      onAddTask={handleAddTask}
      onSeedTasks={handleSeedTasks}
      isSeedingTasks={isSeedingTasks}
    />
  )
}
```

## Columns and Row Actions

Prefer a column factory when row actions need callbacks.

```ts
export function getTaskColumns({
  onUpdateTask,
  onDeleteTask,
  onDuplicateTask,
}: TaskColumnActions = {}): ColumnDef<Task>[] {
  return [
    // field columns...
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onDuplicateTask={onDuplicateTask}
        />
      ),
    },
  ]
}

export const columns = getTaskColumns()
```

Row actions should parse `row.original` with the feature schema before using it. Edit dialogs should call `onUpdate...`; delete actions should call `onDelete...`; duplicate actions should generate a new ID and call create through the page callback.

## Add Modal

Add modal responsibilities:

- maintain controlled form state;
- validate with `zod`;
- generate a stable unique string ID, for example `TASK-${Date.now()}`;
- await `onAdd...`;
- show root errors returned by Firestore;
- reset state and close only after success;
- set trigger buttons to `type="button"`.

The modal should not import Firestore services directly. Keep writes in the page callback so state refresh stays centralized.

## Toolbar

Toolbar should include:

- search input bound to a table column filter;
- select filters for enum fields;
- reset filters button;
- column visibility button;
- add modal trigger;
- optional seed button wired to `onSeed...`.

```tsx
<Button
  variant="outline"
  size="sm"
  onClick={onSeedTasks}
  disabled={!onSeedTasks || isSeedingTasks}
>
  <Database className="h-4 w-4" />
  <span className="hidden lg:block">
    {isSeedingTasks ? "Seeding..." : "Seed Data"}
  </span>
</Button>
```

## Validation

After changes, run:

```bash
npx tsc --noEmit
npm run build
```

If a Firestore write fails in the UI:

- inspect the modal or row action root error;
- verify Firestore Security Rules allow the authenticated user to create/update/delete the collection;
- verify document fields match the zod schema and rules;
- avoid adding timestamp or metadata fields unless rules allow them.

## Do Not

- Do not create or use `firebase-admin`.
- Do not create `mock-data-seeder.ts`.
- Do not create a global `/mock-data` route for seeding modules.
- Do not auto-seed in `get<Features>()`.
- Do not place seed rows in JSON files.
- Do not make CRUD local-only if the feature is Firestore-backed.
- Do not hardcode Firebase config; always use `@/lib/firebase/client`.
