import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create default organization
  const organization = await prisma.organization.upsert({
    where: { id: 'default-org' },
    update: {},
    create: {
      id: 'default-org',
      name: 'Default Organization',
      contactEmail: 'admin@conference-app.com',
      contactPerson: 'System Administrator'
    }
  })

  console.log('Created organization:', organization.name)

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@conference-app.com',
      firstName: 'System',
      lastName: 'Administrator',
      passwordHash: adminPassword,
      role: 'system_admin',
      organizationId: organization.id,
      permissions: JSON.stringify(['*']),
      isActive: true
    }
  })

  console.log('Created admin user:', adminUser.username)

  // Create organizer user
  const organizerPassword = await bcrypt.hash('org123', 12)
  const organizerUser = await prisma.user.upsert({
    where: { username: 'organizer' },
    update: {},
    create: {
      username: 'organizer',
      email: 'organizer@conference-app.com',
      firstName: 'Event',
      lastName: 'Organizer',
      passwordHash: organizerPassword,
      role: 'event_manager',
      organizationId: organization.id,
      permissions: JSON.stringify(['events:read', 'events:write', 'attendees:read', 'attendees:write']),
      isActive: true
    }
  })

  console.log('Created organizer user:', organizerUser.username)

  // Create Accommodation Manager user
  const accoManagerPassword = await bcrypt.hash('accomgr123', 12)
  const accoManagerUser = await prisma.user.upsert({
    where: { username: 'acco_manager' },
    update: {},
    create: {
      username: 'acco_manager',
      email: 'amanager@conference-app.com',
      firstName: 'Accommodation',
      lastName: 'Manager',
      passwordHash: accoManagerPassword,
      role: 'accommodation_manager',
      organizationId: organization.id,
      isActive: true
    }
  })
  console.log('Created accommodation manager user:', accoManagerUser.username)

  // Create Event Attendee user
  const attendeePassword = await bcrypt.hash('attendee123', 12)
  const attendeeUser = await prisma.user.upsert({
    where: { username: 'attendee' },
    update: {},
    create: {
      username: 'attendee',
      email: 'attendee@conference-app.com',
      firstName: 'Regular',
      lastName: 'Attendee',
      passwordHash: attendeePassword,
      role: 'event_attendee',
      organizationId: organization.id,
      isActive: true
    }
  })
  console.log('Created event attendee user:', attendeeUser.username)

  // Create Guest user
  const guestPassword = await bcrypt.hash('guest123', 12)
  const guestUser = await prisma.user.upsert({
    where: { username: 'guest' },
    update: {},
    create: {
      username: 'guest',
      email: 'guest@conference-app.com',
      firstName: 'Guest',
      lastName: 'User',
      passwordHash: guestPassword,
      role: 'guest',
      organizationId: organization.id,
      isActive: true
    }
  })
  console.log('Created guest user:', guestUser.username)

  // Create sample event
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
  })

  console.log('Created sample event:', sampleEvent.name)

  // Create sample accommodation
  const accommodation = await prisma.accommodation.upsert({
    where: { id: 'default-accommodation' },
    update: {},
    create: {
      id: 'default-accommodation',
      name: 'Conference Hotel',
      address: '123 Conference Street, Event City',
      type: 'HOTEL',
      contactPerson: 'Hotel Manager',
      contactPhone: '+1234567890',
      totalCapacity: 200,
      eventId: sampleEvent.id
    }
  })

  console.log('Created accommodation:', accommodation.name)

  // Create sample building
  const building = await prisma.building.upsert({
    where: { id: 'default-building' },
    update: {},
    create: {
      id: 'default-building',
      name: 'Main Building',
      description: 'Primary accommodation building',
      totalFloors: 5,
      accommodationId: accommodation.id
    }
  })

  console.log('Created building:', building.name)

  // Create sample rooms
  const roomData: Prisma.RoomCreateWithoutBuildingInput[] = []
  for (let floor = 1; floor <= 5; floor++) {
    for (let roomNum = 1; roomNum <= 10; roomNum++) {
      roomData.push({
        number: `${floor}${roomNum.toString().padStart(2, '0')}`,
        capacity: floor === 1 ? 4 : 2, // Ground floor has larger capacity
        genderType: roomNum <= 5 ? 'MALE' : 'FEMALE',
        floor: floor,
        isGroundFloorSuitable: floor === 1,
        isVIP: floor === 5 && roomNum >= 8,
      })
    }
  }

  for (const roomInfo of roomData) {
    await prisma.room.upsert({
      where: {
        buildingId_number: {
          buildingId: building.id,
          number: roomInfo.number,
        },
      },
      update: {},
      create: {
        ...roomInfo,
        buildingId: building.id,
      },
    });
  }

  console.log(`Created ${roomData.length} rooms`)

  // Create sample bus
  const bus = await prisma.bus.upsert({
    where: {
      eventId_number: {
        eventId: sampleEvent.id,
        number: 'Bus-001'
      }
    },
    update: {},
    create: {
      number: 'Bus-001',
      capacity: 50,
      gatheringArea: 'Main Parking Lot',
      driverName: 'John Driver',
      driverPhone: '+1987654321',
      route: 'City Center - Conference Hotel',
      eventId: sampleEvent.id
    }
  })

  console.log('Created bus:', bus.number)

  // Create sample attendees
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
  ]

  for (const attendeeData of attendees) {
    const attendee = await prisma.attendee.create({
      data: {
        ...attendeeData,
        eventId: sampleEvent.id
      }
    })
    console.log('Created attendee:', `${attendee.firstName} ${attendee.lastName}`)
  }

  console.log('Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
