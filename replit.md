# Hao System - Angular Frontend

## Recent Changes (January 2026)
- **Bug Fix: Training Enrollment**: Fixed frontend payload format - now sends flat `sessionId` and `employeeId` instead of nested objects (`session: {id}`, `employee: {id}`). Backend now extracts `enrolledBy` from authenticated user context via Spring Security `Authentication` parameter
- **Cost Centers Sample Data**: Added 11 cost centers with parent-child hierarchy:
  - Corporate (CC001) → IT, HR, Finance
  - Operations (CC002) → Manufacturing, Warehouse, Quality Assurance
  - Sales & Marketing (CC003) → Sales, Marketing
- **Expense Centers Sample Data**: Added 10 expense centers linked to cost centers:
  - IT: Software Licenses, Hardware & Equipment, Cloud Services
  - HR: Recruitment, Training & Development
  - Finance: Audit & Compliance
  - Manufacturing: Raw Materials
  - Warehouse: Logistics
  - Sales: Sales Travel
  - Marketing: Advertising
- **Development Database Sample Data**: Seeded comprehensive sample data for testing:
  - 5 departments (IT, HR, Finance, Sales, Operations)
  - 5 grades (Junior, Mid-Level, Senior, Lead, Executive) with salary ranges
  - 5 locations (Headquarters, West Coast, South, Midwest, Remote)
  - 5 designations (Software Engineer, HR Executive, Financial Analyst, Sales Rep, Ops Manager)
  - 5 pay frequencies (Monthly, Bi-Weekly, Weekly, Semi-Monthly, Annual)
  - 5 employees with complete profiles
  - 5 projects (Website Redesign, Mobile App, ERP Implementation, Marketing Campaign, Infrastructure)
  - 2 payroll runs with 10 payroll records including detailed tax breakdowns
  - 10 attendance records for today and yesterday
- **Payroll Workflow Step Wizard**: Implemented 5-step wizard navigation for payroll processing:
  - Step 0: Daily Attendance Approval (with date navigation, attendance selection, bulk approval)
  - Step 1: Generate Timesheets (with pay period type dropdown: Monthly, Weekly, Bi-Weekly, Semi-Monthly)
  - Step 2: Calculate Payroll (redirects to /app/payroll/calculation)
  - Step 3: Process Payroll (redirects to /app/payroll/process)
  - Step 4: Payroll History (redirects to /app/payroll/history)
- **Payroll History Column Structure**: Updated table with comprehensive tax breakdown columns:
  - S.NO, EMP ID, NAME, TYPE, PROJECT, PAY PERIOD, PERIOD FROM, PERIOD TO, HOURS
  - GROSS, FEDERAL, STATE, SOC.SEC, MEDICARE, TOTAL TAX, NET PAY, PAYM DATE
  - "All Payroll Records" header bar with record count, total hours, and total paid summary
  - Export buttons for Excel and PDF
- **Sidebar Navigation Improvements**: Enhanced CSS for better clickability with user-select, tap-highlight suppression, and active state feedback
- **Database Seeding**: Added data.sql for automatic seeding of default leave types (Annual, Sick, Casual, Maternity, Paternity, Unpaid) on fresh deployments
- **Application Initialization**: Configured deferred datasource initialization with SQL init mode for proper schema-then-data execution order
- **Leave Balance Display**: Added employee selection dropdown in leave request form that loads and displays leave balances (Available/Used/Pending days) when creating leave requests
- **Duplicate Prevention**: Added `saving` state and button disable logic across leave-requests, loans, training, and designations components to prevent double submissions
- **Edit Functionality**: Fixed loans component to properly load existing data when editing; training and designations already had proper edit loading
- **Error Handling**: Improved error message extraction and user feedback across all save operations
- **Form Validation**: Added frontend validation for required fields before submission
- **Select Bindings**: Changed from [value] to [ngValue] in leave request form for proper null handling and numeric ID submission

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
19. **Multi-Branch Management**: Complete multi-branch architecture with:
    - Branch CRUD operations (create, edit, delete branches)
    - Branch-specific user management with role-based access
    - **Branch Settings** with 5 configuration tabs:
      - **General**: Company legal name, display name, tax registration, business registration
      - **Localization**: Currency symbol, position, time format, number format, fiscal year start
      - **Tax & Finance**: Default tax rate, tax label, payment terms, invoice due days, footer/terms
      - **Document Prefixes**: Auto-generated numbering for invoices, POs, quotations, receipts, payroll, employee IDs
      - **Branding**: Logo upload, signature upload, primary/secondary colors, visibility toggles
    - Data isolation per branch with independent settings
3.  **Inventory**: Group Master, Item Master, Units, Warehouse/Bin, Suppliers, Valuation, Ledger.
4.  **Stock Movement**: Goods Receipt (GRN), Goods Issue, Stock Transfer, Stock Adjustments with approval workflows.
5.  **Customer & Contract Management**: CRUD operations with search and filtering.
6.  **Purchase Order Management**: Purchase Requisition (PR), PR Fulfillment, Direct Purchase, Purchase Invoice with workflow tracking.
7.  **Admin Notifications**: Real-time system notifications with an approval workflow for PRs.
8.  **Audit Trails & Logging**: Comprehensive tracking for system, inventory, and purchase actions.
9.  **Reports**: Detailed reports across Inventory (e.g., Stock Summary, Valuation) and Purchase (e.g., PR List, PO List).
10. **HR Management**: Comprehensive module including Organization Structure, Employee Master, Document Management, Recruitment, Training & Development, and Onboarding.
11. **Time, Attendance & Leave Management**: Web-based clock in/out, multi-method attendance tracking, overtime calculation, leave types, requests with approval workflows, and holiday calendars. Includes:
    - **Daily Attendance**: Daily attendance tracking with manual entry and upload capabilities
    - **Weekly Timesheet - Project Wise**: Project-based weekly timesheet view with auto-generate functionality (generates 7 days, auto-marks weekends), employee/project breakdown, day-by-day hours tracking, variance calculation from 40-hour week, and summary cards (Total Employees, Projects, Hours, Average)
