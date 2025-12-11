import { Component } from '@angular/core';

@Component({
  selector: 'app-roles-settings',
  standalone: false,
  templateUrl: './roles-settings.component.html',
  styleUrls: ['./roles-settings.component.scss']
})
export class RolesSettingsComponent {
  roles = [
    { id: 1, name: 'Super Admin', description: 'Full system access', users: 1, permissions: 'All' },
    { id: 2, name: 'Admin', description: 'Administrative access', users: 3, permissions: 'Most' },
    { id: 3, name: 'Manager', description: 'Department management', users: 5, permissions: 'Limited' },
    { id: 4, name: 'Staff', description: 'Basic operations', users: 12, permissions: 'Basic' },
    { id: 5, name: 'Viewer', description: 'Read-only access', users: 8, permissions: 'View Only' }
  ];

  permissions = [
    { module: 'Dashboard', view: true, create: true, edit: true, delete: true },
    { module: 'Customers', view: true, create: true, edit: true, delete: false },
    { module: 'Contracts', view: true, create: true, edit: false, delete: false },
    { module: 'Inventory', view: true, create: false, edit: false, delete: false },
    { module: 'Reports', view: true, create: false, edit: false, delete: false }
  ];

  selectedRole: any = null;
  showModal: boolean = false;

  selectRole(role: any) {
    this.selectedRole = role;
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
