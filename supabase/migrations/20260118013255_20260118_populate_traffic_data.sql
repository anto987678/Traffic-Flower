/*
  # Populate Traffic Database with Sample Data
  
  1. Infrastructure
    - 7 intersections across different sectors
    - 21+ semaphores (3+ per intersection)
    - Public transport stations (bus, tram, troleibus)
  
  2. Entities
    - 35+ cars with registration numbers
    - 30+ buses with line numbers
    - 30+ trams with line numbers
    - 30+ troleibuses with line numbers
    - 50+ persons with gender data
  
  3. Operational Logs (last 24 hours)
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
  v_intersection_id INTEGER;
  v_semaphor_id INTEGER;
  v_vehicle_id INTEGER;
  v_person_id INTEGER;
  v_i INTEGER;
  v_colors TEXT[] := ARRAY['Red', 'Blue', 'Black', 'White', 'Silver'];
  v_light_colors TEXT[] := ARRAY['RED', 'YELLOW', 'GREEN'];
BEGIN

  -- =============================================
  -- 1. INFRASTRUCTURE (Intersections)
  -- =============================================
  
  INSERT INTO "INTERSECTION" (name, sector, lat, lng) VALUES 
  ('Piata Unirii', 3, 44.4268, 26.1025),
  ('Piata Victoriei', 1, 44.4522, 26.0864),
  ('Piata Iancului', 2, 44.4415, 26.1317),
  ('Dristor', 3, 44.4196, 26.1396),
  ('Piata Romana', 1, 44.4473, 26.0979),
  ('Universitate', 3, 44.4355, 26.1025),
  ('Obor', 2, 44.4500, 26.1200);

  -- =============================================
  -- 2. INFRASTRUCTURE DETAILS (Semaphores)
  -- =============================================
  
  FOR v_i IN 0..6 LOOP
    INSERT INTO "SEMAPHOR" (type, street, sense, "intersectionId")
    VALUES 
      ('VEHICLE', 'Main Road', 'North', v_i + 1),
      ('VEHICLE', 'Cross Road', 'East', v_i + 1),
      ('PEDESTRIAN', 'Crosswalk', 'Any', v_i + 1),
      ('VEHICLE', 'Side Street', 'South', v_i + 1);
  END LOOP;

  -- =============================================
  -- 3. STATIONS (Bus, Tram, Troleibus)
  -- =============================================
  
  FOR v_i IN 0..6 LOOP
    INSERT INTO "BUS_STATION" (name, sense, no_people, no_buses, "intersectionId")
    VALUES 
      ('Station ' || (v_i + 1) || 'A', 'North', FLOOR(RANDOM() * 50)::INTEGER, FLOOR(RANDOM() * 10)::INTEGER, v_i + 1),
      ('Station ' || (v_i + 1) || 'B', 'South', FLOOR(RANDOM() * 50)::INTEGER, FLOOR(RANDOM() * 10)::INTEGER, v_i + 1);
    
    INSERT INTO "TRAM_STATION" (name, sense, no_people, no_trams, "intersectionId")
    VALUES 
      ('Tram Stop ' || (v_i + 1), 'East', FLOOR(RANDOM() * 100)::INTEGER, FLOOR(RANDOM() * 5)::INTEGER, v_i + 1);
    
    INSERT INTO "TROLEIBUS_STATION" (name, sense, no_people, no_troleibuses, "intersectionId")
    VALUES 
      ('Trolley Stop ' || (v_i + 1), 'West', FLOOR(RANDOM() * 30)::INTEGER, FLOOR(RANDOM() * 5)::INTEGER, v_i + 1);
  END LOOP;

  -- =============================================
  -- 4. VEHICLES (Cars, Buses, Trams, Troleibuses)
  -- =============================================
  
  -- CARS (35 records)
  FOR v_i IN 1..35 LOOP
    INSERT INTO "CAR" (color, "regNr") VALUES (
      v_colors[FLOOR(RANDOM() * 5)::INTEGER + 1],
      'B-' || (10 + FLOOR(RANDOM() * 90)::INTEGER) || '-' || 
      CHR(65 + FLOOR(RANDOM() * 26)::INTEGER) || 
      CHR(65 + FLOOR(RANDOM() * 26)::INTEGER) || 
      CHR(65 + FLOOR(RANDOM() * 26)::INTEGER)
    ) ON CONFLICT DO NOTHING;
  END LOOP;

  -- BUSES (30 records)
  FOR v_i IN 1..30 LOOP
    INSERT INTO "BUS" ("regNr", line) VALUES (
      'B-STB-' || (100 + FLOOR(RANDOM() * 800)::INTEGER),
      (100 + FLOOR(RANDOM() * 300)::INTEGER)::TEXT
    ) ON CONFLICT DO NOTHING;
  END LOOP;

  -- TRAMS (30 records)
  FOR v_i IN 1..30 LOOP
    INSERT INTO "TRAM" ("regNr", line) VALUES (
      'B-TRM-' || (100 + FLOOR(RANDOM() * 800)::INTEGER),
      (1 + FLOOR(RANDOM() * 55)::INTEGER)::TEXT
    ) ON CONFLICT DO NOTHING;
  END LOOP;

  -- TROLEIBUSES (30 records)
  FOR v_i IN 1..30 LOOP
    INSERT INTO "TROLEIBUS" ("regNr", line) VALUES (
      'B-TRL-' || (100 + FLOOR(RANDOM() * 800)::INTEGER),
      (60 + FLOOR(RANDOM() * 40)::INTEGER)::TEXT
    ) ON CONFLICT DO NOTHING;
  END LOOP;

  -- PERSONS (50 records)
  FOR v_i IN 1..50 LOOP
    INSERT INTO "PERSON" (gender) VALUES (
      CASE WHEN RANDOM() > 0.5 THEN 'Male' ELSE 'Female' END
    );
  END LOOP;

  -- =============================================
  -- 5. OPERATIONAL LOGS (last 24 hours)
  -- =============================================
  
  -- CROSSING_CAR (150 records)
  FOR v_i IN 1..150 LOOP
    INSERT INTO "CROSSING_CAR" (speed, timestamp, "semaphorId", "carId") 
    SELECT 
      30 + RANDOM() * 50,
      NOW() - (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "SEMAPHOR" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "CAR" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- CROSSING_BUS (80 records)
  FOR v_i IN 1..80 LOOP
    INSERT INTO "CROSSING_BUS" (speed, timestamp, "semaphorId", "busId") 
    SELECT 
      20 + RANDOM() * 30,
      NOW() - (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "SEMAPHOR" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "BUS" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- CROSSING_TRAM (60 records)
  FOR v_i IN 1..60 LOOP
    INSERT INTO "CROSSING_TRAM" (speed, timestamp, "semaphorId", "tramId") 
    SELECT 
      15 + RANDOM() * 20,
      NOW() - (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "SEMAPHOR" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "TRAM" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- CROSSING_TROLEIBUS (60 records)
  FOR v_i IN 1..60 LOOP
    INSERT INTO "CROSSING_TROLEIBUS" (speed, timestamp, "semaphorId", "troleibusId") 
    SELECT 
      15 + RANDOM() * 25,
      NOW() - (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "SEMAPHOR" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "TROLEIBUS" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- CROSSING_PERSON (100 records)
  FOR v_i IN 1..100 LOOP
    INSERT INTO "CROSSING_PERSON" (timestamp, "semaphorId", "personId") 
    SELECT 
      NOW() - (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      COALESCE(
        (SELECT id FROM "SEMAPHOR" WHERE type = 'PEDESTRIAN' ORDER BY RANDOM() LIMIT 1),
        (SELECT id FROM "SEMAPHOR" ORDER BY RANDOM() LIMIT 1)
      ),
      (SELECT id FROM "PERSON" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- STOPPED_BUS (50 records)
  FOR v_i IN 1..50 LOOP
    INSERT INTO "STOPPED_BUS" ("stoppedMinutes", "expectedArrival", "actualArrival", "busId", "stationId") 
    SELECT 
      FLOOR(RANDOM() * 10)::INTEGER,
      NOW(),
      NOW() + (FLOOR(RANDOM() * 5)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "BUS" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "BUS_STATION" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- STOPPED_TRAM (50 records)
  FOR v_i IN 1..50 LOOP
    INSERT INTO "STOPPED_TRAM" ("stoppedMinutes", "expectedArrival", "actualArrival", "tramId", "stationId") 
    SELECT 
      FLOOR(RANDOM() * 10)::INTEGER,
      NOW(),
      NOW() + (FLOOR(RANDOM() * 5)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "TRAM" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "TRAM_STATION" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- STOPPED_TROLEIBUS (50 records)
  FOR v_i IN 1..50 LOOP
    INSERT INTO "STOPPED_TROLEIBUS" ("stoppedMinutes", "expectedArrival", "actualArrival", "troleibusId", "stationId") 
    SELECT 
      FLOOR(RANDOM() * 10)::INTEGER,
      NOW(),
      NOW() + (FLOOR(RANDOM() * 5)::INTEGER || ' minutes')::INTERVAL,
      (SELECT id FROM "TROLEIBUS" ORDER BY RANDOM() LIMIT 1),
      (SELECT id FROM "TROLEIBUS_STATION" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- CHANGING (Semaphore color changes - for each semaphor)
  INSERT INTO "CHANGING" (color, timestamp, "semaphorId")
  SELECT 
    v_light_colors[FLOOR(RANDOM() * 3)::INTEGER + 1],
    NOW() - (FLOOR(RANDOM() * 60)::INTEGER || ' minutes')::INTERVAL,
    id
  FROM "SEMAPHOR";

  RAISE NOTICE 'Database population completed successfully!';
END $$;