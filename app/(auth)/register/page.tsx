'use client'

import { AuthForm } from "@/components/features/auth/auth-form"
import { Card } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export default function RegisterPage() {
    return (
        <div className="container mx-auto p-4 md:p-6 max-w-4xl animate-in fade-in duration-1000 flex flex-col items-center justify-center min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <Card className="border-none bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden relative p-8 md:p-10 rounded-[2rem]">
                    <div className="relative z-10">
                        <AuthForm initialMode="register" />
                    </div>

                    {/* Background Aesthetic Elements */}
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Sparkles className="size-32" />
                    </div>
                </Card>
            </motion.div>

            {/* Bottom Ambient Text */}
            <div className="fixed bottom-6 left-0 right-0 text-center pointer-events-none">
                <p className="text-xs text-[#3d362f]/30 font-light tracking-widest uppercase animate-breathe-slow">
                    ✨ Focus together, finish together
                </p>
            </div>
        </div>
    )
}
