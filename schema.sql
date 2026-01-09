-- Enable Row Level Security (RLS) recommended for Supabase, 
-- though we will connect via service role/connection string in this app.

-- 1. Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
    id TEXT PRIMARY KEY, -- 'SOUP', 'FISH', etc.
    name TEXT NOT NULL,
    icon TEXT
);

-- 2. Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id BIGINT PRIMARY KEY, -- Preserving timestamp-based IDs or legacy integer IDs
    name TEXT NOT NULL,
    category_id TEXT REFERENCES menu_categories(id) ON DELETE SET NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image TEXT,
    is_popular BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true
);

-- 3. Gallery Images
CREATE TABLE IF NOT EXISTS gallery_images (
    id BIGINT PRIMARY KEY,
    title TEXT,
    description TEXT,
    url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- 4. Reservations
CREATE TABLE IF NOT EXISTS reservations (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    guests INTEGER DEFAULT 1,
    notes TEXT,
    status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. News Articles
CREATE TABLE IF NOT EXISTS news_articles (
    id BIGINT PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    image TEXT,
    publish_date DATE,
    is_published BOOLEAN DEFAULT true
);

-- 6. Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved BOOLEAN DEFAULT false
);

-- 7. Settings (Key-Value Store)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
