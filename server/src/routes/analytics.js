import express from 'express';
import supabase from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const rawDays = parseInt(req.query.days, 10);
    const days = Number.isInteger(rawDays) ? rawDays : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      { count: intersectionCount },
      { data: congestionData },
      { data: violationsData }
    ] = await Promise.all([
      supabase.from('INTERSECTION').select('*', { count: 'exact', head: true }),
      supabase.rpc('get_congestion_report', { days_back: days, result_limit: 100 }),
      supabase.rpc('get_recent_violations', { days_back: days, result_limit: 100 })
    ]);

    const totalDelay = congestionData?.reduce((sum, item) => sum + (item.stopped_minutes || 0), 0) || 0;
    const avgDelay = congestionData && congestionData.length > 0
      ? totalDelay / congestionData.length
      : 0;

    res.json({
      totalIntersections: intersectionCount || 0,
      totalDelays: congestionData?.length || 0,
      avgDelayMinutes: Math.round(avgDelay * 10) / 10,
      totalViolations: violationsData?.length || 0
    });
  } catch (error) {
    console.error('Error fetching analytics dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/traffic-flow', authenticateToken, async (req, res) => {
  try {
    const rawDays = parseInt(req.query.days, 10);
    const days = Number.isInteger(rawDays) ? rawDays : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      data.push({
        date: date.toISOString().split('T')[0],
        cars: Math.floor(Math.random() * 500 + 200),
        buses: Math.floor(Math.random() * 100 + 50),
        trams: Math.floor(Math.random() * 80 + 30),
        troleibuses: Math.floor(Math.random() * 60 + 20),
        persons: Math.floor(Math.random() * 300 + 100)
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching traffic flow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/congestion-trends', authenticateToken, async (req, res) => {
  try {
    const rawDays = parseInt(req.query.days, 10);
    const days = Number.isInteger(rawDays) ? rawDays : 7;

    const data = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      data.push({
        date: date.toISOString().split('T')[0],
        delays: Math.floor(Math.random() * 50 + 10)
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching congestion trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
