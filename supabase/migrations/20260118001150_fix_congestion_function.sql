/*
  # Fix Congestion Report Function
  
  1. Fix column name ambiguity in get_congestion_report function
*/

DROP FUNCTION IF EXISTS get_congestion_report(INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION get_congestion_report(days_back INTEGER DEFAULT 7, result_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  type TEXT,
  line_number TEXT,
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
      b.line as vehicle_line,
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
    vehicle_line as line_number,
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