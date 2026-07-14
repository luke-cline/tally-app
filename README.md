# Tally

A private, custom-built budgeting app for one household — tracking shared personal expenses, kids, business finances, and everything in between, in one place, for free.

Tally isn't a public product and isn't meant to be cloned or self-hosted by others. This README documents what v1 is, what v2–v4 will become, and the reasoning behind it, for our own reference and anyone we choose to show it to.

---

## Why Tally exists

Every budgeting app on the market locks real functionality behind a subscription — multiple budgets, shared accounts, recurring bill tracking, business + personal separation. We needed all of that for one household: two adults, two kids, one company, one shared life. Rather than pay monthly for someone else's app, we built our own from first principles, scoped tightly to the problem we actually have.

---

## What v1 is

**Core purpose:** track household spending (groceries, kids, housing, bills) and business spending (the company) separately but in the same app, shared between two people in real time.

### v1 feature set

- **Two workspaces** — Household and Business, toggled instantly, fully separated data
- **Shared, secure login** — two real individual accounts (not a shared password), each seeing the same live data for a workspace
- **Categories with monthly budgets** — Groceries, Kids, Housing, Utilities, Insurance, Subscriptions, Fun, Medical, Savings (Household) and Revenue, Software/Tools, Contractors, Marketing, Taxes, Misc (Business)
- **Add transactions** — amount, category, income/expense, date, note — under 10 seconds to log
- **Dashboard** — income vs expense, net for the month, budget-vs-spent progress bars per category
- **Recurring transactions** — track upcoming bills (rent, daycare, subscriptions) with due dates, so nothing is a surprise
- **Transaction history** — full log, filterable by category
- **Dark mode** — persists across sessions
- **Fully responsive** — same quality experience on desktop and mobile
- **Real-time persistence** — every transaction is saved to the cloud instantly, always available from any device, for both of us

### What v1 intentionally does not include

- Editing existing transactions (delete + re-add for now — coming in v1.1)
- Bank sync
- Notifications
- Receipts/photo attachments
- Reports/PDF export

These were cut deliberately to ship a working, reliable core fast. Nothing here was missed by accident.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Icons | Lucide |
| Backend / Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| Hosting | Vercel |
| Version control | GitHub (private repo) |

**Total monthly cost: $0.** Every layer runs on a free tier sufficient for a two-person household indefinitely.

---

## Roadmap

### v1.1 (next up)
- Edit existing transactions
- Basic form validation polish
- Bug fixes from real day-to-day use

### v2 — Quality of life
- Month picker on Dashboard (view past months, not just current)
- Combined view: total net worth movement across Household + Business together
- Category icons/colors customizable by us
- Soft delete + "undo" on delete, so nothing is ever lost by mistake
- Search within transaction history
- Budget rollover toggle (unused budget carries to next month, or resets)

### v3 — Depth
- Savings goals (e.g. college fund, house fund) with progress tracking
- Recurring transactions auto-post as real transactions on their due date (currently manual)
- Simple charts: spending trend over time, category breakdown pie chart
- Multi-month and year-over-year comparison view
- Export to CSV (for tax prep handoff, not a full accounting system)

### v4 — Long-term polish
- Notifications/reminders for upcoming bills
- Receipt photo attachment per transaction
- Business expense tagging refined for actual tax categories (in partnership with real bookkeeping, not a replacement for it)
- Possible native mobile wrapper for faster daily use
- Multi-currency support if ever needed

---

## A note on scope

Tally is intentionally built for exactly two people and two workspaces. It is not designed, marketed, or intended for other households to install or use. Every decision in this roadmap optimizes for "does this help us see our money clearly," not "does this scale to other users."
