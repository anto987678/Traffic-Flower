/*
  # Traffic Flow System - Complete Database Schema
  
  1. New Tables
    - USER: User accounts with authentication
    - INTERSECTION: Traffic intersections with location data
    - SEMAPHOR: Traffic lights at intersections
    - BUS_STATION, TRAM_STATION, TROLEIBUS_STATION: Public transport stations
    - CAR, BUS, TRAM, TROLEIBUS, PERSON: Entities that cross intersections
    - CROSSING_*: Records of entities crossing at specific semaphores with timestamps
    - STOPPED_*: Records of public transport stops at stations
    - CHANGING: Traffic light color changes (RED, YELLOW, GREEN) for violation detection
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data
    
  3. Important Notes
    - All timestamps default to now() for easy data tracking
    - Foreign keys use CASCADE delete to maintain referential integrity
    - The CHANGING table is critical for detecting red light violations
    - Speed data helps identify speeding violations
*/

-- USER table
CREATE TABLE IF NOT EXISTS "USER" (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE "USER" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own data"
  ON "USER"
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- INTERSECTION table
CREATE TABLE IF NOT EXISTS "INTERSECTION" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sector INTEGER NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
);

ALTER TABLE "INTERSECTION" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read intersections"
  ON "INTERSECTION"
  FOR SELECT
  TO authenticated
  USING (true);

