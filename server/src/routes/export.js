// server/src/routes/export.js
import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ---------- GET /api/export/intersections/csv ----------
router.get('/intersections/csv', authenticateToken, async (req, res) => {
  try {
    const p = pool.promise();

    // Get intersections
    const [intersections] = await p.query(
      'SELECT id, name, sector, lat, lng FROM INTERSECTION'
    );

    if (intersections.length === 0) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=intersections.csv'
      );
      return res.send('ID,Name,Sector,Latitude,Longitude,Semaphores,Stations\n');
    }

    const intersectionIds = intersections.map(i => i.id);

    // Count semaphores per intersection
    const [semaphoresCounts] = await p.query(
      `
      SELECT intersectionId AS id, COUNT(*) AS semaphoresCount
      FROM SEMAPHOR
      WHERE intersectionId IN (?)
      GROUP BY intersectionId
      `,
      [intersectionIds]
    );

    // Count stations per intersection (all types)
    const [busStationsCounts] = await p.query(
      `
      SELECT intersectionId AS id, COUNT(*) AS stationsCount
      FROM BUS_STATION
      WHERE intersectionId IN (?)
      GROUP BY intersectionId
      `,
      [intersectionIds]
    );
    const [tramStationsCounts] = await p.query(
      `
      SELECT intersectionId AS id, COUNT(*) AS stationsCount
      FROM TRAM_STATION
      WHERE intersectionId IN (?)
      GROUP BY intersectionId
      `,
      [intersectionIds]
    );
    const [troleibusStationsCounts] = await p.query(
      `
      SELECT intersectionId AS id, COUNT(*) AS stationsCount
      FROM TROLEIBUS_STATION
      WHERE intersectionId IN (?)
      GROUP BY intersectionId
      `,
      [intersectionIds]
    );

    const semaphoresMap = new Map(
      semaphoresCounts.map(r => [r.id, r.semaphoresCount])
    );
    const stationsMap = new Map();
    for (const row of [
      ...busStationsCounts,
      ...tramStationsCounts,
      ...troleibusStationsCounts
    ]) {
      stationsMap.set(row.id, (stationsMap.get(row.id) || 0) + row.stationsCount);
    }

    const header = 'ID,Name,Sector,Latitude,Longitude,Semaphores,Stations';

    const lines = intersections.map(i => {
      const semCount = semaphoresMap.get(i.id) || 0;
      const stCount = stationsMap.get(i.id) || 0;
      const name = (i.name || '').replace(/"/g, '""');
      return `${i.id},"${name}",${i.sector ?? ''},${i.lat ?? ''},${
        i.lng ?? ''
      },${semCount},${stCount}`;
    });

    const csv = [header, ...lines].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=intersections.csv'
    );
    res.send(csv);
  } catch (error) {
    console.error('Error exporting intersections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------- GET /api/export/traffic/csv ----------
router.get('/traffic/csv', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const p = pool.promise();

    // Cars
    const [cars] = await p.query(
      `
      SELECT c.timestamp,
             c.speed,
             s.street,
             i.name AS intersectionName
      FROM CROSSING_CAR c
      JOIN SEMAPHOR s     ON c.semaphorId = s.id
      JOIN INTERSECTION i ON s.intersectionId = i.id
      WHERE c.timestamp BETWEEN ? AND ?
      ORDER BY c.timestamp ASC
      LIMIT 1000
      `,
      [start, end]
    );

    // Buses
    const [buses] = await p.query(
      `
      SELECT cb.timestamp,
             cb.speed,
             s.street,
             i.name AS intersectionName,
             b.regNr AS busRegNr
      FROM CROSSING_BUS cb
      JOIN SEMAPHOR s      ON cb.semaphorId = s.id
      JOIN INTERSECTION i  ON s.intersectionId = i.id
      JOIN BUS b           ON cb.busId = b.id
      WHERE cb.timestamp BETWEEN ? AND ?
      ORDER BY cb.timestamp ASC
      LIMIT 1000
      `,
      [start, end]
    );

    // Trams
    const [trams] = await p.query(
      `
      SELECT ct.timestamp,
             ct.speed,
             s.street,
             i.name AS intersectionName,
             t.regNr AS tramRegNr
      FROM CROSSING_TRAM ct
      JOIN SEMAPHOR s      ON ct.semaphorId = s.id
      JOIN INTERSECTION i  ON s.intersectionId = i.id
      JOIN TRAM t          ON ct.tramId = t.id
      WHERE ct.timestamp BETWEEN ? AND ?
      ORDER BY ct.timestamp ASC
      LIMIT 1000
      `,
      [start, end]
    );

    const header = 'Type,Timestamp,Intersection,Street,Speed,Vehicle';

    const carLines = cars.map(c => {
      const ts = c.timestamp.toISOString();
      const intersection = (c.intersectionName || '').replace(/"/g, '""');
      const street = (c.street || '').replace(/"/g, '""');
      return `Car,"${ts}","${intersection}","${street}",${c.speed ?? ''},`;
    });

    const busLines = buses.map(b => {
      const ts = b.timestamp.toISOString();
      const intersection = (b.intersectionName || '').replace(/"/g, '""');
      const street = (b.street || '').replace(/"/g, '""');
      const vehicle = (b.busRegNr || '').replace(/"/g, '""');
      return `Bus,"${ts}","${intersection}","${street}",${b.speed ?? ''},"${vehicle}"`;
    });

    const tramLines = trams.map(t => {
      const ts = t.timestamp.toISOString();
      const intersection = (t.intersectionName || '').replace(/"/g, '""');
      const street = (t.street || '').replace(/"/g, '""');
      const vehicle = (t.tramRegNr || '').replace(/"/g, '""');
      return `Tram,"${ts}","${intersection}","${street}",${t.speed ?? ''},"${vehicle}"`;
    });

    const csv = [header, ...carLines, ...busLines, ...tramLines].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=traffic-data.csv'
    );
    res.send(csv);
  } catch (error) {
    console.error('Error exporting traffic data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
