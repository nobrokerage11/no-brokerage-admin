-- Seed contact_info for admin-managed website phone / WhatsApp / website URL
INSERT INTO public.system_settings (key, value, updated_at)
VALUES (
  'contact_info',
  '{"support_phone": "9214901596", "support_phone_display": "+91 92149 01596", "website_url": "https://nobrokerages.online", "support_email": "team@nobrokerages.online"}'::jsonb,
  NOW()
)
ON CONFLICT (key) DO NOTHING;
