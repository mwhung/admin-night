'use client'

import { AuthForm } from "@/components/features/auth/auth-form"
import { Card } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
    return (
        <div className="container mx-auto p-4 md:p-6 max-w-4xl animate-in fade-in duration-1000 flex flex-col items-center justify-center min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <Card className="border border-border/70 bg-card/88 backdrop-blur-md shadow-[0_28px_56px_-22px_rgba(44,61,86,0.22)] overflow-hidden relative p-8 md:p-10 rounded-[calc(var(--radius)+0.75rem)]">
                    <div className="relative z-10">
                        <AuthForm initialMode="login" />
                    </div>

                    {/* Background Aesthetic Elements */}
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Sparkles className="size-32" />
                    </div>
                </Card>
            </motion.div>

            {/* Bottom Ambient Text */}
            <div className="fixed bottom-6 left-0 right-0 text-center pointer-events-none">
                <p className="type-caption text-primary/45 uppercase tracking-[0.1em] animate-breathe-slow">
                    ✨ Focus together, finish together
                </p>
            </div>
        </div>
    )
}
