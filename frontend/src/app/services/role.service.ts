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
      { key: 'Settings.General', label: 'General Settings' },
      { key: 'Settings.Companies', label: 'Multi-Company' },
      { key: 'Settings.Roles', label: 'Role Management' },
      { key: 'Settings.Staff', label: 'Staff Management' },
      { key: 'Settings.Integrations', label: 'Integrations' }
    ]
  },
  { 
    key: 'Customer Management', 
    label: 'Customer Management', 
    icon: 'fas fa-users',
    subModules: [
      { key: 'Customer.List', label: 'Customer List' },
      { key: 'Customer.Contracts', label: 'Contracts' }
    ]
  },
  { 
    key: 'Purchase', 
    label: 'Procurement', 
    icon: 'fas fa-shopping-cart',
    subModules: [
      { key: 'Purchase.Requisition', label: 'Purchase Requisition' },
      { key: 'Purchase.Fulfillment', label: 'PR Fulfillment' },
      { key: 'Purchase.Direct', label: 'Direct Purchase' },
      { key: 'Purchase.Invoice', label: 'Purchase Invoice' }
    ]
  },
  { 
    key: 'Inventory', 
    label: 'Inventory', 
    icon: 'fas fa-boxes',
    subModules: [
      { key: 'Inventory.Groups', label: 'Group Master' },
      { key: 'Inventory.Items', label: 'Item Master' },
      { key: 'Inventory.Units', label: 'Units of Measure' },
      { key: 'Inventory.Warehouse', label: 'Warehouse & Bin' },
      { key: 'Inventory.Suppliers', label: 'Suppliers' },
      { key: 'Inventory.Valuation', label: 'Valuation' },
      { key: 'Inventory.Ledger', label: 'Inventory Ledger' },
      { key: 'Inventory.GoodsReceipt', label: 'Goods Receipt' },
      { key: 'Inventory.GoodsIssue', label: 'Goods Issue' },
      { key: 'Inventory.Transfer', label: 'Stock Transfer' },
      { key: 'Inventory.Adjustment', label: 'Stock Adjustment' }
    ]
  },
  { 
    key: 'HR Management', 
    label: 'HR Management', 
    icon: 'fas fa-user-tie',
    subModules: [
      { key: 'HR.Organization', label: 'Organization Structure' },
      { key: 'HR.Employees', label: 'Employee Master' },
      { key: 'HR.Documents', label: 'Document Management' },
      { key: 'HR.Recruitment', label: 'Recruitment' },
      { key: 'HR.Training', label: 'Training & Development' },
      { key: 'HR.Onboarding', label: 'Onboarding' }
    ]
  },
  { 
    key: 'Payroll', 
    label: 'Payroll', 
    icon: 'fas fa-money-check-alt',
    subModules: [
      { key: 'Payroll.Dashboard', label: 'Payroll Dashboard' },
      { key: 'Payroll.Process', label: 'Process Payroll' },
      { key: 'Payroll.History', label: 'Payroll History' },
      { key: 'Payroll.PaySlips', label: 'Pay Slips' },
      { key: 'Payroll.Rules', label: 'Payroll Rules' }
    ]
  },
  { 
    key: 'Attendance', 
    label: 'Attendance', 
    icon: 'fas fa-clock',
    subModules: [
      { key: 'Attendance.Dashboard', label: 'Attendance Dashboard' },
      { key: 'Attendance.TimeClock', label: 'Time Clock' },
      { key: 'Attendance.Timesheet', label: 'Weekly Timesheet' },
      { key: 'Attendance.Daily', label: 'Daily Attendance' },
      { key: 'Attendance.Approval', label: 'Attendance Approval' }
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
      { key: 'Accounting.Transactions', label: 'Bank Transactions' },
      { key: 'Accounting.Transfers', label: 'Account Transfers' },
      { key: 'Accounting.Bills', label: 'Bills' },
      { key: 'Accounting.Budget', label: 'Budget' },
      { key: 'Accounting.Reconciliation', label: 'Bank Reconciliation' },
      { key: 'Accounting.Reports', label: 'Financial Reports' }
    ]
  },
  { 
    key: 'Projects', 
    label: 'Project Management', 
    icon: 'fas fa-project-diagram',
    subModules: [
      { key: 'Projects.List', label: 'Project List' },
      { key: 'Projects.Tasks', label: 'Tasks' },
      { key: 'Projects.Milestones', label: 'Milestones' },
      { key: 'Projects.Timesheets', label: 'Project Timesheets' }
    ]
  },
  { 
    key: 'Expenses', 
    label: 'Expenses & Reimbursement', 
    icon: 'fas fa-file-invoice-dollar',
    subModules: [
      { key: 'Expenses.Categories', label: 'Expense Categories' },
      { key: 'Expenses.Requests', label: 'Expense Requests' },
      { key: 'Expenses.Approval', label: 'Expense Approval' }
    ]
  },
  { 
    key: 'Leave', 
    label: 'Leave Management', 
    icon: 'fas fa-calendar-alt',
    subModules: [
      { key: 'Leave.Types', label: 'Leave Types' },
      { key: 'Leave.Holidays', label: 'Holiday Calendar' },
      { key: 'Leave.Requests', label: 'Leave Requests' },
      { key: 'Leave.Approval', label: 'Leave Approval' }
    ]
  },
  { 
    key: 'Loans', 
    label: 'Loans & Advances', 
    icon: 'fas fa-hand-holding-usd',
    subModules: [
      { key: 'Loans.Applications', label: 'Loan Applications' },
      { key: 'Loans.Approval', label: 'Loan Approval' },
      { key: 'Loans.Ledger', label: 'Loan Ledger' },
      { key: 'Loans.Repayment', label: 'Repayment History' }
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
