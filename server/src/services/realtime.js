import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let vehiclePositions = new Map();
let activeVehicles = [];

export function startRealTimeUpdates(io) {
  initializeVehiclePositions();
  
  setInterval(async () => {
    await updateVehiclePositions(io);
    await broadcastTrafficUpdates(io);
  }, 2000);

  setInterval(async () => {
    await simulateNewCrossings(io);
  }, 3000);
}

async function initializeVehiclePositions() {
  const intersections = await prisma.intersection.findMany();
  
  const buses = await prisma.bus.findMany({ take: 2 });
  const trams = await prisma.tram.findMany({ take: 1 });

  activeVehicles = [
    ...buses.map(b => ({ id: `bus-${b.id}`, type: 'bus', vehicleId: b.id, line: b.line, regNr: b.regNr })),
    ...trams.map(t => ({ id: `tram-${t.id}`, type: 'tram', vehicleId: t.id, line: t.line, regNr: t.regNr }))
  ];

  intersections.forEach(intersection => {
    activeVehicles.forEach(vehicle => {
      if (!vehiclePositions.has(vehicle.id)) {
        const offsetLat = (Math.random() - 0.5) * 0.01;
        const offsetLng = (Math.random() - 0.5) * 0.01;
        vehiclePositions.set(vehicle.id, {
          lat: intersection.lat + offsetLat,
          lng: intersection.lng + offsetLng,
          heading: Math.random() * 360,
          speed: Math.random() * 40 + 20
        });
      }
    });
  });
}

const vehicleRoutes = new Map();

async function updateVehiclePositions(io) {
  const intersections = await prisma.intersection.findMany();
  
  if (intersections.length < 2) return;

  activeVehicles.forEach(vehicle => {
    let currentPos = vehiclePositions.get(vehicle.id);
    let route = vehicleRoutes.get(vehicle.id);

    if (!currentPos) {
      const startIntersection = intersections[Math.floor(Math.random() * intersections.length)];
      const endIntersection = intersections.find(i => i.id !== startIntersection.id) || intersections[0];
      
      currentPos = {
        lat: startIntersection.lat,
        lng: startIntersection.lng,
        heading: 0,
        speed: 35
      };
      
      route = {
        start: startIntersection,
        end: endIntersection,
        progress: 0
      };
      
      vehiclePositions.set(vehicle.id, currentPos);
      vehicleRoutes.set(vehicle.id, route);
    }

    if (!route) {
      route = vehicleRoutes.get(vehicle.id);
      if (!route) {
        const startIntersection = intersections.find(i => 
          Math.abs(i.lat - currentPos.lat) < 0.01 && Math.abs(i.lng - currentPos.lng) < 0.01
        ) || intersections[0];
        const endIntersection = intersections.find(i => i.id !== startIntersection.id) || intersections[1];
        
        route = {
          start: startIntersection,
          end: endIntersection,
          progress: 0
        };
        vehicleRoutes.set(vehicle.id, route);
      }
    }

    const dx = route.end.lng - route.start.lng;
    const dy = route.end.lat - route.start.lat;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const speed = 0.00015;
    route.progress += speed / Math.max(distance, 0.001);

    if (route.progress >= 1) {
      const newStart = route.end;
      const newEnd = intersections.find(i => i.id !== newStart.id && i.id !== route.start.id) || intersections[0];
      route.start = newStart;
      route.end = newEnd;
      route.progress = 0;
    }

    const newLat = route.start.lat + (route.end.lat - route.start.lat) * route.progress;
    const newLng = route.start.lng + (route.end.lng - route.start.lng) * route.progress;
    const heading = Math.atan2(dy, dx) * 180 / Math.PI + 90;

    vehiclePositions.set(vehicle.id, {
      lat: newLat,
      lng: newLng,
      heading,
      speed: currentPos.speed
    });
  });

  const positions = Array.from(vehiclePositions.entries()).map(([id, pos]) => {
    const vehicle = activeVehicles.find(v => v.id === id);
    return {
      id,
      ...vehicle,
      ...pos
    };
  });

  io.emit('vehicle-updates', positions);
}

async function broadcastTrafficUpdates(io) {
  const intersections = await prisma.intersection.findMany();
  
  for (const intersection of intersections) {
    const semaphores = await prisma.semaphor.findMany({
      where: { intersectionId: intersection.id }
    });
    
    if (semaphores.length === 0) continue;
    
    const semaphorIds = semaphores.map(s => s.id);
    
    const [cars, buses, trams] = await Promise.all([
      prisma.crossingCar.count({
        where: {
          semaphorId: { in: semaphorIds },
          timestamp: { gte: new Date(Date.now() - 60000) }
        }
      }),
      prisma.crossingBus.count({
        where: {
          semaphorId: { in: semaphorIds },
          timestamp: { gte: new Date(Date.now() - 60000) }
        }
      }),
      prisma.crossingTram.count({
        where: {
          semaphorId: { in: semaphorIds },
          timestamp: { gte: new Date(Date.now() - 60000) }
        }
      })
    ]);

    io.to(`intersection-${intersection.id}`).emit('traffic-update', {
      intersectionId: intersection.id,
      stats: { cars, buses, trams, total: cars + buses + trams }
    });
  }
}

async function simulateNewCrossings(io) {
  const semaphores = await prisma.semaphor.findMany({ take: 10 });
  const buses = await prisma.bus.findMany({ take: 5 });
  const trams = await prisma.tram.findMany({ take: 3 });

  if (semaphores.length === 0) return;

  const randomSem = semaphores[Math.floor(Math.random() * semaphores.length)];
  
  if (Math.random() > 0.5 && buses.length > 0) {
    const randomBus = buses[Math.floor(Math.random() * buses.length)];
    await prisma.crossingBus.create({
      data: {
        semaphorId: randomSem.id,
        busId: randomBus.id,
        speed: Math.random() * 40 + 20,
        timestamp: new Date()
      }
    });
  } else if (trams.length > 0) {
    const randomTram = trams[Math.floor(Math.random() * trams.length)];
    await prisma.crossingTram.create({
      data: {
        semaphorId: randomSem.id,
        tramId: randomTram.id,
        speed: Math.random() * 35 + 25,
        timestamp: new Date()
      }
    });
  } else {
    await prisma.crossingCar.create({
      data: {
        semaphorId: randomSem.id,
        speed: Math.random() * 60 + 30,
        timestamp: new Date()
      }
    });
  }
}

