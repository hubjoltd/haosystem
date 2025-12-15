import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoleService, Role } from '../../../services/role.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-roles-settings',
  standalone: false,
  templateUrl: './roles-settings.component.html',
  styleUrls: ['./roles-settings.component.scss']
})
export class RolesSettingsComponent implements OnInit {
  roles: Role[] = [];
  loading: boolean = false;

  searchQuery: string = '';
  pageSize: number = 25;
  currentPage: number = 1;

  constructor(private router: Router, private roleService: RoleService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.getAll().subscribe({
      next: (data) => {
        this.roles = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading roles:', err);
        this.loading = false;
      }
    });
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

  addRole(): void {
    this.router.navigate(['/app/settings/roles/add']);
  }

  editRole(role: Role): void {
    this.router.navigate(['/app/settings/roles/edit', role.id]);
  }

  deleteRole(role: Role): void {
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      this.roleService.delete(role.id!).subscribe({
        next: () => {
          this.notificationService.success('Role deleted successfully');
          this.loadRoles();
        },
        error: (err) => {
          this.notificationService.error(err.error?.error || 'Error deleting role');
        }
      });
    }
  }

  exportData(): void {
    console.log('Export roles data');
  }

  refresh(): void {
    this.loadRoles();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
