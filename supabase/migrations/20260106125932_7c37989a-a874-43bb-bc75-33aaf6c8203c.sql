-- Update the validate_profile_update function to allow empty equipped_shoes
CREATE OR REPLACE FUNCTION public.validate_profile_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Prevent negative values for game stats
  IF NEW.coins < 0 THEN
    RAISE EXCEPTION 'Coins cannot be negative';
  END IF;
  
  IF NEW.exp < 0 THEN
    RAISE EXCEPTION 'Experience cannot be negative';
  END IF;
  
  IF NEW.level < 1 THEN
    RAISE EXCEPTION 'Level cannot be less than 1';
  END IF;
  
  IF NEW.total_score < 0 THEN
    RAISE EXCEPTION 'Total score cannot be negative';
  END IF;
  
  IF NEW.reputation < 0 THEN
    RAISE EXCEPTION 'Reputation cannot be negative';
  END IF;
  
  IF NEW.skill_points < 0 THEN
    RAISE EXCEPTION 'Skill points cannot be negative';
  END IF;
  
  IF NEW.skill_coins < 0 THEN
    RAISE EXCEPTION 'Skill coins cannot be negative';
  END IF;
  
  IF NEW.skill_score < 0 THEN
    RAISE EXCEPTION 'Skill score cannot be negative';
  END IF;
  
  -- Validate username format if changed
  IF NEW.username IS DISTINCT FROM OLD.username THEN
    IF length(NEW.username) < 1 OR length(NEW.username) > 20 THEN
      RAISE EXCEPTION 'Username must be between 1 and 20 characters';
    END IF;
    
    IF NEW.username !~ '^[a-zA-Z0-9_-]+$' THEN
      RAISE EXCEPTION 'Username can only contain letters, numbers, underscores and hyphens';
    END IF;
  END IF;
  
  -- Allow empty equipped_shoes or validate from allowed list
  IF NEW.equipped_shoes != '' AND NEW.equipped_shoes NOT IN ('avalon', 'zeus', 'woodblas', 'energy', 'infinity') THEN
    RAISE EXCEPTION 'Invalid equipped shoes';
  END IF;
  
  -- Ensure equipped shoes are owned (only if not empty)
  IF NEW.equipped_shoes != '' AND NOT (NEW.equipped_shoes = ANY(NEW.owned_shoes)) THEN
    RAISE EXCEPTION 'Cannot equip shoes that are not owned';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update the default value for equipped_shoes to empty string
ALTER TABLE public.profiles ALTER COLUMN equipped_shoes SET DEFAULT '';