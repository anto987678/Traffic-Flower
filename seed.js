import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const daysBack = 30;
const randomPastDate = () => {
  const now = Date.now();
  const rangeMs = daysBack * 24 * 60 * 60 * 1000;
  return new Date(now - Math.floor(Math.random() * rangeMs));
};

async function main() {
  console.log('🌺 Seeding Traffic Flower database (NEW SCHEMA)...');

  // CLEAN DATABASE (order matters)
  await prisma.changing.deleteMany();
  await prisma.crossingPerson.deleteMany();
  await prisma.crossingTroleibus.deleteMany();
  await prisma.crossingTram.deleteMany();
  await prisma.crossingBus.deleteMany();
  await prisma.crossingCar.deleteMany();
  await prisma.stoppedTroleibus.deleteMany();
  await prisma.stoppedTram.deleteMany();
  await prisma.stoppedBus.deleteMany();
  await prisma.person.deleteMany();
  await prisma.car.deleteMany();
  await prisma.troleibus.deleteMany();
  await prisma.tram.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.busStation.deleteMany();
  await prisma.tramStation.deleteMany();
  await prisma.troleibusStation.deleteMany();
  await prisma.semaphor.deleteMany();
  await prisma.intersection.deleteMany();
  await prisma.user.deleteMany();

  // USERS
  await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@trafficflower.com',
      password: 'hashed_password',
      name: 'Admin',
      updatedAt: new Date(),
    },
  });

  // INTERSECTIONS
  const intersectionData = [
    ['Piata Unirii', 3, 44.4268, 26.1025],
    ['Calea Victoriei', 1, 44.4378, 26.0969],
    ['Bd. Magheru', 1, 44.4515, 26.0965],
    ['Piata Romana', 1, 44.4475, 26.0978],
    ['Universitate', 1, 44.4356, 26.1012],
    ['Bd. Iuliu Maniu', 6, 44.4123, 26.0789],
    ['Piata Obor', 2, 44.4501, 26.1234],
    ['Bd. Aviatorilor', 1, 44.4656, 26.0890],
    ['Piata Muncii', 3, 44.4156, 26.1123],
    ['Bd. Timisoara', 6, 44.3989, 26.0567],
    ['Timpuri Noi', 3, 44.4167, 26.1183],
  ];

  const intersections = [];
  for (const [name, sector, lat, lng] of intersectionData) {
    intersections.push(
      await prisma.intersection.create({
        data: { name, sector, lat, lng },
      })
    );
  }

  // SEMAPHORES
  const directions = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
  const semaphores = [];

  for (const i of intersections) {
    for (const dir of directions) {
      semaphores.push(
        await prisma.semaphor.create({
          data: {
            type: 'CAR',
            street: `${i.name} Street`,
            sense: dir,
            intersectionId: i.id,
          },
        })
      );
    }
  }

  // STATIONS
  const busStations = [];
  const tramStations = [];
  const troleibusStations = [];

  for (const i of intersections) {
    busStations.push(
      await prisma.busStation.create({
        data: {
          name: `${i.name} Bus Stop`,
          sense: 'FORWARD',
          no_people: 10,
          no_buses: 2,
          intersectionId: i.id,
        },
      })
    );

    tramStations.push(
      await prisma.tramStation.create({
        data: {
          name: `${i.name} Tram Stop`,
          sense: 'FORWARD',
          no_people: 15,
          no_trams: 1,
          intersectionId: i.id,
        },
      })
    );

    troleibusStations.push(
      await prisma.troleibusStation.create({
        data: {
          name: `${i.name} Troleibus Stop`,
          sense: 'FORWARD',
          no_people: 12,
          no_troleibuses: 1,
          intersectionId: i.id,
        },
      })
    );
  }

  // VEHICLES & PERSONS
  const cars = await Promise.all(
    Array.from({ length: 100 }).map((_, i) =>
      prisma.car.create({ data: { color: 'black', regNr: `CAR-${i + 1}` } })
    )
  );

  const persons = await Promise.all(
    Array.from({ length: 200 }).map(() =>
      prisma.person.create({ data: { gender: 'unknown' } })
    )
  );

  const buses = await Promise.all(
    Array.from({ length: 30 }).map((_, i) =>
      prisma.bus.create({ data: { regNr: `BUS-${i + 1}`, line: `${i % 10}` } })
    )
  );

  const trams = await Promise.all(
    Array.from({ length: 20 }).map((_, i) =>
      prisma.tram.create({ data: { regNr: `TRAM-${i + 1}`, line: `${i % 5}` } })
    )
  );

  const troleibuses = await Promise.all(
    Array.from({ length: 15 }).map((_, i) =>
      prisma.troleibus.create({ data: { regNr: `TROL-${i + 1}`, line: `${i % 7}` } })
    )
  );

  // CROSSINGS
  for (let i = 0; i < 2000; i++) {
    const crossingTime = randomPastDate();
    await prisma.crossingCar.create({
      data: {
        semaphorId: semaphores[i % semaphores.length].id,
        carId: cars[i % cars.length].id,
        speed: 30 + Math.random() * 40,
        timestamp: crossingTime,
      },
    });

    await prisma.crossingPerson.create({
      data: {
        semaphorId: semaphores[i % semaphores.length].id,
        personId: persons[i % persons.length].id,
        timestamp: randomPastDate(),
      },
    });
  }

  // STOPPED EVENTS
  for (let i = 0; i < 100; i++) {
    const stopTime = randomPastDate();
    await prisma.stoppedBus.create({
      data: {
        busId: buses[i % buses.length].id,
        stationId: busStations[i % busStations.length].id,
        stoppedMinutes: Math.floor(Math.random() * 10),
        expectedArrival: stopTime,
        actualArrival: stopTime,
      },
    });

    const tramStopTime = randomPastDate();
    await prisma.stoppedTram.create({
      data: {
        tramId: trams[i % trams.length].id,
        stationId: tramStations[i % tramStations.length].id,
        stoppedMinutes: Math.floor(Math.random() * 7),
        expectedArrival: tramStopTime,
        actualArrival: tramStopTime,
      },
    });

    const troleibusStopTime = randomPastDate();
    await prisma.stoppedTroleibus.create({
      data: {
        troleibusId: troleibuses[i % troleibuses.length].id,
        stationId: troleibusStations[i % troleibusStations.length].id,
        stoppedMinutes: Math.floor(Math.random() * 8),
        expectedArrival: troleibusStopTime,
        actualArrival: troleibusStopTime,
      },
    });
  }

  // CHANGING
  const colors = ['RED', 'YELLOW', 'GREEN'];
  for (let i = 0; i < 500; i++) {
    await prisma.changing.create({
      data: {
        semaphorId: semaphores[i % semaphores.length].id,
        color: colors[i % 3],
        timestamp: randomPastDate(),
      },
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
