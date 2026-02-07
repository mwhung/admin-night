import { Variants } from "framer-motion"

/**
 * 🌿 Admin Night - 2026 Therapeutic Animation System
 * Core motion variants for consistent feeling across the app.
 */

export const transitions = {
    soft: { type: "spring", stiffness: 100, damping: 20 },
    snappy: { type: "spring", stiffness: 300, damping: 30 },
    bouncy: { type: "spring", stiffness: 400, damping: 10 },
    gentle: { type: "tween", ease: [0.25, 0.46, 0.45, 0.94], duration: 0.4 },
} as const


export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: transitions.gentle },
    exit: { opacity: 0, transition: transitions.gentle },
}

export const fadeInUp: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: transitions.soft },
    exit: { opacity: 0, y: 10, transition: transitions.soft },
}

export const scaleIn: Variants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: transitions.soft },
    exit: { opacity: 0, scale: 0.95, transition: transitions.soft },
}

export const staggerContainer: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.05,
        },
    },
}