12. **Integration Capabilities**: Settings for external systems like QuickBooks, SAP, ADP, Jira, SMTP, and SMS (Twilio/Vonage/AWS SNS).
13. **Expense & Reimbursement Management**: Expense categories, request workflow (DRAFT to APPROVED/REJECTED), manager approval, reimbursement processing with payroll integration.
14. **Loans & Advances Management**: Loan applications, approval workflow, EMI configuration, auto-deduction, ledger, repayment history.
15. **Compensation & Benefits**: Salary bands, revisions, bonus setup, health insurance, allowances.
16. **F&F Settlement**: Final and Full Settlement processing for employee separations, automatic calculations, and workflow.
17. **Payroll Management**: A 5-phase workflow covering Payroll Rules Configuration, Attendance Approval & Timesheets, Payroll Calculation (with exact formulas for salaried/hourly employees), Process Payroll (with selective employee checkbox processing and automated account postings), and Employee Self-Service (ESS). Phase 2 (Attendance & Payroll Approval) includes:
    - **Daily Attendance Review tab**: Date selector, summary cards (Total Employees, Total Hours, Overtime), attendance table with EMP ID, NAME, CLOCK IN/OUT, HOURS, STATUS
    - **Timesheet Summary tab**: Period selection (Pay Date, Approved By, Week Ending), Generate Attendance to Payroll button, Timesheet Summary table with bulk selection and approval actions
    - **Payroll History**: Complete payroll history tracking with:
      - Summary cards (Completed Runs, Total Gross, Total Net, Avg Net Pay/Run)
      - Advanced filtering by status, date range (From/To), and search (by name or ID)
      - Sortable data table with 17 columns (EMP ID, NAME, PROJECT, PAY RATE/PERIOD, PAY DATE, PERIOD TO, REGULAR, BONUS, ALLOWANCES, DEDUCTIONS, GROSS, YTD GROSS, FED TAX, STATE TAX, NET PAY, PAYMENT DATE, PAY STATUS)
      - Automatic totals row in table footer
      - Salaried vs Hourly employee breakdown sections (filtered by pay rate period)
      - Grand total net amount bar with gradient styling
      - CSV export functionality for all records
18. **Employee Self-Service (ESS) Portal**: Complete Phase 5 implementation with:
    - Pay Stubs viewing with detailed breakdown (earnings, deductions, taxes, net pay)
    - Salary slip download/print functionality (PDF generation via jsPDF)
    - Attendance Summary with monthly cards (Present Days, Absent Days, Late Arrivals, Total Hours, Overtime)
    - Leave Balance visualization with progress bars
    - Submit Leave Requests modal with leave type, dates, and reason
    - Submit Expense Requests modal with category, amount, date, receipt number, and description
    - Submit Loan/Advance Applications modal with loan type, amount, EMI configuration, and EMI preview calculation
    - HR Policies & Documents tab showing company policies with category badges
    - My Documents tab with expiry tracking and verification status
    - Assigned Assets tab showing company equipment assigned to employee
20. **Project Management Module**: Full-featured project management with 9 tabs:
    - **Overview**: Project name, code, client, billing type, status, progress, dates, hours, description, tags
    - **Members**: Project team management with roles and hourly rates
    - **Client Permissions**: Granular visibility controls (view project, tasks, comments, timesheets, files, discussions)
    - **Billing**: Fixed rate or hourly billing, currency, billable/invoice settings, financial stats
    - **Tasks**: Task list with assignees, status, priority, due dates, billable/visibility flags, completion progress
    - **Milestones**: Project milestones with descriptions and due dates
    - **Timesheets**: Time logging with employee, hours, description, billable status tracking
    - **Files**: File management with visibility controls (staff/client/all)
    - **Notes**: Internal project notes with timestamps
    - Data stored in localStorage with ProjectService using RxJS BehaviorSubjects
    - Card-based grid view with status filtering and search
21. **Expense Types Settings**: Dynamic expense type management under Settings:
    - Add/Edit/Delete expense types
    - Activate/Deactivate status toggles
    - Used in expense form dropdown for categorizing expenses

### Routing
-   Root path redirects to login.
-   `/app` prefix for authenticated routes wrapped by `LayoutComponent`.
-   Nested routes for feature sections.

## External Dependencies

### Frontend Dependencies
-   **Angular**: `@angular/core`, `common`, `forms`, `router` (v21).
-   **RxJS**: `rxjs` (v7.8) for reactive programming.
-   **Charting**: `chart.js` & `ng2-charts` for data visualization.
-   **PDF Generation**: `jspdf` for salary slip and report PDF exports.
-   **Excel Parsing/Export**: `xlsx` for Excel file parsing (attendance uploads) and CSV/Excel exports.
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