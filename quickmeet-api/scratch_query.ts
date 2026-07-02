import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    include: {
      bookings: true,
    }
  });

  for (const user of users) {
    console.log(`User: ${user.email} (ID: ${user.id}) - Bookings count: ${user.bookings.length}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
