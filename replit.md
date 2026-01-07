# Hao System - Angular Frontend

## Recent Changes (January 2026)
- **ESS Leave Balance Auto-Initialization**: Leave balances now auto-initialize from admin-configured LeaveType.annualEntitlement when opening ESS portal
- **Leave Balance Carry-Forward**: Added backend logic to carry forward unused leave from previous year, respecting maxCarryForward limits (excludes pending requests from carry calculation to prevent entitlement loss)
- **Leave Balance Calculation**: Available = Total (opening + credited + carryForward) - used - pending - lapsed - encashed
- **Onboarding Plan Auto-Generation**: Fixed save error by auto-generating plan_number in ONB-YYYY-XXXXX format when creating new onboarding plans
- **Manpower Requisition Field Mapping**: Added backend support for frontend field names (jobTitle, minSalary/maxSalary, requiredSkills, minimumExperience, expectedJoiningDate, justificationType)
- **Training Session programId Fix**: Added support for both programId and trainingProgramId field names when creating training sessions
- **Payroll History View Toggle Fix**: Corrected List View to show summary cards and Detail View to show comprehensive data table
- **Calculate Payroll Navigation**: Added Calculate Payroll page routing under `/payroll/calculate` and menu item in Payroll Processing section
- **Candidate to Employee Conversion**: Verified proper data copying and database linking during candidate conversion
- **ESS Expense Categories Display**: Added all expense categories grid in ESS Expenses tab showing category name, description, icon, color, max amount limit, and active/inactive status
- **ESS Document Checklist**: Verified document checklist is properly showing in ESS Documents tab with upload status, completion percentage, and category-based organization
- **Document Checklist Enhancement**: Added comprehensive document checklist in employee Documents tab showing ALL document types organized by category with upload status indicators (Not Uploaded, Uploaded, Approved, Rejected, Expired)
- **File Upload in Document Modal**: Added PDF and image file upload capability with drag-and-drop style UI (supports PDF, JPEG, PNG, GIF; max 10MB)
- **Document Status Visualization**: Color-coded mandatory document rows (light orange) and expired document rows (light red) for better visibility
- **Asset Field Alignment**: Fixed Assets tab to properly display Asset Code and Issue Date (aligned frontend with backend field names: assetCode/issueDate)
- **Employee Self-Service Assets Fix**: Updated ESS portal to use correct asset field names (assetCode instead of assetTag, issueDate instead of issuedDate)
- **Attendance Bulk Approval**: Added PUT `/api/attendance/bulk-approve` endpoint with proper validation (rejects already approved/rejected records), approverId tracking, and detailed response
- **Daily Attendance Table Enhancements**: Added PROJECT column, ACTIONS column with individual Approve/Reject buttons, and proper status indicators
- **Hourly Rate Auto-Calculation**: Basic Salary input auto-calculates hourly rate using formula: (basicSalary * 12) / 2080 hours
- **Document Types Drill-Down**: Click on category cards to filter document types list with type count per category
- **Terminology Update**: Changed "Branch" to "Company" across login page and branch-management component
- **Employee Lifecycle Flow**: Complete Requisition → Retirement flow verified: MRF → Job Postings → Candidates → Interviews → Offers → Convert to Employee → Onboarding → Settlement (with RETIREMENT separation type)

