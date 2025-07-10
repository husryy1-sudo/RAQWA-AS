/*
  # Update QR Analytics Schema

  1. Schema Updates
    - Add browser field to qr_analytics table
    - Add customization fields to qr_codes table
    - Update indexes for better performance

  2. New Features
    - QR customization options (colors, size, logo)
    - Enhanced analytics tracking
    - Browser detection
*/

-- Add browser field to qr_analytics
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_analytics' AND column_name = 'browser'
  ) THEN
    ALTER TABLE qr_analytics ADD COLUMN browser text;
  END IF;
END $$;

-- Add customization fields to qr_codes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'customization'
  ) THEN
    ALTER TABLE qr_codes ADD COLUMN customization jsonb DEFAULT '{
      "foregroundColor": "#000000",
      "backgroundColor": "#FFFFFF",
      "size": 200,
      "margin": 2
    }'::jsonb;
  END IF;
END $$;

-- Add additional indexes for analytics performance
CREATE INDEX IF NOT EXISTS idx_qr_analytics_device_type ON qr_analytics(device_type);
CREATE INDEX IF NOT EXISTS idx_qr_analytics_browser ON qr_analytics(browser);
CREATE INDEX IF NOT EXISTS idx_qr_analytics_date ON qr_analytics(DATE(scanned_at));

-- Update existing analytics to have browser info extracted from user_agent
UPDATE qr_analytics 
SET browser = CASE 
  WHEN user_agent ILIKE '%chrome%' AND user_agent NOT ILIKE '%edge%' THEN 'Chrome'
  WHEN user_agent ILIKE '%firefox%' THEN 'Firefox'
  WHEN user_agent ILIKE '%safari%' AND user_agent NOT ILIKE '%chrome%' THEN 'Safari'
  WHEN user_agent ILIKE '%edge%' THEN 'Edge'
  WHEN user_agent ILIKE '%opera%' THEN 'Opera'
  ELSE 'Other'
END
WHERE browser IS NULL AND user_agent IS NOT NULL;