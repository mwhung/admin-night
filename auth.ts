
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user) return null

          // Identify if user has a password set (if created via OAuth they might not)
          if (!user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (passwordsMatch) return user
        }

        console.log("Invalid credentials")
        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  },
  pages: {
    signIn: '/login',
  }
})
