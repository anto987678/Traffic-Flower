/*
  # Create Functions for Violation Detection and Reports
  
  1. New Functions
    - get_recent_violations: Returns red light violations from the last N days
    - get_congestion_report: Returns delayed public transport
  
  2. These functions simplify complex queries and improve performance
*/

-- Function to get recent violations
CREATE OR REPLACE FUNCTION get_recent_violations(days_back INTEGER DEFAULT 7, result_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  id TEXT,
  type TEXT,
  intersection TEXT,
  street TEXT,
  sense TEXT,
  violation_time TIMESTAMPTZ,
  speed DOUBLE PRECISION,
  reg_number TEXT,
  line TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH red_lights AS (
    SELECT 
      "semaphorId",
      timestamp as red_time
    FROM "CHANGING"
    WHERE color = 'RED'
      AND timestamp >= NOW() - (days_back || ' days')::INTERVAL
  ),
  all_crossings AS (
    SELECT 
      'CAR' as crossing_type,
      cc.id,
      cc."semaphorId",
      cc.timestamp as crossing_time,
      cc.speed,
      c."regNr" as registration,
      NULL::TEXT as line_number
    FROM "CROSSING_CAR" cc
    JOIN "CAR" c ON cc."carId" = c.id
    WHERE cc.timestamp >= NOW() - (days_back || ' days')::INTERVAL
    
    UNION ALL
    
    SELECT 
      'BUS',
      cb.id,
      cb."semaphorId",
      cb.timestamp,
      cb.speed,
      b."regNr",
      b.line
    FROM "CROSSING_BUS" cb
    JOIN "BUS" b ON cb."busId" = b.id
    WHERE cb.timestamp >= NOW() - (days_back || ' days')::INTERVAL
    
    UNION ALL
    
    SELECT 
      'TRAM',
      ct.id,
      ct."semaphorId",
      ct.timestamp,
      ct.speed,
      t."regNr",
      t.line
    FROM "CROSSING_TRAM" ct
    JOIN "TRAM" t ON ct."tramId" = t.id
    WHERE ct.timestamp >= NOW() - (days_back || ' days')::INTERVAL
    
    UNION ALL
    
    SELECT 
      'TROLEIBUS',
      ctr.id,
      ctr."semaphorId",
      ctr.timestamp,
      ctr.speed,
      tr."regNr",
      tr.line
    FROM "CROSSING_TROLEIBUS" ctr
    JOIN "TROLEIBUS" tr ON ctr."troleibusId" = tr.id
    WHERE ctr.timestamp >= NOW() - (days_back || ' days')::INTERVAL
    
    UNION ALL
    
    SELECT 
      'PERSON',
      cp.id,
      cp."semaphorId",
      cp.timestamp,
      NULL,
      NULL,
      NULL
    FROM "CROSSING_PERSON" cp
    WHERE cp.timestamp >= NOW() - (days_back || ' days')::INTERVAL
  )
  SELECT 
    ac.crossing_type || '-' || ac.id::TEXT as id,
    ac.crossing_type as type,
    i.name as intersection,
    s.street,
    s.sense,
    ac.crossing_time as violation_time,
    ac.speed,
    ac.registration as reg_number,
    ac.line_number as line
  FROM all_crossings ac
  JOIN "SEMAPHOR" s ON ac."semaphorId" = s.id
  JOIN "INTERSECTION" i ON s."intersectionId" = i.id
  WHERE EXISTS (
    SELECT 1 
    FROM red_lights rl 
    WHERE rl."semaphorId" = ac."semaphorId"
      AND ac.crossing_time >= rl.red_time
      AND ac.crossing_time < rl.red_time + INTERVAL '120 seconds'
  )
  ORDER BY ac.crossing_time DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get congestion report
CREATE OR REPLACE FUNCTION get_congestion_report(days_back INTEGER DEFAULT 7, result_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  type TEXT,
  line TEXT,
  reg_number TEXT,
  intersection TEXT,
  station TEXT,
  stopped_minutes INTEGER,
  expected_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH all_delays AS (
    SELECT 
      'BUS' as transport_type,
      b.line,
      b."regNr" as registration,
      i.name as intersection_name,
      bs.name as station_name,
      sb."stoppedMinutes",
      sb."expectedArrival",
      sb."actualArrival"
    FROM "STOPPED_BUS" sb
    JOIN "BUS" b ON sb."busId" = b.id
    JOIN "BUS_STATION" bs ON sb."stationId" = bs.id
    JOIN "INTERSECTION" i ON bs."intersectionId" = i.id
    WHERE sb."actualArrival" >= NOW() - (days_back || ' days')::INTERVAL
      AND sb."stoppedMinutes" > 0
    
    UNION ALL
    
    SELECT 
      'TRAM',
      t.line,
      t."regNr",
      i.name,
      ts.name,
      st."stoppedMinutes",
      st."expectedArrival",
      st."actualArrival"
    FROM "STOPPED_TRAM" st
    JOIN "TRAM" t ON st."tramId" = t.id
    JOIN "TRAM_STATION" ts ON st."stationId" = ts.id
    JOIN "INTERSECTION" i ON ts."intersectionId" = i.id
    WHERE st."actualArrival" >= NOW() - (days_back || ' days')::INTERVAL
      AND st."stoppedMinutes" > 0
    
    UNION ALL
    
    SELECT 
      'TROLEIBUS',
      tr.line,
      tr."regNr",
      i.name,
      trs.name,
      str."stoppedMinutes",
      str."expectedArrival",
      str."actualArrival"
    FROM "STOPPED_TROLEIBUS" str
    JOIN "TROLEIBUS" tr ON str."troleibusId" = tr.id
    JOIN "TROLEIBUS_STATION" trs ON str."stationId" = trs.id
    JOIN "INTERSECTION" i ON trs."intersectionId" = i.id
    WHERE str."actualArrival" >= NOW() - (days_back || ' days')::INTERVAL
      AND str."stoppedMinutes" > 0
  )
  SELECT 
    transport_type as type,
    line,
    registration as reg_number,
    intersection_name as intersection,
    station_name as station,
    "stoppedMinutes" as stopped_minutes,
    "expectedArrival" as expected_arrival,
    "actualArrival" as actual_arrival
  FROM all_delays
  ORDER BY "stoppedMinutes" DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;