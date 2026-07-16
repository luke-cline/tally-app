-- Fix infinite recursion in workspace_members RLS policies

-- Drop existing policies to avoid conflicts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workspace_members' AND policyname = 'Users can view own workspace memberships') THEN
    DROP POLICY "Users can view own workspace memberships" ON workspace_members;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workspace_members' AND policyname = 'Admins can manage workspace members') THEN
    DROP POLICY "Admins can manage workspace members" ON workspace_members;
  END IF;
END $$;

-- Recreate without recursion
-- Users can view their own memberships directly
CREATE POLICY "Users can view own workspace memberships" ON workspace_members
  FOR SELECT USING (user_id = auth.uid());

-- Allow users to insert their own membership (for onboarding/signup flows)
CREATE POLICY "Users can insert own workspace memberships" ON workspace_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- For admin operations, rely on a non-recursive check:
-- users can update/delete memberships only in workspaces where they are admin,
-- but we must avoid referencing workspace_members inside the policy itself.
-- We use a SECURITY DEFINER helper function instead.
CREATE OR REPLACE FUNCTION get_user_admin_workspace_ids(user_id UUID)
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT workspace_members.workspace_id
  FROM workspace_members
  WHERE workspace_members.user_id = get_user_admin_workspace_ids.user_id
    AND workspace_members.role = 'admin';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Now use the helper function in the policy (no recursion!)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workspace_members' AND policyname = 'Admins can manage workspace members') THEN
    CREATE POLICY "Admins can manage workspace members" ON workspace_members
      FOR ALL USING (
        workspace_id IN (SELECT get_user_admin_workspace_ids(auth.uid()))
      );
  END IF;
END $$;

-- Optional: allow service-role full access for backend/admin tasks if needed
-- CREATE POLICY "Service role full access workspace_members" ON workspace_members
--   FOR ALL USING (auth.role() = 'service_role');