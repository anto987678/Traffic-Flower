/*
  # Populate Traffic Database with January 19-20, 2026 Data
  
  1. Operational Logs (January 19-20, 2026)
    - 150+ car crossings
    - 80+ bus crossings
    - 60+ tram crossings
    - 60+ troleibus crossings
    - 100+ pedestrian crossings
    - 50+ stops per public transport type
    - Semaphore color changes
*/

DO $$
DECLARE
  v_i INTEGER;
  v_light_colors TEXT[] := ARRAY['RED', 'YELLOW', 'GREEN'];
  v_base_date_19 TIMESTAMP := '2026-01-19'::TIMESTAMP;
  v_base_date_20 TIMESTAMP := '2026-01-20'::TIMESTAMP;
BEGIN

  -- =============================================
  -- 1. CROSSING_CAR (150 records) - Jan 19-20
  -- =============================================
  
  FOR v_i IN 1..75 LOOP
    INSERT INTO "CROSSING_CAR" (speed, timestamp, "semaphorId", "carId") 
    SELECT 
      30 + RANDOM() * 50,
      v_base_date_19 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "SEMAPHOR" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "CAR" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  FOR v_i IN 1..75 LOOP
    INSERT INTO "CROSSING_CAR" (speed, timestamp, "semaphorId", "carId") 
    SELECT 
      30 + RANDOM() * 50,
      v_base_date_20 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "SEMAPHOR" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "CAR" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- =============================================
  -- 2. CROSSING_BUS (80 records) - Jan 19-20
  -- =============================================
  
  FOR v_i IN 1..40 LOOP
    INSERT INTO "CROSSING_BUS" (speed, timestamp, "semaphorId", "busId") 
    SELECT 
      20 + RANDOM() * 30,
      v_base_date_19 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "SEMAPHOR" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "BUS" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  FOR v_i IN 1..40 LOOP
    INSERT INTO "CROSSING_BUS" (speed, timestamp, "semaphorId", "busId") 
    SELECT 
      20 + RANDOM() * 30,
      v_base_date_20 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "SEMAPHOR" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "BUS" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- =============================================
  -- 3. CROSSING_TRAM (60 records) - Jan 19-20
  -- =============================================
  
  FOR v_i IN 1..30 LOOP
    INSERT INTO "CROSSING_TRAM" (speed, timestamp, "semaphorId", "tramId") 
    SELECT 
      15 + RANDOM() * 20,
      v_base_date_19 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "SEMAPHOR" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "TRAM" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  FOR v_i IN 1..30 LOOP
    INSERT INTO "CROSSING_TRAM" (speed, timestamp, "semaphorId", "tramId") 
    SELECT 
      15 + RANDOM() * 20,
      v_base_date_20 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "SEMAPHOR" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "TRAM" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- =============================================
  -- 4. CROSSING_TROLEIBUS (60 records) - Jan 19-20
  -- =============================================
  
  FOR v_i IN 1..30 LOOP
    INSERT INTO "CROSSING_TROLEIBUS" (speed, timestamp, "semaphorId", "troleibusId") 
    SELECT 
      15 + RANDOM() * 25,
      v_base_date_19 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "SEMAPHOR" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "TROLEIBUS" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  FOR v_i IN 1..30 LOOP
    INSERT INTO "CROSSING_TROLEIBUS" (speed, timestamp, "semaphorId", "troleibusId") 
    SELECT 
      15 + RANDOM() * 25,
      v_base_date_20 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "SEMAPHOR" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "TROLEIBUS" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- =============================================
  -- 5. CROSSING_PERSON (100 records) - Jan 19-20
  -- =============================================
  
  FOR v_i IN 1..50 LOOP
    INSERT INTO "CROSSING_PERSON" (timestamp, "semaphorId", "personId") 
    SELECT 
      v_base_date_19 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      COALESCE(
        (SELECT id FROM "SEMAPHOR" WHERE type = 'PEDESTRIAN' ORDER BY RANDOM() LIMIT 1),
        (SELECT id FROM "SEMAPHOR" ORDER BY RANDOM() LIMIT 1)
      ),
      (SELECT id FROM "PERSON" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  FOR v_i IN 1..50 LOOP
    INSERT INTO "CROSSING_PERSON" (timestamp, "semaphorId", "personId") 
    SELECT 
      v_base_date_20 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      COALESCE(
        (SELECT id FROM "SEMAPHOR" WHERE type = 'PEDESTRIAN' ORDER BY RANDOM() LIMIT 1),
        (SELECT id FROM "SEMAPHOR" ORDER BY RANDOM() LIMIT 1)
      ),
      (SELECT id FROM "PERSON" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- =============================================
  -- 6. STOPPED_BUS (50 records) - Jan 19-20
  -- =============================================
  
  FOR v_i IN 1..25 LOOP
    INSERT INTO "STOPPED_BUS" ("stoppedMinutes", "expectedArrival", "actualArrival", "busId", "stationId") 
    SELECT 
      FLOOR(RANDOM() * 10)::INTEGER,
      v_base_date_19 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      v_base_date_19 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL + (FLOOR(RANDOM() * 5)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "BUS" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "BUS_STATION" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  FOR v_i IN 1..25 LOOP
    INSERT INTO "STOPPED_BUS" ("stoppedMinutes", "expectedArrival", "actualArrival", "busId", "stationId") 
    SELECT 
      FLOOR(RANDOM() * 10)::INTEGER,
      v_base_date_20 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      v_base_date_20 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL + (FLOOR(RANDOM() * 5)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "BUS" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "BUS_STATION" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- =============================================
  -- 7. STOPPED_TRAM (50 records) - Jan 19-20
  -- =============================================
  
  FOR v_i IN 1..25 LOOP
    INSERT INTO "STOPPED_TRAM" ("stoppedMinutes", "expectedArrival", "actualArrival", "tramId", "stationId") 
    SELECT 
      FLOOR(RANDOM() * 10)::INTEGER,
      v_base_date_19 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      v_base_date_19 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL + (FLOOR(RANDOM() * 5)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "TRAM" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "TRAM_STATION" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  FOR v_i IN 1..25 LOOP
    INSERT INTO "STOPPED_TRAM" ("stoppedMinutes", "expectedArrival", "actualArrival", "tramId", "stationId") 
    SELECT 
      FLOOR(RANDOM() * 10)::INTEGER,
      v_base_date_20 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      v_base_date_20 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL + (FLOOR(RANDOM() * 5)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "TRAM" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "TRAM_STATION" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- =============================================
  -- 8. STOPPED_TROLEIBUS (50 records) - Jan 19-20
  -- =============================================
  
  FOR v_i IN 1..25 LOOP
    INSERT INTO "STOPPED_TROLEIBUS" ("stoppedMinutes", "expectedArrival", "actualArrival", "troleibusId", "stationId") 
    SELECT 
      FLOOR(RANDOM() * 10)::INTEGER,
      v_base_date_19 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      v_base_date_19 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL + (FLOOR(RANDOM() * 5)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "TROLEIBUS" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "TROLEIBUS_STATION" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  FOR v_i IN 1..25 LOOP
    INSERT INTO "STOPPED_TROLEIBUS" ("stoppedMinutes", "expectedArrival", "actualArrival", "troleibusId", "stationId") 
    SELECT 
      FLOOR(RANDOM() * 10)::INTEGER,
      v_base_date_20 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      v_base_date_20 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL + (FLOOR(RANDOM() * 5)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "TROLEIBUS" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "TROLEIBUS_STATION" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- =============================================
  -- 9. CHANGING (Semaphore color changes - Jan 19-20)
  -- =============================================
  
  FOR v_i IN 1..10 LOOP
    INSERT INTO "CHANGING" (color, timestamp, "semaphorId")
    SELECT 
      v_light_colors[FLOOR(RANDOM() * 3)::INTEGER + 1],
      v_base_date_19 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      id
    FROM "SEMAPHOR";
  END LOOP;

  FOR v_i IN 1..10 LOOP
    INSERT INTO "CHANGING" (color, timestamp, "semaphorId")
    SELECT 
      v_light_colors[FLOOR(RANDOM() * 3)::INTEGER + 1],
      v_base_date_20 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      id
    FROM "SEMAPHOR";
  END LOOP;

  RAISE NOTICE 'Database populated successfully with January 19-20, 2026 data!';
END $$;