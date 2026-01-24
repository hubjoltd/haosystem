import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoleService, Role } from '../../../services/role.service';
import { BranchService, Branch } from '../../../services/branch.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-roles-settings',
  standalone: false,
  templateUrl: './roles-settings.component.html',
  styleUrls: ['./roles-settings.component.scss']
})
export class RolesSettingsComponent implements OnInit {
  roles: Role[] = [];
  branches: Branch[] = [];
  loading = false;
  deletingRoleId: number | null = null;
  
  searchQuery = '';
  selectedBranchId: number | null = null;
  pageSize = 25;
  currentPage = 1;

  constructor(
    private router: Router,
    private roleService: RoleService,
    private branchService: BranchService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
    this.loadRoles();
  }

  loadBranches(): void {
    this.branchService.getAllBranches().subscribe({
      next: (data: Branch[]) => this.branches = data,
      error: () => {}
    });
  }

  loadRoles(): void {
    this.roleService.getAll().subscribe({
      next: (data) => this.roles = data,
      error: (err) => console.error('Error loading roles:', err)
    });
  }

  getBranchName(branchId: number | undefined): string {
    if (!branchId) return 'System';
    const branch = this.branches.find(b => b.id === branchId);
    return branch?.name || 'Unknown';
  }

  get filteredRoles(): Role[] {
    let filtered = this.roles;
    
    if (this.selectedBranchId) {
      filtered = filtered.filter(r => r.branchId === this.selectedBranchId);
    }
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(query) ||
        (r.description && r.description.toLowerCase().includes(query))
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
    if (role.isSystemRole) {
      this.notificationService.error('System roles cannot be deleted');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      return;
    }

    this.deletingRoleId = role.id!;
    this.roleService.delete(role.id!).subscribe({
      next: () => {
        this.notificationService.success('Role deleted successfully');
        this.roles = this.roles.filter(r => r.id !== role.id);
        this.deletingRoleId = null;
      },
      error: (err) => {
        this.notificationService.error(err.error?.error || 'Error deleting role');
        this.deletingRoleId = null;
      }
    });
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
