-- The Sky Cafe - Phase 4 Database Upgrade

-- 1. Create Tables tracking
CREATE TABLE cafe_tables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_number VARCHAR(10) NOT NULL UNIQUE,
    capacity INT NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Allow public to read table availability
ALTER TABLE cafe_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public to view tables" ON cafe_tables FOR SELECT TO public USING (true);
CREATE POLICY "Allow admin to manage tables" ON cafe_tables FOR ALL TO authenticated USING (true);

-- Insert default tables (Assuming 10 tables: 5 for 2-pax, 3 for 4-pax, 2 for 6-pax)
INSERT INTO cafe_tables (table_number, capacity) VALUES
('T1', 2), ('T2', 2), ('T3', 2), ('T4', 2), ('T5', 2),
('T6', 4), ('T7', 4), ('T8', 4),
('T9', 6), ('T10', 6);

-- 2. Modify Reservations Table
ALTER TABLE reservations 
ADD COLUMN booking_id VARCHAR(20) UNIQUE,
ADD COLUMN email VARCHAR(255),
ADD COLUMN payment_id VARCHAR(100),
ADD COLUMN payment_status VARCHAR(50) DEFAULT 'Unpaid';

-- 3. Create Payments Log Table
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id VARCHAR(20) REFERENCES reservations(booking_id),
    razorpay_payment_id VARCHAR(100) NOT NULL,
    razorpay_order_id VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public to insert payments" ON payments FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow admin to view payments" ON payments FOR SELECT TO authenticated USING (true);
