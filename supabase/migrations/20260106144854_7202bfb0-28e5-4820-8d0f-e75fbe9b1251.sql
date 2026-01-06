-- Change default value for owned_shoes to empty array
ALTER TABLE profiles ALTER COLUMN owned_shoes SET DEFAULT ARRAY[]::text[];