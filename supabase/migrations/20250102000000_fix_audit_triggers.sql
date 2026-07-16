-- Fix: Drop and recreate audit triggers to pick up schema changes
-- This resolves the error "record 'new' has no field 'updated_at"

-- Drop existing audit triggers first
DROP TRIGGER IF EXISTS audit_categories ON categories;
DROP TRIGGER IF EXISTS audit_transactions ON transactions;
DROP TRIGGER IF EXISTS audit_recurring ON recurring_transactions;

-- Recreate audit triggers (will use the updated log_audit_event function with exception handling)
CREATE TRIGGER audit_categories AFTER INSERT OR UPDATE OR DELETE ON categories FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON transactions FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_recurring AFTER INSERT OR UPDATE OR DELETE ON recurring_transactions FOR EACH ROW EXECUTE FUNCTION log_audit_event();