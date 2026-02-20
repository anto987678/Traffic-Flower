/*
  # Populate Historical Traffic Data (Extended)
  
  1. Extended Timeline
    - Data spanning 90 days (3 months)
    - More realistic traffic patterns throughout days
    - Peak hours (7-9 AM, 5-7 PM) with higher volume
    - Off-peak hours with lower volume
  
  2. Daily Patterns
    - Weekdays vs weekends traffic differentiation
    - Rush hour spikes in morning and evening
    - Late night reduced traffic
  
  3. Data Volume
    - 5000+ car crossings
    - 2000+ bus crossings
    - 1500+ tram crossings
    - 1500+ troleibus crossings
    - 3000+ pedestrian crossings
    - 1000+ public transport stops (combined)
*/

DO $$
DECLARE
  v_start_date TIMESTAMP;
  v_current_date TIMESTAMP;
  v_hour INTEGER;
  v_day_of_week INTEGER;
  v_traffic_multiplier DECIMAL;
  v_i INTEGER;
  v_count INTEGER;
  v_base_count INTEGER;
BEGIN

  v_start_date := NOW() - INTERVAL '90 days';
  v_current_date := v_start_date;

  -- =============================================
  -- Generate 90 days of traffic data
  -- =============================================
  
  WHILE v_current_date < NOW() LOOP
    v_day_of_week := EXTRACT(DOW FROM v_current_date)::INTEGER;
    
    -- Generate data for each hour of the day
    FOR v_hour IN 0..23 LOOP
      -- Calculate traffic multiplier based on time of day and day of week
      v_traffic_multiplier := 1.0;
      
      -- Weekday adjustments
      IF v_day_of_week IN (1, 2, 3, 4, 5) THEN
        -- Morning rush (7-9 AM)
        IF v_hour IN (7, 8) THEN
          v_traffic_multiplier := 2.5;
        -- Evening rush (5-7 PM)
        ELSIF v_hour IN (17, 18) THEN
          v_traffic_multiplier := 2.3;
        -- Business hours (9-17)
        ELSIF v_hour >= 9 AND v_hour < 17 THEN
          v_traffic_multiplier := 1.8;
        -- Early morning and late night
        ELSIF v_hour >= 6 AND v_hour < 7 THEN
          v_traffic_multiplier := 1.2;
        ELSIF v_hour >= 19 AND v_hour < 22 THEN
          v_traffic_multiplier := 1.3;
        ELSIF v_hour >= 22 OR v_hour < 6 THEN
          v_traffic_multiplier := 0.4;
        END IF;
      ELSE
        -- Weekend traffic (more uniform, lower peaks)
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

      -- =============================================
      -- CROSSING_CAR with realistic volumes
      -- =============================================
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

      -- =============================================
      -- CROSSING_BUS
      -- =============================================
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

      -- =============================================
      -- CROSSING_TRAM
      -- =============================================
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

      -- =============================================
      -- CROSSING_TROLEIBUS
      -- =============================================
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

      -- =============================================
      -- CROSSING_PERSON
      -- =============================================
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

      -- =============================================
      -- STOPPED_BUS (multiple stops per day)
      -- =============================================
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

      -- =============================================
      -- STOPPED_TRAM
      -- =============================================
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

      -- =============================================
      -- STOPPED_TROLEIBUS
      -- =============================================
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

    -- Move to next day
    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;

  -- =============================================
  -- Refresh semaphore color changes with historical data
  -- =============================================
  DELETE FROM "CHANGING";
  
  v_current_date := v_start_date;
  WHILE v_current_date < NOW() LOOP
    INSERT INTO "CHANGING" (color, timestamp, "semaphorId")
    SELECT 
      CASE FLOOR(RANDOM() * 3)::INTEGER
        WHEN 0 THEN 'RED'
        WHEN 1 THEN 'YELLOW'
        ELSE 'GREEN'
      END,
      v_current_date + (FLOOR(RANDOM() * 1440)::INTEGER || ' minutes')::INTERVAL,
      id
    FROM "SEMAPHOR";
    
    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;

  RAISE NOTICE 'Historical data population completed! 90 days of realistic traffic patterns generated.';
END $$;