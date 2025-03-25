-- Create meal ratings table
CREATE TABLE IF NOT EXISTS public.meal_ratings (
    id BIGSERIAL PRIMARY KEY,
    meal_id BIGINT NOT NULL,
    user_id UUID NOT NULL,
    rating TEXT NOT NULL CHECK (rating IN ('like', 'dislike')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comment to the table
COMMENT ON TABLE public.meal_ratings IS 'Stores user ratings (likes/dislikes) for meals';

-- Add foreign key to city_menus table
ALTER TABLE public.meal_ratings
    ADD CONSTRAINT fk_meal_ratings_meal
    FOREIGN KEY (meal_id)
    REFERENCES public.city_menus(id)
    ON DELETE CASCADE;

-- Add foreign key to auth.users table
ALTER TABLE public.meal_ratings
    ADD CONSTRAINT fk_meal_ratings_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- Add a unique constraint to ensure a user can only rate a meal once
CREATE UNIQUE INDEX idx_meal_ratings_user_meal
    ON public.meal_ratings(user_id, meal_id);

-- Add RLS policies to restrict access
ALTER TABLE public.meal_ratings ENABLE ROW LEVEL SECURITY;

-- Policy for inserting/updating own ratings
CREATE POLICY "Users can manage their own ratings"
    ON public.meal_ratings
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for reading ratings (anyone can read ratings)
CREATE POLICY "Anyone can read ratings"
    ON public.meal_ratings
    FOR SELECT
    USING (true);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_ratings TO authenticated;
GRANT USAGE ON SEQUENCE public.meal_ratings_id_seq TO authenticated;

-- Grant select permissions to anonymous users
GRANT SELECT ON public.meal_ratings TO anon;
