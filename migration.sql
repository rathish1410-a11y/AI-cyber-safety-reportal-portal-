-- Add geospatial columns to incidents table for the Live Threat Map
ALTER TABLE incidents
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION;

-- Optional: Create an index on latitude and longitude to optimize map queries
CREATE INDEX IF NOT EXISTS idx_incidents_location 
ON incidents (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
