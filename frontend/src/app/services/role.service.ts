import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Role {
  id?: number;
  name: string;
  description?: string;
  permissions?: string;
  branchId?: number;
  isSystemRole?: boolean;
  totalUsers?: number;
}

export interface ModulePermission {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export interface RolePermissions {
  [module: string]: ModulePermission;
}

export interface SubModule {
  key: string;
  label: string;
}

export interface MainModule {
  key: string;
  label: string;
  icon: string;
  expanded?: boolean;
  subModules: SubModule[];
}

export const MODULE_HIERARCHY: MainModule[] = [
  { 
    key: 'Dashboard', 
    label: 'Dashboard', 
    icon: 'fas fa-home',
    subModules: []
  },
  { 
    key: 'Settings', 
    label: 'Settings', 
    icon: 'fas fa-cog',
    subModules: [
      { key: 'Settings.Companies', label: 'Companies' },
      { key: 'Settings.General', label: 'General Settings' },
      { key: 'Settings.Finance', label: 'Finance Settings' },
      { key: 'Settings.Customer', label: 'Client Settings' },
      { key: 'Settings.Contract', label: 'Contract Settings' },
      { key: 'Settings.Roles', label: 'Role Management' },
      { key: 'Settings.Staff', label: 'Staff Management' },
      { key: 'Settings.Prefixes', label: 'Prefix Settings' },
      { key: 'Settings.ExpenseTypes', label: 'Expense Types' },
      { key: 'Settings.Integrations', label: 'Integrations' }
    ]
  },
  {
    key: 'Projects',
    label: 'Project Management',
    icon: 'fas fa-project-diagram',
    subModules: [
      { key: 'Projects.List', label: 'Projects List' },
      { key: 'Projects.Tasks', label: 'Tasks' },
      { key: 'Projects.Timesheets', label: 'Timesheets' }
    ]
  },
  { 
    key: 'Customer Management', 
    label: 'Customer Management', 
    icon: 'fas fa-users',
    subModules: [
      { key: 'Customer.Clients', label: 'Clients' },
      { key: 'Customer.Contracts', label: 'Contract Management' }
    ]
  },
  { 
    key: 'Purchase', 
    label: 'Procurement', 
    icon: 'fas fa-shopping-cart',
    subModules: [
      { key: 'Purchase.Requisition', label: 'Purchase Requisition' },
      { key: 'Purchase.Direct', label: 'Direct Purchase' },
      { key: 'Purchase.Invoice', label: 'Purchase Invoice' },
      { key: 'Expenses', label: 'Expenses' }
    ]
  },
  {
    key: 'Accounting',
    label: 'Finance & Accounting',
    icon: 'fas fa-calculator',
    subModules: [
      { key: 'Accounting.Dashboard', label: 'Accounting Dashboard' },
      { key: 'Accounting.ChartOfAccounts', label: 'Chart of Accounts' },
      { key: 'Accounting.BankAccounts', label: 'Bank Accounts' },
      { key: 'Accounting.JournalEntries', label: 'Journal Entries' },
      { key: 'Accounting.Transactions', label: 'Transactions' },
      { key: 'Accounting.Transfers', label: 'Transfers' },
      { key: 'Accounting.Reconciliation', label: 'Reconciliation' },
      { key: 'Accounting.Bills', label: 'Bills' },
      { key: 'Accounting.Budgets', label: 'Budgets' },
      { key: 'Accounting.Reports', label: 'Financial Reports' },
      { key: 'Accounting.Settings', label: 'Accounting Settings' }
    ]
  },
  { 
    key: 'Inventory', 
    label: 'Inventory', 
    icon: 'fas fa-warehouse',
    subModules: [
      { key: 'Inventory.Groups', label: 'Item Groups' },
      { key: 'Inventory.Items', label: 'Item Master' },
      { key: 'Inventory.Units', label: 'Unit of Measure' },
      { key: 'Inventory.Warehouses', label: 'Warehouses/Bins' },
      { key: 'Inventory.Suppliers', label: 'Suppliers' },
      { key: 'Inventory.Valuation', label: 'Valuation' },
      { key: 'Inventory.Ledger', label: 'Inventory Ledger' },
      { key: 'Inventory.GoodsReceipt', label: 'Goods Receipt' },
      { key: 'Inventory.GoodsIssue', label: 'Goods Issue' },
      { key: 'Inventory.StockTransfer', label: 'Stock Transfer' },
      { key: 'Inventory.Adjustment', label: 'Stock Adjustment' }
    ]
  },
  { 
    key: 'HR Management', 
    label: 'HR Management', 
    icon: 'fas fa-user-tie',
    subModules: [
      { key: 'HR.Employees', label: 'Employee List' },
      { key: 'HR.Departments', label: 'Departments' },
      { key: 'HR.Locations', label: 'Locations' },
      { key: 'HR.JobRoles', label: 'Job Roles' },
      { key: 'HR.Grades', label: 'Grades' },
      { key: 'HR.Designations', label: 'Designations' },
      { key: 'HR.CostCenters', label: 'Cost Centers' },
      { key: 'HR.ExpenseCenters', label: 'Expense Centers' },
      { key: 'HR.Documents', label: 'Document Management' },
      { key: 'HR.Recruitment', label: 'Recruitment' },
      { key: 'HR.Training', label: 'Training & Development' },
      { key: 'HR.Onboarding', label: 'Onboarding' },
      { key: 'HR.Settlement', label: 'F&F Settlement' }
    ]
  },
  { 
    key: 'Leave', 
    label: 'Leave Management', 
    icon: 'fas fa-umbrella-beach',
    subModules: [
      { key: 'Leave.Types', label: 'Leave Types' },
      { key: 'Leave.Holidays', label: 'Holiday Calendar' },
      { key: 'Leave.Requests', label: 'Leave Requests' },
      { key: 'Leave.Balances', label: 'Leave Balances' }
    ]
  },
  {
    key: 'Loans',
    label: 'Loans & Advances',
    icon: 'fas fa-hand-holding-usd',
    subModules: [
      { key: 'Loans.Applications', label: 'Loan Applications' },
      { key: 'Loans.Ledger', label: 'Loan Ledger' },
      { key: 'Loans.Repayments', label: 'Repayment History' }
    ]
  },
  {
    key: 'Compensation',
    label: 'Compensation & Benefits',
    icon: 'fas fa-gift',
    subModules: [
      { key: 'Compensation.SalaryBands', label: 'Salary Bands' },
      { key: 'Compensation.Revisions', label: 'Salary Revisions' },
      { key: 'Compensation.Benefits', label: 'Benefits' }
    ]
  },
  { 
    key: 'Attendance', 
    label: 'Attendance', 
    icon: 'fas fa-clock',
    subModules: [
      { key: 'Attendance.TimeClock', label: 'Time Clock' },
      { key: 'Attendance.Timesheet', label: 'Timesheet' },
      { key: 'Attendance.Daily', label: 'Daily Attendance' },
      { key: 'Attendance.Approval', label: 'Attendance Approval' },
      { key: 'Attendance.Dashboard', label: 'Attendance Dashboard' }
    ]
  },
  { 
    key: 'Payroll', 
    label: 'Payroll', 
    icon: 'fas fa-money-check-alt',
    subModules: [
      { key: 'Payroll.Process', label: 'Process Payroll' },
      { key: 'Payroll.History', label: 'Payroll History' },
      { key: 'Payroll.PaySlips', label: 'Pay Slips' },
      { key: 'Payroll.Dashboard', label: 'Payroll Dashboard' },
      { key: 'Payroll.Rules', label: 'Payroll Rules' }
    ]
  },
  {
    key: 'ESS',
    label: 'Employee Self-Service',
    icon: 'fas fa-user-circle',
    subModules: [
      { key: 'ESS.Profile', label: 'My Profile' },
      { key: 'ESS.Attendance', label: 'My Attendance' },
      { key: 'ESS.Leave', label: 'My Leave' },
      { key: 'ESS.PaySlips', label: 'My Pay Slips' },
      { key: 'ESS.Expenses', label: 'My Expenses' },
      { key: 'ESS.Assets', label: 'My Assets' }
    ]
  },
  { 
    key: 'Reports', 
    label: 'Reports', 
    icon: 'fas fa-chart-bar',
    subModules: [
      { key: 'Reports.Inventory', label: 'Inventory Reports' },
      { key: 'Reports.Purchase', label: 'Purchase Reports' },
      { key: 'Reports.HR', label: 'HR Reports' },
      { key: 'Reports.Payroll', label: 'Payroll Reports' },
      { key: 'Reports.Finance', label: 'Finance Reports' }
    ]
  },
  { 
    key: 'AuditTrails', 
    label: 'Audit Trails', 
    icon: 'fas fa-history',
    subModules: [
      { key: 'Audit.System', label: 'System Audits' },
      { key: 'Audit.Inventory', label: 'Inventory Audits' },
      { key: 'Audit.Purchase', label: 'Purchase Audits' }
    ]
  }
];

export const AVAILABLE_MODULES = MODULE_HIERARCHY.map(m => ({
  key: m.key,
  label: m.label,
  icon: m.icon
}));

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = '/api/roles';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  getByBranch(branchId: number): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/branch/${branchId}`);
  }

  getById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  create(role: Role): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  update(id: number, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, role);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  parsePermissions(permissionsJson: string | undefined): RolePermissions {
    if (!permissionsJson) return {};
    try {
      return JSON.parse(permissionsJson);
    } catch {
      return {};
    }
  }

  stringifyPermissions(permissions: RolePermissions): string {
    return JSON.stringify(permissions);
  }

  getDefaultPermissions(): RolePermissions {
    const perms: RolePermissions = {};
    MODULE_HIERARCHY.forEach(m => {
      perms[m.key] = { view: false, add: false, edit: false, delete: false };
      m.subModules.forEach(sub => {
        perms[sub.key] = { view: false, add: false, edit: false, delete: false };
      });
    });
    return perms;
  }

  getFullPermissions(): RolePermissions {
    const perms: RolePermissions = {};
    MODULE_HIERARCHY.forEach(m => {
      perms[m.key] = { view: true, add: true, edit: true, delete: true };
      m.subModules.forEach(sub => {
        perms[sub.key] = { view: true, add: true, edit: true, delete: true };
      });
    });
    return perms;
  }

  getModuleHierarchy(): MainModule[] {
    return MODULE_HIERARCHY.map(m => ({ ...m, expanded: false }));
  }
}
