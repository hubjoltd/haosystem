import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

interface Permission {
  feature: string;
  capabilities: { name: string; checked: boolean }[];
}

@Component({
  selector: 'app-add-role',
  standalone: false,
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.scss']
})
export class AddRoleComponent implements OnInit {
  roleName: string = '';
  editMode: boolean = false;
  roleId: number | null = null;

  featurePermissions: Permission[] = [
    { feature: 'Dashboard', capabilities: [
      { name: 'View', checked: false }
    ]},
    { feature: 'Settings', capabilities: [
      { name: 'View', checked: false },
      { name: 'Edit', checked: false }
    ]},
    { feature: 'Customer Management', capabilities: [
      { name: 'View (Own)', checked: false },
      { name: 'View (Global)', checked: false },
      { name: 'Create', checked: false },
      { name: 'Edit', checked: false },
      { name: 'Delete', checked: false }
    ]},
    { feature: 'Contract Management', capabilities: [
      { name: 'View (Own)', checked: false },
      { name: 'View (Global)', checked: false },
      { name: 'Create', checked: false },
      { name: 'Edit', checked: false },
      { name: 'Delete', checked: false }
    ]},
    { feature: 'Inventory - Group Master', capabilities: [
      { name: 'View', checked: false },
      { name: 'Create', checked: false },
      { name: 'Edit', checked: false },
      { name: 'Delete', checked: false }
    ]},
    { feature: 'Inventory - Item Master', capabilities: [
      { name: 'View', checked: false },
      { name: 'Create', checked: false },
      { name: 'Edit', checked: false },
      { name: 'Delete', checked: false }
    ]},
    { feature: 'Inventory - Units of Measure', capabilities: [
      { name: 'View', checked: false },
      { name: 'Create', checked: false },
      { name: 'Edit', checked: false },
      { name: 'Delete', checked: false }
    ]},
    { feature: 'Inventory - Warehouse & Bin', capabilities: [
      { name: 'View', checked: false },
      { name: 'Create', checked: false },
      { name: 'Edit', checked: false },
      { name: 'Delete', checked: false }
    ]},
    { feature: 'Inventory - Supplier', capabilities: [
      { name: 'View', checked: false },
      { name: 'Create', checked: false },
      { name: 'Edit', checked: false },
      { name: 'Delete', checked: false }
    ]},
    { feature: 'Inventory - Valuation', capabilities: [
      { name: 'View', checked: false }
    ]},
    { feature: 'Inventory - Ledger', capabilities: [
      { name: 'View', checked: false }
    ]},
    { feature: 'Stock Movement - Goods Receipt (GRN)', capabilities: [
      { name: 'View (Own)', checked: false },
      { name: 'View (Global)', checked: false },
      { name: 'Create', checked: false },
      { name: 'Edit', checked: false },
      { name: 'Delete', checked: false }
    ]},
    { feature: 'Stock Movement - Goods Issue', capabilities: [
      { name: 'View (Own)', checked: false },
      { name: 'View (Global)', checked: false },
      { name: 'Create', checked: false },
      { name: 'Edit', checked: false },
      { name: 'Delete', checked: false }
    ]},
    { feature: 'Stock Movement - Stock Transfer', capabilities: [
      { name: 'View (Own)', checked: false },
      { name: 'View (Global)', checked: false },
      { name: 'Create', checked: false },
      { name: 'Edit', checked: false },
      { name: 'Delete', checked: false }
    ]},
    { feature: 'Stock Movement - Stock Adjustments', capabilities: [
      { name: 'View (Own)', checked: false },
      { name: 'View (Global)', checked: false },
      { name: 'Create', checked: false },
      { name: 'Edit', checked: false },
      { name: 'Delete', checked: false },
      { name: 'Approve', checked: false }
    ]},
    { feature: 'Purchase - Requisition', capabilities: [
      { name: 'View (Own)', checked: false },
      { name: 'View (Global)', checked: false },
      { name: 'Create', checked: false },
      { name: 'Edit', checked: false },
      { name: 'Delete', checked: false },
      { name: 'Approve', checked: false }
    ]},
    { feature: 'Purchase - PR Fulfillment', capabilities: [
      { name: 'View', checked: false },
      { name: 'Convert to PO', checked: false },
      { name: 'Stock Issue', checked: false },
      { name: 'Material Transfer', checked: false }
    ]},
    { feature: 'Purchase - Direct Purchase', capabilities: [
      { name: 'View (Own)', checked: false },
      { name: 'View (Global)', checked: false },
      { name: 'Create', checked: false },
      { name: 'Edit', checked: false },
      { name: 'Delete', checked: false }
    ]},
    { feature: 'Reports - Inventory', capabilities: [
      { name: 'View', checked: false },
      { name: 'Export', checked: false }
    ]},
    { feature: 'Reports - Purchase', capabilities: [
      { name: 'View', checked: false },
      { name: 'Export', checked: false }
    ]},
    { feature: 'Audit Trails', capabilities: [
      { name: 'View System Audits', checked: false },
      { name: 'View Inventory Audits', checked: false },
      { name: 'View Purchase Audits', checked: false }
    ]}
  ];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.roleId = parseInt(id);
    }
  }

  saveRole() {
    if (!this.roleName.trim()) {
      alert('Role name is required');
      return;
    }
    this.router.navigate(['/app/settings/roles']);
  }

  cancel() {
    this.router.navigate(['/app/settings/roles']);
  }
}
