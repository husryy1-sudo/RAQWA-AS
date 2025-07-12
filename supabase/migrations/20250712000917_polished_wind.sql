/*
  # Add QR Code Logo Support

  1. Database Changes
    - Update qr_codes table to support logo storage
    - Add logo_url and logo_size columns
    - Update customization JSONB structure

  2. Security
    - Maintain existing RLS policies
    - No breaking changes to existing data
*/

-- Add logo support columns to qr_codes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE qr_codes ADD COLUMN logo_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'logo_size'
  ) THEN
    ALTER TABLE qr_codes ADD COLUMN logo_size integer DEFAULT 40;
  END IF;
END $$;

-- Update existing customization data to include logo support
UPDATE qr_codes 
SET customization = jsonb_set(
  COALESCE(customization, '{}'),
  '{logoSize}',
  '40'
)
WHERE customization IS NULL OR NOT (customization ? 'logoSize');