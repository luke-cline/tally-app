# **Tally**

**Tally** is a private, bespoke personal finance application built exclusively for a single household. Designed for seamless use across mobile and desktop devices, Tally provides an intimate, secure environment for two partners (Luke and Ashleigh) to track, categorize, and manage their shared and personal expenses. This is not a public product—it is a fully custom, private tool created for one couple's financial clarity and control.

> **Status:** Private household application (not intended for public release or multi-tenant use).

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Database](#database)
- [Security](#security)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [API & External Services](#api--external-services)
- [Design System](#design-system)
- [Deployment](#deployment)
- [Performance](#performance)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Development Standards](#development-standards)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

### What Tally Is

Tally is a **household-only budgeting and expense-tracking application** that enables two users (Luke and Ashleigh) to:

- Log income and expenses
- Organize transactions by category
- Track budgets over time
- Distinguish between personal and shared spending
- Access a unified financial view from any device (mobile, tablet, desktop)

### Why It Exists

Most personal finance tools are designed for mass-market use, with complex onboarding, multi-user organizations, and feature bloat. Tally exists to provide:

- A **minimal, focused** experience for one household
- Full **data ownership and control**
- A system tuned precisely to **how this couple actually spends and thinks about money**

### Problem It Solves

- Fragmented spending across accounts and cards  
- No clear, shared view of household finances  
- Overly generic budgeting apps that don't reflect real-life usage patterns  
- Lack of privacy and control in consumer finance apps

### Target Users

- Primary: Luke and Ashleigh (single household)  
- Secondary: No additional users; the system is intentionally not multi-tenant.

### Core Philosophy

- **Private by design** – not for public sign-up or distribution  
- **Simplicity over features** – only what directly improves financial clarity  
- **Owner-operated infrastructure** – full control over auth, data, and deployment  
- **Cross-platform consistency** – same experience on phone, tablet, and desktop

### Key Differentiators

- Built for **exactly two users**, not scaled to hypothetical future users  
- Tightly coupled to one household's workflow and mental model  
- Hosted on a dedicated Supabase project under full owner control  
- No telemetry, ads, or third-party monetization

### Long-Term Vision

- Evolve into a **stable, low-maintenance** system that reliably serves this household for years  
- Add only features that materially improve clarity, accuracy, or ease of use  
- Keep the codebase small enough to understand end-to-end and maintain long-term

---

## Features

### Authentication & Accounts

- Email + password authentication via Supabase Auth  
- Two fixed user accounts:
  - **Luke** – clineluke39@gmail.com
  - **Ashleigh** – ashleighcline2006@gmail.com
- Session management via Supabase client (persists by default)  
- Protected routes and data access enforced via Row Level Security (RLS)
- Remember me checkbox for session persistence control

### Household & Users

- Dual workspace system: Household + Business  
- User profiles linked to Supabase `auth.users`  
- All data isolated per workspace

### Transactions

- Create, edit, and delete transactions  
- Fields include:
  - Amount (positive number)  
  - Type (income/expense)  
  - Date  
  - Category  
  - Note/description  
- Filter by date, category, type

### Categories

- Custom categories for income and expenses (e.g., "Groceries", "Rent", "Salary")  
- Household-specific categories (not global/multi-tenant)  
- Optional monthly budget per category  

### Budgets

- Monthly budgets per category  
- Visualization of:
  - Budgeted amount  
  - Actual spend  
  - Remaining budget  
- Progress bars and percentage indicators  
- Color-coded warnings for overspending

### Recurring Transactions

- Track recurring income/expenses  
- Automatic next due date tracking  
- Monthly/weekly/yearly recurrence support

### Dashboard & Analytics

- High-level summary for the current month:
  - Total income  
  - Total expenses  
  - Net cash flow  
  - Spending trend chart  
- Budget progress visualization per category

### Responsive UI

- Works on:
  - Mobile phones (bottom navigation)  
  - Tablets  
  - Desktop browsers  
- Layout adapts to screen size while preserving core workflow  
- Touch-friendly controls for mobile use

### Dark Mode

- System preference detection  
- Manual toggle via ThemeToggle component  
- Consistent color tokens across themes

---

## Technology Stack

### Frontend

| Technology | Version/Details |
|------------|-----------------|
| **Language** | JavaScript (JSX) |
| **Framework** | React 19.2.7 |
| **Bundler** | Vite 8.1.1 |
| **Styling** | Tailwind CSS 3.4.17 |
| **Icons** | Lucide React 1.24.0 |
| **Fonts** | Inter (body), Poppins (headings) |
| **State Management** | React Context (AuthContext, WorkspaceContext) |
| **Routing** | React Router 7.18.1 |
| **UI Components** | Radix UI (Label, Select) |

### Backend

| Technology | Version/Details |
|------------|-----------------|
| **Platform** | Supabase (managed Postgres + Auth) |
| **API Layer** | Supabase client (@supabase/supabase-js 2.110.5) |
| **Authentication** | Supabase Auth (email + password, magic link) |

### Database

| Technology | Details |
|------------|---------|
| **Engine** | PostgreSQL (via Supabase) |
| **Schema** | public schema with RLS policies |
| **Tables** | categories, transactions, recurring_transactions, workspace_members, workspaces |

### Hosting & Deployment

| Technology | Details |
|------------|---------|
| **Frontend Hosting** | Vercel |
| **Database** | Supabase |
| **Domain** | tally-app-iota.vercel.app (Vercel subdomain) |

### Package Manager & Tooling

| Technology | Version/Details |
|------------|-----------------|
| **Package Manager** | npm |
| **Linting** | ESLint 10.6.0 |
| **Formatting** | Prettier (via ESLint) |
| **Date Handling** | date-fns 4.4.0 |

---

## Architecture

### Folder Structure

```text
tally-app/
├─ public/
│  └─ favicon.svg, icons.svg
├─ src/
│  ├─ assets/
│  │  └─ hero.png, react.svg, vite.svg
│  ├─ components/
│  │  ├─ ui/
│  │  │  ├─ button.jsx
│  │  │  ├─ input.jsx
│  │  │  ├─ label.jsx
│  │  │  ├─ select.jsx
│  │  │  └─ date-picker.jsx
│  │  ├─ CategoryIcon.jsx
│  │  ├─ Footer.jsx
│  │  ├─ IconPicker.jsx
│  │  ├─ Layout.jsx
│  │  ├─ ProgressBar.jsx
│  │  ├─ ProtectedRoute.jsx
│  │  ├─ StatCard.jsx
│  │  ├─ ThemeToggle.jsx
│  │  └─ WorkspaceToggle.jsx
│  ├─ context/
│  │  ├─ AuthContext.jsx
│  │  └─ WorkspaceContext.jsx
│  ├─ lib/
│  │  ├─ format.js
│  │  ├─ supabaseClient.js
│  │  └─ utils.js
│  ├─ pages/
│  │  ├─ AddTransaction.jsx
│  │  ├─ Categories.jsx
│  │  ├─ Dashboard.jsx
│  │  ├─ EditTransaction.jsx
│  │  ├─ History.jsx
│  │  ├─ Login.jsx
│  │  └─ Recurring.jsx
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ index.css
├─ .env.local
├─ package.json
├─ vite.config.js
├─ vercel.json
└─ README.md
```

### System Architecture & Layers

1. **Frontend Layer (SPA)**
   - React 19 with Vite bundler
   - Client-side routing via React Router
   - Tailwind CSS for styling with custom dark/light themes

2. **Auth Layer (Supabase Auth)**
   - Email/password authentication
   - Magic link sign-in
   - Session management stored in localStorage

3. **API Layer (Supabase Client)**
   - Direct database queries from client
   - Row Level Security (RLS) enforces data access
   - Real-time subscriptions (not currently used)

4. **Database Layer (PostgreSQL via Supabase)**
   - Tables: workspaces, workspace_members, categories, transactions, recurring_transactions
   - Soft deletes via `deleted_at` timestamps
   - RLS policies restrict data access by workspace membership

5. **Deployment Layer (Vercel + Supabase)**
   - Frontend deployed to Vercel edge network
   - Backend database hosted on Supabase
   - Environment variables injected via Vercel dashboard

### Data Flow

```
User → Login/Signup → Supabase Auth → Session Token
           ↓
    React SPA (loads App.jsx)
           ↓
    ProtectedRoute verifies session
           ↓
    WorkspaceContext loads user's workspaces
           ↓
    Dashboard/Categories/etc fetch data via Supabase client
           ↓
    RLS policies enforce workspace-level access
```

---

## Database

### Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `workspaces` | Household/Business containers | id, name, type, created_by, updated_by |
| `workspace_members` | User-to-workspace mapping | workspace_id, user_id, display_name, role |
| `categories` | Spending/income categories | id, workspace_id, name, type, monthly_budget |
| `transactions` | Financial records | id, workspace_id, category_id, amount, date, type |
| `recurring_transactions` | Template transactions | id, workspace_id, amount, next_due_date |

### Current Workspace IDs

- **Household:** `60665d08-cb5b-42ee-bf11-fc46fd2ff4a8`
- **Business:** `609200e0-c39a-445f-b6b2-e959ec628b53`

---

## Security

- All data access mediated by Supabase RLS  
- No public/open tables  
- Workspace membership enforced at query level  
- Supabase service role key never exposed to client  

---

## Installation

```bash
# Clone the repository
git clone https://github.com/luke-cline/tally-app.git
cd tally-app

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## Environment Variables

```bash
VITE_SUPABASE_URL=https://qfjowuvqohzfhihrtgop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server at localhost:5173 |
| `npm run build` | Create production build in `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint checks |

---

## API & External Services

- Supabase Authentication API
- Supabase Postgres REST API (PostgREST)

---

## Design System

- **Colors:** Custom CSS variables for light/dark modes
- **Typography:** Inter (body), Poppins (headings)
- **Components:** Glass-morphism panels with backdrop blur
- **Border radius:** 12px rounded, 24px for cards

---

## Deployment

Deployed automatically via Vercel on git push to `main`:

```
git add .
git commit -m "Your message"
git push origin main
vercel --prod
```

---

## Performance

- Bundle size: ~1.2MB (can be code-split)  
- SPA routing with client-side navigation  
- Responsive images and icons  

---

## Roadmap

### Pre-Launch (First 100 Users)
- [ ] Add audit logging for sensitive actions
- [ ] Implement role-based dashboards (admin view)
- [ ] Improve error handling on network failures
- [ ] Add transaction import/export
- [ ] Add monthly/yearly financial reports

### Future Ideas
- [ ] Shared/shared vs. personal transaction flags
- [ ] Multi-currency support
- [ ] Receipt image upload
- [ ] Budget notifications

---

## Contributing

This is a private project. No contributions accepted at this time.

---

## Development Standards

- React 19 with hooks only (no class components)  
- Tailwind CSS utility classes  
- ESLint with React hooks plugin  
- Vite for development/build  

---

## Troubleshooting

**Login redirects back to login page:**
- Verify Supabase env vars are set in Vercel dashboard
- Check that the user exists in Supabase Auth
- Ensure workspace_members record exists for the user

**Missing categories:**
- Each workspace needs categories created via `/categories`

**Build fails:**
- Run `npm install` to update dependencies  
- Check for ESLint errors with `npm run lint`