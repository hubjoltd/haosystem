# Hao System - ERP Application

## Overview

The Hao System is a comprehensive enterprise resource planning (ERP) web application with an Angular 21 frontend and Spring Boot 3.2 backend. It provides full-suite business management including HR management (employees, attendance, payroll, leave, recruitment, onboarding, training), inventory & stock movement, purchase order management, customer & contract management, project management, finance & accounting, expense & reimbursement, loans & advances, compensation & benefits, F&F settlement, and multi-company/branch management with role-based access control.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: Angular 21 with TypeScript 5.9, using NgModule-based architecture (not fully standalone)
- **Styling**: SCSS with dark teal (#008080) theme, Poppins font, Font Awesome icons loaded via CDN
- **State Management**: Angular services with RxJS BehaviorSubjects for reactive data flow
- **HTTP Layer**: HttpClient with a JWT auth interceptor (`AuthInterceptor`) that attaches Bearer tokens and handles 401/403 redirects to login
- **Routing**: Root redirects to `/login`; authenticated routes under `/app` prefix wrapped by `LayoutComponent` (sidebar + header shell)
- **Dev Server**: Runs on port 5000 (`ng serve --host 0.0.0.0 --port 5000`), proxies `/api` and `/ws` requests to backend at `http://127.0.0.1:8080`
- **Proxy Config**: `frontend/proxy.conf.json` — routes `/api` (REST) and `/ws` (WebSocket) to backend
- **Build Output**: `frontend/dist/frontend/browser/` — copied to `backend/src/main/resources/static/` for production packaging
- **Key Libraries**: chart.js + ng2-charts (dashboards), jspdf + jspdf-autotable (PDF generation), xlsx (Excel export), @ngx-translate (i18n)
- **Angular Config**: `frontend/angular.json` — `allowedHosts: true` for Replit proxy compatibility, SCSS as default style preprocessor

### Backend
- **Framework**: Spring Boot 3.2.0 with Java 17+ (currently runs on Java 19)
- **Port**: 8080 (localhost only, proxied through frontend in dev; serves everything on port 5000 in production)
- **Database**: PostgreSQL connected via environment variables (`PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, database name `neondb`)
- **ORM**: Hibernate 6.3.1 with JPA for all entity management
- **Authentication**: JWT-based auth with Spring Security; tokens issued on login, validated via interceptor
- **WebSocket**: Spring WebSocket for real-time chat messaging
- **Data Seeding**: `DataSeeder.java` seeds sample data on startup, wrapped in try-catch for resilience
- **Build Tool**: Maven — `mvn clean package -DskipTests` produces `backend/target/erp-backend-1.0.0.jar`

### Build & Deployment
- **`build.sh`**: Builds Angular frontend, copies output to backend static resources, then packages backend as executable JAR
- **`start.sh`**: Development startup script — launches backend JAR then Angular dev server
- **Production**: Single JAR (`java -jar backend/target/erp-backend-1.0.0.jar --server.port=5000`) serves both API and static Angular frontend on port 5000
- **Deployment Target**: Autoscale

### API Structure
All REST endpoints are under `/api` prefix. Key API groups:
- `/api/auth` — Login, registration, token management
- `/api/branches` — Multi-company/branch management
- `/api/dashboard` — Dashboard statistics
- `/api/settings/*` — General, finance, customer, contract, roles, prefix settings
- `/api/inventory/*` — Groups, items, units, warehouses, suppliers, valuation, ledger
- `/api/stock-movement/*` — Goods receipt, issue, transfer, adjustments
- `/api/purchase/*` — Purchase requisitions, direct purchase, invoices, fulfillment
- `/api/contracts`, `/api/customers` — Contract and customer management
- `/api/employees` — Employee CRUD with related entities
- `/api/organization/*` — Departments, locations, grades, designations, cost centers
- `/api/attendance/*` — Clock in/out, timesheet, approval
- `/api/payroll/*` — Salary heads, pay frequencies, payroll processing
- `/api/leaves/*` — Leave types, requests, balances, holidays
- `/api/expenses/*` — Expense categories, requests, approval
- `/api/loans/*` — Loan applications, EMI, repayment
- `/api/compensation/*` — Salary bands, revisions, bonuses
- `/api/settlements` — Final & full settlement processing
- `/api/recruitment/*` — Job requisitions, candidates, interviews
- `/api/onboarding/*` — Onboarding plans, tasks, assets
- `/api/training/*` — Training programs, sessions, enrollments
- `/api/projects/*` — Projects, tasks, milestones, timesheets, files
- `/api/accounting/*` — Chart of accounts, journal entries, bank transactions
- `/api/notifications` — User notifications with polling
- `/api/calendar` — Calendar events
- `/api/hr-letters` — HR letter generation
- `/api/integrations` — Third-party integration configs
- `/api/audit` — Audit trail logging
- `/api/staff` — Staff/user management
- `/ws` — WebSocket endpoint for real-time chat

### Key Design Decisions
1. **Monolithic JAR deployment**: Frontend is built and bundled into the Spring Boot JAR for single-artifact deployment. This simplifies deployment at the cost of requiring a full rebuild for frontend-only changes.
2. **Proxy-based development**: In development, Angular dev server proxies API calls to the backend, allowing hot-reload for frontend while backend runs separately.
3. **JWT authentication**: Stateless auth with tokens stored client-side; interceptor automatically attaches tokens and redirects on auth failures.
4. **Multi-company isolation**: Branch/company concept with per-branch users, roles, and data. Auto-generates 4 default roles (ADMIN, MANAGER, STAFF, VIEWER) per new company.
5. **NgModule architecture**: Uses traditional NgModule pattern (not standalone-first), with some standalone components mixed in. New components should follow existing patterns.

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connected via Replit's built-in PostgreSQL using environment variables (`PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, database `neondb`)
- **Hibernate DDL**: Auto-manages schema (likely `ddl-auto=update`)

### Frontend CDN Dependencies
- **Google Fonts**: Poppins font family loaded from `fonts.googleapis.com`
- **Font Awesome 6.4.0**: Icon library loaded from `cdnjs.cloudflare.com`

### Frontend NPM Packages
- **@angular/* v21**: Core framework
- **@ngx-translate/core + http-loader**: Internationalization support
- **chart.js + ng2-charts**: Dashboard charts and visualizations
- **jspdf + jspdf-autotable**: Client-side PDF generation (salary slips, reports)
- **xlsx**: Excel file export
- **rxjs**: Reactive programming for state management and HTTP

### Backend Integrations (Configurable)
The system has an integration framework (`/api/integrations`) supporting configurable connections to:
- QuickBooks, SAP (accounting)
- ADP (payroll)
- Jira (project management)
- SMTP (email notifications)
- SMS providers (Twilio-style with SID/auth token)
- Webhook endpoints

These are stored as `IntegrationConfig` entities and are not hard-coded — they're configured per deployment through the settings UI.