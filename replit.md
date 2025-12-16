# Hao System - Angular Frontend

## Overview

This is an enterprise resource planning (ERP) web application built with Angular 21 for the frontend. The system provides comprehensive business management capabilities including inventory management, customer management, contract management, and administrative settings. The application features a dark teal and white professional UI theme with a responsive sidebar dashboard layout.

The backend is fully implemented with Spring Boot (Java) on port 8080, providing RESTful API services with PostgreSQL database integration. The system includes Prefix Settings with auto-generation of IDs across all inventory and purchase modules.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Angular 21 with TypeScript 5.9
- **Module Pattern**: NgModule-based architecture with standalone components for new features
- **Styling**: SCSS with a dark teal (#008080) and white color scheme
- **State Management**: Services with RxJS BehaviorSubjects for reactive state
- **HTTP Communication**: HttpClient with interceptors for authentication

### Component Structure
The application uses a hierarchical component structure:
- `LayoutComponent` - Main wrapper with sidebar and header
- `SidebarComponent` - Collapsible navigation with nested menu items
- `HeaderComponent` - Top navigation bar with notifications and user profile
- Feature components organized by domain (inventory, reports, settings, etc.)

### Authentication
- JWT token-based authentication via `AuthService`
- `AuthInterceptor` automatically attaches tokens to requests
- Handles 401/403 responses by redirecting to login

### API Layer
- All API calls go through service classes (e.g., `ItemService`, `CustomerService`)
- Base URL is `/api` with proxy configuration to forward to backend at port 8080
- Services follow a consistent pattern: `getAll()`, `getById()`, `create()`, `update()`, `delete()`

### Key Feature Modules
1. **Dashboard** - Overview statistics and charts
2. **Settings** - General, Finance (tax rates, currencies, payment modes, expense categories), Customer, Contract, Roles, Staff Management, **Prefix Settings** (auto-generation configuration for all modules)
3. **Inventory** - Group Master, Item Master, Units of Measure, Warehouse/Bin Management, Suppliers, Valuation, Ledger
4. **Stock Movement** - Goods Receipt (GRN with PO-triggered or Direct Receipt options), Goods Issue, Stock Transfer, Stock Adjustments with Approval Workflow (Pending -> Approved/Rejected)
5. **Customer & Contract Management** - CRUD operations with search and filtering
6. **Purchase Order Management** - Purchase Requisition, PR Fulfillment (Convert to PO, Stock Issue, Material Transfer), Direct Purchase with professional PO Print layout, **Purchase Invoice** (table/kanban views, PO linking, full CRUD with status workflow: Draft -> Pending -> Paid/Cancelled)
7. **Admin Notifications** - Real-time notification system for administrators:
   - Notifications triggered when PRs are submitted for approval
   - Bell icon with unread count in header
   - Dropdown list showing notification details with timestamps
   - Mark as read/mark all as read functionality
   - Auto-polling every 30 seconds for new notifications
8. **Audit Trails & Logging** - Comprehensive audit tracking with three sub-sections:
   - **System Audits**: Login/logout, password changes, settings updates
   - **Inventory Audits**: Item changes, stock movements, quantity modifications
   - **Purchase Audits**: PR creation/submission/approval, PO conversion, stock fulfillment with full workflow tracking
9. **Reports** - Reorganized into sub-sections:
   - **Inventory Reports**: Stock Summary, Inventory Valuation, Item Movement, Stock Ledger, Group-wise Stock, Warehouse Stock, Reorder Level, Slow-Moving Items, Purchase vs GRN
   - **Purchase Reports**: PR List, PR Item Pending, PR Fulfillment History, PO List, Direct Purchase, Stock Issue/Transfer (components scaffolded, awaiting design implementation)
10. **HR Management** - Human Resources module with Organization Structure:
   - **Organization Structure** (Phase 1 Complete):
     - Departments - with location and cost center assignment
     - Locations - physical office locations
     - Job Roles - job role definitions
     - Grades - employee grade levels
     - Designations - job titles and designations
     - Cost Centers - financial cost center tracking
     - Expense Centers - expense allocation centers
   - **Employee Master** (Phase 2 Complete): Employee list with search/filter, personal details, employment details
   - **Document Management** (Phase 3 Complete): Document types, employee documents, expiry tracking
11. **Time, Attendance & Leave Management** - Comprehensive workforce management:
   - **Time & Attendance**:
     - Clock In/Out - Web-based time capture with real-time clock display
     - Attendance tracking with multiple capture methods (WEB, MOBILE, BIOMETRIC, MANUAL, EXCEL_UPLOAD)
     - Status tracking (PRESENT, ABSENT, HALF_DAY, ON_LEAVE, HOLIDAY, WEEKEND)
     - Overtime hours calculation and tracking
     - Late arrival/early departure monitoring
     - Approval workflow for manual entries
     - Project-wise time entries with day-wise and hour-wise logging
     - Attendance rules engine for shift configurations
   - **Leave Management**:
     - Leave Types - Configurable leave categories (Casual, Sick, Annual, etc.) with accrual settings
     - Leave Requests - Employee leave applications with approval workflow (PENDING -> APPROVED/REJECTED/CANCELLED)
     - Leave Balance tracking with carry-forward and encashment options
     - Holiday Calendar - Company holiday management with types (FEDERAL, COMPANY, OPTIONAL, RESTRICTED)
     - Leave accrual types (ANNUALLY, MONTHLY, QUARTERLY)

### Routing
- Root path redirects to login
- `/app` prefix for authenticated routes with `LayoutComponent` wrapper
- Nested routes for settings and inventory subsections

## External Dependencies

### Frontend Dependencies
- **@angular/core, common, forms, router** (v21) - Core Angular framework
- **rxjs** (v7.8) - Reactive programming for async operations
- **chart.js & ng2-charts** - Data visualization for dashboard charts
- **Font Awesome** (CDN) - Icon library
- **Google Fonts Poppins** (CDN) - Typography

### Backend Integration (Implemented)
- **Spring Boot REST API** on port 8080 with PostgreSQL database
- **Proxy Configuration**: `frontend/proxy.conf.json` routes `/api` to `localhost:8080`
- **58 JPA Repository interfaces** for data persistence (includes HR organization entities and Time/Attendance/Leave entities)
- API endpoints:
  - `/api/auth/login`, `/api/auth/register`
  - `/api/customers`, `/api/contracts`
  - `/api/inventory/items`, `/api/inventory/groups`, `/api/inventory/units`, `/api/inventory/warehouses`, `/api/inventory/bins`, `/api/inventory/suppliers`
  - `/api/stock-movement/grn`, `/api/stock-movement/issues`, `/api/stock-movement/transfers`, `/api/stock-movement/adjustments`
  - `/api/settings/general`, `/api/settings/finance`
  - `/api/dashboard/stats`
  - `/api/audit` (with filters for module, modules, action, entityType, performedBy, startDate, endDate, search)
  - `/api/audit/entity/{entityType}/{entityId}` (get audits for specific entity)
  - `/api/notifications` (user notifications with mark as read, delete)
  - `/api/settings/prefixes`, `/api/settings/prefixes/generate/{type}` (prefix settings and ID auto-generation)
  - `/api/organization/departments`, `/api/organization/locations`, `/api/organization/job-roles`, `/api/organization/grades`, `/api/organization/designations`, `/api/organization/cost-centers`, `/api/organization/expense-centers` (HR organization structure CRUD)
  - `/api/attendance` (attendance records, clock in/out, rules, project time entries)
  - `/api/leave` (leave types, leave requests with approval workflow, leave balances, holiday calendar)

### Auto-Generation with Prefix Settings
All inventory and purchase modules support automatic ID generation based on configurable prefix settings:
- **Inventory**: Item Code, Group Code, Warehouse Code, Bin Code, Supplier Code, UOM Code
- **Purchase**: PR Number, PO Number
- **Stock Movement**: GRN Number, Issue Number, Transfer Number, Adjustment Number

Components call `SettingsService.generatePrefixId(type)` on create modal open, with fallback to service-level generation if prefix API fails.

### Development Tools
- **Vitest** - Unit testing framework
- **Angular CLI** (v21) - Build and development tooling
- **TypeScript** (v5.9) - Type-safe JavaScript

### Running the Application (Development)
```bash
# Start backend (port 8080)
cd backend && mvn spring-boot:run

# Start frontend (port 5000)
cd frontend && npm start
```

The frontend proxy routes `/api` calls to backend on port 8080.

### Deployment Configuration
- **Build**: Builds Angular frontend, copies to Spring Boot static resources, then packages the JAR
- **Run**: `cd backend && PORT=5000 java -jar target/erp-backend-1.0.0.jar`
- **Port**: Production runs on port 5000 (via PORT environment variable)
- **Health Check**: Root endpoint `/` serves Angular app (returns 200 with HTML)
- **Architecture**: Single-server deployment - Spring Boot serves both the Angular SPA and the REST API