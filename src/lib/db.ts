import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  var prisma: PrismaClient | undefined
}

let db: PrismaClient

if (globalThis.prisma) {
  db = globalThis.prisma
} else {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  db = new PrismaClient({
    adapter,
    log: ['query', 'info', 'warn', 'error'],
  })
}

if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = db
}

export default db