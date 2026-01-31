
'use client'

import { useActionState } from 'react'
import { authenticate } from '@/lib/actions'
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

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(
        authenticate,
        undefined
    )

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account.
                    </CardDescription>
                </CardHeader>
                <form action={dispatch}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" name="email" placeholder="m@example.com" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" name="password" required />
                        </div>
                        {errorMessage && (
                            <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
                                <p className="text-sm text-red-500">{errorMessage}</p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" aria-disabled={isPending}>
                            {isPending ? "Logging in..." : "Sign in"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
