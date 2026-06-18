-- The Sky Cafe - Supabase Database Schema

-- 1. Create Reservations Table
CREATE TABLE reservations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    guests VARCHAR(50) NOT NULL,
    special_requests TEXT,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Confirmed, Cancelled, Completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for Reservations
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (create) a reservation (anonymous users on the website)
CREATE POLICY "Allow public to insert reservations" 
ON reservations FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow only authenticated users (the admin/owner) to view and update reservations
CREATE POLICY "Allow authenticated to view reservations" 
ON reservations FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated to update reservations" 
ON reservations FOR UPDATE 
TO authenticated 
USING (true);


-- 2. Create Menu Items Table
CREATE TABLE menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category VARCHAR(100) NOT NULL, -- e.g., 'Pizza', 'Starters & Appetizers'
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'veg' or 'nonveg'
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for Menu Items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view the menu
CREATE POLICY "Allow public to view menu" 
ON menu_items FOR SELECT 
TO public 
USING (true);

-- Allow only authenticated users (admin/owner) to insert, update, or delete menu items
CREATE POLICY "Allow authenticated to insert menu items" 
ON menu_items FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated to update menu items" 
ON menu_items FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated to delete menu items" 
ON menu_items FOR DELETE 
TO authenticated 
USING (true);

-- (Optional) Insert some initial menu data to get started
INSERT INTO menu_items (category, name, price, type) VALUES
('Pizza', 'Margherita Pizza', 129, 'veg'),
('Pizza', 'Chicken Tikka Pizza', 189, 'nonveg'),
('Beverages & Shakes', 'Cold Coffee', 89, 'veg'),
('Chinese & Noodles', 'Hakka Noodles (Veg)', 109, 'veg');
