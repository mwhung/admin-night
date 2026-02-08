
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    const email = 'm@example.com'
    const password = await bcrypt.hash('password123', 10)

    const user = await prisma.user.upsert({
        where: { email },
        update: { password },
        create: {
            email,
            name: 'Test User',
            password,
        },
    })

    console.log('User created:', user.email)

    // Create sample tasks
    const tasks = [
        { title: 'Update project documentation', state: 'CLARIFIED' as const },
        { title: 'Reply to client emails', state: 'UNCLARIFIED' as const },
        { title: 'Schedule dental appointment', state: 'UNCLARIFIED' as const },
        { title: 'Fix CSS bug in navigation', state: 'RESOLVED' as const },
        { title: 'Prepare for weekly sync', state: 'IN_PROGRESS' as const },
    ]

    for (const taskData of tasks) {
        await prisma.task.upsert({
            where: { id: `task-${taskData.title.toLowerCase().replace(/\s+/g, '-')}` },
            update: { ...taskData, userId: user.id },
            create: {
                id: `task-${taskData.title.toLowerCase().replace(/\s+/g, '-')}`,
                ...taskData,
                userId: user.id
            },
        })
    }
    console.log('Sample tasks created')

    // Create sample work session (one active, one scheduled)
    const now = new Date()
    const activeSession = await prisma.workSession.create({
        data: {
            scheduledStart: new Date(now.getTime() - 10 * 60 * 1000), // Started 10 mins ago
            scheduledEnd: new Date(now.getTime() + 35 * 60 * 1000),   // Ends in 35 mins
            durationMinutes: 45,
            status: 'ACTIVE',
        }
    })

    await prisma.workSession.create({
        data: {
            scheduledStart: new Date(now.getTime() + 2 * 60 * 60 * 1000), // Starts in 2 hours
            scheduledEnd: new Date(now.getTime() + 2 * 60 * 60 * 1000 + 45 * 60 * 1000),
            durationMinutes: 45,
            status: 'SCHEDULED',
        }
    })

    console.log('Sample work sessions created')

    const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

    await prisma.communityReaction.upsert({
        where: {
            type_windowType_windowStart: {
                type: 'clap',
                windowType: 'daily',
                windowStart: dayStart,
            },
        },
        update: { count: 3 },
        create: {
            type: 'clap',
            windowType: 'daily',
            windowStart: dayStart,
            count: 3,
        },
    })

    await prisma.communitySessionReaction.upsert({
        where: {
            sessionId_type: {
                sessionId: activeSession.id,
                type: 'clap',
            },
        },
        update: { count: 3 },
        create: {
            sessionId: activeSession.id,
            type: 'clap',
            count: 3,
        },
    })

    await prisma.communityReactionEvent.createMany({
        data: [
            { type: 'clap', userId: user.id, sessionId: activeSession.id },
            { type: 'clap', userId: user.id, sessionId: activeSession.id },
            { type: 'clap', userId: user.id, sessionId: activeSession.id },
        ],
    })

    console.log('Sample community reactions created')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
