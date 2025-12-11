# ERP System - Angular Frontend

## Overview

This is an enterprise resource planning (ERP) web application built with Angular 21 for the frontend. The system provides comprehensive business management capabilities including inventory management, customer management, contract management, and administrative settings. The application features a dark teal and white professional UI theme with a responsive sidebar dashboard layout.

The backend is intended to be Spring Boot (Java), but is not yet implemented in this repository. The frontend is fully developed and communicates with a `/api` endpoint expecting RESTful services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Angular 21 with TypeScript 5.9
- **Module Pattern**: NgModule-based architecture (not standalone components)
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
2. **Settings** - General, Finance (tax rates, currencies, payment modes, expense categories), Customer, Contract, Roles, Staff Management
3. **Inventory** - Group Master, Item Master, Units of Measure, Warehouse/Bin Management, Suppliers, Valuation, Ledger
4. **Stock Movement** - Goods Receipt (GRN), Goods Issue, Stock Transfer, Adjustments
5. **Customer & Contract Management** - CRUD operations with search and filtering
6. **Purchase Order Management** - Purchase Requisition, PR Fulfillment (Convert to PO, Stock Issue, Material Transfer), Direct Purchase (components scaffolded, awaiting design implementation)
7. **Reports** - Reorganized into sub-sections:
   - **Inventory Reports**: Stock Summary, Inventory Valuation, Item Movement, Stock Ledger, Group-wise Stock, Warehouse Stock, Reorder Level, Slow-Moving Items, Purchase vs GRN
   - **Purchase Reports**: PR List, PR Item Pending, PR Fulfillment History, PO List, Direct Purchase, Stock Issue/Transfer (components scaffolded, awaiting design implementation)

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

### Backend Integration (Not Yet Implemented)
- **Expected**: Spring Boot REST API on port 8080
- **Proxy Configuration**: `frontend/proxy.conf.json` routes `/api` to `localhost:8080`
- API endpoints expected:
  - `/api/auth/login`, `/api/auth/register`
  - `/api/customers`, `/api/contracts`
  - `/api/inventory/items`, `/api/inventory/groups`, `/api/inventory/units`, `/api/inventory/warehouses`, `/api/inventory/bins`, `/api/inventory/suppliers`
  - `/api/stock-movement/grn`, `/api/stock-movement/issues`, `/api/stock-movement/transfers`, `/api/stock-movement/adjustments`
  - `/api/settings/general`, `/api/settings/finance`
  - `/api/dashboard/stats`

### Development Tools
- **Vitest** - Unit testing framework
- **Angular CLI** (v21) - Build and development tooling
- **TypeScript** (v5.9) - Type-safe JavaScript

### Running the Application
```bash
cd frontend
npm install
npm start  # Runs on port 5000 with host 0.0.0.0
```

The frontend expects a backend API to be running on port 8080 for full functionality.