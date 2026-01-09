-- Change skill_coins and skill_score from integer to numeric to support decimal values (0.05% increments)
ALTER TABLE public.profiles 
  ALTER COLUMN skill_coins TYPE numeric USING skill_coins::numeric,
  ALTER COLUMN skill_score TYPE numeric USING skill_score::numeric;

-- Update default values
ALTER TABLE public.profiles 
  ALTER COLUMN skill_coins SET DEFAULT 0,
  ALTER COLUMN skill_score SET DEFAULT 0;