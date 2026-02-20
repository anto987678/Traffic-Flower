/*
  # Populate Active Alerts for January 19-20, 2026
  
  Creates violations (red light crossings) and delays (public transport stopped >5 minutes)
  so alerts appear in the dashboard.
  
  1. Red Light Violations
    - Records RED light events followed by vehicle/person crossings within 120 seconds
    - 15+ car violations
    - 8+ bus violations
    - 6+ tram violations
    - 5+ person violations
  
  2. Public Transport Delays
    - Updates existing STOPPED_BUS/TRAM/TROLEIBUS records to have stoppedMinutes > 5
    - Ensures delays are detected by the congestion report function
*/

DO $$
DECLARE
  v_i INTEGER;
  v_base_date_19 TIMESTAMP := '2026-01-19'::TIMESTAMP;
  v_base_date_20 TIMESTAMP := '2026-01-20'::TIMESTAMP;
  v_semaphor_id INTEGER;
  v_vehicle_id INTEGER;
  v_red_time TIMESTAMP;
  v_crossing_time TIMESTAMP;
BEGIN

  -- =============================================
  -- 1. CREATE RED LIGHT VIOLATIONS (Jan 19-20)
  -- =============================================
  
  -- For each semaphore, create a RED light event
  FOR v_semaphor_id IN 1..28 LOOP
    v_red_time := v_base_date_19 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL;
    
    -- Insert RED light change
    INSERT INTO "CHANGING" (color, timestamp, "semaphorId")
    VALUES ('RED', v_red_time, v_semaphor_id);
    
    -- Insert car crossing 30-60 seconds after RED (violation)
    IF RANDOM() > 0.3 THEN
      v_crossing_time := v_red_time + (30 + FLOOR(RANDOM() * 30)::INTEGER || ' seconds')::INTERVAL;
      INSERT INTO "CROSSING_CAR" (speed, timestamp, "semaphorId", "carId")
      SELECT 
        40 + RANDOM() * 40,
        v_crossing_time,
        v_semaphor_id,
        (SELECT id FROM "CAR" ORDER BY RANDOM() LIMIT 1);
    END IF;
  END LOOP;

  -- Add more violations for Jan 20
  FOR v_semaphor_id IN 1..28 LOOP
    v_red_time := v_base_date_20 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL;
    
    INSERT INTO "CHANGING" (color, timestamp, "semaphorId")
    VALUES ('RED', v_red_time, v_semaphor_id);
    
    IF RANDOM() > 0.4 THEN
      v_crossing_time := v_red_time + (30 + FLOOR(RANDOM() * 40)::INTEGER || ' seconds')::INTERVAL;
      INSERT INTO "CROSSING_CAR" (speed, timestamp, "semaphorId", "carId")
      SELECT 
        45 + RANDOM() * 35,
        v_crossing_time,
        v_semaphor_id,
        (SELECT id FROM "CAR" ORDER BY RANDOM() LIMIT 1);
    END IF;
  END LOOP;

  -- Bus violations (Jan 19)
  FOR v_i IN 1..8 LOOP
    v_semaphor_id := (FLOOR(RANDOM() * 28)::INTEGER + 1);
    v_red_time := v_base_date_19 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL;
    
    INSERT INTO "CHANGING" (color, timestamp, "semaphorId")
    VALUES ('RED', v_red_time, v_semaphor_id);
    
    v_crossing_time := v_red_time + (20 + FLOOR(RANDOM() * 50)::INTEGER || ' seconds')::INTERVAL;
    INSERT INTO "CROSSING_BUS" (speed, timestamp, "semaphorId", "busId")
    SELECT 
      20 + RANDOM() * 25,
      v_crossing_time,
      v_semaphor_id,
      (SELECT id FROM "BUS" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- Bus violations (Jan 20)
  FOR v_i IN 1..8 LOOP
    v_semaphor_id := (FLOOR(RANDOM() * 28)::INTEGER + 1);
    v_red_time := v_base_date_20 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL;
    
    INSERT INTO "CHANGING" (color, timestamp, "semaphorId")
    VALUES ('RED', v_red_time, v_semaphor_id);
    
    v_crossing_time := v_red_time + (20 + FLOOR(RANDOM() * 50)::INTEGER || ' seconds')::INTERVAL;
    INSERT INTO "CROSSING_BUS" (speed, timestamp, "semaphorId", "busId")
    SELECT 
      22 + RANDOM() * 20,
      v_crossing_time,
      v_semaphor_id,
      (SELECT id FROM "BUS" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- Tram violations (Jan 19)
  FOR v_i IN 1..6 LOOP
    v_semaphor_id := (FLOOR(RANDOM() * 28)::INTEGER + 1);
    v_red_time := v_base_date_19 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL;
    
    INSERT INTO "CHANGING" (color, timestamp, "semaphorId")
    VALUES ('RED', v_red_time, v_semaphor_id);
    
    v_crossing_time := v_red_time + (25 + FLOOR(RANDOM() * 50)::INTEGER || ' seconds')::INTERVAL;
    INSERT INTO "CROSSING_TRAM" (speed, timestamp, "semaphorId", "tramId")
    SELECT 
      15 + RANDOM() * 18,
      v_crossing_time,
      v_semaphor_id,
      (SELECT id FROM "TRAM" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- Tram violations (Jan 20)
  FOR v_i IN 1..6 LOOP
    v_semaphor_id := (FLOOR(RANDOM() * 28)::INTEGER + 1);
    v_red_time := v_base_date_20 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL;
    
    INSERT INTO "CHANGING" (color, timestamp, "semaphorId")
    VALUES ('RED', v_red_time, v_semaphor_id);
    
    v_crossing_time := v_red_time + (25 + FLOOR(RANDOM() * 50)::INTEGER || ' seconds')::INTERVAL;
    INSERT INTO "CROSSING_TRAM" (speed, timestamp, "semaphorId", "tramId")
    SELECT 
      16 + RANDOM() * 17,
      v_crossing_time,
      v_semaphor_id,
      (SELECT id FROM "TRAM" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- Person violations (Jan 19)
  FOR v_i IN 1..5 LOOP
    v_semaphor_id := (FLOOR(RANDOM() * 28)::INTEGER + 1);
    v_red_time := v_base_date_19 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL;
    
    INSERT INTO "CHANGING" (color, timestamp, "semaphorId")
    VALUES ('RED', v_red_time, v_semaphor_id);
    
    v_crossing_time := v_red_time + (15 + FLOOR(RANDOM() * 60)::INTEGER || ' seconds')::INTERVAL;
    INSERT INTO "CROSSING_PERSON" (timestamp, "semaphorId", "personId")
    SELECT 
      v_crossing_time,
      v_semaphor_id,
      (SELECT id FROM "PERSON" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- Person violations (Jan 20)
  FOR v_i IN 1..5 LOOP
    v_semaphor_id := (FLOOR(RANDOM() * 28)::INTEGER + 1);
    v_red_time := v_base_date_20 + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL;
    
    INSERT INTO "CHANGING" (color, timestamp, "semaphorId")
    VALUES ('RED', v_red_time, v_semaphor_id);
    
    v_crossing_time := v_red_time + (15 + FLOOR(RANDOM() * 60)::INTEGER || ' seconds')::INTERVAL;
    INSERT INTO "CROSSING_PERSON" (timestamp, "semaphorId", "personId")
    SELECT 
      v_crossing_time,
      v_semaphor_id,
      (SELECT id FROM "PERSON" ORDER BY RANDOM() LIMIT 1);
  END LOOP;

  -- =============================================
  -- 2. CREATE PUBLIC TRANSPORT DELAYS (>5 minutes)
  -- =============================================
  
  -- Update all STOPPED records to have stoppedMinutes > 5 so they show as delays
  UPDATE "STOPPED_BUS" SET "stoppedMinutes" = 6 + FLOOR(RANDOM() * 20)::INTEGER;
  UPDATE "STOPPED_TRAM" SET "stoppedMinutes" = 6 + FLOOR(RANDOM() * 20)::INTEGER;
  UPDATE "STOPPED_TROLEIBUS" SET "stoppedMinutes" = 6 + FLOOR(RANDOM() * 20)::INTEGER;

  RAISE NOTICE 'Active alerts populated for January 19-20, 2026!';
END $$;