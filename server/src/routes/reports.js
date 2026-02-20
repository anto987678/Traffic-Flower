import express from 'express';
import supabase from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/congestion', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const rawDays = parseInt(req.query.days, 10);
    const days = Number.isInteger(rawDays) ? rawDays : 7;

    const { data, error } = await supabase.rpc('get_congestion_report', {
      days_back: days,
      result_limit: limit
    });

    if (error) {
      console.error('Error fetching congestion report:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    const congestion = data.map(item => ({
      type: item.type,
      line: item.line_number,
      regNumber: item.reg_number,
      intersection: item.intersection,
      station: item.station,
      stoppedMinutes: item.stopped_minutes,
      expectedArrival: item.expected_arrival,
      actualArrival: item.actual_arrival
    }));

    res.json(congestion);
  } catch (error) {
    console.error('Error fetching congestion report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/violations', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const rawDays = parseInt(req.query.days, 10);
    const days = Number.isInteger(rawDays) ? rawDays : 7;

    const { data, error } = await supabase.rpc('get_recent_violations', {
      days_back: days,
      result_limit: limit
    });

    if (error) {
      console.error('Error fetching violations report:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    const violations = data.map(item => ({
      id: item.id,
      type: item.type,
      intersection: item.intersection,
      street: item.street,
      sense: item.sense,
      timestamp: item.violation_time,
      speed: item.speed,
      regNumber: item.reg_number,
      line: item.line
    }));

    res.json(violations);
  } catch (error) {
    console.error('Error fetching violations report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
