
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

    console.log({ user })
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
