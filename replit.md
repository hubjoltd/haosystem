# Hao System - Angular Frontend

## Overview
The Hao System is an enterprise resource planning (ERP) web application designed to provide comprehensive business management capabilities. Built with Angular for the frontend and Spring Boot for the backend, it offers functionalities across inventory, customer, contract, HR, payroll, and administrative settings. The system aims to streamline operations with a professional dark teal and white UI, responsive design, automatic ID generation, approval workflows, and extensive reporting features. Its core purpose is to offer a unified platform for managing various enterprise resources efficiently.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
-   **Framework**: Angular 21 with TypeScript 5.9, utilizing NgModule-based and standalone components.
-   **Styling**: SCSS with a dark teal (#008080) and white color scheme, providing a responsive sidebar dashboard layout.
-   **State Management**: Services leveraging RxJS BehaviorSubjects.
-   **HTTP Communication**: HttpClient with interceptors for JWT token-based authentication.
-   **UI/UX**: Professional dark teal and white theme with responsive design.
-   **Routing**: Root path redirects to login; `/app` prefix for authenticated routes wrapped by `LayoutComponent`.

### Key Feature Modules
-   **Multi-Company Management**: Comprehensive CRUD operations for companies (branches), company-specific user management, role-based access, and complete data isolation with extensive settings. Features include:
    - Logo upload during company creation with base64 encoding and preview
    - Auto-creation of admin user with provided credentials during company setup
    - Auto-generation of 4 default roles (ADMIN, MANAGER, STAFF, VIEWER) with predefined permissions for each new company
    - URL slug and color (primary/secondary) customization per company
    - Immediate save/delete operations with individual loading states (no page-wide loading)
-   **Dashboard**: Overview statistics and charts.
-   **Settings**: Manages general, finance, customer, contract, roles, staff, and auto-ID prefix settings, including integration capabilities for external systems (QuickBooks, SAP, ADP, Jira, SMTP, SMS).
-   **Inventory & Stock Movement**: Covers Group/Item Master, Units, Warehouse/Bin, Suppliers, Valuation, Ledger, Goods Receipt, Issue, Transfer, and Adjustments with approval workflows.
-   **Customer & Contract Management**: Standard CRUD operations with search and filtering.
-   **Purchase Order Management**: Manages Purchase Requisition (PR), PR Fulfillment, Direct Purchase, and Purchase Invoice with workflow tracking.
-   **HR Management**: Comprehensive module including Organization Structure, Employee Master, Document Management, Recruitment, Training & Development, Onboarding.
-   **Attendance Module** (Separate menu section): Clock In / Clock Out with real-time running timer, Weekly Timesheet, Daily Attendance tracking, Attendance Approval workflow, Add Attendance button with employee selection for manual entry, and Edit Attendance modal with real-time auto-calculated hours.
-   **Payroll Module** (Separate menu section): Process Payroll (4-step wizard: Generate Payroll, Calculate Payroll, Process Payroll with Pay Date, Payroll History), Payroll History with PDF/CSV export, Pay Slips (ESS), and Payroll Dashboard.
-   **Leave Management**: Leave types with approval workflows, holiday calendars, leave requests, and auto-creation of leave balance records when approving leaves if balance doesn't exist (using annual entitlement as opening balance).
-   **Expense & Reimbursement Management**: Manages expense categories, request workflows, manager approval, and payroll integration.
-   **Loans & Advances Management**: Handles loan applications, approval workflows, EMI configuration, auto-deduction, ledger, and repayment history.
-   **Compensation & Benefits**: Sets up salary bands, revisions, bonus, health insurance, and allowances.
-   **F&F Settlement**: Processes Final and Full Settlements for employee separations.
-   **Payroll Workflow**: Simplified 4-step workflow: Step 1 (Generate Payroll from approved attendance), Step 2 (Calculate Payroll with tax breakdowns), Step 3 (Process Payroll with required pay date), Step 4 (Payroll History). Features consistent employee selection with checkboxes across payroll steps and OnPush change detection for performance.
-   **Employee Payroll Tab**: Employee detail page includes a dedicated Payroll tab showing payroll records and timesheets history for each employee.
-   **Employee Service Portal** (Separate menu section): Allows employees to view pay stubs, attendance summaries, manage leave/reimbursement/loan requests, access HR policies & documents, and view assigned assets. Features auto-initialization and carry-forward of leave balances. Menu items: Pay Slips, My Attendance, My Leave, My Reimbursements, My Assets, HR Policies.
-   **Project Management Module**: Full-featured module with tabs for Overview, Members, Client Permissions, Billing, Tasks, Milestones, Timesheets, Files, and Notes.
-   **Finance & Accounting Module** (Separate menu section): Comprehensive accounting system with:
    - Accounting Dashboard with key financial metrics
    - Chart of Accounts management (ASSET, LIABILITY, EQUITY, INCOME, EXPENSE types)
    - Bank Accounts with balance tracking and GL account linking
    - Journal Entries with double-entry bookkeeping (DRAFT, POSTED, REVERSED status)
    - Bank Transactions with categorization and reconciliation
    - Account Transfers between bank accounts
    - Bills Management with supplier tracking and payment status
    - Budget Management with fiscal year tracking
    - Bank Reconciliation workflow
    - Financial Reports (Trial Balance, Income Statement, Balance Sheet, Cash Flow, Deposit Detail, Income by Customer, Cheque Detail, Budget Overview/Performance/vs Actual, A/R Aging Summary/Detail, A/P Aging Summary/Detail)
    - Finance Settings (General, Account Detail Types, Plaid Environment, Income Statement Modification, Currency Rates)
-   **Admin Notifications**: Real-time system notifications with approval workflows.
-   **Audit Trails & Logging**: Tracks system, inventory, and purchase actions.
-   **Reports**: Generates detailed reports across modules.

### Technical Implementations & Design Choices
-   **Company Data Isolation**: All employee and department data is filtered by branchId from JWT tokens. Each company only sees their own data. SuperAdmin users bypass branch filtering and can access all data across companies.
-   **Branch Verification Pattern**: Employee subresources (bank details, salary, education, experience, assets) verify branch access before any GET/POST/PUT/DELETE operations. Returns 404 for cross-branch access attempts.
-   Automatic ID generation for various modules (e.g., ONB-YYYY-XXXXX for onboarding plans).
-   Integrated approval workflows across Stock Movement, Purchase Orders, Leave, Expenses, Loans, and Attendance.
-   Responsive sidebar dashboard layout.
-   Comprehensive sample data seeding for development.
-   Payroll workflow implemented as a simplified 4-step wizard with pay date requirement in Step 3.
-   Dynamic display of leave balance in request forms.
-   Prevention of duplicate submissions via saving state and button disable logic.
-   Improved error message extraction and user feedback, utilizing a unified Toast Notification System.
-   Frontend validation for required fields.
-   `[ngValue]` binding for proper null handling and numeric ID submission.
-   Hourly rate auto-calculation based on basic salary.
-   Document types drill-down for filtering and selection, with comprehensive document checklists and file upload capabilities (PDF, image files up to 10MB).
-   Terminology standardization (e.g., "Company" instead of "Branch").
-   Consistent loading states for all save/update/edit operations.
-   OnPush change detection strategy with ChangeDetectorRef for performance-critical payroll components.
-   Processed payroll data flows from timesheet-approval to payroll-history via PayrollService in-memory cache.
-   jspdf-autotable integration for formatted PDF reports with summary footers.
-   Chat panel with file attachment support (images, PDF, Word, Excel files up to 5MB) and real-time messaging.
-   Employee code prefix settings for auto-generating employee IDs (e.g., EMP-0001).
-   Profile and account settings navigation in header dropdown for administrators.
-   Leave and reimbursement request notifications - admins notified on new requests, employees notified on approval/rejection.
-   Loan request notifications - admins notified on new applications, employees notified on approval/rejection.
-   ESS (Employee Self-Service) expense/loan submission flow: requests created as DRAFT then submitted to trigger notification workflows.
-   Admin employee selector in ESS portal - administrators can view any employee's ESS data via dropdown selector.

## Recent Changes (Feb 2026)
-   **Employee JSON Serialization Fix**: Added `@JsonIgnoreProperties` annotations on Employee, AttendanceRecord, and Timesheet models to prevent circular reference errors with lazy-loaded `@ManyToOne` relationships (branch, department, designation, reportingManager, etc.). This resolved API responses returning 500 errors instead of data.
-   **Employee Update Data Preservation**: Rewrote `EmployeeController.update()` to use null-guarded field-by-field merging instead of full entity replacement, preventing existing data from being wiped when partial updates are sent.
-   **Attendance Clock-In Logic Fix**: Fixed `AttendanceController.clockIn()` to properly differentiate between "awaiting clock out" (blocked) and "already completed" (blocked with different message) states, preventing false "already clocked in" errors.
-   **Payroll Calculation Rules**: 8hr max regular per day, 1hr lunch deduction, overtime beyond 8hrs, timesheets auto-generated from approved attendance records.

## External Dependencies

### Frontend Dependencies
-   **Angular**: `@angular/core`, `common`, `forms`, `router` (v21).
-   **RxJS**: `rxjs` (v7.8).
-   **Charting**: `chart.js` & `ng2-charts`.
-   **PDF Generation**: `jspdf`.
-   **Excel Parsing/Export**: `xlsx`.
-   **Icons**: Font Awesome (CDN).
-   **Fonts**: Google Fonts Poppins (CDN).

### Backend Integration
-   **Spring Boot REST API**: Hosted on port 8080, integrates with PostgreSQL.
-   **Proxy Configuration**: `frontend/proxy.conf.json` routes `/api` to `localhost:8080`.
-   **JPA Repositories**: Utilized for data persistence.

### Development Tools
-   **Testing**: Vitest (Unit testing).
-   **Build**: Angular CLI (v21).
-   **Language**: TypeScript (v5.9).