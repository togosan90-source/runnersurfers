CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_username TEXT;
BEGIN
  -- Get username from metadata and sanitize
  v_username := COALESCE(NEW.raw_user_meta_data ->> 'username', 'Runner');
  
  -- Remove any non-alphanumeric characters except underscore and hyphen
  v_username := regexp_replace(v_username, '[^a-zA-Z0-9_-]', '', 'g');
  
  -- Ensure length constraints
  v_username := substring(v_username, 1, 20);
  
  -- If username is empty after sanitization, use default
  IF length(v_username) = 0 THEN
    v_username := 'Runner';
  END IF;
  
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, v_username);
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: validate_profile_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_profile_update() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
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
  
  -- Validate equipped_shoes is from allowed list (updated with all shoe IDs)
  IF NEW.equipped_shoes NOT IN ('avalon', 'zeus', 'woodblas', 'energy', 'infinity') THEN
    RAISE EXCEPTION 'Invalid equipped shoes';
  END IF;
  
  -- Ensure equipped shoes are owned
  IF NOT (NEW.equipped_shoes = ANY(NEW.owned_shoes)) THEN
    RAISE EXCEPTION 'Cannot equip shoes that are not owned';
  END IF;
  
  RETURN NEW;
END;
$_$;


SET default_table_access_method = heap;

--
-- Name: daily_objectives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_objectives (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    target_distance numeric(10,3) DEFAULT 5 NOT NULL,
    current_distance numeric(10,3) DEFAULT 0 NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    reward_claimed boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: monthly_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.monthly_stats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    month_start date NOT NULL,
    total_distance numeric(10,3) DEFAULT 0 NOT NULL,
    total_duration integer DEFAULT 0 NOT NULL,
    total_calories integer DEFAULT 0 NOT NULL,
    total_score bigint DEFAULT 0 NOT NULL,
    total_runs integer DEFAULT 0 NOT NULL,
    levels_gained integer DEFAULT 0 NOT NULL,
    coins_earned integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    username text NOT NULL,
    avatar_url text,
    level integer DEFAULT 1 NOT NULL,
    exp integer DEFAULT 0 NOT NULL,
    total_score bigint DEFAULT 0 NOT NULL,
    coins integer DEFAULT 0 NOT NULL,
    equipped_shoes text DEFAULT 'avalon'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    skill_points integer DEFAULT 0 NOT NULL,
    skill_coins integer DEFAULT 0 NOT NULL,
    skill_score integer DEFAULT 0 NOT NULL,
    reputation integer DEFAULT 0 NOT NULL,
    reputation_level text DEFAULT 'novizio_1'::text NOT NULL,
    total_distance numeric DEFAULT 0 NOT NULL,
    streak_days integer DEFAULT 0 NOT NULL,
    last_run_date date,
    owned_shoes text[] DEFAULT ARRAY['avalon'::text] NOT NULL,
    CONSTRAINT username_format_check CHECK (((length(username) >= 1) AND (length(username) <= 20) AND (username ~ '^[a-zA-Z0-9_-]+$'::text)))
);


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    item_id text NOT NULL,
    price numeric(10,2) NOT NULL,
    currency text DEFAULT 'EUR'::text NOT NULL,
    status text DEFAULT 'completed'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: reputation_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reputation_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    distance_km numeric DEFAULT 0 NOT NULL,
    reputation_earned integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    distance numeric(10,3) DEFAULT 0 NOT NULL,
    duration integer DEFAULT 0 NOT NULL,
    avg_speed numeric(5,2) DEFAULT 0 NOT NULL,
    calories integer DEFAULT 0 NOT NULL,
    score_earned bigint DEFAULT 0 NOT NULL,
    exp_earned integer DEFAULT 0 NOT NULL,
    coins_earned integer DEFAULT 0 NOT NULL,
    path jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: weekly_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weekly_stats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    week_start date NOT NULL,
    total_distance numeric(10,3) DEFAULT 0 NOT NULL,
    total_duration integer DEFAULT 0 NOT NULL,
    total_calories integer DEFAULT 0 NOT NULL,
    total_score bigint DEFAULT 0 NOT NULL,
    total_runs integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: daily_objectives daily_objectives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_objectives
    ADD CONSTRAINT daily_objectives_pkey PRIMARY KEY (id);


