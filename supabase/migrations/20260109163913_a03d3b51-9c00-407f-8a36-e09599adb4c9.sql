-- Create marathon_events table to track user participation
CREATE TABLE public.marathon_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('standard', 'intermediate', 'hard')),
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  distance_completed NUMERIC NOT NULL DEFAULT 0,
  target_distance NUMERIC NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  reward_amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_type, event_date)
);

-- Enable Row Level Security
ALTER TABLE public.marathon_events ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view own marathon events" 
ON public.marathon_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own marathon events" 
ON public.marathon_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own marathon events" 
ON public.marathon_events 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_marathon_events_updated_at
BEFORE UPDATE ON public.marathon_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();