'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signInWithGoogle } from '@/lib/actions'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Moon, Sparkles, Eye, EyeOff, Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Password validation rules
const PASSWORD_RULES = [
    { id: 'length', label: 'At least 6 characters', test: (p: string) => p.length >= 6 },
]

export default function RegisterPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isGooglePending, setIsGooglePending] = useState(false)

    // Form state
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)

    // Validation state
    const [emailTouched, setEmailTouched] = useState(false)
    const [passwordTouched, setPasswordTouched] = useState(false)

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const passwordValidation = PASSWORD_RULES.map(rule => ({
        ...rule,
        passed: rule.test(password)
    }))
    const isPasswordValid = passwordValidation.every(r => r.passed)
    const canSubmit = isEmailValid && isPasswordValid && !isPending

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        startTransition(async () => {
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                })

                const data = await res.json()

                if (!res.ok) {
                    setError(data.error || 'Registration failed')
                    return
                }

                setIsSuccess(true)

                // Redirect to login after success
                setTimeout(() => {
                    router.push('/login')
                }, 1500)
            } catch {
                setError('Something went wrong. Please try again.')
            }
        })
    }

    const handleGoogleSignIn = async () => {
        setIsGooglePending(true)
        try {
            await signInWithGoogle()
        } catch {
            setError('Google sign-in failed. Please try again.')
            setIsGooglePending(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">

            {/* Main Card */}
            <Card className={cn(
                "w-full max-w-md shadow-xl border-border/50",
                "animate-in fade-in slide-in-from-bottom-4 duration-700",
                isSuccess && "border-primary/30"
            )}>
                <CardHeader className="text-center pb-2">
                    {/* Logo */}
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className={cn(
                                "p-4 rounded-2xl transition-all duration-500",
                                isSuccess
                                    ? "bg-primary/20 shadow-lg shadow-primary/10"
                                    : "bg-primary shadow-lg shadow-primary/20"
                            )}>
                                {isSuccess ? (
                                    <Check className="h-8 w-8 text-primary animate-checkmark" />
                                ) : (
                                    <Moon className="h-8 w-8 text-primary-foreground" />
                                )}
                            </div>
                            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-primary/40 animate-pulse" />
                        </div>
                    </div>

                    <CardTitle className="text-2xl font-extralight tracking-tight">
                        {isSuccess ? "Welcome aboard" : "Join the quiet space"}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                        {isSuccess
                            ? "Your quiet corner is ready. Redirecting..."
                            : "A moment for yourself awaits"
                        }
                    </CardDescription>
                </CardHeader>

                {!isSuccess && (
                    <>
                        {/* Google Sign-in (Primary option for reduced friction) */}
                        <CardContent className="pb-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 gap-3 text-base font-medium hover:bg-secondary/50 transition-all"
                                onClick={handleGoogleSignIn}
                                disabled={isGooglePending}
                            >
                                {isGooglePending ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                )}
                                Continue with Google
                            </Button>
                        </CardContent>

                        {/* Divider */}
                        <div className="relative px-6">
                            <div className="absolute inset-0 flex items-center px-6">
                                <span className="w-full border-t border-border/50" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-3 text-muted-foreground">
                                    or with email
                                </span>
                            </div>
                        </div>

                        {/* Email/Password Form */}
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4 pt-4">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        Email
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onBlur={() => setEmailTouched(true)}
                                            className={cn(
                                                "h-11 transition-all duration-300",
                                                emailTouched && !isEmailValid && email && "border-destructive focus:ring-destructive/20",
                                                emailTouched && isEmailValid && "border-primary/50 focus:ring-primary/20"
                                            )}
                                            required
                                        />
                                        {emailTouched && email && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                {isEmailValid ? (
                                                    <Check className="h-4 w-4 text-primary animate-in zoom-in duration-200" />
                                                ) : (
                                                    <X className="h-4 w-4 text-destructive animate-in zoom-in duration-200" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onBlur={() => setPasswordTouched(true)}
                                            className={cn(
                                                "h-11 pr-10 transition-all duration-300",
                                                passwordTouched && !isPasswordValid && password && "border-destructive focus:ring-destructive/20",
                                                passwordTouched && isPasswordValid && "border-primary/50 focus:ring-primary/20"
                                            )}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Password Rules */}
                                    {passwordTouched && password && (
                                        <div className="space-y-1 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                            {passwordValidation.map((rule) => (
                                                <div
                                                    key={rule.id}
                                                    className={cn(
                                                        "flex items-center gap-2 text-xs transition-colors",
                                                        rule.passed ? "text-primary" : "text-muted-foreground"
                                                    )}
                                                >
                                                    {rule.passed ? (
                                                        <Check className="h-3 w-3" />
                                                    ) : (
                                                        <div className="h-3 w-3 rounded-full border border-current" />
                                                    )}
                                                    {rule.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <p className="text-sm text-destructive">{error}</p>
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="flex flex-col gap-4 pt-6">
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                                    disabled={!canSubmit}
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creating your space...
                                        </>
                                    ) : (
                                        "Create your quiet space"
                                    )}
                                </Button>

                                <p className="text-sm text-muted-foreground text-center">
                                    Already have a quiet corner?{' '}
                                    <Link
                                        href="/login"
                                        className="text-primary hover:underline underline-offset-4 transition-colors"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </CardFooter>
                        </form>
                    </>
                )}

                {/* Success State */}
                {isSuccess && (
                    <CardContent className="pt-4 pb-8">
                        <div className="flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Bottom Ambient Text */}
            <div className="fixed bottom-6 left-0 right-0 text-center">
                <p className="text-xs text-muted-foreground/60 animate-breathe-slow">
                    ✨ Focus together, finish together
                </p>
            </div>
        </div>
    )
}
