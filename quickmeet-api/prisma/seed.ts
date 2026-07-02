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
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      passwordHash: defaultPassword,
      name: 'John Doe',
      role: Role.USER,
      isVerified: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      passwordHash: defaultPassword,
      name: 'Jane Smith',
      role: Role.USER,
      isVerified: true,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      passwordHash: defaultPassword,
      name: 'Alice Cooper',
      role: Role.USER,
      isVerified: true,
    },
  });

  console.log('Created users: john, jane, alice');

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

  console.log('Created appointment types');

  const today = new Date();
  
  // Create Slots
  // 1. Past Slot (Completed)
  const pastSlotDate = new Date(today);
  pastSlotDate.setDate(pastSlotDate.getDate() - 1);
  pastSlotDate.setHours(10, 0, 0, 0);

  const pastSlotEnd = new Date(pastSlotDate);
  pastSlotEnd.setMinutes(15);

  const pastSlot = await prisma.slot.create({
    data: {
      appointmentTypeId: type1.id,
      startTime: pastSlotDate,
      endTime: pastSlotEnd,
      capacity: 3,
      status: SlotStatus.COMPLETED,
    },
  });

  // 2. Today's Slots (Open / Full)
  const openSlotStart = new Date(today);
  openSlotStart.setHours(14, 0, 0, 0);
  const openSlotEnd = new Date(openSlotStart);
  openSlotEnd.setMinutes(15);

  const openSlot = await prisma.slot.create({
    data: {
      appointmentTypeId: type1.id,
      startTime: openSlotStart,
      endTime: openSlotEnd,
      capacity: 5,
      status: SlotStatus.OPEN,
    },
  });

  const fullSlotStart = new Date(today);
  fullSlotStart.setHours(16, 0, 0, 0);
  const fullSlotEnd = new Date(fullSlotStart);
  fullSlotEnd.setMinutes(30);

  const fullSlot = await prisma.slot.create({
    data: {
      appointmentTypeId: type2.id,
      startTime: fullSlotStart,
      endTime: fullSlotEnd,
      capacity: 2,
      status: SlotStatus.OPEN, // We will fill it via bookings, backend auto-updates this but we just set OPEN initially
    },
  });

  console.log('Created slots');

  // Create Bookings
  // Past Booking
  const bookedAtPast = new Date(today);
  bookedAtPast.setDate(bookedAtPast.getDate() - 2);

  await prisma.booking.create({
    data: {
      userId: user1.id,
      slotId: pastSlot.id,
      status: BookingStatus.SERVED,
      bookedAt: bookedAtPast,
      servedAt: pastSlot.startTime,
    },
  });

  // Upcoming Bookings for Open Slot
  await prisma.booking.create({
    data: {
      userId: user1.id,
      slotId: openSlot.id,
      status: BookingStatus.CONFIRMED,
      queuePosition: 1,
    },
  });

  await prisma.booking.create({
    data: {
      userId: user2.id,
      slotId: openSlot.id,
      status: BookingStatus.CONFIRMED,
      queuePosition: 2,
    },
  });

  // Fill up the Full Slot
  await prisma.booking.create({
    data: {
      userId: user2.id,
      slotId: fullSlot.id,
      status: BookingStatus.CONFIRMED,
      queuePosition: 1,
    },
  });

  await prisma.booking.create({
    data: {
      userId: user3.id,
      slotId: fullSlot.id,
      status: BookingStatus.CONFIRMED,
      queuePosition: 2,
    },
  });

  // Update fullSlot to CLOSED
  await prisma.slot.update({
    where: { id: fullSlot.id },
    data: { status: SlotStatus.CLOSED },
  });

  console.log('Created bookings');
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
