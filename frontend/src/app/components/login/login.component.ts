import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, LoginRequest, Branch, CurrentUser } from '../../services/auth.service';
import { BranchService } from '../../services/branch.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;
  
  branches: Branch[] = [];
  selectedBranch: Branch | null = null;
  showBranchSelector: boolean = false;
  loadingBranches: boolean = false;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private branchService: BranchService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.loadingBranches = true;
    this.branchService.getActiveBranches().subscribe({
      next: (branches) => {
        this.branches = branches;
        this.loadingBranches = false;
      },
      error: () => {
        this.loadingBranches = false;
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleBranchSelector() {
    this.showBranchSelector = !this.showBranchSelector;
  }

  selectBranch(branch: Branch | null) {
    this.selectedBranch = branch;
    this.showBranchSelector = false;
  }

  onSubmit() {
    if (!this.username || !this.password) {
      this.notificationService.error('Please enter username and password');
      return;
    }

    this.isLoading = true;

    const request: LoginRequest = {
      username: this.username,
      password: this.password,
      branchId: this.selectedBranch?.id
    };

    this.authService.login(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.notificationService.success('Login successful!');
        const user: CurrentUser | null = this.authService.getCurrentUser();
        if (user?.role === 'STAFF') {
          this.router.navigate(['/app/payroll/self-service']);
        } else {
          this.router.navigate(['/app/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.error(err.error?.error || 'Login failed. Please try again.');
      }
    });
  }
}
