import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface MenuItem {
  icon: string;
  label: string;
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
    { icon: 'fas fa-home', label: 'Dashboard', route: '/app/dashboard', permissionKey: 'Dashboard' },
    {
      icon: 'fas fa-cog',
      label: 'Settings',
      expanded: false,
      permissionKey: 'Settings',
      children: [
        { icon: 'fas fa-sliders-h', label: 'General Settings', route: '/app/settings/general' },
        {
          icon: 'fas fa-dollar-sign',
          label: 'Finance Settings',
          expanded: false,
          children: [
            { icon: 'fas fa-percent', label: 'Tax Rates', route: '/app/settings/finance/tax-rates' },
            { icon: 'fas fa-coins', label: 'Currencies', route: '/app/settings/finance/currencies' },
            { icon: 'fas fa-credit-card', label: 'Payment Modes', route: '/app/settings/finance/payment-modes' },
            { icon: 'fas fa-receipt', label: 'Expense Categories', route: '/app/settings/finance/expense-categories' }
          ]
        },
        { icon: 'fas fa-user-cog', label: 'Customer Settings', route: '/app/settings/customer' },
        { icon: 'fas fa-file-contract', label: 'Contract Settings', route: '/app/settings/contract' },
        { icon: 'fas fa-user-shield', label: 'Roles Settings', route: '/app/settings/roles' },
        { icon: 'fas fa-users-cog', label: 'Staff Management', route: '/app/settings/staff' },
        { icon: 'fas fa-hashtag', label: 'Prefix Settings', route: '/app/settings/prefixes' }
      ]
    },
    { icon: 'fas fa-users', label: 'Customer Management', route: '/app/customers', permissionKey: 'Customer Management' },
    { icon: 'fas fa-file-signature', label: 'Contract Management', route: '/app/contracts', permissionKey: 'Contract Management' },
    {
      icon: 'fas fa-boxes',
      label: 'Inventory Management',
      expanded: false,
      permissionKey: 'Inventory',
      children: [
        { icon: 'fas fa-layer-group', label: 'Group Master', route: '/app/inventory/groups', permissionKey: 'Inventory - Group Master' },
        { icon: 'fas fa-box', label: 'Item Master', route: '/app/inventory/items', permissionKey: 'Inventory - Item Master' },
        { icon: 'fas fa-balance-scale', label: 'Units of Measure', route: '/app/inventory/units', permissionKey: 'Inventory - Units of Measure' },
        {
          icon: 'fas fa-warehouse',
          label: 'Warehouse & Bin',
          expanded: false,
          permissionKey: 'Inventory - Warehouse & Bin',
          children: [
            { icon: 'fas fa-warehouse', label: 'Warehouse Management', route: '/app/inventory/warehouse' },
            { icon: 'fas fa-truck', label: 'Supplier', route: '/app/inventory/suppliers' }
          ]
        },
        { icon: 'fas fa-calculator', label: 'Inventory Valuation Engine', route: '/app/inventory/valuation', permissionKey: 'Inventory - Valuation' },
        {
          icon: 'fas fa-exchange-alt',
          label: 'Stock Movement',
          expanded: false,
          children: [
            { icon: 'fas fa-arrow-down', label: 'Goods Receipt (GRN)', route: '/app/stock/grn', permissionKey: 'Stock Movement - Goods Receipt (GRN)' },
            { icon: 'fas fa-arrow-up', label: 'Goods Issue', route: '/app/stock/issue', permissionKey: 'Stock Movement - Goods Issue' },
            { icon: 'fas fa-arrows-alt-h', label: 'Stock Transfer', route: '/app/stock/transfer', permissionKey: 'Stock Movement - Stock Transfer' },
            { icon: 'fas fa-edit', label: 'Stock Adjustments', route: '/app/stock/adjustments', permissionKey: 'Stock Movement - Stock Adjustments' }
          ]
        },
        { icon: 'fas fa-book', label: 'Inventory Ledger', route: '/app/inventory/ledger', permissionKey: 'Inventory - Ledger' }
      ]
    },
    {
      icon: 'fas fa-shopping-cart',
      label: 'Purchase Order Management',
      expanded: false,
      permissionKey: 'Purchase',
      children: [
        { icon: 'fas fa-file-alt', label: 'Purchase Requisition', route: '/app/purchase/requisition', permissionKey: 'Purchase - Requisition' },
        { icon: 'fas fa-file-invoice', label: 'Purchase Order', route: '/app/purchase/orders', permissionKey: 'Purchase - Orders' },
        { icon: 'fas fa-file-invoice-dollar', label: 'Purchase Invoice', route: '/app/purchase/invoices', permissionKey: 'Purchase - Invoices' }
      ]
    },
    {
      icon: 'fas fa-chart-bar',
      label: 'Reports',
      expanded: false,
      permissionKey: 'Reports',
      children: [
        {
          icon: 'fas fa-boxes',
          label: 'Inventory Reports',
          expanded: false,
          permissionKey: 'Reports - Inventory',
          children: [
            { icon: 'fas fa-clipboard-list', label: 'Stock Summary Report', route: '/app/reports/stock-summary' },
            { icon: 'fas fa-coins', label: 'Inventory Valuation Report', route: '/app/reports/valuation' },
            { icon: 'fas fa-chart-line', label: 'Item Movement Report', route: '/app/reports/item-movement' },
            { icon: 'fas fa-book-open', label: 'Stock Ledger Report', route: '/app/reports/stock-ledger' },
            { icon: 'fas fa-sitemap', label: 'Group-wise Stock Report', route: '/app/reports/group-wise' },
            { icon: 'fas fa-warehouse', label: 'Warehouse Stock Report', route: '/app/reports/warehouse-stock' },
            { icon: 'fas fa-exclamation-triangle', label: 'Reorder Level', route: '/app/reports/reorder-level' },
            { icon: 'fas fa-hourglass-half', label: 'Slow/Non-Moving Items Report', route: '/app/reports/slow-moving' },
            { icon: 'fas fa-file-invoice', label: 'Purchase vs GRN Report', route: '/app/reports/purchase-grn' }
          ]
        },
        {
          icon: 'fas fa-shopping-cart',
          label: 'Purchase Reports',
          expanded: false,
          permissionKey: 'Reports - Purchase',
          children: [
            { icon: 'fas fa-list-alt', label: 'PR List Report', route: '/app/reports/purchase/pr-list' },
            { icon: 'fas fa-clock', label: 'PR Item Pending Report', route: '/app/reports/purchase/pr-pending' },
            { icon: 'fas fa-history', label: 'PR Fulfillment History Report', route: '/app/reports/purchase/pr-history' },
            { icon: 'fas fa-file-alt', label: 'PO List', route: '/app/reports/purchase/po-list' },
            { icon: 'fas fa-cart-arrow-down', label: 'Direct Purchase Report', route: '/app/reports/purchase/direct-purchase' },
            { icon: 'fas fa-exchange-alt', label: 'Stock Issue/Transfer Report', route: '/app/reports/purchase/stock-issue-transfer' }
          ]
        }
      ]
    },
    {
      icon: 'fas fa-history',
      label: 'Audit Trails & Logging',
      expanded: false,
      permissionKey: 'Audit Trails',
      children: [
        { icon: 'fas fa-server', label: 'System Audits', route: '/app/audit/system' },
        { icon: 'fas fa-boxes', label: 'Inventory Audits', route: '/app/audit/inventory' },
        { icon: 'fas fa-shopping-cart', label: 'Purchase Audits', route: '/app/audit/purchase' }
      ]
    }
  ];

  menuItems: MenuItem[] = [];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.filterMenuByPermissions();
    this.authService.currentUser$.subscribe(() => {
      this.filterMenuByPermissions();
    });
  }

  filterMenuByPermissions(): void {
    if (this.authService.isAdmin()) {
      this.menuItems = this.allMenuItems;
      return;
    }

    this.menuItems = this.filterItems(this.allMenuItems);
  }

  private filterItems(items: MenuItem[]): MenuItem[] {
    return items
      .filter(item => this.hasAccessToItem(item))
      .map(item => {
        if (item.children) {
          return {
            ...item,
            children: this.filterItems(item.children)
          };
        }
        return item;
      })
      .filter(item => !item.children || item.children.length > 0);
  }

  private hasAccessToItem(item: MenuItem): boolean {
    if (!item.permissionKey) return true;
    return this.authService.hasFeatureAccess(item.permissionKey);
  }

  toggleMenu(item: MenuItem) {
    if (item.children) {
      item.expanded = !item.expanded;
    } else if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  isActive(route: string | undefined): boolean {
    if (!route) return false;
    return this.router.url === route;
  }

  hasActiveChild(item: MenuItem): boolean {
    if (!item.children) return false;
    return item.children.some(child => {
      if (child.route && this.router.url === child.route) return true;
      if (child.children) return this.hasActiveChild(child);
      return false;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