--
-- Name: daily_objectives daily_objectives_user_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_objectives
    ADD CONSTRAINT daily_objectives_user_id_date_key UNIQUE (user_id, date);


--
-- Name: monthly_stats monthly_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_stats
    ADD CONSTRAINT monthly_stats_pkey PRIMARY KEY (id);


--
-- Name: monthly_stats monthly_stats_user_id_month_start_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_stats
    ADD CONSTRAINT monthly_stats_user_id_month_start_key UNIQUE (user_id, month_start);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: reputation_history reputation_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reputation_history
    ADD CONSTRAINT reputation_history_pkey PRIMARY KEY (id);


--
-- Name: reputation_history reputation_history_user_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reputation_history
    ADD CONSTRAINT reputation_history_user_id_date_key UNIQUE (user_id, date);


--
-- Name: runs runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.runs
    ADD CONSTRAINT runs_pkey PRIMARY KEY (id);


--
-- Name: weekly_stats weekly_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_stats
    ADD CONSTRAINT weekly_stats_pkey PRIMARY KEY (id);


--
-- Name: weekly_stats weekly_stats_user_id_week_start_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_stats
    ADD CONSTRAINT weekly_stats_user_id_week_start_key UNIQUE (user_id, week_start);


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles validate_profile_update_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER validate_profile_update_trigger BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.validate_profile_update();


--
-- Name: profiles validate_profile_updates; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER validate_profile_updates BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.validate_profile_update();


--
-- Name: daily_objectives daily_objectives_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_objectives
    ADD CONSTRAINT daily_objectives_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: monthly_stats monthly_stats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_stats
    ADD CONSTRAINT monthly_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: purchases purchases_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: runs runs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.runs
    ADD CONSTRAINT runs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: weekly_stats weekly_stats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_stats
    ADD CONSTRAINT weekly_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: monthly_stats Users can insert own monthly stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own monthly stats" ON public.monthly_stats FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: daily_objectives Users can insert own objectives; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own objectives" ON public.daily_objectives FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: purchases Users can insert own purchases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own purchases" ON public.purchases FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: reputation_history Users can insert own reputation history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own reputation history" ON public.reputation_history FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: runs Users can insert own runs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own runs" ON public.runs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: weekly_stats Users can insert own weekly stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own weekly stats" ON public.weekly_stats FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: monthly_stats Users can update own monthly stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own monthly stats" ON public.monthly_stats FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: daily_objectives Users can update own objectives; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own objectives" ON public.daily_objectives FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: reputation_history Users can update own reputation history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own reputation history" ON public.reputation_history FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: weekly_stats Users can update own weekly stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own weekly stats" ON public.weekly_stats FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);


--
-- Name: monthly_stats Users can view own monthly stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own monthly stats" ON public.monthly_stats FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: daily_objectives Users can view own objectives; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own objectives" ON public.daily_objectives FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: purchases Users can view own purchases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: reputation_history Users can view own reputation history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own reputation history" ON public.reputation_history FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: runs Users can view own runs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own runs" ON public.runs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: weekly_stats Users can view own weekly stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own weekly stats" ON public.weekly_stats FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: daily_objectives; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_objectives ENABLE ROW LEVEL SECURITY;

--
-- Name: monthly_stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.monthly_stats ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: purchases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

--
-- Name: reputation_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reputation_history ENABLE ROW LEVEL SECURITY;

--
-- Name: runs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;

--
-- Name: weekly_stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weekly_stats ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;