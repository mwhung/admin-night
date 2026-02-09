'use client'

import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    User,
    Database,
    Sparkles,
    Clock,
    Palette,
    Volume2,
    Eye,
    BrainCircuit,
    Info,
    Loader2,
    type LucideIcon,
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { GuestPlaceholder } from "@/components/features/auth/guest-placeholder"
import { useAestheticMode } from "@/lib/hooks/useAestheticMode"

export default function SettingsPage() {
    const { user, loading: authLoading } = useAuth()
    const [preferencesLoading, setPreferencesLoading] = useState(true)
    const [savingSetting, setSavingSetting] = useState<string | null>(null)

    // Setting States
    const [duration, setDuration] = useState(25)
    const [presence, setPresence] = useState('anonymous')
    const [insightLevel, setInsightLevel] = useState('detailed')
    const [ambientSound, setAmbientSound] = useState(false)
    const [completionCues, setCompletionCues] = useState(true)
    const {
        mode: aesthetic,
        setMode: setAestheticMode,
        isSaving: isAestheticModeSaving,
    } = useAestheticMode({ userId: user?.id, syncFromServer: false })

    // Fetch Preferences
    useEffect(() => {
        if (!user) {
            setPreferencesLoading(false)
            return
        }

        const fetchPreferences = async () => {
            try {
                const res = await fetch('/api/user/preferences')
                if (res.ok) {
                    const data = await res.json()
                    if (data.session_duration) setDuration(data.session_duration)
                    if (data.presence_visibility) setPresence(data.presence_visibility)
                    if (data.insight_level) setInsightLevel(data.insight_level)
                    if (data.ambient_sound !== undefined) setAmbientSound(data.ambient_sound)
                    if (data.completion_cues !== undefined) setCompletionCues(data.completion_cues)
                }
            } catch (err) {
                console.error("Failed to fetch preferences:", err)
            } finally {
                setPreferencesLoading(false)
            }
        }

        fetchPreferences()
    }, [user])

    // Update Preference Function
    const updatePreference = useCallback(async (key: string, value: unknown) => {
        if (!user) return // Don't save for guests

        setSavingSetting(key)
        try {
            const res = await fetch('/api/user/preferences', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: value })
            })
            if (!res.ok) throw new Error("Update failed")
        } catch (err) {
            console.error(`Failed to update ${key}:`, err)
            // Rollback UI could go here if needed
        } finally {
            setSavingSetting(null)
        }
    }, [user])

    const handleExport = useCallback(async () => {
        if (!user) return
        setSavingSetting('export')
        try {
            const [prefRes, taskRes] = await Promise.all([
                fetch('/api/user/preferences'),
                fetch('/api/tasks')
            ])

            const preferences = prefRes.ok ? await prefRes.json() : {}
            const tasks = taskRes.ok ? await taskRes.json() : []

            const exportData = {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.name
                },
                preferences,
                tasks,
                exportedAt: new Date().toISOString()
            }

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `admin-night-footprint-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error("Export failed:", err)
        } finally {
            setSavingSetting(null)
        }
    }, [user])

    const handlePurge = useCallback(async () => {
        if (!user) return
        if (!confirm("Are you absolutely sure? This will permanently delete all your task history and session data. This action cannot be undone.")) return

        setSavingSetting('purge')
        try {
            const res = await fetch('/api/user/purge', { method: 'DELETE' })
            if (res.ok) {
                alert("Your history has been purged successfully.")
                window.location.reload() // Refresh to clear local state
            } else {
                throw new Error("Purge failed")
            }
        } catch (err) {
            console.error("Purge failed:", err)
            alert("Failed to purge history. Please try again.")
        } finally {
            setSavingSetting(null)
        }
    }, [user])

    if (authLoading || preferencesLoading) {
        return (
            <div className="container mx-auto p-8 max-w-4xl min-h-screen animate-pulse">
                <div className="h-8 w-48 bg-muted rounded mb-4" />
                <div className="h-4 w-64 bg-muted rounded mb-8" />
                <div className="grid gap-6">
                    <div className="h-48 bg-muted rounded-lg" />
                    <div className="h-48 bg-muted rounded-lg" />
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <GuestPlaceholder
                pageName="Settings"
                description="Settings is available for registered members. Sign in to start tracing your footprints."
            />
        )
    }

    const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: LucideIcon, title: string, subtitle?: string }) => (
        <div className="flex flex-col gap-1 mb-6">
            <div className="flex items-center gap-2 text-primary/80">
                <Icon className="size-5" />
                <h3 className="text-[1.05rem] font-medium tracking-[-0.012em] text-foreground/90">{title}</h3>
            </div>
            {subtitle && <p className="type-body-soft max-w-2xl">{subtitle}</p>}
        </div>
    )

    const LoadingIndicator = ({ id }: { id: string }) => {
        const isLoading = savingSetting === id || (id === 'aesthetic_mode' && isAestheticModeSaving)
        if (!isLoading) return null
        return <Loader2 className="size-3 animate-spin text-primary ml-2" />
    }

    const settingLabelClass = "text-sm font-medium tracking-[-0.005em] text-foreground/90"
    const settingMetaClass = "type-caption"
    const optionChipClass = "px-4 py-1.5 rounded-full text-sm font-medium tracking-[-0.005em] transition-all duration-300 capitalize"

    return (
        <div className="container mx-auto p-4 sm:p-5 md:p-6 max-w-4xl min-h-screen">
            {/* Header */}
            <div className="flex flex-col gap-2 pt-8 mb-10">
                <h2 className="type-page-title">
                    {user ? `Greetings, ${user.user_metadata?.name || 'Friend'}` : 'App Preferences'}
                </h2>
                <p className="type-page-subtitle max-w-2xl">
                    Tailor your environment for quiet focus and relief.
                </p>
            </div>

            <div className="grid gap-16 pb-20">

                {/* 1. Ritual & Session */}
                <section>
                    <SectionHeader
                        icon={Clock}
                        title="Ritual & Session"
                        subtitle="Define the rhythm of your admin sessions."
                    />
                    <div className="grid gap-6">
                        <Card className="bg-card/40 backdrop-blur-md border-border/40 overflow-hidden">
                            <CardContent className="p-6 space-y-8">
                                {/* Default Duration */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-0.5">
                                        <div className={cn("flex items-center", settingLabelClass)}>
                                            Default Session Duration
                                            <LoadingIndicator id="session_duration" />
                                        </div>
                                        <div className={settingMetaClass}>The standard time block for your focus sessions.</div>
                                    </div>
                                    <div className="flex p-1 bg-muted/30 rounded-full border border-border/40">
                                        {[25, 45, 60].map((d) => (
                                            <button
                                                key={d}
                                                disabled={savingSetting !== null}
                                                onClick={() => {
                                                    setDuration(d)
                                                    updatePreference('session_duration', d)
                                                }}
                                                className={cn(
                                                    optionChipClass,
                                                    duration === d
                                                        ? "bg-primary text-primary-foreground shadow-sm"
                                                        : "hover:bg-primary/10 text-muted-foreground",
                                                    savingSetting !== null && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                {d}m
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* 2. Therapeutic Environment */}
                <section>
                    <SectionHeader
                        icon={Palette}
                        title="Therapeutic Environment"
                        subtitle="Craft the visual and auditory atmosphere of your sanctuary."
                    />
                    <div className="grid gap-6">
                        <Card className="bg-card/40 backdrop-blur-md border-border/40 overflow-hidden">
                            <CardContent className="p-6 space-y-8">
                                {/* Focus Aesthetic */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-0.5">
                                        <div className={cn("flex items-center", settingLabelClass)}>
                                            Focus Aesthetic
                                            <LoadingIndicator id="aesthetic_mode" />
                                        </div>
                                        <div className={settingMetaClass}>Adjust the interface to your visual comfort.</div>
                                    </div>
                                    <div className="flex p-1 bg-muted/30 rounded-full border border-border/40">
                                        {(['light', 'dark', 'adaptive'] as const).map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => {
                                                    setAestheticMode(mode)
                                                }}
                                                className={cn(
                                                    optionChipClass,
                                                    aesthetic === mode
                                                        ? "bg-primary text-primary-foreground shadow-sm"
                                                        : "hover:bg-primary/10 text-muted-foreground"
                                                )}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="opacity-40" />

                                {/* Soundscapes & Cues */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className={cn(
                                        "p-4 rounded-2xl border transition-all duration-300",
                                        ambientSound ? "bg-primary/5 border-primary/20" : "bg-muted/10 border-border/40"
                                    )}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Volume2 className={cn("size-4", ambientSound ? "text-primary" : "text-muted-foreground/60")} />
                                                <span className={cn("text-sm font-medium tracking-[-0.005em]", ambientSound ? "text-foreground" : "text-muted-foreground/60")}>Soundscapes</span>
                                            </div>
                                            <button
                                                disabled={savingSetting !== null}
                                                onClick={() => {
                                                    const newVal = !ambientSound
                                                    setAmbientSound(newVal)
                                                    updatePreference('ambient_sound', newVal)
                                                }}
                                                className={cn(
                                                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                                    ambientSound ? "bg-primary" : "bg-muted",
                                                    savingSetting !== null && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <span className={cn(
                                                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out",
                                                    ambientSound ? "translate-x-4" : "translate-x-0"
                                                )} />
                                            </button>
                                        </div>
                                        <p className="type-caption italic">Background textures to mask distraction.</p>
                                    </div>

                                    <div className={cn(
                                        "p-4 rounded-2xl border transition-all duration-300",
                                        completionCues ? "bg-primary/5 border-primary/20" : "bg-muted/10 border-border/40"
                                    )}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className={cn("size-4", completionCues ? "text-primary" : "text-muted-foreground/60")} />
                                                <span className={cn("text-sm font-medium tracking-[-0.005em]", completionCues ? "text-foreground" : "text-muted-foreground/60")}>Task Sounds</span>
                                            </div>
                                            <button
                                                disabled={savingSetting !== null}
                                                onClick={() => {
                                                    const newVal = !completionCues
                                                    setCompletionCues(newVal)
                                                    updatePreference('completion_cues', newVal)
                                                }}
                                                className={cn(
                                                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                                    completionCues ? "bg-primary" : "bg-muted",
                                                    savingSetting !== null && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <span className={cn(
                                                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out",
                                                    completionCues ? "translate-x-4" : "translate-x-0"
                                                )} />
                                            </button>
                                        </div>
                                        <p className="type-caption italic">Auditory relief when steps are finished.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* 3. Privacy & Presence */}
                <section>
                    <SectionHeader
                        icon={Eye}
                        title="Privacy & Presence"
                        subtitle="Control how you exist within the shared ritual."
                    />
                    <div className="grid gap-6">
                        <Card className="bg-card/40 backdrop-blur-md border-border/40 overflow-hidden">
                            <CardContent className="p-6 space-y-8">
                                {/* Presence Visibility */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-0.5">
                                        <div className={cn("flex items-center", settingLabelClass)}>
                                            Presence Visibility
                                            <LoadingIndicator id="presence_visibility" />
                                        </div>
                                        <div className={settingMetaClass}>How others perceive you during active sessions.</div>
                                    </div>
                                    <div className="flex p-1 bg-muted/30 rounded-full border border-border/40">
                                        {['public', 'anonymous', 'private'].map((p) => (
                                            <button
                                                key={p}
                                                disabled={savingSetting !== null}
                                                onClick={() => {
                                                    setPresence(p)
                                                    updatePreference('presence_visibility', p)
                                                }}
                                                className={cn(
                                                    optionChipClass,
                                                    presence === p
                                                        ? "bg-primary text-primary-foreground shadow-sm"
                                                        : "hover:bg-primary/10 text-muted-foreground",
                                                    savingSetting !== null && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="opacity-40" />

                                {/* Insight Level */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-0.5">
                                        <div className={cn("flex items-center", settingLabelClass)}>
                                            History Data Detail
                                            <LoadingIndicator id="insight_level" />
                                        </div>
                                        <div className={settingMetaClass}>Depth of data preserved in your focus history.</div>
                                    </div>
                                    <div className="flex p-1 bg-muted/30 rounded-full border border-border/40">
                                        {['basic', 'detailed', 'deep'].map((l) => (
                                            <button
                                                key={l}
                                                disabled={savingSetting !== null}
                                                onClick={() => {
                                                    setInsightLevel(l)
                                                    updatePreference('insight_level', l)
                                                }}
                                                className={cn(
                                                    optionChipClass,
                                                    insightLevel === l
                                                        ? "bg-primary text-primary-foreground shadow-sm"
                                                        : "hover:bg-primary/10 text-muted-foreground",
                                                    savingSetting !== null && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="opacity-40" />

                                {/* Data Sovereignty */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Database className="size-4 text-primary/60" />
                                            <span className={settingLabelClass}>Data Sovereignty</span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-start rounded-xl border-border/40 bg-background/50 hover:bg-background"
                                                onClick={handleExport}
                                                disabled={savingSetting !== null}
                                            >
                                                {savingSetting === 'export' ? <Loader2 className="size-3 animate-spin mr-2" /> : null}
                                                Export Your Footprint (JSON)
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full justify-start rounded-xl text-destructive hover:text-destructive hover:bg-destructive/5"
                                                onClick={handlePurge}
                                                disabled={savingSetting !== null}
                                            >
                                                {savingSetting === 'purge' ? <Loader2 className="size-3 animate-spin mr-2" /> : null}
                                                Purge All History
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                                        <Info className="size-5 text-primary/60 mt-0.5" />
                                        <p className="type-caption leading-relaxed">
                                            Admin Night is built on transparency. We do not sell focus data. Your history is yours to keep or destroy.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* 4. AI & Assistant (Coming Soon) */}
                <section>
                    <SectionHeader
                        icon={BrainCircuit}
                        title="AI & Assistant"
                        subtitle="Future enhancements for task clarification."
                    />
                    <div className="p-10 border border-dashed border-border/60 rounded-[2.5rem] bg-muted/[0.05] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                            <BrainCircuit className="size-24 text-primary opacity-[0.03]" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-[1.05rem] font-medium tracking-[-0.012em] text-foreground/90">Focus Intelligence</h4>
                                    <p className="type-body-soft max-w-sm">
                                        We are developing AI integrations to help you break down vague, overwhelming admin tasks into concrete first steps.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {['Clarification Depth', 'Semantic Tagging', 'Auto-Planning'].map(tag => (
                                        <span key={tag} className="px-3 py-1 rounded-full bg-primary/5 border border-primary/10 type-section-label text-primary/60">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col justify-center items-center md:items-end text-center md:text-right gap-3">
                                <div className="p-1.5 px-4 bg-muted/40 rounded-full border border-border/40">
                                    <span className="type-caption text-muted-foreground/70 italic uppercase tracking-[0.08em] font-medium">Expansion in Progress</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Account / Identity Hub */}
                <section>
                    <SectionHeader
                        icon={User}
                        title="Account"
                    />
                    {user && (
                        <Card className="bg-card/40 backdrop-blur-md border-border/40 overflow-hidden">
                            <CardHeader className="flex flex-row items-center gap-6 p-8">
                                <div className="size-20 rounded-full bg-background flex items-center justify-center border border-primary/20 shadow-inner overflow-hidden">
                                    {user.user_metadata?.avatar_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={user.user_metadata.avatar_url} alt="" className="size-full object-cover" />
                                    ) : (
                                        <User className="size-10 text-primary/40" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CardTitle className="text-[1.35rem] font-medium tracking-[-0.012em]">{user.user_metadata?.name || 'Friend of Focus'}</CardTitle>
                                        <div className="bg-primary/10 text-primary px-2 py-0.5 rounded-full type-section-label">Pro Member</div>
                                    </div>
                                    <CardDescription className="type-caption opacity-75">{user.email}</CardDescription>
                                </div>
                                <Button variant="outline" className="rounded-full border-border/40 px-6">
                                    Manage Profile
                                </Button>
                            </CardHeader>
                        </Card>
                    )}
                </section>
            </div>
        </div>
    )
}
