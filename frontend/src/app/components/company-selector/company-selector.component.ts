import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BranchService } from '../../services/branch.service';
import { Branch } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-company-selector',
  standalone: false,
  templateUrl: './company-selector.component.html',
  styleUrls: ['./company-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanySelectorComponent implements OnInit, OnDestroy {
  companies: Branch[] = [];
  isLoading: boolean = true;
  private subscription: Subscription | null = null;

  constructor(
    private router: Router,
    private branchService: BranchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadCompanies(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    
    this.subscription = this.branchService.getActiveBranches().subscribe({
      next: (companies) => {
        this.companies = companies;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading companies:', err);
        this.companies = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  selectCompany(company: Branch): void {
    const slug = company.slug || company.code.toLowerCase().replace(/[^a-z0-9]/g, '-');
    this.router.navigate(['/', slug]);
  }

  goToMainLogin(): void {
    this.router.navigate(['/login']);
  }
}
