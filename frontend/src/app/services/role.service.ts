import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Role {
  id?: number;
  name: string;
  description?: string;
  permissions?: string;
  branchId?: number;
  isSystemRole?: boolean;
  totalUsers?: number;
}

export interface ModulePermission {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export interface RolePermissions {
  [module: string]: ModulePermission;
}

export const AVAILABLE_MODULES = [
  { key: 'Dashboard', label: 'Dashboard', icon: 'fas fa-home' },
  { key: 'Settings', label: 'Settings', icon: 'fas fa-cog' },
  { key: 'Customer Management', label: 'Customer Management', icon: 'fas fa-users' },
  { key: 'Purchase', label: 'Procurement', icon: 'fas fa-shopping-cart' },
  { key: 'Inventory', label: 'Inventory', icon: 'fas fa-boxes' },
  { key: 'HR Management', label: 'HR Management', icon: 'fas fa-user-tie' },
  { key: 'Payroll', label: 'Payroll', icon: 'fas fa-money-check-alt' },
  { key: 'Attendance', label: 'Attendance', icon: 'fas fa-clock' },
  { key: 'Accounting', label: 'Finance & Accounting', icon: 'fas fa-calculator' },
  { key: 'Projects', label: 'Project Management', icon: 'fas fa-project-diagram' },
  { key: 'Expenses', label: 'Expenses', icon: 'fas fa-file-invoice-dollar' },
  { key: 'Leave', label: 'Leave Management', icon: 'fas fa-calendar-alt' },
  { key: 'Reports', label: 'Reports', icon: 'fas fa-chart-bar' }
];

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = '/api/roles';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  getByBranch(branchId: number): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/branch/${branchId}`);
  }

  getById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  create(role: Role): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  update(id: number, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, role);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  parsePermissions(permissionsJson: string | undefined): RolePermissions {
    if (!permissionsJson) return {};
    try {
      return JSON.parse(permissionsJson);
    } catch {
      return {};
    }
  }

  stringifyPermissions(permissions: RolePermissions): string {
    return JSON.stringify(permissions);
  }

  getDefaultPermissions(): RolePermissions {
    const perms: RolePermissions = {};
    AVAILABLE_MODULES.forEach(m => {
      perms[m.key] = { view: false, add: false, edit: false, delete: false };
    });
    return perms;
  }

  getFullPermissions(): RolePermissions {
    const perms: RolePermissions = {};
    AVAILABLE_MODULES.forEach(m => {
      perms[m.key] = { view: true, add: true, edit: true, delete: true };
    });
    return perms;
  }
}
