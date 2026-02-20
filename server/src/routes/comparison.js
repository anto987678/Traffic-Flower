// server/src/routes/comparison.js
import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/comparison/intersections?ids=1,2,3
router.get('/intersections', authenticateToken, async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res
        .status(400)
        .json({ error: 'Intersection IDs required (comma-separated)' });
    }

    const intersectionIds = ids
      .split(',')
      .map(id => parseInt(id.trim(), 10))
      .filter(id => !Number.isNaN(id));

    if (intersectionIds.length === 0) {
      return res
        .status(400)
        .json({ error: 'No valid intersection IDs provided' });
    }

    const p = pool.promise();

    // 1) Load intersections
    const [intersections] = await p.query(
      'SELECT id, name, sector FROM INTERSECTION WHERE id IN (?)',
      [intersectionIds]
    );
    if (intersections.length === 0) {
      return res.json([]);
    }

    const existingIds = intersections.map(i => i.id);

    // 2) Load semaphores for these intersections
    const [semaphors] = await p.query(
      'SELECT id, intersectionId FROM SEMAPHOR WHERE intersectionId IN (?)',
      [existingIds]
    );

    const semaphorsByIntersection = new Map();
    for (const s of semaphors) {
      if (!semaphorsByIntersection.has(s.intersectionId)) {
        semaphorsByIntersection.set(s.intersectionId, []);
      }
      semaphorsByIntersection.get(s.intersectionId).push(s.id);
    }

    const comparisons = [];

    for (const intersection of intersections) {
      const semaphorIds = semaphorsByIntersection.get(intersection.id) || [];

      if (semaphorIds.length === 0) {
        comparisons.push({
          id: intersection.id,
          name: intersection.name,
          sector: intersection.sector,
          stats: {
            cars: 0,
            buses: 0,
            trams: 0,
            total: 0
          }
        });
        continue;
      }

      const [
        [carsRow],
        [busesRow],
        [tramsRow]
      ] = await Promise.all([
        p.query(
          'SELECT COUNT(*) AS cnt FROM CROSSING_CAR WHERE semaphorId IN (?)',
          [semaphorIds]
        ),
        p.query(
          'SELECT COUNT(*) AS cnt FROM CROSSING_BUS WHERE semaphorId IN (?)',
          [semaphorIds]
        ),
        p.query(
          'SELECT COUNT(*) AS cnt FROM CROSSING_TRAM WHERE semaphorId IN (?)',
          [semaphorIds]
        )
      ]);

      const cars = carsRow[0].cnt;
      const buses = busesRow[0].cnt;
      const trams = tramsRow[0].cnt;

      comparisons.push({
        id: intersection.id,
        name: intersection.name,
        sector: intersection.sector,
        stats: {
          cars,
          buses,
          trams,
          total: cars + buses + trams
        }
      });
    }

    res.json(comparisons);
  } catch (error) {
    console.error('Error comparing intersections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
