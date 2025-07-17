/*
  # Enhanced QR Code Customization System

  1. Database Schema Updates
    - Enhanced advanced_customization JSONB structure
    - Added comprehensive style options storage
    - Proper indexing for performance

  2. Style Categories
    - Body Shape (Dot Patterns): 22 different patterns
    - Eye Frame Shape: 15 different outer eye styles  
    - Eye Ball Shape: 18 different inner eye styles
    - Frame options and colors

  3. Performance Optimizations
    - Indexed JSONB fields for fast queries
    - Optimized storage structure
*/

-- Update QR codes table with enhanced customization structure
ALTER TABLE qr_codes 
ALTER COLUMN advanced_customization SET DEFAULT '{
  "size": 300,
  "margin": 2,
  "colors": {
    "background": "#FFFFFF",
    "foreground": "#000000",
    "eyeColor": "#000000",
    "frameColor": "#333333"
  },
  "bodyShape": {
    "id": "square",
    "name": "Square",
    "type": "square"
  },
  "eyeFrameShape": {
    "id": "square",
    "name": "Square",
    "type": "square"
  },
  "eyeBallShape": {
    "id": "square",
    "name": "Square",
    "type": "square"
  },
  "frame": {
    "id": "none",
    "name": "No Frame",
    "type": "none"
  },
  "errorCorrectionLevel": "H"
}'::jsonb;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_body_shape ON qr_codes USING gin ((advanced_customization->'bodyShape'));
CREATE INDEX IF NOT EXISTS idx_qr_codes_eye_frame_shape ON qr_codes USING gin ((advanced_customization->'eyeFrameShape'));
CREATE INDEX IF NOT EXISTS idx_qr_codes_eye_ball_shape ON qr_codes USING gin ((advanced_customization->'eyeBallShape'));

-- Update existing records with new structure
UPDATE qr_codes 
SET advanced_customization = jsonb_set(
  jsonb_set(
    jsonb_set(
      COALESCE(advanced_customization, '{}'::jsonb),
      '{bodyShape}',
      '{"id": "square", "name": "Square", "type": "square"}'::jsonb
    ),
    '{eyeFrameShape}',
    '{"id": "square", "name": "Square", "type": "square"}'::jsonb
  ),
  '{eyeBallShape}',
  '{"id": "square", "name": "Square", "type": "square"}'::jsonb
)
WHERE advanced_customization IS NULL 
   OR NOT (advanced_customization ? 'bodyShape')
   OR NOT (advanced_customization ? 'eyeFrameShape')
   OR NOT (advanced_customization ? 'eyeBallShape');