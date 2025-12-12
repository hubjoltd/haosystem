import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

  searchQuery: string = '';
  pageSize: number = 25;
  currentPage: number = 1;

  constructor(private router: Router) {}

  ngOnInit(): void {}

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

  addRole() {
    this.router.navigate(['/app/settings/roles/add']);
  }

  editRole(role: Role) {
    this.router.navigate(['/app/settings/roles/edit', role.id]);
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
