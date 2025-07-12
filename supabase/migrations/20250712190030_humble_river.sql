/*
  # Fix QR Code Advanced Customization

  1. Updates
    - Ensure advanced_customization column exists and is properly configured
    - Add template_id column if missing
    - Update existing QR codes with default advanced customization

  2. Data Migration
    - Convert existing basic customization to advanced format where possible
    - Set default values for new columns
*/

-- Ensure advanced_customization column exists with proper default
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'advanced_customization'
  ) THEN
    ALTER TABLE qr_codes ADD COLUMN advanced_customization jsonb DEFAULT '{
      "pattern": {"id": "classic-squares", "name": "Classic Squares", "type": "squares"},
      "eyeShape": {"id": "square-square", "name": "Square in Square", "outerShape": "square", "innerShape": "square"},
      "frame": {"id": "none", "name": "No Frame", "type": "none"},
      "colors": {"foreground": "#000000", "background": "#FFFFFF", "eyeColor": "#000000", "frameColor": "#333333"},
      "size": 300,
      "margin": 2,
      "errorCorrectionLevel": "H"
    }'::jsonb;
  END IF;
END $$;

-- Ensure template_id column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE qr_codes ADD COLUMN template_id text DEFAULT NULL;
  END IF;
END $$;

-- Update existing QR codes that don't have advanced customization
UPDATE qr_codes 
SET advanced_customization = jsonb_build_object(
  'pattern', jsonb_build_object(
    'id', 'classic-squares',
    'name', 'Classic Squares',
    'type', 'squares'
  ),
  'eyeShape', jsonb_build_object(
    'id', 'square-square',
    'name', 'Square in Square',
    'outerShape', 'square',
    'innerShape', 'square'
  ),
  'frame', jsonb_build_object(
    'id', 'none',
    'name', 'No Frame',
    'type', 'none'
  ),
  'colors', jsonb_build_object(
    'foreground', COALESCE(customization->>'foregroundColor', '#000000'),
    'background', COALESCE(customization->>'backgroundColor', '#FFFFFF'),
    'eyeColor', COALESCE(customization->>'foregroundColor', '#000000'),
    'frameColor', '#333333'
  ),
  'size', COALESCE((customization->>'size')::integer, 300),
  'margin', COALESCE((customization->>'margin')::integer, 2),
  'errorCorrectionLevel', 'H',
  'logoUrl', customization->>'logoUrl',
  'logoSize', COALESCE((customization->>'logoSize')::integer, 60)
)
WHERE advanced_customization IS NULL OR advanced_customization = '{}'::jsonb;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_template_id ON qr_codes(template_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_advanced_customization ON qr_codes USING gin(advanced_customization);