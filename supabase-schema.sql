-- ===================================
-- BACKYARD ADVENTURES DATABASE SCHEMA
-- Execute this in your Supabase SQL Editor
-- ===================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- USERS TABLE
-- ===================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('client', 'admin', 'employee')),
    phone VARCHAR(20),
    address TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- TOURS TABLE
-- ===================================
CREATE TABLE tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(100) NOT NULL, -- e.g., 'kayaking', 'snorkeling', 'island-hopping'
    duration VARCHAR(50) NOT NULL, -- e.g., '2 hours', 'full day', 'half day'
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    price DECIMAL(10, 2) NOT NULL,
    max_participants INTEGER NOT NULL,
    included_items TEXT[], -- Array of included items
    requirements TEXT[], -- Array of requirements
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'seasonal')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- EQUIPMENT TABLE
-- ===================================
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- e.g., 'kayak', 'jet-ski', 'snorkel-gear'
    description TEXT NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    daily_rate DECIMAL(10, 2) NOT NULL,
    availability VARCHAR(50) DEFAULT 'available' CHECK (availability IN ('available', 'rented', 'maintenance', 'unavailable')),
    quantity INTEGER DEFAULT 1,
    image_url TEXT,
    badge VARCHAR(50) CHECK (badge IN ('popular', 'featured', 'premium')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- TOUR BOOKINGS TABLE
-- ===================================
CREATE TABLE tour_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME,
    participants INTEGER NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- EQUIPMENT RENTALS TABLE
-- ===================================
CREATE TABLE equipment_rentals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_hours INTEGER NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- INQUIRIES TABLE (Contact Form)
-- ===================================
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in-progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- REVIEWS TABLE
-- ===================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- INDEXES FOR PERFORMANCE
-- ===================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Tours indexes
CREATE INDEX idx_tours_type ON tours(type);
CREATE INDEX idx_tours_difficulty ON tours(difficulty);
CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_tours_price ON tours(price);

-- Equipment indexes
CREATE INDEX idx_equipment_type ON equipment(type);
CREATE INDEX idx_equipment_availability ON equipment(availability);

-- Bookings indexes
CREATE INDEX idx_tour_bookings_user_id ON tour_bookings(user_id);
CREATE INDEX idx_tour_bookings_tour_id ON tour_bookings(tour_id);
CREATE INDEX idx_tour_bookings_date ON tour_bookings(date);
CREATE INDEX idx_tour_bookings_status ON tour_bookings(status);

-- Rentals indexes
CREATE INDEX idx_equipment_rentals_user_id ON equipment_rentals(user_id);
CREATE INDEX idx_equipment_rentals_equipment_id ON equipment_rentals(equipment_id);
CREATE INDEX idx_equipment_rentals_status ON equipment_rentals(status);

-- Inquiries indexes
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_email ON inquiries(email);

-- ===================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Tours policies (public read, admin write)
CREATE POLICY "Anyone can view active tours" ON tours
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage tours" ON tours
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Equipment policies (public read, admin write)
CREATE POLICY "Anyone can view available equipment" ON equipment
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage equipment" ON equipment
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Tour bookings policies
CREATE POLICY "Users can view their own bookings" ON tour_bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" ON tour_bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON tour_bookings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON tour_bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

-- Equipment rentals policies
CREATE POLICY "Users can view their own rentals" ON equipment_rentals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create rentals" ON equipment_rentals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rentals" ON equipment_rentals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all rentals" ON equipment_rentals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

-- Inquiries policies
CREATE POLICY "Anyone can create inquiries" ON inquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all inquiries" ON inquiries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

CREATE POLICY "Admins can update inquiries" ON inquiries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- ===================================
-- FUNCTIONS AND TRIGGERS
-- ===================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_bookings_updated_at BEFORE UPDATE ON tour_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_rentals_updated_at BEFORE UPDATE ON equipment_rentals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- SAMPLE DATA (Optional)
-- ===================================

-- Sample Tours
INSERT INTO tours (name, description, type, duration, difficulty, price, max_participants, included_items, requirements, image_url) VALUES
('Island Hopping Adventure', 'Explore pristine islands with crystal-clear waters', 'island-hopping', 'full day', 'beginner', 89.99, 12, ARRAY['Lunch', 'Snorkel gear', 'Life jacket', 'Guide'], ARRAY['Swimming ability', 'Sun protection'], 'assets/island-hopping.jpg'),
('Sunset Kayaking', 'Paddle through calm waters during golden hour', 'kayaking', '2 hours', 'beginner', 45.00, 8, ARRAY['Kayak', 'Paddle', 'Life jacket', 'Waterproof bag'], ARRAY['Basic fitness', 'Swimming ability'], 'assets/kayaking.jpg'),
('Snorkeling Expedition', 'Discover vibrant coral reefs and marine life', 'snorkeling', 'half day', 'intermediate', 65.00, 10, ARRAY['Snorkel gear', 'Fins', 'Wetsuit', 'Guide'], ARRAY['Swimming ability', 'Comfort in water'], 'assets/snorkeling.jpg');

-- Sample Equipment
INSERT INTO equipment (name, type, description, hourly_rate, daily_rate, availability, quantity, badge, image_url) VALUES
('Professional Kayak', 'kayak', 'Stable single-person kayak perfect for exploration', 25.00, 100.00, 'available', 10, 'popular', 'assets/kayak.jpg'),
('Jet Ski', 'jet-ski', 'High-speed water adventure for thrill seekers', 75.00, 400.00, 'available', 5, 'premium', 'assets/jetski.jpg'),
('Snorkel Set', 'snorkel-gear', 'Complete snorkeling equipment with mask and fins', 15.00, 50.00, 'available', 20, 'featured', 'assets/snorkel.jpg'),
('Paddleboard', 'paddleboard', 'Stand-up paddleboard for calm water activities', 20.00, 80.00, 'available', 8, 'popular', 'assets/paddleboard.jpg');
