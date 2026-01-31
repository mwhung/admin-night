'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TaskStateBadge, type TaskState } from "@/components/task-list"
import { Loader2, Plus, Inbox as InboxIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
    id: string
    title: string
    state: string
}

export default function InboxPage() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [newTask, setNewTask] = useState("")
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {
        try {
            const res = await fetch("/api/tasks")
            if (res.ok) {
                const data = await res.json()
                setTasks(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTask.trim()) return

        setCreating(true)
        // Optimistic UI update
        const tempId = Math.random().toString()
        const optimisticTask = { id: tempId, title: newTask, state: 'UNCLARIFIED' }
        setTasks(prev => [...prev, optimisticTask])

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTask }),
            })

            if (res.ok) {
                setNewTask("")
                // In a real app we'd replace the temp ID or re-fetch properly
                fetchTasks()
            } else {
                // Revert on failure
                setTasks(prev => prev.filter(t => t.id !== tempId))
            }
        } catch (error) {
            console.error(error)
            setTasks(prev => prev.filter(t => t.id !== tempId))
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="container mx-auto max-w-4xl py-8 px-4 h-full flex flex-col">
            <header className="mb-8 flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-light tracking-tight mb-2">Inbox</h1>
                    <p className="text-muted-foreground">Capture everything. Process later.</p>
                </div>
                <Badge variant="outline" className="px-3 py-1">
                    {tasks.length} Pending
                </Badge>
            </header>

            <div className="bg-card border rounded-xl p-4 shadow-sm mb-8 transition-all focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-primary">
                <form onSubmit={handleCreate} className="flex gap-4 items-center">
                    <div className="bg-primary/10 p-2 rounded-full hidden sm:block">
                        <Plus className="size-5 text-primary" />
                    </div>
                    <Input
                        className="border-0 shadow-none focus-visible:ring-0 text-lg p-0 h-auto placeholder:text-muted-foreground/60"
                        placeholder="What&apos;s on your mind? (e.g., &apos;Review quarterly report&apos;)"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        disabled={creating}
                        autoFocus
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={creating || !newTask.trim()}
                        className={cn("transition-all", newTask.trim() ? "opacity-100 scale-100" : "opacity-0 scale-90")}
                    >
                        {creating ? <Loader2 className="size-4 animate-spin" /> : <ArrowRightIcon className="size-4" />}
                    </Button>
                </form>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-pulse">
                        <Loader2 className="size-8 animate-spin mb-4" />
                        <p>Syncing tasks...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-accent/5">
                        <div className="bg-background p-4 rounded-full mb-4 shadow-sm">
                            <InboxIcon className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-1">Inbox Zero</h3>
                        <p className="text-muted-foreground max-w-xs">You&apos;re all caught up! Enjoy the peace or add a new task to get started.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className="group flex items-center justify-between p-4 bg-card hover:bg-accent/50 border rounded-lg transition-all hover:shadow-sm hover:border-primary/20"
                            >
                                <div className="flex items-center gap-4">
                                    <button className="text-muted-foreground hover:text-primary transition-colors">
                                        <div className="size-5 border-2 rounded-full" />
                                    </button>
                                    <span className="font-medium group-hover:text-foreground/90 transition-colors">
                                        {task.title}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TaskStateBadge state={task.state as TaskState} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function ArrowRightIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
