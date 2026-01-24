import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BranchService } from '../../services/branch.service';
import { Branch } from '../../services/auth.service';

@Component({
  selector: 'app-company-selector',
  standalone: false,
  templateUrl: './company-selector.component.html',
  styleUrls: ['./company-selector.component.scss']
})
export class CompanySelectorComponent implements OnInit {
  companies: Branch[] = [];
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private branchService: BranchService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.isLoading = true;
    this.branchService.getActiveBranches().subscribe({
      next: (companies) => {
        this.companies = companies;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
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
