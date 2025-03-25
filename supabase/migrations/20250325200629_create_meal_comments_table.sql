-- Create meal comments table
CREATE TABLE IF NOT EXISTS public.meal_comments (
    id BIGSERIAL PRIMARY KEY,
    meal_id BIGINT NOT NULL,
    user_id UUID NOT NULL,
    comment TEXT NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comment to the table
COMMENT ON TABLE public.meal_comments IS 'Stores user comments for meals';

-- Add foreign key to city_menus table
ALTER TABLE public.meal_comments
    ADD CONSTRAINT fk_meal_comments_meal
    FOREIGN KEY (meal_id)
    REFERENCES public.city_menus(id)
    ON DELETE CASCADE;

-- Add foreign key to auth.users table
ALTER TABLE public.meal_comments
    ADD CONSTRAINT fk_meal_comments_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- Add index for meal_id for faster lookups when fetching comments for a meal
CREATE INDEX idx_meal_comments_meal_id ON public.meal_comments(meal_id);

-- Add index for user_id to quickly find a user's comments
CREATE INDEX idx_meal_comments_user_id ON public.meal_comments(user_id);

-- Add RLS policies to restrict access
ALTER TABLE public.meal_comments ENABLE ROW LEVEL SECURITY;

-- Policy for inserting own comments
CREATE POLICY "Users can insert their own comments"
    ON public.meal_comments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for updating own comments - simplified version without using OLD references
DROP POLICY IF EXISTS "Users can update their own comments" ON public.meal_comments;

-- Create two separate policies instead - one to restrict which rows can be updated, another to restrict which fields
CREATE POLICY "Users can update their own comments"
    ON public.meal_comments
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create a trigger function to prevent changing certain fields
CREATE OR REPLACE FUNCTION prevent_changing_comment_metadata()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.meal_id <> NEW.meal_id OR 
       OLD.user_id <> NEW.user_id OR 
       OLD.is_approved <> NEW.is_approved THEN
        RAISE EXCEPTION 'Cannot change meal_id, user_id, or is_approved fields';
    END IF;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that runs the function before update
CREATE TRIGGER ensure_comment_metadata_unchanged
    BEFORE UPDATE ON public.meal_comments
    FOR EACH ROW
    EXECUTE FUNCTION prevent_changing_comment_metadata();

-- Policy for deleting own comments
CREATE POLICY "Users can delete their own comments"
    ON public.meal_comments
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy for reading approved comments (anyone can read)
CREATE POLICY "Anyone can read approved comments"
    ON public.meal_comments
    FOR SELECT
    USING (is_approved = TRUE OR auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_comments TO authenticated;
GRANT USAGE ON SEQUENCE public.meal_comments_id_seq TO authenticated;

-- Grant select permissions to anonymous users (only for approved comments)
GRANT SELECT ON public.meal_comments TO anon;
