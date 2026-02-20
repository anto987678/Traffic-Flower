import express from 'express';
import supabase from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('INTERSECTION')
      .select('id, name, sector, lat, lng')
      .order('name');

    if (error) {
      console.error('Error fetching intersections:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching intersections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const intersectionId = parseInt(id, 10);

  if (Number.isNaN(intersectionId)) {
    return res.status(400).json({ error: 'Invalid intersection id' });
  }

  try {
    const { data: intersection, error: intError } = await supabase
      .from('INTERSECTION')
      .select('id, name, sector, lat, lng')
      .eq('id', intersectionId)
      .maybeSingle();

    if (intError) {
      console.error('Error fetching intersection:', intError);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!intersection) {
      return res.status(404).json({ error: 'Intersection not found' });
    }

    const [
      { data: semaphores },
      { data: busStations },
      { data: tramStations },
      { data: troleibusStations }
    ] = await Promise.all([
      supabase.from('SEMAPHOR').select('id, type, street, sense').eq('intersectionId', intersectionId),
      supabase.from('BUS_STATION').select('id, name, intersectionId').eq('intersectionId', intersectionId),
      supabase.from('TRAM_STATION').select('id, name, intersectionId').eq('intersectionId', intersectionId),
      supabase.from('TROLEIBUS_STATION').select('id, name, intersectionId').eq('intersectionId', intersectionId)
    ]);

    const stations = [
      ...(busStations || []).map(s => ({ ...s, type: 'BUS' })),
      ...(tramStations || []).map(s => ({ ...s, type: 'TRAM' })),
      ...(troleibusStations || []).map(s => ({ ...s, type: 'TROLEIBUS' }))
    ];

    res.json({
      ...intersection,
      semaphores: semaphores || [],
      stations
    });
  } catch (error) {
    console.error('Error fetching intersection details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/stats/volume', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const intersectionId = parseInt(id, 10);

  if (Number.isNaN(intersectionId)) {
    return res.status(400).json({ error: 'Invalid intersection id' });
  }

  const rawDays = parseInt(req.query.days, 10);
  const days = Number.isInteger(rawDays) ? rawDays : 7;

  try {
    const { data: semaphores } = await supabase
      .from('SEMAPHOR')
      .select('id')
      .eq('intersectionId', intersectionId);

    if (!semaphores || semaphores.length === 0) {
      return res.json({ cars: 0, buses: 0, trams: 0, troleibuses: 0, persons: 0, total: 0 });
    }

    const semaphorIds = semaphores.map(s => s.id);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      { count: cars },
      { count: buses },
      { count: trams },
      { count: troleibuses },
      { count: persons }
    ] = await Promise.all([
      supabase.from('CROSSING_CAR').select('*', { count: 'exact', head: true })
        .in('semaphorId', semaphorIds).gte('timestamp', startDate.toISOString()),
      supabase.from('CROSSING_BUS').select('*', { count: 'exact', head: true })
        .in('semaphorId', semaphorIds).gte('timestamp', startDate.toISOString()),
      supabase.from('CROSSING_TRAM').select('*', { count: 'exact', head: true })
        .in('semaphorId', semaphorIds).gte('timestamp', startDate.toISOString()),
      supabase.from('CROSSING_TROLEIBUS').select('*', { count: 'exact', head: true })
        .in('semaphorId', semaphorIds).gte('timestamp', startDate.toISOString()),
      supabase.from('CROSSING_PERSON').select('*', { count: 'exact', head: true })
        .in('semaphorId', semaphorIds).gte('timestamp', startDate.toISOString())
    ]);

    res.json({
      cars: cars || 0,
      buses: buses || 0,
      trams: trams || 0,
      troleibuses: troleibuses || 0,
      persons: persons || 0,
      total: (cars || 0) + (buses || 0) + (trams || 0) + (troleibuses || 0) + (persons || 0)
    });
  } catch (error) {
    console.error('Error fetching volume stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/stats/flow', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const intersectionId = parseInt(id, 10);

  if (Number.isNaN(intersectionId)) {
    return res.status(400).json({ error: 'Invalid intersection id' });
  }

  const rawMinutes = parseInt(req.query.minutes, 10);
  const minutes = Number.isInteger(rawMinutes) ? rawMinutes : 20;

  try {
    const { data: semaphores } = await supabase
      .from('SEMAPHOR')
      .select('id')
      .eq('intersectionId', intersectionId);

    const data = [];
    const now = new Date();
    for (let i = minutes - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000);
      const timeLabel = time.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      data.push({
        time: timeLabel,
        cars: Math.floor(Math.random() * 30),
        buses: Math.floor(Math.random() * 5),
        trams: Math.floor(Math.random() * 3),
        troleibuses: Math.floor(Math.random() * 2),
        total: 0
      });
      data[data.length - 1].total =
        data[data.length - 1].cars +
        data[data.length - 1].buses +
        data[data.length - 1].trams +
        data[data.length - 1].troleibuses;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching flow stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/semaphores/current', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const intersectionId = parseInt(id, 10);

  if (Number.isNaN(intersectionId)) {
    return res.status(400).json({ error: 'Invalid intersection id' });
  }

  try {
    const { data: semaphores } = await supabase
      .from('SEMAPHOR')
      .select('id, type, street, sense')
      .eq('intersectionId', intersectionId);

    if (!semaphores) {
      return res.json([]);
    }

    const semaphoreStatus = await Promise.all(
      semaphores.map(async (sem) => {
        const { data: lastChange } = await supabase
          .from('CHANGING')
          .select('color')
          .eq('semaphorId', sem.id)
          .order('timestamp', { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          id: sem.id,
          type: sem.type,
          street: sem.street,
          sense: sem.sense,
          currentColor: lastChange?.color || 'GREEN'
        };
      })
    );

    res.json(semaphoreStatus);
  } catch (error) {
    console.error('Error fetching semaphore status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/schedule', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const intersectionId = parseInt(id, 10);

  if (Number.isNaN(intersectionId)) {
    return res.status(400).json({ error: 'Invalid intersection id' });
  }

  const rawDays = parseInt(req.query.days, 10);
  const days = Number.isInteger(rawDays) ? rawDays : 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const [
      { data: busStations },
      { data: tramStations },
      { data: troleibusStations }
    ] = await Promise.all([
      supabase.from('BUS_STATION').select('id').eq('intersectionId', intersectionId),
      supabase.from('TRAM_STATION').select('id').eq('intersectionId', intersectionId),
      supabase.from('TROLEIBUS_STATION').select('id').eq('intersectionId', intersectionId)
    ]);

    const schedule = [];

    if (busStations && busStations.length > 0) {
      const busStationIds = busStations.map(s => s.id);
      const { data: stoppedBuses } = await supabase
        .from('STOPPED_BUS')
        .select(`
          stoppedMinutes,
          expectedArrival,
          actualArrival,
          stationId,
          BUS_STATION!inner(name),
          BUS!inner(line, regNr)
        `)
        .in('stationId', busStationIds)
        .gte('expectedArrival', startDate.toISOString())
        .order('expectedArrival');

      if (stoppedBuses) {
        schedule.push(...stoppedBuses.map(sb => ({
          type: 'BUS',
          line: sb.BUS.line,
          regNumber: sb.BUS.regNr,
          expectedArrival: sb.expectedArrival,
          stoppedMinutes: sb.stoppedMinutes,
          stationName: sb.BUS_STATION.name
        })));
      }
    }

    res.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/history', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;
  const intersectionId = parseInt(id, 10);

  if (Number.isNaN(intersectionId)) {
    return res.status(400).json({ error: 'Invalid intersection id' });
  }

  if (!date) {
    return res.status(400).json({ error: 'Date parameter is required (YYYY-MM-DD)' });
  }

  try {
    const hourlyActivity = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      count: Math.floor(Math.random() * 100)
    }));

    res.json({
      date,
      violations: Math.floor(Math.random() * 50),
      violationsByType: {
        cars: Math.floor(Math.random() * 30),
        buses: Math.floor(Math.random() * 5),
        trams: Math.floor(Math.random() * 5),
        troleibuses: Math.floor(Math.random() * 5),
        persons: Math.floor(Math.random() * 5)
      },
      totalVehicles: hourlyActivity.reduce((sum, row) => sum + row.count, 0),
      hourlyActivity
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
