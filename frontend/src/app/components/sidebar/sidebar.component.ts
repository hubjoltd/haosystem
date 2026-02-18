import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, Branch } from '../../services/auth.service';
import { BranchService } from '../../services/branch.service';
import { TranslateService } from '@ngx-translate/core';

interface MenuItem {
  icon: string;
  label: string;
  labelKey?: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
  permissionKey?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() collapsed: boolean = false;
  @Input() mobileOpen: boolean = false;
  @Output() menuItemClicked = new EventEmitter<void>();

  currentBranch: Branch | null = null;

  allMenuItems: MenuItem[] = [
    { icon: 'fas fa-home', label: 'Dashboard', labelKey: 'nav.dashboard', route: '/app/dashboard', permissionKey: 'Dashboard' },
    { icon: 'fas fa-building', label: 'Companies', labelKey: 'nav.branchManagement', route: '/app/settings/branches', permissionKey: 'SuperAdminOnly' },
    {
      icon: 'fas fa-project-diagram',
      label: 'Project Management',
      labelKey: 'nav.projects',
      expanded: false,
      permissionKey: 'Projects',
      children: [
        { icon: 'fas fa-tasks', label: 'Projects', labelKey: 'nav.projects', route: '/app/projects' }
      ]
    },
    {
      icon: 'fas fa-cog',
      label: 'Settings',
      labelKey: 'nav.settings',
      expanded: false,
      permissionKey: 'Settings',
      children: [
        { icon: 'fas fa-sliders-h', label: 'General Settings', labelKey: 'nav.general', route: '/app/settings/general' },
        {
          icon: 'fas fa-dollar-sign',
          label: 'Finance Settings',
          labelKey: 'nav.finance',
          expanded: false,
          children: [
            { icon: 'fas fa-percent', label: 'Tax Rates', labelKey: 'nav.taxRates', route: '/app/settings/finance/tax-rates' },
            { icon: 'fas fa-coins', label: 'Currencies', labelKey: 'nav.currencies', route: '/app/settings/finance/currencies' },
            { icon: 'fas fa-credit-card', label: 'Payment Modes', labelKey: 'nav.paymentModes', route: '/app/settings/finance/payment-modes' },
            { icon: 'fas fa-receipt', label: 'Expense Categories', labelKey: 'nav.expenseCategories', route: '/app/settings/finance/expense-categories' }
          ]
        },
        { icon: 'fas fa-user-cog', label: 'Client Settings', labelKey: 'nav.customer', route: '/app/settings/customer' },
        { icon: 'fas fa-file-contract', label: 'Contract Settings', labelKey: 'nav.contract', route: '/app/settings/contract' },
        { icon: 'fas fa-user-shield', label: 'Roles Settings', labelKey: 'nav.roles', route: '/app/settings/roles' },
        { icon: 'fas fa-users-cog', label: 'Staff Management', labelKey: 'nav.staff', route: '/app/settings/staff' },
        { icon: 'fas fa-hashtag', label: 'Prefix Settings', labelKey: 'nav.prefixSettings', route: '/app/settings/prefixes' },
        { icon: 'fas fa-tags', label: 'Expense Types', labelKey: 'nav.expenseTypes', route: '/app/settings/expense-types' },
        { icon: 'fas fa-plug', label: 'Integrations', labelKey: 'nav.integrations', route: '/app/settings/integrations' }
      ]
    },
    {
      icon: 'fas fa-users',
      label: 'Customer Management',
      labelKey: 'nav.customerManagement',
      expanded: false,
      permissionKey: 'Customer Management',
      children: [
        { icon: 'fas fa-user-friends', label: 'Clients', labelKey: 'nav.clients', route: '/app/customers' },
        { icon: 'fas fa-file-signature', label: 'Contract Management', labelKey: 'nav.contractManagement', route: '/app/contracts' }
      ]
    },
    {
      icon: 'fas fa-shopping-cart',
      label: 'Procurement',
      labelKey: 'nav.procurement',
      expanded: false,
      permissionKey: 'Purchase',
      children: [
        {
          icon: 'fas fa-clipboard-list',
          label: 'Purchase Order Management',
          labelKey: 'nav.purchaseOrders',
          expanded: false,
          children: [
            { icon: 'fas fa-file-alt', label: 'Purchase Requisition', labelKey: 'nav.purchaseRequisition', route: '/app/purchase/requisition', permissionKey: 'Purchase - Requisition' },
            { icon: 'fas fa-file-invoice', label: 'Direct Purchase', labelKey: 'nav.directPurchase', route: '/app/purchase/direct', permissionKey: 'Purchase - Orders' },
            { icon: 'fas fa-file-invoice-dollar', label: 'Purchase Invoice', labelKey: 'nav.purchaseInvoice', route: '/app/purchase/invoices', permissionKey: 'Purchase - Invoices' }
          ]
        },
        {
          icon: 'fas fa-file-invoice-dollar',
          label: 'Reimbursement Management',
          labelKey: 'nav.reimbursements',
          expanded: false,
          permissionKey: 'Expenses',
          children: [
            { icon: 'fas fa-list', label: 'All Reimbursements', labelKey: 'nav.allReimbursements', route: '/app/expenses' },
            { icon: 'fas fa-plus-circle', label: 'New Reimbursement', labelKey: 'nav.newReimbursement', route: '/app/expenses/new' }
          ]
        }
      ]
    },
    {
      icon: 'fas fa-calculator',
      label: 'Finance & Accounting',
      labelKey: 'nav.accounting',
      expanded: false,
      permissionKey: 'Accounting',
      children: [
        { icon: 'fas fa-chart-pie', label: 'Dashboard', labelKey: 'nav.accountingDashboard', route: '/app/accounting/dashboard' },
        { icon: 'fas fa-book', label: 'Chart of Accounts', labelKey: 'nav.chartOfAccounts', route: '/app/accounting/chart-of-accounts' },
        { icon: 'fas fa-university', label: 'Bank Accounts', labelKey: 'nav.bankAccounts', route: '/app/accounting/bank-accounts' },
        { icon: 'fas fa-pen', label: 'Journal Entries', labelKey: 'nav.journalEntries', route: '/app/accounting/journal-entries' },
        {
          icon: 'fas fa-exchange-alt',
          label: 'Banking',
          labelKey: 'nav.banking',
          expanded: false,
          children: [
            { icon: 'fas fa-list', label: 'Transactions', labelKey: 'nav.transactions', route: '/app/accounting/transactions' },
            { icon: 'fas fa-random', label: 'Transfers', labelKey: 'nav.transfers', route: '/app/accounting/transfers' },
            { icon: 'fas fa-check-double', label: 'Reconciliation', labelKey: 'nav.reconciliation', route: '/app/accounting/reconciliation' }
          ]
        },
        { icon: 'fas fa-file-invoice-dollar', label: 'Bills', labelKey: 'nav.bills', route: '/app/accounting/bills' },
        { icon: 'fas fa-balance-scale', label: 'Budgets', labelKey: 'nav.budgets', route: '/app/accounting/budgets' },
        { icon: 'fas fa-file-alt', label: 'Financial Reports', labelKey: 'nav.financialReports', route: '/app/accounting/reports' },
        { icon: 'fas fa-cog', label: 'Settings', labelKey: 'nav.accountingSettings', route: '/app/accounting/settings' }
      ]
    },
    {
      icon: 'fas fa-user-tie',
      label: 'HR Management',
      labelKey: 'nav.hr',
      expanded: false,
      permissionKey: 'HR Management',
      children: [
        {
          icon: 'fas fa-users',
          label: 'Employee Master',
          labelKey: 'nav.employees',
          expanded: false,
          children: [
            { icon: 'fas fa-id-card', label: 'Employee List', labelKey: 'nav.employeeList', route: '/app/hr/employees' }
          ]
        },
        {
          icon: 'fas fa-sitemap',
          label: 'Organization Structure',
          labelKey: 'nav.organization',
          expanded: false,
          children: [
            { icon: 'fas fa-building', label: 'Departments', labelKey: 'nav.departments', route: '/app/hr/organization/departments' },
            { icon: 'fas fa-map-marker-alt', label: 'Locations', labelKey: 'nav.locations', route: '/app/hr/organization/locations' },
            { icon: 'fas fa-briefcase', label: 'Job Roles', labelKey: 'nav.jobRoles', route: '/app/hr/organization/job-roles' },
            { icon: 'fas fa-layer-group', label: 'Grades', labelKey: 'nav.grades', route: '/app/hr/organization/grades' },
            { icon: 'fas fa-id-badge', label: 'Designations', labelKey: 'nav.designations', route: '/app/hr/organization/designations' },
            { icon: 'fas fa-chart-pie', label: 'Cost Centers', labelKey: 'nav.costCenters', route: '/app/hr/organization/cost-centers' },
            { icon: 'fas fa-money-bill-wave', label: 'Expense Centers', labelKey: 'nav.expenseCenters', route: '/app/hr/organization/expense-centers' }
          ]
        },
        {
          icon: 'fas fa-folder-open',
          label: 'Document Management',
          labelKey: 'nav.documents',
          expanded: false,
          children: [
            { icon: 'fas fa-file-alt', label: 'Document Types', labelKey: 'nav.documentTypes', route: '/app/hr/documents/types' },
            { icon: 'fas fa-bell', label: 'Expiry Reminders', labelKey: 'nav.documentExpiry', route: '/app/hr/documents/reminders' }
          ]
        },
        {
          icon: 'fas fa-handshake',
          label: 'Recruitment',
          labelKey: 'nav.recruitment',
          expanded: false,
          children: [
            { icon: 'fas fa-file-alt', label: 'Manpower Requisition', labelKey: 'nav.requisitions', route: '/app/hr/recruitment/requisition' },
            { icon: 'fas fa-briefcase', label: 'Job Postings', labelKey: 'nav.jobPostings', route: '/app/hr/recruitment/postings' },
            { icon: 'fas fa-address-book', label: 'Candidate Database', labelKey: 'nav.candidates', route: '/app/hr/recruitment/candidates' },
            { icon: 'fas fa-calendar-check', label: 'Interviews', labelKey: 'nav.interviews', route: '/app/hr/recruitment/interviews' },
            { icon: 'fas fa-file-contract', label: 'Offer Letters', labelKey: 'nav.offers', route: '/app/hr/recruitment/offers' }
          ]
        },
        { icon: 'fas fa-graduation-cap', label: 'Training & Development', labelKey: 'nav.trainingDevelopment', route: '/app/hr/training' },
        { icon: 'fas fa-sign-in-alt', label: 'Onboarding', labelKey: 'nav.onboarding', route: '/app/hr/onboarding' },
        { icon: 'fas fa-file-invoice', label: 'F&F Settlement', labelKey: 'nav.ffSettlement', route: '/app/hr/settlement' },
        {
          icon: 'fas fa-umbrella-beach',
          label: 'Leave Management',
          labelKey: 'nav.leave',
          expanded: false,
          permissionKey: 'Leave Management',
          children: [
            { icon: 'fas fa-list-alt', label: 'Leave Types', labelKey: 'nav.leaveTypes', route: '/app/leave/types' },
            { icon: 'fas fa-calendar-check', label: 'Leave Requests', labelKey: 'nav.leaveRequests', route: '/app/leave/requests' },
            { icon: 'fas fa-calendar', label: 'Holiday Calendar', labelKey: 'nav.holidayCalendar', route: '/app/leave/holidays' }
          ]
        },
        {
          icon: 'fas fa-dollar-sign',
          label: 'Loans & Advances',
          labelKey: 'nav.loans',
          route: '/app/hr/loans',
          permissionKey: 'Loans'
        },
        {
          icon: 'fas fa-briefcase',
          label: 'Compensation & Benefits',
          labelKey: 'nav.compensation',
          expanded: false,
          permissionKey: 'Compensation',
          children: [
            {
              icon: 'fas fa-layer-group',
              label: 'Salary Management',
              labelKey: 'nav.salaryManagement',
              expanded: false,
              children: [
                { icon: 'fas fa-bars', label: 'Salary Bands', labelKey: 'nav.salaryBands', route: '/app/compensation/salary-bands' },
                { icon: 'fas fa-exchange-alt', label: 'Salary Revision', labelKey: 'nav.salaryRevisions', route: '/app/compensation/salary-revision' },
                { icon: 'fas fa-gift', label: 'Bonus & Incentive', labelKey: 'nav.bonuses', route: '/app/compensation/bonus-incentive' }
              ]
            },
            {
              icon: 'fas fa-heart',
              label: 'Benefits Administration',
              labelKey: 'nav.benefits',
              expanded: false,
              children: [
                { icon: 'fas fa-hospital', label: 'Health Insurance', labelKey: 'nav.healthInsurance', route: '/app/compensation/health-insurance' },
                { icon: 'fas fa-tooth', label: 'Dental & Vision', labelKey: 'nav.dentalVision', route: '/app/compensation/dental-vision' },
                { icon: 'fas fa-utensils', label: 'Allowances', labelKey: 'nav.allowances', route: '/app/compensation/allowances' },
                { icon: 'fas fa-scroll', label: 'Benefits Enrollment', labelKey: 'nav.benefitsEnrollment', route: '/app/compensation/enrollment' }
              ]
            }
          ]
        },
        {
          icon: 'fas fa-chart-pie',
          label: 'MIS & Dashboards',
          labelKey: 'nav.misDashboards',
          expanded: false,
          permissionKey: 'MIS Dashboards',
          children: [
            { icon: 'fas fa-users', label: 'HR Dashboard', labelKey: 'nav.hrDashboard', route: '/app/mis/hr-dashboard' },
            { icon: 'fas fa-chart-line', label: 'Performance Dashboard', labelKey: 'nav.performanceDashboard', route: '/app/mis/performance-dashboard' },
            { icon: 'fas fa-file-alt', label: 'Custom Report Builder', labelKey: 'nav.customReports', route: '/app/mis/report-builder' }
          ]
        }
      ]
    },
    {
      icon: 'fas fa-user-clock',
      label: 'Attendance',
      labelKey: 'nav.attendance',
      expanded: false,
      permissionKey: 'Attendance',
      children: [
        { icon: 'fas fa-clock', label: 'Clock In / Clock Out', labelKey: 'nav.clockInOut', route: '/app/attendance/clock-in-out' },
        { icon: 'fas fa-calendar-day', label: 'Daily Attendance', labelKey: 'nav.dailyAttendance', route: '/app/attendance/management' },
        { icon: 'fas fa-calendar-week', label: 'Weekly Timesheet', labelKey: 'nav.weeklyTimesheet', route: '/app/attendance/weekly-timesheet' }
      ]
    },
    {
      icon: 'fas fa-money-check-alt',
      label: 'Payroll',
      labelKey: 'nav.payroll',
      expanded: false,
      permissionKey: 'Payroll',
      children: [
        { icon: 'fas fa-cog', label: 'Process Payroll', labelKey: 'nav.processPayroll', route: '/app/payroll/process' },
        { icon: 'fas fa-history', label: 'Payroll History', labelKey: 'nav.payrollHistory', route: '/app/payroll/history' },
        { icon: 'fas fa-chart-pie', label: 'Payroll Dashboard', labelKey: 'nav.payrollDashboard', route: '/app/mis/payroll-dashboard' }
      ]
    },
    {
      icon: 'fas fa-user-circle',
      label: 'Employee Service Portal',
      labelKey: 'nav.employeeServicePortal',
      expanded: false,
      permissionKey: 'ESS',
      children: [
        { icon: 'fas fa-file-invoice-dollar', label: 'Pay Slips', labelKey: 'nav.paySlips', route: '/app/payroll/self-service' },
        { icon: 'fas fa-clock', label: 'My Attendance', labelKey: 'nav.myAttendance', route: '/app/ess/attendance' },
        { icon: 'fas fa-umbrella-beach', label: 'My Leave', labelKey: 'nav.myLeave', route: '/app/ess/leave' },
        { icon: 'fas fa-receipt', label: 'My Reimbursements', labelKey: 'nav.myReimbursements', route: '/app/ess/reimbursements' },
        { icon: 'fas fa-laptop', label: 'My Assets', labelKey: 'nav.myAssets', route: '/app/ess/assets' },
        { icon: 'fas fa-file-alt', label: 'HR Policies', labelKey: 'nav.hrPolicies', route: '/app/ess/policies' }
      ]
    },
    {
      icon: 'fas fa-boxes',
      label: 'Inventory Management',
      labelKey: 'nav.inventory',
      expanded: false,
      permissionKey: 'Inventory',
      children: [
        { icon: 'fas fa-layer-group', label: 'Group Master', labelKey: 'nav.groupMaster', route: '/app/inventory/groups', permissionKey: 'Inventory - Group Master' },
        { icon: 'fas fa-box', label: 'Item Master', labelKey: 'nav.itemMaster', route: '/app/inventory/items', permissionKey: 'Inventory - Item Master' },
        { icon: 'fas fa-balance-scale', label: 'Units of Measure', labelKey: 'nav.units', route: '/app/inventory/units', permissionKey: 'Inventory - Units of Measure' },
        {
          icon: 'fas fa-warehouse',
          label: 'Warehouse & Bin',
          labelKey: 'nav.warehouseBin',
          expanded: false,
          permissionKey: 'Inventory - Warehouse & Bin',
          children: [
            { icon: 'fas fa-warehouse', label: 'Warehouse Management', labelKey: 'nav.warehouseManagement', route: '/app/inventory/warehouse' },
            { icon: 'fas fa-truck', label: 'Supplier', labelKey: 'nav.suppliers', route: '/app/inventory/suppliers' }
          ]
        },
        { icon: 'fas fa-calculator', label: 'Inventory Valuation Engine', labelKey: 'nav.valuation', route: '/app/inventory/valuation', permissionKey: 'Inventory - Valuation' },
        {
          icon: 'fas fa-exchange-alt',
          label: 'Stock Movement',
          labelKey: 'nav.stockMovement',
          expanded: false,
          children: [
            { icon: 'fas fa-arrow-down', label: 'Goods Receipt (GRN)', labelKey: 'nav.goodsReceipt', route: '/app/stock/grn', permissionKey: 'Stock Movement - Goods Receipt (GRN)' },
            { icon: 'fas fa-arrow-up', label: 'Goods Issue', labelKey: 'nav.goodsIssue', route: '/app/stock/issue', permissionKey: 'Stock Movement - Goods Issue' },
            { icon: 'fas fa-arrows-alt-h', label: 'Stock Transfer', labelKey: 'nav.stockTransfer', route: '/app/stock/transfer', permissionKey: 'Stock Movement - Stock Transfer' },
            { icon: 'fas fa-edit', label: 'Stock Adjustments', labelKey: 'nav.adjustments', route: '/app/stock/adjustments', permissionKey: 'Stock Movement - Stock Adjustments' }
          ]
        },
        { icon: 'fas fa-book', label: 'Inventory Ledger', labelKey: 'nav.ledger', route: '/app/inventory/ledger', permissionKey: 'Inventory - Ledger' }
      ]
    },
    {
      icon: 'fas fa-chart-bar',
      label: 'Reports',
      labelKey: 'nav.reports',
      expanded: false,
      permissionKey: 'Reports',
      children: [
        {
          icon: 'fas fa-boxes',
          label: 'Inventory Reports',
          labelKey: 'nav.stockReports',
          expanded: false,
          permissionKey: 'Reports - Inventory',
          children: [
            { icon: 'fas fa-clipboard-list', label: 'Stock Summary Report', labelKey: 'nav.stockSummary', route: '/app/reports/stock-summary' },
            { icon: 'fas fa-coins', label: 'Inventory Valuation Report', labelKey: 'nav.inventoryValuation', route: '/app/reports/valuation' },
            { icon: 'fas fa-chart-line', label: 'Item Movement Report', labelKey: 'nav.itemMovement', route: '/app/reports/item-movement' },
            { icon: 'fas fa-book-open', label: 'Stock Ledger Report', labelKey: 'nav.stockLedger', route: '/app/reports/stock-ledger' },
            { icon: 'fas fa-sitemap', label: 'Group-wise Stock Report', labelKey: 'nav.groupWiseStock', route: '/app/reports/group-wise' },
            { icon: 'fas fa-warehouse', label: 'Warehouse Stock Report', labelKey: 'nav.warehouseStock', route: '/app/reports/warehouse-stock' },
            { icon: 'fas fa-exclamation-triangle', label: 'Reorder Level', labelKey: 'nav.reorderLevel', route: '/app/reports/reorder-level' },
            { icon: 'fas fa-hourglass-half', label: 'Slow/Non-Moving Items Report', labelKey: 'nav.slowMovingItems', route: '/app/reports/slow-moving' },
            { icon: 'fas fa-file-invoice', label: 'Purchase vs GRN Report', labelKey: 'nav.purchaseVsGrn', route: '/app/reports/purchase-grn' }
          ]
        },
        {
          icon: 'fas fa-shopping-cart',
          label: 'Purchase Reports',
          labelKey: 'nav.purchaseReports',
          expanded: false,
          permissionKey: 'Reports - Purchase',
          children: [
            { icon: 'fas fa-list-alt', label: 'PR List Report', labelKey: 'nav.prList', route: '/app/reports/purchase/pr-list' },
            { icon: 'fas fa-clock', label: 'PR Item Pending Report', labelKey: 'nav.prPending', route: '/app/reports/purchase/pr-pending' },
            { icon: 'fas fa-history', label: 'PR Fulfillment History Report', labelKey: 'nav.prHistory', route: '/app/reports/purchase/pr-history' },
            { icon: 'fas fa-file-alt', label: 'PO List', labelKey: 'nav.poList', route: '/app/reports/purchase/po-list' },
            { icon: 'fas fa-cart-arrow-down', label: 'Direct Purchase Report', labelKey: 'nav.directPurchaseReport', route: '/app/reports/purchase/direct-purchase' },
            { icon: 'fas fa-exchange-alt', label: 'Stock Issue/Transfer Report', labelKey: 'nav.stockIssueTransfer', route: '/app/reports/purchase/stock-issue-transfer' }
          ]
        },
        {
          icon: 'fas fa-money-check-alt',
          label: 'Payroll Reports',
          labelKey: 'nav.payrollReports',
          expanded: false,
          permissionKey: 'Reports - Payroll',
          children: [
            { icon: 'fas fa-file-invoice-dollar', label: 'Pay Slips', labelKey: 'nav.paySlips', route: '/app/payroll/self-service' },
            { icon: 'fas fa-chart-pie', label: 'Payroll Summary', labelKey: 'nav.payrollSummary', route: '/app/reports/payroll/summary' },
            { icon: 'fas fa-clipboard-list', label: 'Payroll Register', labelKey: 'nav.payrollRegister', route: '/app/reports/payroll/register' },
            { icon: 'fas fa-landmark', label: 'Tax Liability', labelKey: 'nav.taxLiability', route: '/app/reports/payroll/tax-liability' },
            { icon: 'fas fa-file-invoice-dollar', label: 'Deductions', labelKey: 'nav.deductions', route: '/app/reports/payroll/deductions' },
            { icon: 'fas fa-calendar-alt', label: 'YTD Earnings', labelKey: 'nav.ytdEarnings', route: '/app/reports/payroll/ytd-earnings' },
            { icon: 'fas fa-clock', label: 'Overtime', labelKey: 'nav.overtime', route: '/app/reports/payroll/overtime' },
            { icon: 'fas fa-chart-area', label: 'Labor Cost Allocation', labelKey: 'nav.laborCostAllocation', route: '/app/reports/payroll/labor-cost' }
          ]
        }
      ]
    },
    {
      icon: 'fas fa-history',
      label: 'Audit Trails & Logging',
      labelKey: 'nav.auditTrails',
      expanded: false,
      permissionKey: 'Audit Trails',
      children: [
        { icon: 'fas fa-server', label: 'System Audits', labelKey: 'nav.systemAudits', route: '/app/audit/system' },
        { icon: 'fas fa-boxes', label: 'Inventory Audits', labelKey: 'nav.inventoryAudits', route: '/app/audit/inventory' },
        { icon: 'fas fa-shopping-cart', label: 'Purchase Audits', labelKey: 'nav.purchaseAudits', route: '/app/audit/purchase' }
      ]
    }
  ];

