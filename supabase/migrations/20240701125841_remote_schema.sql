CREATE TRIGGER fcm_notifications_webhook AFTER INSERT ON public.fcm_notifications FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://dthvcgffzopawocgahnr.supabase.co/functions/v1/push', 'POST', '{"Content-type":"application/json"}', '{}', '1000');


