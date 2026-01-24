import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RoleService, Role, MainModule, RolePermissions } from '../../../../services/role.service';
import { BranchService, Branch } from '../../../../services/branch.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-add-role',
  standalone: false,
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.scss']
})
export class AddRoleComponent implements OnInit {
  roleName = '';
  roleDescription = '';
  roleType: 'system' | 'custom' = 'custom';
  selectedBranchId: number | null = null;
  editMode = false;
  roleId: number | null = null;
  saving = false;

  branches: Branch[] = [];
  moduleHierarchy: MainModule[] = [];
  permissions: RolePermissions = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private roleService: RoleService,
    private branchService: BranchService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.moduleHierarchy = this.roleService.getModuleHierarchy();
    this.permissions = this.roleService.getDefaultPermissions();
    this.loadBranches();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.roleId = parseInt(id, 10);
      this.loadRole(this.roleId);
    }
  }

  loadBranches(): void {
    this.branchService.getAllBranches().subscribe({
      next: (data: Branch[]) => this.branches = data,
      error: () => this.notificationService.error('Failed to load companies')
    });
  }

  loadRole(id: number): void {
    this.roleService.getById(id).subscribe({
      next: (role) => {
        this.roleName = role.name;
        this.roleDescription = role.description || '';
        this.selectedBranchId = role.branchId || null;
        this.roleType = role.isSystemRole ? 'system' : 'custom';
        if (role.permissions) {
          const parsed = this.roleService.parsePermissions(role.permissions);
          this.permissions = { ...this.roleService.getDefaultPermissions(), ...parsed };
        }
      },
      error: () => {
        this.notificationService.error('Failed to load role');
        this.router.navigate(['/app/settings/roles']);
      }
    });
  }

  toggleModule(module: MainModule): void {
    module.expanded = !module.expanded;
  }

  toggleMainModulePermission(moduleKey: string, permission: 'view' | 'add' | 'edit' | 'delete'): void {
    if (!this.permissions[moduleKey]) {
      this.permissions[moduleKey] = { view: false, add: false, edit: false, delete: false };
    }
    this.permissions[moduleKey][permission] = !this.permissions[moduleKey][permission];

    const module = this.moduleHierarchy.find(m => m.key === moduleKey);
    if (module) {
      module.subModules.forEach(sub => {
        if (!this.permissions[sub.key]) {
          this.permissions[sub.key] = { view: false, add: false, edit: false, delete: false };
        }
        this.permissions[sub.key][permission] = this.permissions[moduleKey][permission];
      });
    }
  }

  toggleSubModulePermission(subKey: string, permission: 'view' | 'add' | 'edit' | 'delete'): void {
    if (!this.permissions[subKey]) {
      this.permissions[subKey] = { view: false, add: false, edit: false, delete: false };
    }
    this.permissions[subKey][permission] = !this.permissions[subKey][permission];
  }

  selectAllForModule(moduleKey: string): void {
    const module = this.moduleHierarchy.find(m => m.key === moduleKey);
    if (!module) return;

    this.permissions[moduleKey] = { view: true, add: true, edit: true, delete: true };
    module.subModules.forEach(sub => {
      this.permissions[sub.key] = { view: true, add: true, edit: true, delete: true };
    });
  }

  clearAllForModule(moduleKey: string): void {
    const module = this.moduleHierarchy.find(m => m.key === moduleKey);
    if (!module) return;

    this.permissions[moduleKey] = { view: false, add: false, edit: false, delete: false };
    module.subModules.forEach(sub => {
      this.permissions[sub.key] = { view: false, add: false, edit: false, delete: false };
    });
  }

  selectAll(): void {
    this.permissions = this.roleService.getFullPermissions();
  }

  clearAll(): void {
    this.permissions = this.roleService.getDefaultPermissions();
  }

  isMainModuleChecked(moduleKey: string, permission: 'view' | 'add' | 'edit' | 'delete'): boolean {
    return this.permissions[moduleKey]?.[permission] || false;
  }

  isSubModuleChecked(subKey: string, permission: 'view' | 'add' | 'edit' | 'delete'): boolean {
    return this.permissions[subKey]?.[permission] || false;
  }

  hasAnySubModulePermission(moduleKey: string): boolean {
    const module = this.moduleHierarchy.find(m => m.key === moduleKey);
    if (!module || module.subModules.length === 0) return false;
    
    return module.subModules.some(sub => {
      const perm = this.permissions[sub.key];
      return perm && (perm.view || perm.add || perm.edit || perm.delete);
    });
  }

  countModulePermissions(moduleKey: string): number {
    const module = this.moduleHierarchy.find(m => m.key === moduleKey);
    if (!module) return 0;
    
    let count = 0;
    const mainPerm = this.permissions[moduleKey];
    if (mainPerm) {
      if (mainPerm.view) count++;
      if (mainPerm.add) count++;
      if (mainPerm.edit) count++;
      if (mainPerm.delete) count++;
    }
    
    module.subModules.forEach(sub => {
      const perm = this.permissions[sub.key];
      if (perm) {
        if (perm.view) count++;
        if (perm.add) count++;
        if (perm.edit) count++;
        if (perm.delete) count++;
      }
    });
    
    return count;
  }

  saveRole(): void {
    if (!this.roleName.trim()) {
      this.notificationService.error('Role name is required');
      return;
    }

    this.saving = true;

    const role: Role = {
      name: this.roleName.trim(),
      description: this.roleDescription.trim(),
      permissions: this.roleService.stringifyPermissions(this.permissions),
      branchId: this.selectedBranchId || undefined,
      isSystemRole: this.roleType === 'system'
    };

    if (this.editMode && this.roleId) {
      this.roleService.update(this.roleId, role).subscribe({
        next: () => {
          this.notificationService.success('Role updated successfully');
          this.router.navigate(['/app/settings/roles']);
        },
        error: (err) => {
          this.notificationService.error(err.error?.error || 'Failed to update role');
          this.saving = false;
        }
      });
    } else {
      this.roleService.create(role).subscribe({
        next: () => {
          this.notificationService.success('Role created successfully');
          this.router.navigate(['/app/settings/roles']);
        },
        error: (err) => {
          this.notificationService.error(err.error?.error || 'Failed to create role');
          this.saving = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/app/settings/roles']);
  }
}