  menuItems: MenuItem[] = [];

  constructor(
    private router: Router, 
    private authService: AuthService,
    private branchService: BranchService
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    this.filterMenuByPermissions();
    this.loadCurrentBranch();
    this.authService.currentUser$.subscribe(() => {
      this.filterMenuByPermissions();
      this.loadCurrentBranch();
    });
  }

  loadCurrentBranch(): void {
    const user = this.authService.getCurrentUser();
    if (user?.branchId) {
      this.branchService.getMyBranch().subscribe({
        next: (branch) => {
          this.currentBranch = branch;
        },
        error: () => {
          this.currentBranch = null;
        }
      });
    } else {
      this.currentBranch = null;
    }
  }

  filterMenuByPermissions(): void {
    if (this.authService.isSuperAdmin()) {
      this.menuItems = JSON.parse(JSON.stringify(this.allMenuItems));
    } else if (this.authService.hasRole('STAFF')) {
      this.menuItems = JSON.parse(JSON.stringify(this.allMenuItems)).filter(
        (item: MenuItem) => item.permissionKey === 'ESS'
      );
      if (this.menuItems.length > 0) {
        this.menuItems[0].expanded = true;
      }
    } else {
      this.menuItems = this.filterItems(JSON.parse(JSON.stringify(this.allMenuItems)));
    }
  }

  private filterItems(items: MenuItem[]): MenuItem[] {
    return items.filter(item => {
      if (item.permissionKey === 'SuperAdminOnly') {
        return false; // Only super admin can see this
      }
      if (!item.permissionKey || this.authService.hasFeatureAccess(item.permissionKey)) {
        if (item.children) {
          item.children = this.filterItems(item.children);
          // Remove parent if no children after filtering
          if (item.children.length === 0 && !item.route) {
            return false;
          }
        }
        return true;
      }
      return false;
    });
  }

  toggleMenu(item: MenuItem, parentItems?: MenuItem[]): void {
    if (item.route) {
      this.router.navigate([item.route]);
      this.menuItemClicked.emit();
      if (parentItems) {
        parentItems.forEach(i => {
          if (i !== item && !i.children?.includes(item)) {
            i.expanded = false;
          }
        });
      }
    } else if (item.children) {
      item.expanded = !item.expanded;
    }
  }

  isActive(route?: string): boolean {
    if (!route) return false;
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  hasActiveChild(item: MenuItem): boolean {
    if (!item.children) return false;
    return item.children.some(child => 
      this.isActive(child.route) || this.hasActiveChild(child)
    );
  }
}
