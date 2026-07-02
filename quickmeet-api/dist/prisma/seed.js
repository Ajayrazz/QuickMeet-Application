"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const argon2 = __importStar(require("argon2"));
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Starting seed process...');
    await prisma.user.deleteMany();
    await prisma.appointmentType.deleteMany();
    await prisma.slot.deleteMany();
    await prisma.booking.deleteMany();
    console.log('Cleared existing data.');
    const defaultPassword = await argon2.hash('password123');
    const admin = await prisma.user.create({
        data: {
            email: 'admin@quickmeet.com',
            passwordHash: defaultPassword,
            name: 'QuickMeet Admin',
            role: client_1.Role.ADMIN,
            isVerified: true,
        },
    });
    console.log('Created admin:', admin.email);
    const user1 = await prisma.user.create({
        data: {
            email: 'john@example.com',
            passwordHash: defaultPassword,
            name: 'John Doe',
            role: client_1.Role.USER,
            isVerified: true,
        },
    });
    const user2 = await prisma.user.create({
        data: {
            email: 'jane@example.com',
            passwordHash: defaultPassword,
            name: 'Jane Smith',
            role: client_1.Role.USER,
            isVerified: true,
        },
    });
    const user3 = await prisma.user.create({
        data: {
            email: 'alice@example.com',
            passwordHash: defaultPassword,
            name: 'Alice Cooper',
            role: client_1.Role.USER,
            isVerified: true,
        },
    });
    console.log('Created users: john, jane, alice');
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
            status: client_1.SlotStatus.COMPLETED,
        },
    });
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
            status: client_1.SlotStatus.OPEN,
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
            status: client_1.SlotStatus.OPEN,
        },
    });
    console.log('Created slots');
    const bookedAtPast = new Date(today);
    bookedAtPast.setDate(bookedAtPast.getDate() - 2);
    await prisma.booking.create({
        data: {
            userId: user1.id,
            slotId: pastSlot.id,
            status: client_1.BookingStatus.SERVED,
            bookedAt: bookedAtPast,
            servedAt: pastSlot.startTime,
        },
    });
    await prisma.booking.create({
        data: {
            userId: user1.id,
            slotId: openSlot.id,
            status: client_1.BookingStatus.CONFIRMED,
            queuePosition: 1,
        },
    });
    await prisma.booking.create({
        data: {
            userId: user2.id,
            slotId: openSlot.id,
            status: client_1.BookingStatus.CONFIRMED,
            queuePosition: 2,
        },
    });
    await prisma.booking.create({
        data: {
            userId: user2.id,
            slotId: fullSlot.id,
            status: client_1.BookingStatus.CONFIRMED,
            queuePosition: 1,
        },
    });
    await prisma.booking.create({
        data: {
            userId: user3.id,
            slotId: fullSlot.id,
            status: client_1.BookingStatus.CONFIRMED,
            queuePosition: 2,
        },
    });
    await prisma.slot.update({
        where: { id: fullSlot.id },
        data: { status: client_1.SlotStatus.CLOSED },
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
//# sourceMappingURL=seed.js.map