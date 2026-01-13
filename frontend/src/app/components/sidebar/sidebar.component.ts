import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
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

  allMenuItems: MenuItem[] = [
    { icon: 'fas fa-home', label: 'Dashboard', labelKey: 'nav.dashboard', route: '/app/dashboard', permissionKey: 'Dashboard' },
    { icon: 'fas fa-building', label: 'Companies', labelKey: 'nav.branchManagement', route: '/app/settings/branches', permissionKey: 'Settings' },
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
          label: 'Expense Management',
          labelKey: 'nav.expenses',
          expanded: false,
          permissionKey: 'Expenses',
          children: [
            { icon: 'fas fa-list', label: 'All Expenses', labelKey: 'nav.allExpenses', route: '/app/expenses' },
            { icon: 'fas fa-plus-circle', label: 'New Expense', labelKey: 'nav.newExpense', route: '/app/expenses/new' }
          ]
        }
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
        { icon: 'fas fa-clock', label: 'Time Clock', labelKey: 'nav.timeClock', route: '/app/attendance/clock-in-out' },
        { icon: 'fas fa-calendar-week', label: 'Weekly Timesheet', labelKey: 'nav.weeklyTimesheet', route: '/app/attendance/weekly-timesheet' },
        { icon: 'fas fa-calendar-day', label: 'Daily Attendance', labelKey: 'nav.dailyAttendance', route: '/app/attendance/management' },
        { icon: 'fas fa-check-circle', label: 'Attendance Approval', labelKey: 'nav.attendanceApproval', route: '/app/attendance/approval' },
        { icon: 'fas fa-chart-bar', label: 'Attendance Dashboard', labelKey: 'nav.attendanceDashboard', route: '/app/mis/attendance-dashboard' }
      ]
    },
    {
      icon: 'fas fa-money-check-alt',
      label: 'Payroll',
      labelKey: 'nav.payroll',
      expanded: false,
      permissionKey: 'Payroll',
      children: [
        { icon: 'fas fa-cog', label: 'Process Payroll', labelKey: 'nav.processPayroll', route: '/app/payroll/timesheets' },
        { icon: 'fas fa-history', label: 'Payroll History', labelKey: 'nav.payrollHistory', route: '/app/payroll/history' },
        { icon: 'fas fa-file-invoice-dollar', label: 'Pay Slips (ESS)', labelKey: 'nav.paySlips', route: '/app/payroll/self-service' },
        { icon: 'fas fa-chart-pie', label: 'Payroll Dashboard', labelKey: 'nav.payrollDashboard', route: '/app/mis/payroll-dashboard' }
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
            { icon: 'fas fa-chart-area', label: 'Labor Cost Allocation', labelKey: 'nav.laborCostAllocation', route: '/app/reports/payroll/labor-cost' },
            { icon: 'fas fa-clipboard-list', label: 'Payroll Register', labelKey: 'nav.payrollRegister', route: '/app/reports/payroll/register' }
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

  constructor(private router: Router, private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    this.filterMenuByPermissions();
    this.authService.currentUser$.subscribe(() => {
      this.filterMenuByPermissions();
    });
  }

  filterMenuByPermissions(): void {
    if (this.authService.isAdmin()) {
      this.menuItems = this.allMenuItems;
    } else {
      this.menuItems = this.filterItems(this.allMenuItems);
    }
  }

  private filterItems(items: MenuItem[]): MenuItem[] {
    return items.filter(item => {
      if (!item.permissionKey || this.authService.hasFeatureAccess(item.permissionKey)) {
        if (item.children) {
          item.children = this.filterItems(item.children);
        }
        return true;
      }
      return false;
    });
  }

  toggleMenu(item: MenuItem, parentItems?: MenuItem[]): void {
    if (item.route) {
      this.router.navigate([item.route]);
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
