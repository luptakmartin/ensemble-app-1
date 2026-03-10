-- ============================================================
-- RLS Policies for Ensemble App
-- Assumes auth.uid() returns the current user's UUID
-- (Supabase provides this; self-hosted would SET LOCAL)
-- ============================================================

-- Helper function: returns role array for a user in an ensemble
CREATE OR REPLACE FUNCTION get_member_roles(p_user_id uuid, p_ensemble_id uuid)
RETURNS text[] AS $$
  SELECT COALESCE(array_agg(mr.role::text), '{}')
  FROM members m
  JOIN member_roles mr ON mr.member_id = m.id
  WHERE m.user_id = p_user_id
    AND m.ensemble_id = p_ensemble_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- ensembles
-- ============================================================
ALTER TABLE ensembles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ensembles_select" ON ensembles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.ensemble_id = ensembles.id
        AND members.user_id = auth.uid()
    )
  );

-- ============================================================
-- members
-- ============================================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_select" ON members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members AS m
      WHERE m.ensemble_id = members.ensemble_id
        AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "members_update_own" ON members
  FOR UPDATE USING (
    members.user_id = auth.uid()
  );

CREATE POLICY "members_insert_admin" ON members
  FOR INSERT WITH CHECK (
    'admin' = ANY(get_member_roles(auth.uid(), members.ensemble_id))
  );

CREATE POLICY "members_delete_admin" ON members
  FOR DELETE USING (
    'admin' = ANY(get_member_roles(auth.uid(), members.ensemble_id))
  );

-- ============================================================
-- member_roles
-- ============================================================
ALTER TABLE member_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_roles_select" ON member_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members m1
      JOIN members m2 ON m2.ensemble_id = m1.ensemble_id
      WHERE m2.id = member_roles.member_id
        AND m1.user_id = auth.uid()
    )
  );

CREATE POLICY "member_roles_insert_admin" ON member_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = member_roles.member_id
        AND 'admin' = ANY(get_member_roles(auth.uid(), m.ensemble_id))
    )
  );

CREATE POLICY "member_roles_update_admin" ON member_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = member_roles.member_id
        AND 'admin' = ANY(get_member_roles(auth.uid(), m.ensemble_id))
    )
  );

CREATE POLICY "member_roles_delete_admin" ON member_roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = member_roles.member_id
        AND 'admin' = ANY(get_member_roles(auth.uid(), m.ensemble_id))
    )
  );

-- ============================================================
-- events
-- ============================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select" ON events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.ensemble_id = events.ensemble_id
        AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "events_insert_director_admin" ON events
  FOR INSERT WITH CHECK (
    get_member_roles(auth.uid(), events.ensemble_id) && ARRAY['director', 'admin']
  );

CREATE POLICY "events_update_director_admin" ON events
  FOR UPDATE USING (
    get_member_roles(auth.uid(), events.ensemble_id) && ARRAY['director', 'admin']
  );

CREATE POLICY "events_delete_director_admin" ON events
  FOR DELETE USING (
    get_member_roles(auth.uid(), events.ensemble_id) && ARRAY['director', 'admin']
  );

-- ============================================================
-- event_attendance
-- ============================================================
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_attendance_select" ON event_attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN members m ON m.ensemble_id = e.ensemble_id
      WHERE e.id = event_attendance.event_id
        AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "event_attendance_update_own" ON event_attendance
  FOR UPDATE USING (
    event_attendance.member_id = (
      SELECT m.id FROM members m
      JOIN events e ON e.ensemble_id = m.ensemble_id
      WHERE e.id = event_attendance.event_id
        AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "event_attendance_update_director_admin" ON event_attendance
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_attendance.event_id
        AND get_member_roles(auth.uid(), e.ensemble_id) && ARRAY['director', 'admin']
    )
  );

-- ============================================================
-- compositions
-- ============================================================
ALTER TABLE compositions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "compositions_select" ON compositions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.ensemble_id = compositions.ensemble_id
        AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "compositions_insert_director_admin" ON compositions
  FOR INSERT WITH CHECK (
    get_member_roles(auth.uid(), compositions.ensemble_id) && ARRAY['director', 'admin']
  );

CREATE POLICY "compositions_update_director_admin" ON compositions
  FOR UPDATE USING (
    get_member_roles(auth.uid(), compositions.ensemble_id) && ARRAY['director', 'admin']
  );

CREATE POLICY "compositions_delete_director_admin" ON compositions
  FOR DELETE USING (
    get_member_roles(auth.uid(), compositions.ensemble_id) && ARRAY['director', 'admin']
  );

-- ============================================================
-- event_compositions
-- ============================================================
ALTER TABLE event_compositions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_compositions_select" ON event_compositions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN members m ON m.ensemble_id = e.ensemble_id
      WHERE e.id = event_compositions.event_id
        AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "event_compositions_insert_director_admin" ON event_compositions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_compositions.event_id
        AND get_member_roles(auth.uid(), e.ensemble_id) && ARRAY['director', 'admin']
    )
  );

CREATE POLICY "event_compositions_delete_director_admin" ON event_compositions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_compositions.event_id
        AND get_member_roles(auth.uid(), e.ensemble_id) && ARRAY['director', 'admin']
    )
  );

-- ============================================================
-- attachments
-- ============================================================
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attachments_select" ON attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM compositions c
      JOIN members m ON m.ensemble_id = c.ensemble_id
      WHERE c.id = attachments.composition_id
        AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "attachments_insert_director_admin" ON attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM compositions c
      WHERE c.id = attachments.composition_id
        AND get_member_roles(auth.uid(), c.ensemble_id) && ARRAY['director', 'admin']
    )
  );

CREATE POLICY "attachments_delete_director_admin" ON attachments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM compositions c
      WHERE c.id = attachments.composition_id
        AND get_member_roles(auth.uid(), c.ensemble_id) && ARRAY['director', 'admin']
    )
  );