## Overview
The Hao System is an enterprise resource planning (ERP) web application built with Angular for the frontend and Spring Boot (Java) for the backend. Its core purpose is to provide comprehensive business management capabilities, including inventory, customer, contract, HR, payroll, and administrative settings. The application features a professional dark teal and white UI, responsive design, and robust functionalities like automatic ID generation, approval workflows, and extensive reporting. The system aims to streamline business operations and offer a unified platform for managing various enterprise resources.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
-   **Framework**: Angular 21 with TypeScript 5.9.
-   **Module Pattern**: NgModule-based with standalone components.
-   **Styling**: SCSS with a dark teal (#008080) and white color scheme.
-   **State Management**: Services utilizing RxJS BehaviorSubjects.
-   **HTTP Communication**: HttpClient with interceptors for authentication.
-   **Authentication**: JWT token-based authentication.
-   **UI/UX**: Responsive sidebar dashboard layout, professional dark teal and white theme.
-   **Routing**: Root path redirects to login; `/app` prefix for authenticated routes wrapped by `LayoutComponent`.

### Key Feature Modules
-   **Multi-Branch Management**: Full architecture supporting branch CRUD, branch-specific user management, role-based access, and data isolation with extensive branch settings (General, Localization, Tax & Finance, Document Prefixes, Branding).
-   **Dashboard**: Provides overview statistics and charts.
-   **Settings**: Manages general, finance, customer, contract, roles, staff, and auto-ID prefix settings.
-   **Inventory**: Covers Group Master, Item Master, Units, Warehouse/Bin, Suppliers, Valuation, Ledger.
-   **Stock Movement**: Includes Goods Receipt (GRN), Goods Issue, Stock Transfer, Stock Adjustments with approval workflows.
-   **Customer & Contract Management**: Standard CRUD operations with search and filtering.
-   **Purchase Order Management**: Manages Purchase Requisition (PR), PR Fulfillment, Direct Purchase, and Purchase Invoice with workflow tracking.
-   **Admin Notifications**: Real-time system notifications with approval workflows (e.g., for PRs).
-   **Audit Trails & Logging**: Tracks system, inventory, and purchase actions comprehensively.
-   **Reports**: Generates detailed reports across Inventory and Purchase modules.
-   **HR Management**: Comprehensive module including Organization Structure, Employee Master, Document Management, Recruitment, Training & Development, Onboarding.
-   **Time, Attendance & Leave Management**: Features web-based clock in/out, multi-method attendance tracking, overtime calculation, leave types, requests with approval workflows, holiday calendars, daily attendance tracking, and project-wise weekly timesheets.
-   **Integration Capabilities**: Settings for external systems like QuickBooks, SAP, ADP, Jira, SMTP, SMS.
-   **Expense & Reimbursement Management**: Manages expense categories, request workflows, manager approval, and payroll integration.
-   **Loans & Advances Management**: Handles loan applications, approval workflows, EMI configuration, auto-deduction, ledger, and repayment history.
-   **Compensation & Benefits**: Sets up salary bands, revisions, bonus, health insurance, and allowances.
-   **F&F Settlement**: Processes Final and Full Settlements for employee separations with automatic calculations.
-   **Payroll Management**: A 5-phase workflow: Rules Configuration, Attendance Approval & Timesheets (with daily attendance review and timesheet summary), Payroll Calculation, Process Payroll, and Employee Self-Service (ESS). Includes comprehensive payroll history with advanced filtering and export options.
-   **Employee Self-Service (ESS) Portal**: Allows employees to view pay stubs, download salary slips, see attendance summaries, manage leave/expense/loan requests, access HR policies & documents, and view assigned assets.
-   **Project Management Module**: A full-featured module with tabs for Overview, Members, Client Permissions, Billing, Tasks, Milestones, Timesheets, Files, and Notes. Features a card-based grid view with filtering and search.
-   **Expense Types Settings**: Dynamic management of expense types (add/edit/delete, activate/deactivate).

### Technical Implementations & Design Choices
-   Automatic ID generation for various modules.
-   Approval workflows integrated into Stock Movement, Purchase Orders, Leave, Expenses, Loans.
-   Responsive sidebar dashboard layout.
-   Comprehensive sample data seeding for development.
-   Payroll workflow implemented as a 5-step wizard.
-   Leave balance displayed dynamically in request forms.
-   Duplicate submission prevention via `saving` state and button disable logic.
-   Improved error message extraction and user feedback.
-   Frontend validation for required fields.
-   `[ngValue]` binding used for proper null handling and numeric ID submission in select elements.
-   Hourly rate auto-calculation based on basic salary.
-   Document types drill-down for filtering and selection.
-   Terminology standardization (e.g., "Company" instead of "Branch").

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
-   **JPA Repositories**: 72 interfaces for data persistence.

### Development Tools
-   **Testing**: Vitest (Unit testing).
-   **Build**: Angular CLI (v21).
-   **Language**: TypeScript (v5.9).

### Deployment
-   **Single-server**: Spring Boot serves both Angular SPA and REST API.
-   **Production Port**: Configurable via `PORT` environment variable (defaults to 5000).