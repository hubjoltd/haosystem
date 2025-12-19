# Hao System - Angular Frontend

## Overview
The Hao System is an enterprise resource planning (ERP) web application built with Angular 21 for the frontend and Spring Boot (Java) for the backend. It offers comprehensive business management capabilities, including inventory, customer, contract, HR, payroll, and administrative settings. The application features a professional dark teal and white UI, responsive design, and robust functionalities like automatic ID generation, approval workflows, and extensive reporting. Its purpose is to streamline business operations and provide a unified platform for managing various enterprise resources.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Angular 21 with TypeScript 5.9.
- **Module Pattern**: NgModule-based with standalone components for new features.
- **Styling**: SCSS with a dark teal (#008080) and white color scheme.
- **State Management**: Services utilizing RxJS BehaviorSubjects.
- **HTTP Communication**: HttpClient with interceptors for authentication.
- **Authentication**: JWT token-based authentication with `AuthService` and `AuthInterceptor`.
- **UI/UX**: Responsive sidebar dashboard layout, professional dark teal and white theme.

### Key Feature Modules
1.  **Dashboard**: Overview statistics and charts.
2.  **Settings**: General, Finance (tax, currency), Customer, Contract, Roles, Staff, and Prefix Settings for auto-generating IDs across modules.
3.  **Inventory**: Group Master, Item Master, Units, Warehouse/Bin, Suppliers, Valuation, Ledger.
4.  **Stock Movement**: Goods Receipt (GRN), Goods Issue, Stock Transfer, Stock Adjustments with approval workflows.
5.  **Customer & Contract Management**: CRUD operations with search and filtering.
6.  **Purchase Order Management**: Purchase Requisition (PR), PR Fulfillment, Direct Purchase, Purchase Invoice with workflow tracking.
7.  **Admin Notifications**: Real-time system notifications with an approval workflow for PRs.
8.  **Audit Trails & Logging**: Comprehensive tracking for system, inventory, and purchase actions.
9.  **Reports**: Detailed reports across Inventory (e.g., Stock Summary, Valuation) and Purchase (e.g., PR List, PO List).
10. **HR Management**: Comprehensive module including Organization Structure, Employee Master, Document Management, Recruitment, Training & Development, and Onboarding.
11. **Time, Attendance & Leave Management**: Web-based clock in/out, multi-method attendance tracking, overtime calculation, leave types, requests with approval workflows, and holiday calendars.
12. **Integration Capabilities**: Settings for external systems like QuickBooks, SAP, ADP, Jira, SMTP, and SMS (Twilio/Vonage/AWS SNS).
13. **Expense & Reimbursement Management**: Expense categories, request workflow (DRAFT to APPROVED/REJECTED), manager approval, reimbursement processing with payroll integration.
14. **Loans & Advances Management**: Loan applications, approval workflow, EMI configuration, auto-deduction, ledger, repayment history.
15. **Compensation & Benefits**: Salary bands, revisions, bonus setup, health insurance, allowances.
16. **F&F Settlement**: Final and Full Settlement processing for employee separations, automatic calculations, and workflow.
17. **Payroll Management**: A 5-phase workflow covering Payroll Rules Configuration, Attendance Approval & Timesheets, Payroll Calculation, Process Payroll, and Employee Self-Service (ESS).

### Routing
-   Root path redirects to login.
-   `/app` prefix for authenticated routes wrapped by `LayoutComponent`.
-   Nested routes for feature sections.

## External Dependencies

### Frontend Dependencies
-   **Angular**: `@angular/core`, `common`, `forms`, `router` (v21).
-   **RxJS**: `rxjs` (v7.8) for reactive programming.
-   **Charting**: `chart.js` & `ng2-charts` for data visualization.
-   **Icons**: Font Awesome (CDN).
-   **Fonts**: Google Fonts Poppins (CDN).

### Backend Integration
-   **Spring Boot REST API**: Hosted on port 8080, integrates with PostgreSQL.
-   **Proxy Configuration**: `frontend/proxy.conf.json` routes `/api` to `localhost:8080`.
-   **JPA Repositories**: 72 interfaces for data persistence across all modules.
-   **API Endpoints**: Comprehensive set of RESTful endpoints for all features, including authentication, CRUD for various entities (customers, inventory, HR, payroll, etc.), audit trails, notifications, and integration settings.

### Development Tools
-   **Testing**: Vitest (Unit testing).
-   **Build**: Angular CLI (v21).
-   **Language**: TypeScript (v5.9).

### Deployment
-   **Single-server**: Spring Boot serves both the Angular SPA and the REST API.
-   **Production Port**: Configurable via `PORT` environment variable (defaults to 5000).