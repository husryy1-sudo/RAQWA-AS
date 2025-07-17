/*
  # Add Advanced QR Code Customization

  1. New Columns
    - `advanced_customization` (jsonb) - Stores all advanced customization options
    - `template_id` (text) - References predefined templates

  2. Features Added
    - QR code templates (modern, classic, colorful, etc.)
    - Frame styles (none, square, rounded, circle)
    - Dot patterns (squares, circles, rounded, diamonds)
    - Eye shapes (square, circle, rounded combinations)
    - Color customization for each element

  3. Indexes
    - Index on template_id for quick template filtering
    - GIN index on advanced_customization for JSON queries
*/

-- Add advanced customization columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'advanced_customization'
  ) THEN
    ALTER TABLE qr_codes ADD COLUMN advanced_customization jsonb DEFAULT '{
      "size": 300,
      "margin": 2,
      "colors": {
        "background": "#FFFFFF",
        "foreground": "#000000",
        "eyeColor": "#000000",
        "frameColor": "#333333"
      },
      "pattern": {
        "id": "classic-squares",
        "name": "Classic Squares",
        "type": "squares"
      },
      "eyeShape": {
        "id": "square-square",
        "name": "Square in Square",
        "outerShape": "square",
        "innerShape": "square"
      },
      "frame": {
        "id": "none",
        "name": "No Frame",
        "type": "none"
      },
      "errorCorrectionLevel": "H"
    }'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE qr_codes ADD COLUMN template_id text;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_template_id ON qr_codes(template_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_advanced_customization ON qr_codes USING gin(advanced_customization);