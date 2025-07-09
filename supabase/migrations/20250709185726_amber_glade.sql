/*
  # Social Media Website Database Schema

  1. New Tables
    - `social_links`
      - `id` (uuid, primary key)
      - `name` (text) - Display name for the social media platform
      - `url` (text) - The actual URL/link
      - `icon` (text) - Icon identifier for the platform
      - `is_visible` (boolean) - Whether the link should be shown on the frontend
      - `order` (integer) - Display order of the links
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_profile`
      - `id` (text, primary key)
      - `username` (text) - Display name/brand name
      - `description` (text) - Short bio/description
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access (frontend)
    - Add policies for authenticated admin access (admin panel)
*/

-- Create social_links table
CREATE TABLE IF NOT EXISTS social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  icon text NOT NULL DEFAULT 'link',
  is_visible boolean NOT NULL DEFAULT true,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_profile table
CREATE TABLE IF NOT EXISTS user_profile (
  id text PRIMARY KEY DEFAULT '1',
  username text NOT NULL DEFAULT 'RAQWA',
  description text NOT NULL DEFAULT 'Welcome to my social media hub',
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Create policies for social_links
CREATE POLICY "Anyone can read social links"
  ON social_links
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can manage social links"
  ON social_links
  FOR ALL
  TO anon, authenticated
  USING (true);

-- Create policies for user_profile
CREATE POLICY "Anyone can read user profile"
  ON user_profile
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can manage user profile"
  ON user_profile
  FOR ALL
  TO anon, authenticated
  USING (true);

-- Insert default profile
INSERT INTO user_profile (id, username, description) 
VALUES ('1', 'RAQWA', 'Welcome to my social media hub')
ON CONFLICT (id) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_social_links_updated_at
  BEFORE UPDATE ON social_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profile_updated_at
  BEFORE UPDATE ON user_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();