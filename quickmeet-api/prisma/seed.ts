import { PrismaClient, Role, SlotStatus, BookingStatus } from '@prisma/client';
import * as argon2 from 'argon2';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed process...');

  // Clean up existing data (Cascade will handle relations)
  await prisma.user.deleteMany();
  await prisma.appointmentType.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.booking.deleteMany();

  console.log('Cleared existing data.');

  const defaultPassword = await argon2.hash('password123');

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@quickmeet.com',
      passwordHash: defaultPassword,
      name: 'QuickMeet Admin',
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  console.log('Created admin:', admin.email);

  // Create End Users
  const users = [];
  for (let i = 1; i <= 15; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        passwordHash: defaultPassword,
        name: `Dummy User ${i}`,
        role: Role.USER,
        isVerified: true,
      },
    });
    users.push(user);
  }

  console.log(`Created ${users.length} dummy users`);

  // Create Appointment Types
  const type1 = await prisma.appointmentType.create({
    data: {
      adminId: admin.id,
      title: 'General Consultation',
      description: 'Standard 15-minute consultation',
      category: 'Health',
      location: 'Room 101',
      avgServiceDurationMinutes: 15,
      isActive: true,
    },
  });

  const type2 = await prisma.appointmentType.create({
    data: {
      adminId: admin.id,
      title: 'Tech Support',
      description: 'Device troubleshooting and repair evaluation',
      category: 'Tech',
      location: 'Genius Desk',
      avgServiceDurationMinutes: 30,
      isActive: true,
    },
  });

  const type3 = await prisma.appointmentType.create({
    data: {
      adminId: admin.id,
      title: 'Career Coaching',
      description: '1 on 1 career coaching session',
      category: 'Consulting',
      location: 'Online (Zoom)',
      avgServiceDurationMinutes: 45,
      isActive: true,
    },
  });

  console.log('Created appointment types');

  const today = new Date();
  const slots = [];

  // Create 15 Slots spread across different days and times
  for (let i = 0; i < 15; i++) {
    const slotStart = new Date(today);
    // Spread slots from 5 days ago to 10 days in the future
    slotStart.setDate(slotStart.getDate() + (i - 5)); 
    slotStart.setHours(9 + (i % 8), (i % 2) * 30, 0, 0); // times between 9 AM and 4 PM
    
    const isPast = slotStart < today;
    const type = [type1, type2, type3][i % 3];
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotStart.getMinutes() + type.avgServiceDurationMinutes);
    
    // capacity between 2 and 5
    const capacity = 2 + (i % 4);
    
    const slot = await prisma.slot.create({
      data: {
        appointmentTypeId: type.id,
        startTime: slotStart,
        endTime: slotEnd,
        capacity: capacity,
        status: isPast ? SlotStatus.COMPLETED : SlotStatus.OPEN,
      },
    });
    slots.push(slot);
  }

  // Create 10 more slots explicitly for TODAY
  for (let i = 0; i < 10; i++) {
    const slotStart = new Date(today);
    // Times from 8 AM to 5 PM today
    slotStart.setHours(8 + i, (i % 2) * 30, 0, 0); 
    
    const type = [type1, type2, type3][i % 3];
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotStart.getMinutes() + type.avgServiceDurationMinutes);
    
    const isPast = slotStart < new Date();
    const capacity = 3 + (i % 3);
    
    const slot = await prisma.slot.create({
      data: {
        appointmentTypeId: type.id,
        startTime: slotStart,
        endTime: slotEnd,
        capacity: capacity,
        status: isPast ? SlotStatus.COMPLETED : SlotStatus.OPEN,
      },
    });
    slots.push(slot);
  }

  console.log(`Created ${slots.length} slots`);

  // Create Bookings
  let bookingCount = 0;
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const isPast = slot.startTime < today;
    
    // Determine how many bookings for this slot (up to its capacity)
    const numBookings = (i % slot.capacity) + 1; // 1 to capacity

    for (let j = 0; j < numBookings; j++) {
      const user = users[(i * j + j) % users.length]; // pick a user deterministically
      const status = isPast ? (j % 2 === 0 ? BookingStatus.SERVED : BookingStatus.CANCELLED) : BookingStatus.CONFIRMED;

      const bookedAt = new Date(slot.startTime);
      bookedAt.setDate(bookedAt.getDate() - 1);

      await prisma.booking.create({
        data: {
          userId: user.id,
          slotId: slot.id,
          status: status,
          queuePosition: j + 1,
          bookedAt: bookedAt,
          servedAt: status === BookingStatus.SERVED ? slot.startTime : null,
        },
      });
      bookingCount++;
    }

    // if full, mark it CLOSED
    if (!isPast && numBookings === slot.capacity) {
      await prisma.slot.update({
        where: { id: slot.id },
        data: { status: SlotStatus.CLOSED },
      });
    }
  }

  console.log(`Created ${bookingCount} bookings`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
