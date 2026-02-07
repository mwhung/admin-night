'use client'

import { Card } from "@/components/ui/card"
import { Lock, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { AuthForm } from "./auth-form"

interface GuestPlaceholderProps {
    pageName: string
    description?: string
}

export function GuestPlaceholder({ pageName, description }: GuestPlaceholderProps) {
    return (
        <div className="container mx-auto p-4 md:p-6 max-w-4xl animate-in fade-in duration-1000 flex flex-col items-center justify-center min-h-[80vh] space-y-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <Card className="border-none bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden relative p-8 md:p-10 rounded-[2rem]">
                    <div className="relative z-10">
                        {/* Integrated Auth Form - Letting it use its own high-fidelity defaults */}
                        <AuthForm
                            initialMode="login"
                        />

                        {/* Secondary Context Description */}
                        {description && (
                            <div className="mt-6 pt-6 border-t border-[#3d362f]/5 text-center">
                                <p className="text-[10px] text-[#3d362f]/40 font-light leading-relaxed italic">
                                    "{description}"
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Background Aesthetic Elements */}
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none text-[#3d362f]">
                        <Sparkles className="size-24" />
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