-- SEMAPHOR table
CREATE TABLE IF NOT EXISTS "SEMAPHOR" (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  street TEXT NOT NULL,
  sense TEXT NOT NULL,
  "intersectionId" INTEGER NOT NULL,
  CONSTRAINT "SEMAPHOR_intersectionId_fkey" 
    FOREIGN KEY ("intersectionId") 
    REFERENCES "INTERSECTION"(id) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "SEMAPHOR_intersectionId_idx" ON "SEMAPHOR"("intersectionId");

ALTER TABLE "SEMAPHOR" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read semaphors"
  ON "SEMAPHOR"
  FOR SELECT
  TO authenticated
  USING (true);

-- BUS_STATION table
CREATE TABLE IF NOT EXISTS "BUS_STATION" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sense TEXT NOT NULL,
  no_people INTEGER NOT NULL DEFAULT 0,
  no_buses INTEGER NOT NULL DEFAULT 0,
  "intersectionId" INTEGER NOT NULL,
  CONSTRAINT "BUS_STATION_intersectionId_fkey" 
    FOREIGN KEY ("intersectionId") 
    REFERENCES "INTERSECTION"(id) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "BUS_STATION_intersectionId_idx" ON "BUS_STATION"("intersectionId");

ALTER TABLE "BUS_STATION" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read bus stations"
  ON "BUS_STATION"
  FOR SELECT
  TO authenticated
  USING (true);

-- TRAM_STATION table
CREATE TABLE IF NOT EXISTS "TRAM_STATION" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sense TEXT NOT NULL,
  no_people INTEGER NOT NULL DEFAULT 0,
  no_trams INTEGER NOT NULL DEFAULT 0,
  "intersectionId" INTEGER NOT NULL,
  CONSTRAINT "TRAM_STATION_intersectionId_fkey" 
    FOREIGN KEY ("intersectionId") 
    REFERENCES "INTERSECTION"(id) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "TRAM_STATION_intersectionId_idx" ON "TRAM_STATION"("intersectionId");

ALTER TABLE "TRAM_STATION" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tram stations"
  ON "TRAM_STATION"
  FOR SELECT
  TO authenticated
  USING (true);

-- TROLEIBUS_STATION table
CREATE TABLE IF NOT EXISTS "TROLEIBUS_STATION" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sense TEXT NOT NULL,
  no_people INTEGER NOT NULL DEFAULT 0,
  no_troleibuses INTEGER NOT NULL DEFAULT 0,
  "intersectionId" INTEGER NOT NULL,
  CONSTRAINT "TROLEIBUS_STATION_intersectionId_fkey" 
    FOREIGN KEY ("intersectionId") 
    REFERENCES "INTERSECTION"(id) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "TROLEIBUS_STATION_intersectionId_idx" ON "TROLEIBUS_STATION"("intersectionId");

ALTER TABLE "TROLEIBUS_STATION" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read troleibus stations"
  ON "TROLEIBUS_STATION"
  FOR SELECT
  TO authenticated
  USING (true);

-- CAR table
CREATE TABLE IF NOT EXISTS "CAR" (
  id SERIAL PRIMARY KEY,
  color TEXT NOT NULL,
  "regNr" TEXT UNIQUE NOT NULL
);

ALTER TABLE "CAR" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cars"
  ON "CAR"
  FOR SELECT
  TO authenticated
  USING (true);

-- BUS table
CREATE TABLE IF NOT EXISTS "BUS" (
  id SERIAL PRIMARY KEY,
  "regNr" TEXT UNIQUE NOT NULL,
  line TEXT NOT NULL
);

ALTER TABLE "BUS" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read buses"
  ON "BUS"
  FOR SELECT
  TO authenticated
  USING (true);

-- TRAM table
CREATE TABLE IF NOT EXISTS "TRAM" (
  id SERIAL PRIMARY KEY,
  "regNr" TEXT UNIQUE NOT NULL,
  line TEXT NOT NULL
);

ALTER TABLE "TRAM" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read trams"
  ON "TRAM"
  FOR SELECT
  TO authenticated
  USING (true);

-- TROLEIBUS table
CREATE TABLE IF NOT EXISTS "TROLEIBUS" (
  id SERIAL PRIMARY KEY,
  "regNr" TEXT UNIQUE NOT NULL,
  line TEXT NOT NULL
);

ALTER TABLE "TROLEIBUS" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read troleibuses"
  ON "TROLEIBUS"
  FOR SELECT
  TO authenticated
  USING (true);

-- PERSON table
CREATE TABLE IF NOT EXISTS "PERSON" (
  id SERIAL PRIMARY KEY,
  gender TEXT NOT NULL DEFAULT 'unknown'
);

ALTER TABLE "PERSON" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read persons"
  ON "PERSON"
  FOR SELECT
  TO authenticated
  USING (true);

-- CROSSING_CAR table
CREATE TABLE IF NOT EXISTS "CROSSING_CAR" (
  id SERIAL PRIMARY KEY,
  speed DOUBLE PRECISION,
  timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
  "semaphorId" INTEGER NOT NULL,
  "carId" INTEGER NOT NULL,
  CONSTRAINT "CROSSING_CAR_semaphorId_fkey" 
    FOREIGN KEY ("semaphorId") 
    REFERENCES "SEMAPHOR"(id) 
    ON DELETE CASCADE,
  CONSTRAINT "CROSSING_CAR_carId_fkey" 
    FOREIGN KEY ("carId") 
    REFERENCES "CAR"(id) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "CROSSING_CAR_semaphorId_idx" ON "CROSSING_CAR"("semaphorId");
CREATE INDEX IF NOT EXISTS "CROSSING_CAR_carId_idx" ON "CROSSING_CAR"("carId");
CREATE INDEX IF NOT EXISTS "CROSSING_CAR_timestamp_idx" ON "CROSSING_CAR"(timestamp);

ALTER TABLE "CROSSING_CAR" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read car crossings"
  ON "CROSSING_CAR"
  FOR SELECT
  TO authenticated
  USING (true);

-- CROSSING_BUS table
CREATE TABLE IF NOT EXISTS "CROSSING_BUS" (
  id SERIAL PRIMARY KEY,
  speed DOUBLE PRECISION,
  timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
  "semaphorId" INTEGER NOT NULL,
  "busId" INTEGER NOT NULL,
  CONSTRAINT "CROSSING_BUS_semaphorId_fkey" 
    FOREIGN KEY ("semaphorId") 
    REFERENCES "SEMAPHOR"(id) 
    ON DELETE CASCADE,
  CONSTRAINT "CROSSING_BUS_busId_fkey" 
    FOREIGN KEY ("busId") 
    REFERENCES "BUS"(id) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "CROSSING_BUS_semaphorId_idx" ON "CROSSING_BUS"("semaphorId");
CREATE INDEX IF NOT EXISTS "CROSSING_BUS_busId_idx" ON "CROSSING_BUS"("busId");
CREATE INDEX IF NOT EXISTS "CROSSING_BUS_timestamp_idx" ON "CROSSING_BUS"(timestamp);

ALTER TABLE "CROSSING_BUS" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read bus crossings"
  ON "CROSSING_BUS"
  FOR SELECT
  TO authenticated
  USING (true);

-- CROSSING_TRAM table
CREATE TABLE IF NOT EXISTS "CROSSING_TRAM" (
  id SERIAL PRIMARY KEY,
  speed DOUBLE PRECISION,
  timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
  "semaphorId" INTEGER NOT NULL,
  "tramId" INTEGER NOT NULL,
  CONSTRAINT "CROSSING_TRAM_semaphorId_fkey" 
    FOREIGN KEY ("semaphorId") 
    REFERENCES "SEMAPHOR"(id) 
    ON DELETE CASCADE,
  CONSTRAINT "CROSSING_TRAM_tramId_fkey" 
    FOREIGN KEY ("tramId") 
    REFERENCES "TRAM"(id) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "CROSSING_TRAM_semaphorId_idx" ON "CROSSING_TRAM"("semaphorId");
CREATE INDEX IF NOT EXISTS "CROSSING_TRAM_tramId_idx" ON "CROSSING_TRAM"("tramId");
CREATE INDEX IF NOT EXISTS "CROSSING_TRAM_timestamp_idx" ON "CROSSING_TRAM"(timestamp);

ALTER TABLE "CROSSING_TRAM" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tram crossings"
  ON "CROSSING_TRAM"
  FOR SELECT
  TO authenticated
  USING (true);

-- CROSSING_TROLEIBUS table
CREATE TABLE IF NOT EXISTS "CROSSING_TROLEIBUS" (
  id SERIAL PRIMARY KEY,
  speed DOUBLE PRECISION,
  timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
  "semaphorId" INTEGER NOT NULL,
  "troleibusId" INTEGER NOT NULL,
  CONSTRAINT "CROSSING_TROLEIBUS_semaphorId_fkey" 
    FOREIGN KEY ("semaphorId") 
    REFERENCES "SEMAPHOR"(id) 
    ON DELETE CASCADE,
  CONSTRAINT "CROSSING_TROLEIBUS_troleibusId_fkey" 
    FOREIGN KEY ("troleibusId") 
    REFERENCES "TROLEIBUS"(id) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "CROSSING_TROLEIBUS_semaphorId_idx" ON "CROSSING_TROLEIBUS"("semaphorId");
CREATE INDEX IF NOT EXISTS "CROSSING_TROLEIBUS_troleibusId_idx" ON "CROSSING_TROLEIBUS"("troleibusId");
CREATE INDEX IF NOT EXISTS "CROSSING_TROLEIBUS_timestamp_idx" ON "CROSSING_TROLEIBUS"(timestamp);

ALTER TABLE "CROSSING_TROLEIBUS" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read troleibus crossings"
  ON "CROSSING_TROLEIBUS"
  FOR SELECT
  TO authenticated
  USING (true);

-- CROSSING_PERSON table
CREATE TABLE IF NOT EXISTS "CROSSING_PERSON" (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
  "semaphorId" INTEGER NOT NULL,
  "personId" INTEGER NOT NULL,
  CONSTRAINT "CROSSING_PERSON_semaphorId_fkey" 
    FOREIGN KEY ("semaphorId") 
    REFERENCES "SEMAPHOR"(id) 
    ON DELETE CASCADE,
  CONSTRAINT "CROSSING_PERSON_personId_fkey" 
    FOREIGN KEY ("personId") 
    REFERENCES "PERSON"(id) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "CROSSING_PERSON_semaphorId_idx" ON "CROSSING_PERSON"("semaphorId");
CREATE INDEX IF NOT EXISTS "CROSSING_PERSON_personId_idx" ON "CROSSING_PERSON"("personId");
CREATE INDEX IF NOT EXISTS "CROSSING_PERSON_timestamp_idx" ON "CROSSING_PERSON"(timestamp);

ALTER TABLE "CROSSING_PERSON" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read person crossings"
  ON "CROSSING_PERSON"
  FOR SELECT
  TO authenticated
  USING (true);

-- STOPPED_BUS table
CREATE TABLE IF NOT EXISTS "STOPPED_BUS" (
  id SERIAL PRIMARY KEY,
  "stoppedMinutes" INTEGER NOT NULL DEFAULT 0,
  "expectedArrival" TIMESTAMPTZ NOT NULL,
  "actualArrival" TIMESTAMPTZ DEFAULT now() NOT NULL,
  "busId" INTEGER NOT NULL,
  "stationId" INTEGER NOT NULL,
  CONSTRAINT "STOPPED_BUS_busId_fkey" 
    FOREIGN KEY ("busId") 
    REFERENCES "BUS"(id) 
    ON DELETE CASCADE,
  CONSTRAINT "STOPPED_BUS_stationId_fkey" 
    FOREIGN KEY ("stationId") 
    REFERENCES "BUS_STATION"(id) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "STOPPED_BUS_busId_idx" ON "STOPPED_BUS"("busId");
CREATE INDEX IF NOT EXISTS "STOPPED_BUS_stationId_idx" ON "STOPPED_BUS"("stationId");
CREATE INDEX IF NOT EXISTS "STOPPED_BUS_actualArrival_idx" ON "STOPPED_BUS"("actualArrival");

ALTER TABLE "STOPPED_BUS" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stopped buses"
  ON "STOPPED_BUS"
  FOR SELECT
  TO authenticated
  USING (true);

-- STOPPED_TRAM table
CREATE TABLE IF NOT EXISTS "STOPPED_TRAM" (
  id SERIAL PRIMARY KEY,
  "stoppedMinutes" INTEGER NOT NULL DEFAULT 0,
  "expectedArrival" TIMESTAMPTZ NOT NULL,
  "actualArrival" TIMESTAMPTZ DEFAULT now() NOT NULL,
  "tramId" INTEGER NOT NULL,
  "stationId" INTEGER NOT NULL,
  CONSTRAINT "STOPPED_TRAM_tramId_fkey" 
    FOREIGN KEY ("tramId") 
    REFERENCES "TRAM"(id) 
    ON DELETE CASCADE,
  CONSTRAINT "STOPPED_TRAM_stationId_fkey" 
    FOREIGN KEY ("stationId") 
    REFERENCES "TRAM_STATION"(id) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "STOPPED_TRAM_tramId_idx" ON "STOPPED_TRAM"("tramId");
CREATE INDEX IF NOT EXISTS "STOPPED_TRAM_stationId_idx" ON "STOPPED_TRAM"("stationId");
CREATE INDEX IF NOT EXISTS "STOPPED_TRAM_actualArrival_idx" ON "STOPPED_TRAM"("actualArrival");

ALTER TABLE "STOPPED_TRAM" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stopped trams"
  ON "STOPPED_TRAM"
  FOR SELECT
  TO authenticated
  USING (true);

-- STOPPED_TROLEIBUS table
CREATE TABLE IF NOT EXISTS "STOPPED_TROLEIBUS" (
  id SERIAL PRIMARY KEY,
  "stoppedMinutes" INTEGER NOT NULL DEFAULT 0,
  "expectedArrival" TIMESTAMPTZ NOT NULL,
  "actualArrival" TIMESTAMPTZ DEFAULT now() NOT NULL,
  "troleibusId" INTEGER NOT NULL,
  "stationId" INTEGER NOT NULL,
  CONSTRAINT "STOPPED_TROLEIBUS_troleibusId_fkey" 
    FOREIGN KEY ("troleibusId") 
    REFERENCES "TROLEIBUS"(id) 
    ON DELETE CASCADE,
  CONSTRAINT "STOPPED_TROLEIBUS_stationId_fkey" 
    FOREIGN KEY ("stationId") 
    REFERENCES "TROLEIBUS_STATION"(id) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "STOPPED_TROLEIBUS_troleibusId_idx" ON "STOPPED_TROLEIBUS"("troleibusId");
CREATE INDEX IF NOT EXISTS "STOPPED_TROLEIBUS_stationId_idx" ON "STOPPED_TROLEIBUS"("stationId");
CREATE INDEX IF NOT EXISTS "STOPPED_TROLEIBUS_actualArrival_idx" ON "STOPPED_TROLEIBUS"("actualArrival");

ALTER TABLE "STOPPED_TROLEIBUS" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stopped troleibuses"
  ON "STOPPED_TROLEIBUS"
  FOR SELECT
  TO authenticated
  USING (true);

-- CHANGING table (critical for violation detection)
CREATE TABLE IF NOT EXISTS "CHANGING" (
  id SERIAL PRIMARY KEY,
  color TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
  "semaphorId" INTEGER NOT NULL,
  CONSTRAINT "CHANGING_semaphorId_fkey" 
    FOREIGN KEY ("semaphorId") 
    REFERENCES "SEMAPHOR"(id) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "CHANGING_semaphorId_idx" ON "CHANGING"("semaphorId");
CREATE INDEX IF NOT EXISTS "CHANGING_timestamp_idx" ON "CHANGING"(timestamp);
CREATE INDEX IF NOT EXISTS "CHANGING_color_idx" ON "CHANGING"(color);

ALTER TABLE "CHANGING" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read traffic light changes"
  ON "CHANGING"
  FOR SELECT
  TO authenticated
  USING (true);