'use client'

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ArrowLeft, Fingerprint, KeyRound, Loader2, LogOut, Shield, UserRoundCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/hooks/useAuth"
import { createClient } from "@/lib/supabase/client"
import { GuestPlaceholder } from "@/components/features/auth/guest-placeholder"
import { ROUTES } from "@/lib/routes"

type ApiErrorPayload = {
    error?: {
        message?: string
    }
    message?: string
}

function getApiErrorMessage(payload: ApiErrorPayload | null, fallbackMessage: string) {
    if (!payload) return fallbackMessage
    if (payload.error?.message) return payload.error.message
    if (payload.message) return payload.message
    return fallbackMessage
}

export default function AccountSettingsPage() {
    const { user, loading } = useAuth()
    const supabase = useMemo(() => createClient(), [])

    const [displayName, setDisplayName] = useState("")
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
    const [isSendingReset, setIsSendingReset] = useState(false)
    const [signOutScope, setSignOutScope] = useState<"local" | "global" | null>(null)
    const [statusMessage, setStatusMessage] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    useEffect(() => {
        const userName = typeof user?.user_metadata?.name === "string" ? user.user_metadata.name : ""
        setDisplayName(userName)
    }, [user])

    const clearFeedback = useCallback(() => {
        setStatusMessage(null)
        setErrorMessage(null)
    }, [])

    const handleProfileSave = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!user) return

        const normalizedName = displayName.trim()
        if (normalizedName.length < 1) {
            setErrorMessage("Display name cannot be empty.")
            setStatusMessage(null)
            return
        }
        if (normalizedName.length > 80) {
            setErrorMessage("Display name must be 80 characters or fewer.")
            setStatusMessage(null)
            return
        }

        if (normalizedName === (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "")) {
            setStatusMessage("No profile changes to save.")
            setErrorMessage(null)
            return
        }

        setIsUpdatingProfile(true)
        clearFeedback()
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    name: normalizedName,
                },
            })
            if (error) {
                throw new Error(error.message)
            }
            setStatusMessage("Profile updated successfully.")
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Failed to update profile.")
        } finally {
            setIsUpdatingProfile(false)
        }
    }, [clearFeedback, displayName, supabase, user])

    const handlePasswordReset = useCallback(async () => {
        if (!user) return

        setIsSendingReset(true)
        clearFeedback()

        try {
            const response = await fetch("/api/auth/password-reset", { method: "POST" })
            let payload: ApiErrorPayload | null = null
            try {
                payload = await response.json() as ApiErrorPayload
            } catch {
                payload = null
            }

            if (!response.ok) {
                throw new Error(getApiErrorMessage(payload, "Failed to send password reset email."))
            }

            setStatusMessage(payload?.message ?? "Password reset email sent. Please check your inbox.")
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Failed to send password reset email.")
        } finally {
            setIsSendingReset(false)
        }
    }, [clearFeedback, user])

    const handleSignOut = useCallback(async (scope: "local" | "global") => {
        setSignOutScope(scope)
        clearFeedback()
        try {
            const { error } = await supabase.auth.signOut({ scope })
            if (error) {
                throw new Error(error.message)
            }
            window.location.href = ROUTES.LOGIN
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Failed to sign out.")
            setSignOutScope(null)
        }
    }, [clearFeedback, supabase])

    if (loading) {
        return (
            <div className="container mx-auto p-8 max-w-4xl min-h-screen animate-pulse">
                <div className="h-8 w-56 bg-muted rounded mb-4" />
                <div className="h-4 w-72 bg-muted rounded mb-8" />
                <div className="grid gap-6">
                    <div className="h-52 bg-muted rounded-lg" />
                    <div className="h-56 bg-muted rounded-lg" />
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <GuestPlaceholder
                pageName="Account Settings"
                description="Account and security controls are for registered members."
            />
        )
    }

    return (
        <div className="container mx-auto p-4 sm:p-5 md:p-6 max-w-4xl min-h-screen">
            <div className="pt-8 mb-8 space-y-3">
                <Button asChild variant="ghost" size="sm" className="rounded-full w-fit">
                    <Link href={ROUTES.SETTINGS}>
                        <ArrowLeft className="size-4" />
                        Back to Settings
                    </Link>
                </Button>
                <div className="space-y-2">
                    <h1 className="type-page-title">Account & Security</h1>
                    <p className="type-page-subtitle max-w-2xl">
                        Manage identity, password recovery, and sign-in safety.
                    </p>
                </div>
                {statusMessage ? (
                    <div role="status" aria-live="polite" className="max-w-2xl rounded-xl border border-success/35 bg-success/10 px-3 py-2">
                        <p className="type-caption text-success-foreground">{statusMessage}</p>
                    </div>
                ) : null}
                {errorMessage ? (
                    <div role="alert" aria-live="polite" className="max-w-2xl rounded-xl border border-destructive/35 bg-destructive/10 px-3 py-2">
                        <p className="type-caption text-destructive">{errorMessage}</p>
                    </div>
                ) : null}
            </div>

            <div className="grid gap-6 pb-16">
                <Card className="bg-card/40 backdrop-blur-md border-border/40 overflow-hidden">
                    <CardHeader className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-[1.05rem] font-medium tracking-[-0.012em]">
                            <UserRoundCheck className="size-4 text-primary/75" />
                            Profile
                        </CardTitle>
                        <CardDescription className="type-caption">
                            Update the display name shown in the app.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileSave} className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                            <div className="space-y-2">
                                <label htmlFor="display-name" className="text-sm font-medium text-foreground/90">
                                    Display Name
                                </label>
                                <Input
                                    id="display-name"
                                    value={displayName}
                                    onChange={(event) => setDisplayName(event.target.value)}
                                    maxLength={80}
                                    autoComplete="name"
                                    disabled={isUpdatingProfile}
                                />
                                <p className="type-caption">Email: {user.email || "Unavailable"}</p>
                            </div>
                            <Button type="submit" disabled={isUpdatingProfile}>
                                {isUpdatingProfile ? <Loader2 className="size-4 animate-spin" /> : null}
                                Save Profile
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-border/40 overflow-hidden">
                    <CardHeader className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-[1.05rem] font-medium tracking-[-0.012em]">
                            <Shield className="size-4 text-primary/75" />
                            Security Controls
                        </CardTitle>
                        <CardDescription className="type-caption">
                            Recover access and control signed-in sessions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="rounded-2xl border border-border/40 bg-muted/10 p-4">
                            <p className="text-sm font-medium text-foreground/90">Password Recovery</p>
                            <p className="type-caption mt-1 mb-3">
                                Send a reset link to {user.email || "your account email"}.
                            </p>
                            <Button variant="outline" onClick={handlePasswordReset} disabled={isSendingReset}>
                                {isSendingReset ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
                                Send Password Reset Email
                            </Button>
                        </div>

                        <div className="rounded-2xl border border-border/40 bg-muted/10 p-4">
                            <p className="text-sm font-medium text-foreground/90">Session Safety</p>
                            <p className="type-caption mt-1 mb-3">
                                End access on this device or revoke sessions everywhere.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => { void handleSignOut("local") }}
                                    disabled={signOutScope !== null}
                                >
                                    {signOutScope === "local" ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                                    Sign Out This Device
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => { void handleSignOut("global") }}
                                    disabled={signOutScope !== null}
                                >
                                    {signOutScope === "global" ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                                    Sign Out All Devices
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/[0.06] p-4">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Fingerprint className="size-4 text-primary/70" />
                                <p className="text-sm font-medium text-foreground/90">Passkeys</p>
                                <Badge variant="outline" className="text-[0.68rem] uppercase tracking-[0.08em]">Roadmap</Badge>
                            </div>
                            <p className="type-caption">
                                Passkey enrollment and device-level key management are planned for a future release.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
