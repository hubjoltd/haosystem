import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StaffService, Staff } from '../../../../services/staff.service';
import { BranchService, Branch } from '../../../../services/branch.service';
import { RoleService, Role } from '../../../../services/role.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-add-staff',
  standalone: false,
  templateUrl: './add-staff.component.html',
  styleUrls: ['./add-staff.component.scss']
})
export class AddStaffComponent implements OnInit {
  editMode: boolean = false;
  staffId: number | null = null;
  activeTab: string = 'profile';
  saving: boolean = false;

  staff: Staff = {
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    roleId: undefined,
    branchId: undefined,
    isAdmin: false,
    isStaffMember: true,
    phone: '',
    hourlyRate: 0,
    active: true
  };

  password: string = '';
  roles: Role[] = [];
  branches: Branch[] = [];
  selectedBranchId: number | null = null;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private staffService: StaffService,
    private branchService: BranchService,
    private roleService: RoleService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.editMode = true;
        this.staffId = parseInt(id);
        this.loadStaff();
      }
    });
  }

  loadBranches(): void {
    this.branchService.getAllBranches().subscribe({
      next: (data: Branch[]) => {
        this.branches = data;
      },
      error: () => {
        this.notificationService.error('Failed to load companies');
      }
    });
  }

  onBranchChange(): void {
    this.staff.roleId = undefined;
    this.staff.role = '';
    this.roles = [];
    
    if (this.selectedBranchId) {
      this.staff.branchId = this.selectedBranchId;
      this.loadRolesForBranch(this.selectedBranchId);
    }
  }

  loadRolesForBranch(branchId: number): void {
    this.roleService.getByBranch(branchId).subscribe({
      next: (data: Role[]) => {
        this.roles = data;
      },
      error: () => {
        this.roles = [];
      }
    });
  }

  loadRoles(): void {
    this.staffService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: () => {
        this.roles = [];
      }
    });
  }

  loadStaff(): void {
    if (this.staffId) {
      this.staffService.getById(this.staffId).subscribe({
        next: (data) => {
          this.staff = data;
          if (data.branchId) {
            this.selectedBranchId = data.branchId;
            this.loadRolesForBranch(data.branchId);
          }
        },
        error: () => {
          this.notificationService.error('Failed to load staff member');
        }
      });
    }
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  saveStaff(): void {
    if (!this.staff.firstName?.trim() || !this.staff.lastName?.trim()) {
      this.notificationService.error('First name and last name are required');
      return;
    }

    if (!this.staff.email?.trim()) {
      this.notificationService.error('Email is required');
      return;
    }

    if (!this.editMode && (!this.password || this.password.length < 6)) {
      this.notificationService.error('Password must be at least 6 characters');
      return;
    }

    if (!this.selectedBranchId) {
      this.notificationService.error('Please select a company');
      return;
    }

    this.saving = true;

    const staffData: any = { ...this.staff };
    if (!this.editMode && this.password) {
      staffData.password = this.password;
    }

    if (this.editMode && this.staffId) {
      this.staffService.update(this.staffId, this.staff).subscribe({
        next: () => {
          this.notificationService.success('Staff updated successfully');
          this.router.navigate(['/app/settings/staff']);
        },
        error: (err) => {
          this.notificationService.error(err.error?.error || 'Error updating staff');
          this.saving = false;
        }
      });
    } else {
      this.staffService.create(staffData).subscribe({
        next: () => {
          this.notificationService.success('Staff created successfully');
          this.router.navigate(['/app/settings/staff']);
        },
        error: (err) => {
          this.notificationService.error(err.error?.error || 'Error creating staff');
          this.saving = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/app/settings/staff']);
  }

  get selectedBranchName(): string {
    const branch = this.branches.find(b => b.id === this.selectedBranchId);
    return branch?.name || 'Not selected';
  }

  get selectedRoleName(): string {
    const role = this.roles.find(r => r.id === this.staff.roleId);
    return role?.name || 'Not selected';
  }
}
