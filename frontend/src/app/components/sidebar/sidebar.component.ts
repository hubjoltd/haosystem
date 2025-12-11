import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() collapsed: boolean = false;

  menuItems: MenuItem[] = [
    { icon: 'fas fa-home', label: 'Dashboard', route: '/app/dashboard' },
    {
      icon: 'fas fa-cog',
      label: 'Settings',
      expanded: false,
      children: [
        { icon: 'fas fa-sliders-h', label: 'General Settings', route: '/app/settings/general' },
        { icon: 'fas fa-dollar-sign', label: 'Finance Settings', route: '/app/settings/finance' },
        { icon: 'fas fa-user-cog', label: 'Customer Settings', route: '/app/settings/customer' },
        { icon: 'fas fa-file-contract', label: 'Contract Settings', route: '/app/settings/contract' },
        { icon: 'fas fa-user-shield', label: 'Roles Settings', route: '/app/settings/roles' },
        { icon: 'fas fa-users-cog', label: 'Staff Management', route: '/app/settings/staff' }
      ]
    },
    { icon: 'fas fa-users', label: 'Customer Management', route: '/app/customers' },
    { icon: 'fas fa-file-signature', label: 'Contract Management', route: '/app/contracts' },
    {
      icon: 'fas fa-boxes',
      label: 'Inventory Management',
      expanded: false,
      children: [
        { icon: 'fas fa-layer-group', label: 'Group Master', route: '/app/inventory/groups' },
        { icon: 'fas fa-box', label: 'Item Master', route: '/app/inventory/items' },
        { icon: 'fas fa-balance-scale', label: 'Units of Measure', route: '/app/inventory/units' },
        {
          icon: 'fas fa-warehouse',
          label: 'Warehouse & Bin',
          expanded: false,
          children: [
            { icon: 'fas fa-warehouse', label: 'Warehouse Management', route: '/app/inventory/warehouse' },
            { icon: 'fas fa-truck', label: 'Supplier', route: '/app/inventory/suppliers' }
          ]
        },
        { icon: 'fas fa-calculator', label: 'Inventory Valuation', route: '/app/inventory/valuation' },
        { icon: 'fas fa-book', label: 'Inventory Ledger', route: '/app/inventory/ledger' }
      ]
    },
    {
      icon: 'fas fa-exchange-alt',
      label: 'Stock Movement',
      expanded: false,
      children: [
        { icon: 'fas fa-arrow-down', label: 'Goods Receipt (GRN)', route: '/app/stock/grn' },
        { icon: 'fas fa-arrow-up', label: 'Goods Issue', route: '/app/stock/issue' },
        { icon: 'fas fa-arrows-alt-h', label: 'Stock Transfer', route: '/app/stock/transfer' },
        { icon: 'fas fa-edit', label: 'Stock Adjustments', route: '/app/stock/adjustments' }
      ]
    },
    {
      icon: 'fas fa-chart-bar',
      label: 'Inventory Reports',
      expanded: false,
      children: [
        { icon: 'fas fa-clipboard-list', label: 'Stock Summary', route: '/app/reports/stock-summary' },
        { icon: 'fas fa-coins', label: 'Inventory Valuation', route: '/app/reports/valuation' },
        { icon: 'fas fa-chart-line', label: 'Item Movement', route: '/app/reports/item-movement' },
        { icon: 'fas fa-book-open', label: 'Stock Ledger', route: '/app/reports/stock-ledger' },
        { icon: 'fas fa-sitemap', label: 'Group-wise Stock', route: '/app/reports/group-wise' },
        { icon: 'fas fa-warehouse', label: 'Warehouse Stock', route: '/app/reports/warehouse-stock' },
        { icon: 'fas fa-exclamation-triangle', label: 'Reorder Level', route: '/app/reports/reorder-level' },
        { icon: 'fas fa-hourglass-half', label: 'Slow Moving Items', route: '/app/reports/slow-moving' },
        { icon: 'fas fa-file-invoice', label: 'Purchase vs GRN', route: '/app/reports/purchase-grn' }
      ]
    }
  ];

  constructor(private router: Router) {}

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
    this.router.navigate(['/login']);
  }
}
