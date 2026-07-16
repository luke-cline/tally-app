-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('household', 'business')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Workspace members (many-to-many between users and workspaces)
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(workspace_id, user_id)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  monthly_budget DECIMAL(10,2) DEFAULT 0,
  icon TEXT DEFAULT 'MoreHorizontal',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  note TEXT,
  added_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Recurring transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  category_id UUID REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
  next_due_date DATE NOT NULL,
  added_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Add missing columns to existing tables if they don't have them
ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS updated_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS added_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL;
ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL;
ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Ensure workspace_members has role column for existing tables
ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member'));

-- Audit logs table for tracking all changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for performance (only create if column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'deleted_at') THEN
    CREATE INDEX IF NOT EXISTS idx_transactions_workspace_date ON transactions(workspace_id, date DESC) WHERE deleted_at IS NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'deleted_at') THEN
    CREATE INDEX IF NOT EXISTS idx_categories_workspace ON categories(workspace_id) WHERE deleted_at IS NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recurring_transactions' AND column_name = 'deleted_at') THEN
    CREATE INDEX IF NOT EXISTS idx_recurring_workspace ON recurring_transactions(workspace_id) WHERE deleted_at IS NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace ON audit_logs(workspace_id, created_at DESC);

-- Enable Row Level Security (RLS)
DO $$
BEGIN
  ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
  ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
  ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- RLS Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workspaces' AND policyname = 'Users can view own workspaces') THEN
    CREATE POLICY "Users can view own workspaces" ON workspaces FOR SELECT USING (
      id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workspaces' AND policyname = 'Anyone can create workspaces') THEN
    CREATE POLICY "Anyone can create workspaces" ON workspaces FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workspace_members' AND policyname = 'Users can view own workspace memberships') THEN
    BEGIN
      CREATE POLICY "Users can view own workspace memberships" ON workspace_members FOR SELECT USING (user_id = auth.uid());
    EXCEPTION
      WHEN others THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workspace_members' AND policyname = 'Admins can manage workspace members') THEN
    BEGIN
      CREATE POLICY "Admins can manage workspace members" ON workspace_members FOR ALL USING (
        workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role = 'admin')
      );
    EXCEPTION
      WHEN others THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Users can view categories in own workspaces') THEN
    CREATE POLICY "Users can view categories in own workspaces" ON categories FOR SELECT USING (
      workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
      AND deleted_at IS NULL
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Users can insert categories in own workspaces') THEN
    CREATE POLICY "Users can insert categories in own workspaces" ON categories FOR INSERT WITH CHECK (
      workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Users can update categories in own workspaces') THEN
    CREATE POLICY "Users can update categories in own workspaces" ON categories FOR UPDATE USING (
      workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
      AND deleted_at IS NULL
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Users can soft delete categories in own workspaces') THEN
    CREATE POLICY "Users can soft delete categories in own workspaces" ON categories FOR UPDATE USING (
      workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can view transactions in own workspaces') THEN
    CREATE POLICY "Users can view transactions in own workspaces" ON transactions FOR SELECT USING (
      workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
      AND deleted_at IS NULL
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can insert transactions in own workspaces') THEN
    CREATE POLICY "Users can insert transactions in own workspaces" ON transactions FOR INSERT WITH CHECK (
      workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can update transactions in own workspaces') THEN
    CREATE POLICY "Users can update transactions in own workspaces" ON transactions FOR UPDATE USING (
      workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
      AND deleted_at IS NULL
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can soft delete transactions in own workspaces') THEN
    CREATE POLICY "Users can soft delete transactions in own workspaces" ON transactions FOR UPDATE USING (
      workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recurring_transactions' AND policyname = 'Users can view recurring in own workspaces') THEN
    CREATE POLICY "Users can view recurring in own workspaces" ON recurring_transactions FOR SELECT USING (
      workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
      AND deleted_at IS NULL
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recurring_transactions' AND policyname = 'Users can insert recurring in own workspaces') THEN
    CREATE POLICY "Users can insert recurring in own workspaces" ON recurring_transactions FOR INSERT WITH CHECK (
      workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recurring_transactions' AND policyname = 'Users can update recurring in own workspaces') THEN
    CREATE POLICY "Users can update recurring in own workspaces" ON recurring_transactions FOR UPDATE USING (
      workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
      AND deleted_at IS NULL
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recurring_transactions' AND policyname = 'Users can delete recurring in own workspaces') THEN
    CREATE POLICY "Users can delete recurring in own workspaces" ON recurring_transactions FOR DELETE USING (
      workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Users can view audit logs in own workspaces') THEN
    CREATE POLICY "Users can view audit logs in own workspaces" ON audit_logs FOR SELECT USING (
      workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    );
  END IF;
END $$;

-- Functions for auto-updating timestamps and audit logging
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_workspaces_updated_at') THEN
    CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
    CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_transactions_updated_at') THEN
    CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_recurring_updated_at') THEN
    CREATE TRIGGER update_recurring_updated_at BEFORE UPDATE ON recurring_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN CASE TG_OP
      WHEN 'DELETE' THEN OLD
      ELSE NEW
    END;
  END IF;
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (workspace_id, user_id, action, table_name, record_id, new_values)
    VALUES (NEW.workspace_id, current_user_id, 'insert', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (workspace_id, user_id, action, table_name, record_id, old_values, new_values)
    VALUES (NEW.workspace_id, current_user_id, 'update', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (workspace_id, user_id, action, table_name, record_id, old_values)
    VALUES (OLD.workspace_id, current_user_id, 'delete', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_categories') THEN
    CREATE TRIGGER audit_categories AFTER INSERT OR UPDATE OR DELETE ON categories FOR EACH ROW EXECUTE FUNCTION log_audit_event();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_transactions') THEN
    CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON transactions FOR EACH ROW EXECUTE FUNCTION log_audit_event();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_recurring') THEN
    CREATE TRIGGER audit_recurring AFTER INSERT OR UPDATE OR DELETE ON recurring_transactions FOR EACH ROW EXECUTE FUNCTION log_audit_event();
  END IF;
END $$;
