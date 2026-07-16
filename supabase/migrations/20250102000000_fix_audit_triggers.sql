-- Fix: Drop and recreate audit triggers and function to resolve updated_at error

-- First, drop the existing triggers
DROP TRIGGER IF EXISTS audit_categories ON categories;
DROP TRIGGER IF EXISTS audit_transactions ON transactions;
DROP TRIGGER IF EXISTS audit_recurring ON recurring_transactions;

-- Recreate the function with proper error handling
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
  
  -- Handle the operation safely
  BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    -- Fallback: log minimal info and still allow the main operation to succeed
    IF TG_OP = 'INSERT' THEN
      INSERT INTO audit_logs (workspace_id, user_id, action, table_name, record_id, new_values)
      VALUES (NEW.workspace_id, current_user_id, 'insert', TG_TABLE_NAME, NEW.id, '{}'::jsonb);
      RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
      INSERT INTO audit_logs (workspace_id, user_id, action, table_name, record_id, old_values, new_values)
      VALUES (NEW.workspace_id, current_user_id, 'update', TG_TABLE_NAME, NEW.id, '{}'::jsonb, '{}'::jsonb);
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      INSERT INTO audit_logs (workspace_id, user_id, action, table_name, record_id, old_values)
      VALUES (OLD.workspace_id, current_user_id, 'delete', TG_TABLE_NAME, OLD.id, '{}'::jsonb);
      RETURN OLD;
    END IF;
  END;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers
CREATE TRIGGER audit_categories AFTER INSERT OR UPDATE OR DELETE ON categories FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON transactions FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_recurring AFTER INSERT OR UPDATE OR DELETE ON recurring_transactions FOR EACH ROW EXECUTE FUNCTION log_audit_event();