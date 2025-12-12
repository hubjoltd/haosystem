import { Component, OnInit } from '@angular/core';

interface Permission {
  feature: string;
  capabilities: { name: string; checked: boolean }[];
}

interface Role {
  id?: number;
  name: string;
  totalUsers: number;
}

@Component({
  selector: 'app-roles-settings',
  standalone: false,
  templateUrl: './roles-settings.component.html',
  styleUrls: ['./roles-settings.component.scss']
})
export class RolesSettingsComponent implements OnInit {
  roles: Role[] = [
    { id: 1, name: 'Admin', totalUsers: 2 },
    { id: 2, name: 'Manager', totalUsers: 5 },
    { id: 3, name: 'Staff', totalUsers: 10 },
    { id: 4, name: 'Viewer', totalUsers: 3 }
  ];

  featurePermissions: Permission[] = [
    { feature: 'Bulk PDF Export', capabilities: [{ name: 'View(Global)', checked: false }] },
    { feature: 'Contracts', capabilities: [
      { name: 'View (Own)', checked: false },
      { name: 'View(Global)', checked: false },
      { name: 'Create', checked: false },
      { name: 'Edit', checked: false },
      { name: 'Delete', checked: false },
      { name: 'View All Templates', checked: false }
    ]},
    { feature: 'Credit Notes', capabilities: [
      { name: 'View (Own)', checked: false },
      { name: 'View(Global)', checked: false },
      { name: 'Create', checked: false },
      { name: 'Edit', checked: false },
      { name: 'Delete', checked: false }
    ]},
    { feature: 'Customers', capabilities: [
      { name: 'View (Own)', checked: false },
      { name: 'View(Global)', checked: false },
      { name: 'Create', checked: false },
      { name: 'Edit', checked: false },
      { name: 'Delete', checked: false }
    ]},
    { feature: 'Dashboard', capabilities: [
      { name: 'View(Global)', checked: false }
    ]},
    { feature: 'Inventory', capabilities: [
      { name: 'View (Own)', checked: false },
      { name: 'View(Global)', checked: false },
      { name: 'Create', checked: false },
      { name: 'Edit', checked: false },
      { name: 'Delete', checked: false }
    ]},
    { feature: 'Reports', capabilities: [
      { name: 'View (Own)', checked: false },
      { name: 'View(Global)', checked: false },
      { name: 'Export', checked: false }
    ]},
    { feature: 'Settings', capabilities: [
      { name: 'View(Global)', checked: false },
      { name: 'Edit', checked: false }
    ]},
    { feature: 'Stock Movement', capabilities: [
      { name: 'View (Own)', checked: false },
      { name: 'View(Global)', checked: false },
      { name: 'Create', checked: false },
      { name: 'Edit', checked: false },
      { name: 'Delete', checked: false },
      { name: 'Approve', checked: false }
    ]},
    { feature: 'Purchase Orders', capabilities: [
      { name: 'View (Own)', checked: false },
      { name: 'View(Global)', checked: false },
      { name: 'Create', checked: false },
      { name: 'Edit', checked: false },
      { name: 'Delete', checked: false },
      { name: 'Approve', checked: false }
    ]}
  ];

  showModal: boolean = false;
  editMode: boolean = false;
  selectedRole: Role = this.getEmptyRole();
  rolePermissions: Permission[] = [];
  
  searchQuery: string = '';
  pageSize: number = 25;
  currentPage: number = 1;

  ngOnInit(): void {}

  getEmptyRole(): Role {
    return { name: '', totalUsers: 0 };
  }

  get filteredRoles(): Role[] {
    let filtered = this.roles;
    if (this.searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    return filtered;
  }

  get paginatedRoles(): Role[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRoles.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRoles.length / this.pageSize) || 1;
  }

  get startEntry(): number {
    return this.filteredRoles.length > 0 ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get endEntry(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredRoles.length);
  }

  openModal(role?: Role) {
    if (role) {
      this.editMode = true;
      this.selectedRole = { ...role };
    } else {
      this.editMode = false;
      this.selectedRole = this.getEmptyRole();
    }
    this.rolePermissions = JSON.parse(JSON.stringify(this.featurePermissions));
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedRole = this.getEmptyRole();
  }

  saveRole() {
    if (!this.selectedRole.name.trim()) {
      alert('Role name is required');
      return;
    }

    if (this.editMode && this.selectedRole.id) {
      const index = this.roles.findIndex(r => r.id === this.selectedRole.id);
      if (index >= 0) {
        this.roles[index] = { ...this.selectedRole };
      }
    } else {
      const newId = Math.max(...this.roles.map(r => r.id || 0), 0) + 1;
      this.roles.push({ ...this.selectedRole, id: newId });
    }
    this.closeModal();
  }

  deleteRole(role: Role) {
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      this.roles = this.roles.filter(r => r.id !== role.id);
    }
  }

  exportData() {
    console.log('Export roles data');
  }

  refresh() {
    console.log('Refresh roles data');
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
