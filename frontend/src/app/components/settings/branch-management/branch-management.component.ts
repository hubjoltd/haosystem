import { Component, OnInit } from '@angular/core';
import { BranchService, BranchUser, CreateBranchUserRequest, BranchSettings } from '../../../services/branch.service';
import { Branch, AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

interface Role {
  id: number;
  name: string;
}

@Component({
  selector: 'app-branch-management',
  standalone: false,
  templateUrl: './branch-management.component.html',
  styleUrls: ['./branch-management.component.scss']
})
export class BranchManagementComponent implements OnInit {
  branches: Branch[] = [];
  selectedBranch: Branch | null = null;
  branchUsers: BranchUser[] = [];
  roles: Role[] = [];
  branchSettings: BranchSettings | null = null;
  
  isLoading = false;
  isSavingSettings = false;
  showBranchModal = false;
  showUserModal = false;
  showPasswordModal = false;
  editMode = false;
  settingsTab: 'general' | 'localization' | 'tax' | 'documents' | 'branding' = 'general';
  
  branchForm: Partial<Branch> = {};
  userForm: CreateBranchUserRequest = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    roleId: undefined
  };
  editingUserId: number | null = null;
  passwordResetUserId: number | null = null;
  newPassword = '';
  
  activeTab: 'branches' | 'users' | 'settings' = 'branches';

  constructor(
    private branchService: BranchService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isSuperAdmin()) {
      this.notificationService.error('Access denied. Super admin privileges required.');
      return;
    }
    this.loadBranches();
    this.loadRoles();
  }

  loadBranches(): void {
    this.isLoading = true;
    this.branchService.getAllBranches().subscribe({
      next: (branches) => {
        this.branches = branches;
        this.isLoading = false;
      },
      error: () => {
        this.notificationService.error('Failed to load branches');
        this.isLoading = false;
      }
    });
  }

  loadRoles(): void {
    this.roles = [
      { id: 2, name: 'ADMIN' },
      { id: 3, name: 'MANAGER' },
      { id: 4, name: 'STAFF' },
      { id: 5, name: 'VIEWER' }
    ];
  }

  selectBranch(branch: Branch): void {
    this.selectedBranch = branch;
    this.activeTab = 'users';
    this.loadBranchUsers(branch.id);
  }

  loadBranchUsers(branchId: number): void {
    this.isLoading = true;
    this.branchService.getBranchUsers(branchId).subscribe({
      next: (users) => {
        this.branchUsers = users;
        this.isLoading = false;
      },
      error: () => {
        this.notificationService.error('Failed to load branch users');
        this.isLoading = false;
      }
    });
  }

  openAddBranchModal(): void {
    this.editMode = false;
    this.branchForm = {
      code: '',
      slug: '',
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      phone: '',
      email: '',
      website: '',
      currency: 'USD',
      timezone: 'UTC',
      primaryColor: '#0d7377',
      secondaryColor: '#14919b',
      active: true
    };
    this.showBranchModal = true;
  }

  openEditBranchModal(branch: Branch): void {
    this.editMode = true;
    this.branchForm = { ...branch };
    this.showBranchModal = true;
  }

  closeBranchModal(): void {
    this.showBranchModal = false;
    this.branchForm = {};
  }

  saveBranch(): void {
    if (!this.branchForm.code || !this.branchForm.name) {
      this.notificationService.error('Branch code and name are required');
      return;
    }

    this.isLoading = true;
    
    if (this.editMode && this.branchForm.id) {
      this.branchService.updateBranch(this.branchForm.id, this.branchForm).subscribe({
        next: () => {
          this.notificationService.success('Branch updated successfully');
          this.closeBranchModal();
          this.loadBranches();
        },
        error: (err) => {
          this.notificationService.error(err.error?.error || 'Failed to update branch');
          this.isLoading = false;
        }
      });
    } else {
      this.branchService.createBranch(this.branchForm).subscribe({
        next: () => {
          this.notificationService.success('Branch created successfully');
          this.closeBranchModal();
          this.loadBranches();
        },
        error: (err) => {
          this.notificationService.error(err.error?.error || 'Failed to create branch');
          this.isLoading = false;
        }
      });
    }
  }

  deleteBranch(branch: Branch): void {
    if (!confirm(`Are you sure you want to delete branch "${branch.name}"? This action cannot be undone.`)) {
      return;
    }

    this.branchService.deleteBranch(branch.id).subscribe({
      next: () => {
        this.notificationService.success('Branch deleted successfully');
        this.loadBranches();
        if (this.selectedBranch?.id === branch.id) {
          this.selectedBranch = null;
          this.branchUsers = [];
        }
      },
      error: () => {
        this.notificationService.error('Failed to delete branch. Make sure no users are assigned.');
      }
    });
  }

  openAddUserModal(): void {
    if (!this.selectedBranch) return;
    this.editMode = false;
    this.editingUserId = null;
    this.userForm = {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      roleId: undefined
    };
    this.showUserModal = true;
  }

  openEditUserModal(user: BranchUser): void {
    this.editMode = true;
    this.editingUserId = user.id;
    this.userForm = {
      username: user.username,
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      roleId: user.role?.id
    };
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.editingUserId = null;
    this.userForm = {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      roleId: undefined
    };
  }

  saveUser(): void {
    if (!this.selectedBranch) return;

    if (!this.userForm.username || !this.userForm.email || !this.userForm.firstName || !this.userForm.lastName) {
      this.notificationService.error('Please fill all required fields');
      return;
    }

    if (!this.editMode && !this.userForm.password) {
      this.notificationService.error('Password is required for new users');
      return;
    }

    this.isLoading = true;

    if (this.editMode && this.editingUserId) {
      this.branchService.updateBranchUser(this.selectedBranch.id, this.editingUserId, {
        firstName: this.userForm.firstName,
        lastName: this.userForm.lastName,
        email: this.userForm.email,
        phone: this.userForm.phone,
        role: this.userForm.roleId ? { id: this.userForm.roleId, name: '' } : undefined,
        active: true
      } as Partial<BranchUser>).subscribe({
        next: () => {
          this.notificationService.success('User updated successfully');
          this.closeUserModal();
          this.loadBranchUsers(this.selectedBranch!.id);
        },
        error: (err) => {
          this.notificationService.error(err.error?.error || 'Failed to update user');
          this.isLoading = false;
        }
      });
    } else {
      this.branchService.createBranchUser(this.selectedBranch.id, this.userForm).subscribe({
        next: () => {
          this.notificationService.success('User created successfully');
          this.closeUserModal();
          this.loadBranchUsers(this.selectedBranch!.id);
        },
        error: (err) => {
          this.notificationService.error(err.error?.error || 'Failed to create user');
          this.isLoading = false;
        }
      });
    }
  }

  deleteUser(user: BranchUser): void {
    if (!this.selectedBranch) return;
    if (!confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      return;
    }

    this.branchService.deleteBranchUser(this.selectedBranch.id, user.id).subscribe({
      next: () => {
        this.notificationService.success('User deleted successfully');
        this.loadBranchUsers(this.selectedBranch!.id);
      },
      error: () => {
        this.notificationService.error('Failed to delete user');
      }
    });
  }

  openPasswordModal(user: BranchUser): void {
    this.passwordResetUserId = user.id;
    this.newPassword = '';
    this.showPasswordModal = true;
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.passwordResetUserId = null;
    this.newPassword = '';
  }

  resetPassword(): void {
    if (!this.selectedBranch || !this.passwordResetUserId) return;
    if (!this.newPassword || this.newPassword.length < 6) {
      this.notificationService.error('Password must be at least 6 characters');
      return;
    }

    this.branchService.resetBranchUserPassword(this.selectedBranch.id, this.passwordResetUserId, this.newPassword).subscribe({
      next: () => {
        this.notificationService.success('Password reset successfully');
        this.closePasswordModal();
      },
      error: () => {
        this.notificationService.error('Failed to reset password');
      }
    });
  }

  backToBranches(): void {
    this.activeTab = 'branches';
    this.selectedBranch = null;
    this.branchUsers = [];
    this.branchSettings = null;
  }

  openSettings(branch: Branch): void {
    this.selectedBranch = branch;
    this.activeTab = 'settings';
    this.settingsTab = 'general';
    this.loadBranchSettings(branch.id);
  }

  loadBranchSettings(branchId: number): void {
    this.isLoading = true;
    this.branchService.getBranchSettings(branchId).subscribe({
      next: (settings) => {
        this.branchSettings = settings;
        this.isLoading = false;
      },
      error: () => {
        this.notificationService.error('Failed to load branch settings');
        this.isLoading = false;
      }
    });
  }

  saveBranchSettings(): void {
    if (!this.selectedBranch || !this.branchSettings) return;
    
    this.isSavingSettings = true;
    this.branchService.updateBranchSettings(this.selectedBranch.id, this.branchSettings).subscribe({
      next: (settings) => {
        this.branchSettings = settings;
        this.notificationService.success('Settings saved successfully');
        this.isSavingSettings = false;
      },
      error: () => {
        this.notificationService.error('Failed to save settings');
        this.isSavingSettings = false;
      }
    });
  }

  onLogoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.selectedBranch) return;
    
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.notificationService.error('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      this.notificationService.error('File size must be less than 5MB');
      return;
    }
    
    this.isLoading = true;
    this.branchService.uploadBranchLogo(this.selectedBranch.id, file).subscribe({
      next: (response) => {
        if (this.selectedBranch) {
          this.selectedBranch.logoPath = response.logoPath;
        }
        this.notificationService.success('Logo uploaded successfully');
        this.isLoading = false;
      },
      error: () => {
        this.notificationService.error('Failed to upload logo');
        this.isLoading = false;
      }
    });
  }

  onSignatureChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.selectedBranch) return;
    
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.notificationService.error('Please select an image file');
      return;
    }
    
    this.isLoading = true;
    this.branchService.uploadBranchSignature(this.selectedBranch.id, file).subscribe({
      next: (response) => {
        if (this.branchSettings) {
          this.branchSettings.signaturePath = response.signaturePath;
        }
        this.notificationService.success('Signature uploaded successfully');
        this.isLoading = false;
      },
      error: () => {
        this.notificationService.error('Failed to upload signature');
        this.isLoading = false;
      }
    });
  }
}
