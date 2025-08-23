"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting database seed...');
    const organization = await prisma.organization.upsert({
        where: { name: 'Default Organization' },
        update: {},
        create: {
            name: 'Default Organization',
            contactEmail: 'admin@conference-app.com',
            contactPerson: 'System Administrator'
        }
    });
    console.log('Created organization:', organization.name);
    const adminPassword = await bcryptjs_1.default.hash('admin123', 12);
    const adminUser = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            email: 'admin@conference-app.com',
            firstName: 'System',
            lastName: 'Administrator',
            passwordHash: adminPassword,
            role: 'SUPER_ADMIN',
            organizationId: organization.id,
            permissions: JSON.stringify(['*']),
            isActive: true
        }
    });
    console.log('Created admin user:', adminUser.username);
    const organizerPassword = await bcryptjs_1.default.hash('org123', 12);
    const organizerUser = await prisma.user.upsert({
        where: { username: 'organizer' },
        update: {},
        create: {
            username: 'organizer',
            email: 'organizer@conference-app.com',
            firstName: 'Event',
            lastName: 'Organizer',
            passwordHash: organizerPassword,
            role: 'ORGANIZER',
            organizationId: organization.id,
            permissions: JSON.stringify(['events:read', 'events:write', 'attendees:read', 'attendees:write']),
            isActive: true
        }
    });
    console.log('Created organizer user:', organizerUser.username);
    const sampleEvent = await prisma.event.upsert({
        where: { id: 'sample-event-1' },
        update: {},
        create: {
            id: 'sample-event-1',
            name: 'Annual Conference 2025',
            description: 'Annual conference for members and guests',
            startDate: new Date('2025-09-15'),
            endDate: new Date('2025-09-18'),
            maxAttendees: 500,
            registrationOpenDate: new Date('2025-06-01'),
            registrationCloseDate: new Date('2025-09-01'),
            status: 'PLANNING',
            organizationId: organization.id,
            createdBy: adminUser.id
        }
    });
    console.log('Created sample event:', sampleEvent.name);
    const accommodation = await prisma.accommodation.create({
        data: {
            name: 'Conference Hotel',
            address: '123 Conference Street, Event City',
            type: 'HOTEL',
            contactPerson: 'Hotel Manager',
            contactPhone: '+1234567890',
            totalCapacity: 200,
            eventId: sampleEvent.id
        }
    });
    console.log('Created accommodation:', accommodation.name);
    const building = await prisma.building.create({
        data: {
            name: 'Main Building',
            description: 'Primary accommodation building',
            totalFloors: 5,
            accommodationId: accommodation.id
        }
    });
    console.log('Created building:', building.name);
    const rooms = [];
    for (let floor = 1; floor <= 5; floor++) {
        for (let roomNum = 1; roomNum <= 10; roomNum++) {
            const room = await prisma.room.create({
                data: {
                    number: `${floor}${roomNum.toString().padStart(2, '0')}`,
                    capacity: floor === 1 ? 4 : 2,
                    genderType: roomNum <= 5 ? 'MALE' : 'FEMALE',
                    floor: floor,
                    isGroundFloorSuitable: floor === 1,
                    isVIP: floor === 5 && roomNum >= 8,
                    buildingId: building.id
                }
            });
            rooms.push(room);
        }
    }
    console.log(`Created ${rooms.length} rooms`);
    const bus = await prisma.bus.create({
        data: {
            number: 'Bus-001',
            capacity: 50,
            gatheringArea: 'Main Parking Lot',
            driverName: 'John Driver',
            driverPhone: '+1987654321',
            route: 'City Center - Conference Hotel',
            eventId: sampleEvent.id
        }
    });
    console.log('Created bus:', bus.number);
    const attendees = [
        {
            firstName: 'John',
            lastName: 'Smith',
            gender: 'MALE',
            age: 35,
            church: 'First Church',
            region: 'North',
            email: 'john.smith@email.com',
            phoneNumber: '+1234567001',
            isLeader: true,
            isElderly: false,
            isVIP: false
        },
        {
            firstName: 'Mary',
            lastName: 'Johnson',
            gender: 'FEMALE',
            age: 42,
            church: 'Second Church',
            region: 'South',
            email: 'mary.johnson@email.com',
            phoneNumber: '+1234567002',
            isLeader: false,
            isElderly: false,
            isVIP: true
        },
        {
            firstName: 'David',
            lastName: 'Wilson',
            gender: 'MALE',
            age: 68,
            church: 'Third Church',
            region: 'East',
            email: 'david.wilson@email.com',
            phoneNumber: '+1234567003',
            isLeader: false,
            isElderly: true,
            isVIP: false
        }
    ];
    for (const attendeeData of attendees) {
        const attendee = await prisma.attendee.create({
            data: {
                ...attendeeData,
                eventId: sampleEvent.id
            }
        });
        console.log('Created attendee:', `${attendee.firstName} ${attendee.lastName}`);
    }
    console.log('Database seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map