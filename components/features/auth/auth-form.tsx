'use client'

import { useActionState, useState, useTransition } from 'react'
import { authenticate, signInWithGoogle, signInWithMockUser } from '@/lib/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Moon, Eye, EyeOff, Loader2, Check } from "lucide-react"

interface AuthFormProps {
    initialMode?: 'login' | 'register'
    title?: string
    subtitle?: string
}

export function AuthForm({ initialMode = 'login', title, subtitle }: AuthFormProps) {
    const [mode, setMode] = useState<'login' | 'register'>(initialMode)
    const [showPassword, setShowPassword] = useState(false)
    const [isGooglePending, startGoogleTransition] = useTransition()
    const [isMockPending, startMockTransition] = useTransition()

    // Login State
    const [loginError, loginDispatch, isLoginPending] = useActionState(
        authenticate,
        undefined
    )

    // Register State
    const [registerEmail, setRegisterEmail] = useState('')
    const [registerPassword, setRegisterPassword] = useState('')
    const [isRegisterPending, startRegisterTransition] = useTransition()
    const [registerError, setRegisterError] = useState<string | null>(null)
    const [isRegisterSuccess, setIsRegisterSuccess] = useState(false)

    const handleGoogleSignIn = () => {
        startGoogleTransition(async () => {
            await signInWithGoogle()
        })
    }

    const handleMockSignIn = () => {
        startMockTransition(async () => {
            await signInWithMockUser()
        })
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setRegisterError(null)

        startRegisterTransition(async () => {
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: registerEmail, password: registerPassword }),
                })

                const data = await res.json()

                if (!res.ok) {
                    setRegisterError(data.error || 'Registration failed')
                    return
                }

                setIsRegisterSuccess(true)
                setTimeout(() => {
                    setMode('login')
                    setIsRegisterSuccess(false)
                }, 2000)
            } catch {
                setRegisterError('Something went wrong. Please try again.')
            }
        })
    }

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail)
    const isPasswordValid = registerPassword.length >= 6
    const isMockAuthEnabled = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || process.env.NEXT_PUBLIC_E2E_TESTING === 'true'

    const displayTitle = title || (mode === 'login' ? 'Back to Admin Night' : 'Create Account')
    const displaySubtitle = subtitle || (mode === 'login' ? "Admin work is still there. Let's process it." : 'Create an account to keep your records across sessions.')

    return (
        <div className="w-full max-w-sm mx-auto space-y-6 animate-in fade-in duration-1000">
            {/* Logo area */}
            <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                    <div className="p-4 rounded-[1.5rem] bg-[#3d362f] shadow-[0_12px_24px_-8px_rgba(61,54,47,0.3)]">
                        <Moon className="h-7 w-7 text-[#f5f0e8]" />
                    </div>
                </div>
                <div className="space-y-1">
                    <h2 className="text-[1.7rem] font-medium tracking-[-0.015em] text-[#2d2a26] font-sans">
                        {displayTitle}
                    </h2>
                    <p className="type-caption text-[#3d362f]/55">
                        {displaySubtitle}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Google Sign-in */}
                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 gap-3 text-sm font-medium border-[#3d362f]/10 bg-white shadow-sm hover:bg-secondary/20 transition-all rounded-[0.8rem]"
                    onClick={handleGoogleSignIn}
                    disabled={isGooglePending}
                >
                    {isGooglePending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
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

                {isMockAuthEnabled && (
                    <Button
                        type="button"
                        variant="secondary"
                        className="w-full h-12 text-sm font-medium rounded-[0.8rem] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                        onClick={handleMockSignIn}
                        disabled={isMockPending}
                    >
                        {isMockPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {isMockPending ? 'Mock sign-in...' : 'Use Mock Auth (Dev)'}
                    </Button>
                )}

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-[#3d362f]/10" />
                    </div>
                    <div className="relative flex justify-center type-caption text-[#3d362f]/38 uppercase tracking-[0.1em] font-semibold">
                        <span className="bg-white px-4">
                            or use email
                        </span>
                    </div>
                </div>

                {mode === 'login' ? (
                    <form action={loginDispatch} className="space-y-4">
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="type-section-label text-[#2d2a26] ml-1 tracking-[0.06em]">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    className="h-12 bg-[#f0f7ff] border-none rounded-[0.8rem] focus:ring-2 focus:ring-[#3d362f]/10 transition-all font-light text-sm px-4"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="type-section-label text-[#2d2a26] ml-1 tracking-[0.06em]">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="h-12 bg-[#f0f7ff] border-none rounded-[0.8rem] focus:ring-2 focus:ring-[#3d362f]/10 transition-all font-light text-sm px-4 pr-12"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3d362f]/40 hover:text-[#3d362f] transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {loginError && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive text-center animate-in zoom-in-95">
                                {loginError}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoginPending}
                            className="w-full h-12 bg-[#3d362f] hover:bg-[#2d2824] text-[#f5f0e8] text-base font-light rounded-[0.8rem] shadow-lg shadow-[#3d362f]/10 transition-all active:scale-[0.98]"
                        >
                            {isLoginPending ? <Loader2 className="size-5 animate-spin mr-2" /> : null}
                            {isLoginPending ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="register-email" className="type-section-label text-[#2d2a26] ml-1 tracking-[0.06em]">Email</Label>
                                <Input
                                    id="register-email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={registerEmail}
                                    onChange={(e) => setRegisterEmail(e.target.value)}
                                    className="h-12 bg-[#f0f7ff] border-none rounded-[0.8rem] focus:ring-2 focus:ring-[#3d362f]/10 transition-all font-light text-sm px-4"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="register-password" className="type-section-label text-[#2d2a26] ml-1 tracking-[0.06em]">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="register-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={registerPassword}
                                        onChange={(e) => setRegisterPassword(e.target.value)}
                                        className="h-12 bg-[#f0f7ff] border-none rounded-[0.8rem] focus:ring-2 focus:ring-[#3d362f]/10 transition-all font-light text-sm px-4 pr-12"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3d362f]/40 hover:text-[#3d362f] transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {registerError && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive text-center">
                                {registerError}
                            </div>
                        )}

                        {isRegisterSuccess && (
                            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary text-center flex items-center justify-center gap-2">
                                <Check className="size-4" /> Account created. Redirecting to sign in...
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isRegisterPending || !isEmailValid || !isPasswordValid || isRegisterSuccess}
                            className="w-full h-12 bg-[#3d362f] hover:bg-[#2d2824] text-[#f5f0e8] text-base font-light rounded-[0.8rem] shadow-lg shadow-[#3d362f]/10 transition-all active:scale-[0.98]"
                        >
                            {isRegisterPending ? <Loader2 className="size-5 animate-spin mr-2" /> : null}
                            {isRegisterPending ? 'Creating account...' : 'Create account'}
                        </Button>
                    </form>
                )}
            </div>

            <div className="text-center pt-2">
                <button
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    className="type-body-soft text-[#3d362f]/65 hover:text-[#3d362f] transition-colors"
                >
                    {mode === 'login' ? (
                        <>Need an account? <span className="font-semibold text-[#3d362f]">Create account</span></>
                    ) : (
                        <>Already registered? <span className="font-semibold text-[#3d362f]">Sign in</span></>
                    )}
                </button>
            </div>
        </div>
    )
}
