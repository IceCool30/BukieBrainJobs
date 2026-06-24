CREATE OR REPLACE FUNCTION search_artisans(search_skill text, search_state text)
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text,
  role text,
  avg_rating numeric,
  jobs_completed int,
  dispute_strikes int,
  is_employer_verified boolean,
  bio text,
  skills jsonb,
  is_verified boolean,
  hourly_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.role,
    COALESCE(
      (
        SELECT 
          ROUND(
            (SUM(r.rating * CASE WHEN r.is_blue_check_reviewer THEN 2 ELSE 1 END)::numeric / 
            NULLIF(SUM(CASE WHEN r.is_blue_check_reviewer THEN 2 ELSE 1 END), 0)), 
            1
          )
        FROM reviews r 
        WHERE r.artisan_id = p.id
      ),
      p.avg_rating,
      5.0
    ) AS avg_rating,
    p.jobs_completed,
    p.dispute_strikes,
    p.is_employer_verified,
    bp.bio,
    bp.skills,
    bp.is_verified,
    bp.hourly_rate
  FROM profiles p
  JOIN bukie_passports bp ON p.id = bp.profile_id
  WHERE p.role = 'artisan'
    AND (search_skill IS NULL OR search_skill = '' OR bp.skills ? search_skill)
    -- If there's a location field in passport, use it. Else this is a basic query.
    -- (Assuming location_state is tracked somewhere, e.g., in passports or we just match by skill for now)
    ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
