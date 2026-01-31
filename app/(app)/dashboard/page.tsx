'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, CheckCircle2, ListTodo, Play, Inbox, Settings } from 'lucide-react'
import Link from "next/link"

export default function DashboardPage() {
    return (
        <div className="container mx-auto p-8 space-y-8 max-w-7xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back, Admin. Ready to conquer the night?</p>
                </div>
                <Button asChild className="gap-2 shadow-therapeutic">
                    <Link href="/admin-mode">
                        <Play className="size-4" />
                        Start Admin Night
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-primary/5 border-primary/10 shadow-therapeutic hover-lift">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Tasks Pending
                        </CardTitle>
                        <ListTodo className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">
                            4 high priority
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-therapeutic hover-lift">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Sessions Completed
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">
                            Last session 2 hours ago
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-therapeutic hover-lift">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Clarification Needed
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground">
                            Tasks require AI processing
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Your recent sessions and task completions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Placeholder for activity feed */}
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 text-sm border-b pb-4 last:border-0 last:pb-0">
                                    <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                                        <CheckCircle2 className="size-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">Completed &quot;Update documentation&quot;</p>
                                        <p className="text-muted-foreground text-xs">2 hours ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Get things done fast.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <Button variant="outline" className="justify-start h-auto py-4" asChild>
                            <Link href="/admin-mode">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-primary/10 rounded-md">
                                        <Play className="size-5 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <span className="font-semibold block">Start Admin Session</span>
                                        <span className="text-xs text-muted-foreground">Join others in focus</span>
                                    </div>
                                </div>
                            </Link>
                        </Button>
                        <Button variant="outline" className="justify-start h-auto py-4">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-primary/10 rounded-md">
                                    <Settings className="size-5 text-primary" />
                                </div>
                                <div className="text-left">
                                    <span className="font-semibold block">Configure AI</span>
                                    <span className="text-xs text-muted-foreground">Adjust your clarification prompt</span>
                                </div>
                            </div>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
