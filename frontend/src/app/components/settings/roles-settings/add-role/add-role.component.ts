import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RoleService, Role } from '../../../../services/role.service';

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
  roleDescription: string = '';
  editMode: boolean = false;
  roleId: number | null = null;
  saving: boolean = false;

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

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.roleId = parseInt(id);
      this.loadRole();
    }
  }

  loadRole(): void {
    if (this.roleId) {
      this.roleService.getById(this.roleId).subscribe({
        next: (role) => {
          this.roleName = role.name;
          this.roleDescription = role.description || '';
          if (role.permissions) {
            this.parsePermissions(role.permissions);
          }
        },
        error: (err) => {
          console.error('Error loading role:', err);
        }
      });
    }
  }

  parsePermissions(permissionsStr: string): void {
    try {
      const permissions = JSON.parse(permissionsStr);
      for (const perm of this.featurePermissions) {
        const featurePerms = permissions[perm.feature];
        if (featurePerms) {
          for (const cap of perm.capabilities) {
            cap.checked = featurePerms.includes(cap.name);
          }
        }
      }
    } catch (e) {
      console.error('Error parsing permissions:', e);
    }
  }

  getPermissionsJson(): string {
    const permissions: { [key: string]: string[] } = {};
    for (const perm of this.featurePermissions) {
      const checkedCaps = perm.capabilities
        .filter(c => c.checked)
        .map(c => c.name);
      if (checkedCaps.length > 0) {
        permissions[perm.feature] = checkedCaps;
      }
    }
    return JSON.stringify(permissions);
  }

  saveRole(): void {
    if (!this.roleName.trim()) {
      alert('Role name is required');
      return;
    }

    this.saving = true;
    const role: Role = {
      name: this.roleName,
      description: this.roleDescription,
      permissions: this.getPermissionsJson()
    };

    if (this.editMode && this.roleId) {
      this.roleService.update(this.roleId, role).subscribe({
        next: () => {
          this.router.navigate(['/app/settings/roles']);
        },
        error: (err) => {
          alert(err.error?.error || 'Error updating role');
          this.saving = false;
        }
      });
    } else {
      this.roleService.create(role).subscribe({
        next: () => {
          this.router.navigate(['/app/settings/roles']);
        },
        error: (err) => {
          alert(err.error?.error || 'Error creating role');
          this.saving = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/app/settings/roles']);
  }
}
