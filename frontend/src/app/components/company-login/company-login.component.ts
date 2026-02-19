import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest, Branch } from '../../services/auth.service';
import { BranchService } from '../../services/branch.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-company-login',
  standalone: false,
  templateUrl: './company-login.component.html',
  styleUrls: ['./company-login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyLoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  isLoadingCompany: boolean = true;
  
  company: Branch | null = null;
  companySlug: string = '';
  companyNotFound: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private branchService: BranchService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.companySlug = params['companySlug'];
      this.loadCompany();
    });
  }

  loadCompany(): void {
    this.isLoadingCompany = true;
    this.companyNotFound = false;
    this.cdr.markForCheck();
    
    this.branchService.getBranchBySlug(this.companySlug).subscribe({
      next: (company) => {
        this.company = company;
        this.isLoadingCompany = false;
        this.applyCompanyTheme();
        this.cdr.markForCheck();
      },
      error: () => {
        this.companyNotFound = true;
        this.isLoadingCompany = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyCompanyTheme(): void {
    if (this.company?.primaryColor) {
      document.documentElement.style.setProperty('--company-primary', this.company.primaryColor);
    }
    if (this.company?.secondaryColor) {
      document.documentElement.style.setProperty('--company-secondary', this.company.secondaryColor);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.notificationService.error('Please enter username and password');
      return;
    }

    if (!this.company) {
      this.notificationService.error('Company not found');
      return;
    }

    this.isLoading = true;

    const request: LoginRequest = {
      username: this.username,
      password: this.password,
      branchId: this.company.id
    };

    this.authService.login(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.notificationService.success('Login successful!');
        this.cdr.markForCheck();
        this.router.navigate(['/app/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.error(err.error?.error || 'Login failed. Please try again.');
        this.cdr.markForCheck();
      }
    });
  }

  goToCompanySelector(): void {
    this.router.navigate(['/companies']);
  }

  goToMainLogin(): void {
    this.router.navigate(['/login']);
  }
}
