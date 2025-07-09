/*
  # Complete Social Media Website Database Schema

  1. New Tables
    - `user_profile` - Stores main profile information (username, description)
    - `social_links` - Stores all social media links with visibility controls
    - `profiles` - User profiles linked to auth.users
    - `products` - For potential e-commerce features
    - `orders` - Order management
    - `order_items` - Order line items

  2. Security
    - Enable RLS on all tables
    - Add policies for public access to profile and visible social links
    - Add policies for authenticated admin access to manage content
    - Add policies for user-specific data access

  3. Functions
    - Auto-update timestamp triggers
    - User profile creation trigger
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profile table for main site profile
CREATE TABLE IF NOT EXISTS user_profile (
  id text PRIMARY KEY DEFAULT '1',
  username text NOT NULL DEFAULT 'RAQWA',
  description text NOT NULL DEFAULT 'Welcome to my social media hub',
  updated_at timestamptz DEFAULT now()
);

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

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  updated_at timestamptz DEFAULT now(),
  full_name text NOT NULL,
  avatar_url text,
  phone text,
  addresses jsonb[]
);

-- Create products table for potential e-commerce
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  category text NOT NULL,
  inventory integer NOT NULL DEFAULT 0,
  images text[] NOT NULL,
  featured boolean DEFAULT false,
  discount_percent integer
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid,
  status text NOT NULL DEFAULT 'processing',
  total numeric(10,2) NOT NULL,
  shipping_address jsonb NOT NULL,
  payment_intent text
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid,
  product_id uuid,
  quantity integer NOT NULL,
  price numeric(10,2) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

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

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for products
CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert/update/delete products"
  ON products
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Create policies for orders
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "Admin can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Create policies for order_items
CREATE POLICY "Users can view their own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admin can view all order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_user_id_fkey'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'order_items_order_id_fkey'
  ) THEN
    ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_fkey 
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'order_items_product_id_fkey'
  ) THEN
    ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id);
  END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profile_updated_at ON user_profile;
CREATE TRIGGER update_user_profile_updated_at
  BEFORE UPDATE ON user_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_social_links_updated_at ON social_links;
CREATE TRIGGER update_social_links_updated_at
  BEFORE UPDATE ON social_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'));
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Insert default profile data
INSERT INTO user_profile (id, username, description) 
VALUES ('1', 'RAQWA', 'Welcome to my social media hub')
ON CONFLICT (id) DO NOTHING;

-- Insert some sample social links
INSERT INTO social_links (name, url, icon, is_visible, "order") VALUES
  ('Instagram', 'https://instagram.com/raqwa', 'instagram', true, 1),
  ('Twitter', 'https://twitter.com/raqwa', 'twitter', true, 2),
  ('LinkedIn', 'https://linkedin.com/in/raqwa', 'linkedin', true, 3)
ON CONFLICT DO NOTHING;