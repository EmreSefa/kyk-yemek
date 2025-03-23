-- Create cities table
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    city_name TEXT NOT NULL
);

-- Create dormitories table
CREATE TABLE dormitories (
    id SERIAL PRIMARY KEY,
    dorm_name TEXT NOT NULL,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE
);

-- Create meals table
CREATE TABLE meals (
    id SERIAL PRIMARY KEY,
    meal_date DATE NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('BREAKFAST', 'DINNER')),
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    dorm_id INTEGER REFERENCES dormitories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create meal_items table
CREATE TABLE meal_items (
    id SERIAL PRIMARY KEY,
    meal_id INTEGER REFERENCES meals(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    calories INTEGER,
    description TEXT
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    email TEXT,
    phone TEXT,
    full_name TEXT,
    city_id INTEGER REFERENCES cities(id) ON DELETE SET NULL,
    dorm_id INTEGER REFERENCES dormitories(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_meals_date ON meals(meal_date);
CREATE INDEX idx_meals_city ON meals(city_id);
CREATE INDEX idx_meals_dorm ON meals(dorm_id);
CREATE INDEX idx_meal_items_meal ON meal_items(meal_id);
CREATE INDEX idx_users_city ON users(city_id);
CREATE INDEX idx_users_dorm ON users(dorm_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_meals_updated_at
    BEFORE UPDATE ON meals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE dormitories ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow public read access to cities and dormitories
CREATE POLICY "Allow public read access to cities"
    ON cities FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public read access to dormitories"
    ON dormitories FOR SELECT
    TO public
    USING (true);

-- Allow public read access to meals and meal_items
CREATE POLICY "Allow public read access to meals"
    ON meals FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public read access to meal_items"
    ON meal_items FOR SELECT
    TO public
    USING (true);

-- Users can only read and update their own data
CREATE POLICY "Users can read own data"
    ON users FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id); 