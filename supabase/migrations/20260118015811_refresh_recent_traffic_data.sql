/*
  # Refresh Recent Traffic Data
  
  This migration refreshes the traffic crossing data to ensure recent data is available
  for dashboard analytics. It deletes old crossings and generates new data for the
  last 30 days with realistic timestamps.
  
  ## What this does:
  - Clears crossing data older than 90 days to keep database clean
  - Generates fresh traffic crossing data for the last 30 days
  - Ensures Dashboard shows current statistics
  - Maintains realistic traffic patterns (rush hours, weekday/weekend differences)
  
  ## Data Generated:
  - Car crossings: 3000+ records
  - Bus crossings: 1200+ records
  - Tram crossings: 900+ records
  - Troleibus crossings: 900+ records
  - Pedestrian crossings: 2000+ records
  - Public transport stops: 600+ records
*/

DO $$
DECLARE
  v_start_date TIMESTAMP;
  v_current_date TIMESTAMP;
  v_hour INTEGER;
  v_day_of_week INTEGER;
  v_traffic_multiplier DECIMAL;
  v_i INTEGER;
  v_base_count INTEGER;
BEGIN

  -- Clean old data (keep only last 90 days)
  DELETE FROM "CROSSING_CAR" WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM "CROSSING_BUS" WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM "CROSSING_TRAM" WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM "CROSSING_TROLEIBUS" WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM "CROSSING_PERSON" WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM "STOPPED_BUS" WHERE "actualArrival" < NOW() - INTERVAL '90 days';
  DELETE FROM "STOPPED_TRAM" WHERE "actualArrival" < NOW() - INTERVAL '90 days';
  DELETE FROM "STOPPED_TROLEIBUS" WHERE "actualArrival" < NOW() - INTERVAL '90 days';

  -- Generate fresh data for last 30 days
  v_start_date := NOW() - INTERVAL '30 days';
  v_current_date := v_start_date;

  WHILE v_current_date < NOW() LOOP
    v_day_of_week := EXTRACT(DOW FROM v_current_date)::INTEGER;
    
    FOR v_hour IN 0..23 LOOP
      v_traffic_multiplier := 1.0;
      
      -- Weekday traffic patterns
      IF v_day_of_week IN (1, 2, 3, 4, 5) THEN
        IF v_hour IN (7, 8) THEN
          v_traffic_multiplier := 2.5;
        ELSIF v_hour IN (17, 18) THEN
          v_traffic_multiplier := 2.3;
        ELSIF v_hour >= 9 AND v_hour < 17 THEN
          v_traffic_multiplier := 1.8;
        ELSIF v_hour >= 6 AND v_hour < 7 THEN
          v_traffic_multiplier := 1.2;
        ELSIF v_hour >= 19 AND v_hour < 22 THEN
          v_traffic_multiplier := 1.3;
        ELSIF v_hour >= 22 OR v_hour < 6 THEN
          v_traffic_multiplier := 0.4;
        END IF;
      ELSE
        -- Weekend patterns
        IF v_hour IN (10, 11, 15, 16, 17, 18) THEN
          v_traffic_multiplier := 1.5;
        ELSIF v_hour >= 9 AND v_hour < 20 THEN
          v_traffic_multiplier := 1.2;
        ELSIF v_hour >= 20 OR v_hour < 7 THEN
          v_traffic_multiplier := 0.5;
        ELSE
          v_traffic_multiplier := 0.3;
        END IF;
      END IF;

      -- Car crossings
      v_base_count := FLOOR(20 * v_traffic_multiplier)::INTEGER;
      FOR v_i IN 1..v_base_count LOOP
        INSERT INTO "CROSSING_CAR" (speed, timestamp, "semaphorId", "carId")
        SELECT 
          25 + RANDOM() * 55,
          v_current_date + (v_hour::TEXT || ' hours')::INTERVAL + 
            (FLOOR(RANDOM() * 60)::INTEGER || ' minutes')::INTERVAL,
          (SELECT id FROM "SEMAPHOR" WHERE type = 'VEHICLE' ORDER BY RANDOM() LIMIT 1),
          (SELECT id FROM "CAR" ORDER BY RANDOM() LIMIT 1);
      END LOOP;

      -- Bus crossings
      v_base_count := FLOOR(8 * v_traffic_multiplier)::INTEGER;
      FOR v_i IN 1..v_base_count LOOP
        INSERT INTO "CROSSING_BUS" (speed, timestamp, "semaphorId", "busId")
        SELECT 
          15 + RANDOM() * 35,
          v_current_date + (v_hour::TEXT || ' hours')::INTERVAL + 
            (FLOOR(RANDOM() * 60)::INTEGER || ' minutes')::INTERVAL,
          (SELECT id FROM "SEMAPHOR" WHERE type = 'VEHICLE' ORDER BY RANDOM() LIMIT 1),
          (SELECT id FROM "BUS" ORDER BY RANDOM() LIMIT 1);
      END LOOP;

      -- Tram crossings
      v_base_count := FLOOR(6 * v_traffic_multiplier)::INTEGER;
      FOR v_i IN 1..v_base_count LOOP
        INSERT INTO "CROSSING_TRAM" (speed, timestamp, "semaphorId", "tramId")
        SELECT 
          12 + RANDOM() * 22,
          v_current_date + (v_hour::TEXT || ' hours')::INTERVAL + 
            (FLOOR(RANDOM() * 60)::INTEGER || ' minutes')::INTERVAL,
          (SELECT id FROM "SEMAPHOR" WHERE type = 'VEHICLE' ORDER BY RANDOM() LIMIT 1),
          (SELECT id FROM "TRAM" ORDER BY RANDOM() LIMIT 1);
      END LOOP;

      -- Troleibus crossings
      v_base_count := FLOOR(6 * v_traffic_multiplier)::INTEGER;
      FOR v_i IN 1..v_base_count LOOP
        INSERT INTO "CROSSING_TROLEIBUS" (speed, timestamp, "semaphorId", "troleibusId")
        SELECT 
          12 + RANDOM() * 28,
          v_current_date + (v_hour::TEXT || ' hours')::INTERVAL + 
            (FLOOR(RANDOM() * 60)::INTEGER || ' minutes')::INTERVAL,
          (SELECT id FROM "SEMAPHOR" WHERE type = 'VEHICLE' ORDER BY RANDOM() LIMIT 1),
          (SELECT id FROM "TROLEIBUS" ORDER BY RANDOM() LIMIT 1);
      END LOOP;

      -- Pedestrian crossings
      v_base_count := FLOOR(15 * v_traffic_multiplier)::INTEGER;
      FOR v_i IN 1..v_base_count LOOP
        INSERT INTO "CROSSING_PERSON" (timestamp, "semaphorId", "personId")
        SELECT 
          v_current_date + (v_hour::TEXT || ' hours')::INTERVAL + 
            (FLOOR(RANDOM() * 60)::INTEGER || ' minutes')::INTERVAL,
          COALESCE(
            (SELECT id FROM "SEMAPHOR" WHERE type = 'PEDESTRIAN' ORDER BY RANDOM() LIMIT 1),
            (SELECT id FROM "SEMAPHOR" ORDER BY RANDOM() LIMIT 1)
          ),
          (SELECT id FROM "PERSON" ORDER BY RANDOM() LIMIT 1);
      END LOOP;

      -- Stopped buses
      v_base_count := FLOOR(3 * v_traffic_multiplier)::INTEGER;
      FOR v_i IN 1..v_base_count LOOP
        INSERT INTO "STOPPED_BUS" ("stoppedMinutes", "expectedArrival", "actualArrival", "busId", "stationId")
        SELECT 
          FLOOR(RANDOM() * 15)::INTEGER,
          v_current_date + (v_hour::TEXT || ' hours')::INTERVAL,
          v_current_date + (v_hour::TEXT || ' hours')::INTERVAL + 
            (FLOOR(RANDOM() * 10)::INTEGER || ' minutes')::INTERVAL,
          (SELECT id FROM "BUS" ORDER BY RANDOM() LIMIT 1),
          (SELECT id FROM "BUS_STATION" ORDER BY RANDOM() LIMIT 1);
      END LOOP;

      -- Stopped trams
      v_base_count := FLOOR(2 * v_traffic_multiplier)::INTEGER;
      FOR v_i IN 1..v_base_count LOOP
        INSERT INTO "STOPPED_TRAM" ("stoppedMinutes", "expectedArrival", "actualArrival", "tramId", "stationId")
        SELECT 
          FLOOR(RANDOM() * 12)::INTEGER,
          v_current_date + (v_hour::TEXT || ' hours')::INTERVAL,
          v_current_date + (v_hour::TEXT || ' hours')::INTERVAL + 
            (FLOOR(RANDOM() * 8)::INTEGER || ' minutes')::INTERVAL,
          (SELECT id FROM "TRAM" ORDER BY RANDOM() LIMIT 1),
          (SELECT id FROM "TRAM_STATION" ORDER BY RANDOM() LIMIT 1);
      END LOOP;

      -- Stopped troleibuses
      v_base_count := FLOOR(2 * v_traffic_multiplier)::INTEGER;
      FOR v_i IN 1..v_base_count LOOP
        INSERT INTO "STOPPED_TROLEIBUS" ("stoppedMinutes", "expectedArrival", "actualArrival", "troleibusId", "stationId")
        SELECT 
          FLOOR(RANDOM() * 12)::INTEGER,
          v_current_date + (v_hour::TEXT || ' hours')::INTERVAL,
          v_current_date + (v_hour::TEXT || ' hours')::INTERVAL + 
            (FLOOR(RANDOM() * 8)::INTEGER || ' minutes')::INTERVAL,
          (SELECT id FROM "TROLEIBUS" ORDER BY RANDOM() LIMIT 1),
          (SELECT id FROM "TROLEIBUS_STATION" ORDER BY RANDOM() LIMIT 1);
      END LOOP;

    END LOOP;

    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;

  RAISE NOTICE 'Traffic data refreshed successfully! 30 days of recent data generated.';
END $$;