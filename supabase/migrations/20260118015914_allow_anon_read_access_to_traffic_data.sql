/*
  # Allow Anonymous Read Access to Traffic Data
  
  This migration updates RLS policies to allow anonymous users (using anon key)
  to read traffic data. This is necessary because the frontend uses direct Supabase
  queries with the anon key, not authenticated sessions.
  
  ## Security Considerations
  - Traffic data is public information and not sensitive
  - Only SELECT (read) operations are allowed for anonymous users
  - Write operations still require authentication
  - This enables the Dashboard to display real-time statistics
  
  ## Tables Updated
  - INTERSECTION: Allow anon to view all intersections
  - CROSSING_* tables: Allow anon to view crossing data
  - STOPPED_* tables: Allow anon to view public transport delays
  - SEMAPHOR: Allow anon to view semaphore information
  - All station tables: Allow anon to view station data
*/

-- Drop existing restrictive policies and create new ones that allow anon access

-- INTERSECTION
DROP POLICY IF EXISTS "Anyone can read intersections" ON "INTERSECTION";
CREATE POLICY "Public can read intersections"
  ON "INTERSECTION" FOR SELECT
  TO anon, authenticated
  USING (true);

-- CROSSING_CAR
DROP POLICY IF EXISTS "Anyone can read car crossings" ON "CROSSING_CAR";
CREATE POLICY "Public can read car crossings"
  ON "CROSSING_CAR" FOR SELECT
  TO anon, authenticated
  USING (true);

-- CROSSING_BUS
DROP POLICY IF EXISTS "Anyone can read bus crossings" ON "CROSSING_BUS";
CREATE POLICY "Public can read bus crossings"
  ON "CROSSING_BUS" FOR SELECT
  TO anon, authenticated
  USING (true);

-- CROSSING_TRAM
DROP POLICY IF EXISTS "Anyone can read tram crossings" ON "CROSSING_TRAM";
CREATE POLICY "Public can read tram crossings"
  ON "CROSSING_TRAM" FOR SELECT
  TO anon, authenticated
  USING (true);

-- CROSSING_TROLEIBUS
DROP POLICY IF EXISTS "Anyone can read troleibus crossings" ON "CROSSING_TROLEIBUS";
CREATE POLICY "Public can read troleibus crossings"
  ON "CROSSING_TROLEIBUS" FOR SELECT
  TO anon, authenticated
  USING (true);

-- CROSSING_PERSON
DROP POLICY IF EXISTS "Anyone can read person crossings" ON "CROSSING_PERSON";
CREATE POLICY "Public can read person crossings"
  ON "CROSSING_PERSON" FOR SELECT
  TO anon, authenticated
  USING (true);

-- STOPPED_BUS
DROP POLICY IF EXISTS "Anyone can read stopped buses" ON "STOPPED_BUS";
CREATE POLICY "Public can read stopped buses"
  ON "STOPPED_BUS" FOR SELECT
  TO anon, authenticated
  USING (true);

-- STOPPED_TRAM
DROP POLICY IF EXISTS "Anyone can read stopped trams" ON "STOPPED_TRAM";
CREATE POLICY "Public can read stopped trams"
  ON "STOPPED_TRAM" FOR SELECT
  TO anon, authenticated
  USING (true);

-- STOPPED_TROLEIBUS
DROP POLICY IF EXISTS "Anyone can read stopped troleibuses" ON "STOPPED_TROLEIBUS";
CREATE POLICY "Public can read stopped troleibuses"
  ON "STOPPED_TROLEIBUS" FOR SELECT
  TO anon, authenticated
  USING (true);

-- SEMAPHOR
DROP POLICY IF EXISTS "Anyone can read semaphores" ON "SEMAPHOR";
CREATE POLICY "Public can read semaphores"
  ON "SEMAPHOR" FOR SELECT
  TO anon, authenticated
  USING (true);

-- BUS_STATION
DROP POLICY IF EXISTS "Anyone can read bus stations" ON "BUS_STATION";
CREATE POLICY "Public can read bus stations"
  ON "BUS_STATION" FOR SELECT
  TO anon, authenticated
  USING (true);

-- TRAM_STATION
DROP POLICY IF EXISTS "Anyone can read tram stations" ON "TRAM_STATION";
CREATE POLICY "Public can read tram stations"
  ON "TRAM_STATION" FOR SELECT
  TO anon, authenticated
  USING (true);

-- TROLEIBUS_STATION
DROP POLICY IF EXISTS "Anyone can read troleibus stations" ON "TROLEIBUS_STATION";
CREATE POLICY "Public can read troleibus stations"
  ON "TROLEIBUS_STATION" FOR SELECT
  TO anon, authenticated
  USING (true);

-- BUS, TRAM, TROLEIBUS, CAR, PERSON
DROP POLICY IF EXISTS "Anyone can read buses" ON "BUS";
CREATE POLICY "Public can read buses"
  ON "BUS" FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can read trams" ON "TRAM";
CREATE POLICY "Public can read trams"
  ON "TRAM" FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can read troleibuses" ON "TROLEIBUS";
CREATE POLICY "Public can read troleibuses"
  ON "TROLEIBUS" FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can read cars" ON "CAR";
CREATE POLICY "Public can read cars"
  ON "CAR" FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can read persons" ON "PERSON";
CREATE POLICY "Public can read persons"
  ON "PERSON" FOR SELECT
  TO anon, authenticated
  USING (true);

-- CHANGING (semaphore color changes)
DROP POLICY IF EXISTS "Anyone can read semaphore changes" ON "CHANGING";
CREATE POLICY "Public can read semaphore changes"
  ON "CHANGING" FOR SELECT
  TO anon, authenticated
  USING (true);