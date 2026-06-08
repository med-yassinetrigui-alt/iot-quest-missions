
CREATE TABLE public.mission_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  mission_id TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, mission_id)
);
CREATE INDEX idx_mc_session ON public.mission_completions(session_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_completions TO anon, authenticated;
GRANT ALL ON public.mission_completions TO service_role;
ALTER TABLE public.mission_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read completions" ON public.mission_completions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert completions" ON public.mission_completions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete completions" ON public.mission_completions FOR DELETE USING (true);

CREATE TABLE public.sensor_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  mission_id TEXT NOT NULL,
  sensor TEXT NOT NULL,
  value NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sr_session_time ON public.sensor_readings(session_id, recorded_at DESC);
CREATE INDEX idx_sr_mission ON public.sensor_readings(mission_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sensor_readings TO anon, authenticated;
GRANT ALL ON public.sensor_readings TO service_role;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read readings" ON public.sensor_readings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert readings" ON public.sensor_readings FOR INSERT WITH CHECK (true);
