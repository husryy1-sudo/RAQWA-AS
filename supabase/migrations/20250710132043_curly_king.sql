/*
  # QR Analytics Enhancement Migration

  1. Database Schema Updates
    - Add `browser` column to `qr_analytics` table for browser tracking
    - Add `customization` column to `qr_codes` table for QR appearance settings

  2. Performance Improvements
    - Add indexes for analytics queries on device_type and browser
    - Add index for timestamp-based queries

  3. Data Migration
    - Extract browser information from existing user_agent data
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