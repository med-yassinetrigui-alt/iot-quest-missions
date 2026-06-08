ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;
ALTER TABLE public.sensor_readings REPLICA IDENTITY FULL;