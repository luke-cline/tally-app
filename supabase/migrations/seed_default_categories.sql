-- Seed sensible default categories for Household and Business
-- Note: created_by and updated_by use default values from the table schema

-- Household expense defaults
INSERT INTO categories (workspace_id, name, type, icon, monthly_budget, sort_order)
SELECT
  w.id,
  c.name,
  'expense',
  c.icon,
  NULL,
  c.sort_order
FROM workspaces w
CROSS JOIN (
  VALUES
    ('Groceries', 'ShoppingCart', 1),
    ('Rent/Mortgage', 'Home', 2),
    ('Utilities', 'Zap', 3),
    ('Transportation', 'Car', 4),
    ('Healthcare', 'Stethoscope', 5),
    ('Childcare/Kids', 'Baby', 6),
    ('Insurance', 'Shield', 7),
    ('Subscriptions', 'Repeat', 8),
    ('Dining/Eating Out', 'Utensils', 9),
    ('Entertainment', 'Film', 10),
    ('Clothing', 'Shirt', 11),
    ('Phone/Internet', 'Smartphone', 12),
    ('Savings', 'PiggyBank', 13),
    ('Personal', 'Smile', 14),
    ('Other Expense', 'MoreHorizontal', 15)
) AS c(name, icon, sort_order)
WHERE w.type = 'household'
ON CONFLICT DO NOTHING;

-- Household income defaults
INSERT INTO categories (workspace_id, name, type, icon, monthly_budget, sort_order)
SELECT
  w.id,
  c.name,
  'income',
  c.icon,
  NULL,
  c.sort_order
FROM workspaces w
CROSS JOIN (
  VALUES
    ('Salary/Wages', 'Wallet', 1),
    ('Freelance/Side', 'Laptop', 2),
    ('Investments', 'TrendingUp', 3),
    ('Gifts/Other', 'Gift', 4),
    ('Other Income', 'MoreHorizontal', 5)
) AS c(name, icon, sort_order)
WHERE w.type = 'household'
ON CONFLICT DO NOTHING;

-- Business expense defaults
INSERT INTO categories (workspace_id, name, type, icon, monthly_budget, sort_order)
SELECT
  w.id,
  c.name,
  'expense',
  c.icon,
  NULL,
  c.sort_order
FROM workspaces w
CROSS JOIN (
  VALUES
    ('Software/Tools', 'Monitor', 1),
    ('Hosting/Infrastructure', 'Server', 2),
    ('Marketing/Ads', 'Megaphone', 3),
    ('Contractor/Freelancer', 'Users', 4),
    ('Professional Services', 'Briefcase', 5),
    ('Office/Supplies', 'Archive', 6),
    ('Travel', 'Plane', 7),
    ('Education/Training', 'GraduationCap', 8),
    ('Taxes/Fees', 'Receipt', 9),
    ('Meals/Entertainment', 'Coffee', 10),
    ('Insurance', 'Shield', 11),
    ('Other Expense', 'MoreHorizontal', 12)
) AS c(name, icon, sort_order)
WHERE w.type = 'business'
ON CONFLICT DO NOTHING;

-- Business income defaults
INSERT INTO categories (workspace_id, name, type, icon, monthly_budget, sort_order)
SELECT
  w.id,
  c.name,
  'income',
  c.icon,
  NULL,
  c.sort_order
FROM workspaces w
CROSS JOIN (
  VALUES
    ('Revenue/Client Pay', 'Landmark', 1),
    ('Refunds', 'RotateCcw', 2),
    ('Interest/Dividends', 'Coins', 3),
    ('Other Income', 'MoreHorizontal', 4)
) AS c(name, icon, sort_order)
WHERE w.type = 'business'
ON CONFLICT DO NOTHING;