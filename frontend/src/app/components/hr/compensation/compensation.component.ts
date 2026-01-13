import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CompensationService } from '../../../services/compensation.service';
import { EmployeeService } from '../../../services/employee.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-compensation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './compensation.component.html',
  styleUrl: './compensation.component.scss'
})
export class CompensationComponent implements OnInit {
  activeTab = 'salary-bands';
  salaryBands: any[] = [];
  salaryRevisions: any[] = [];
  bonusIncentives: any[] = [];
  benefitPlans: any[] = [];
  allowances: any[] = [];
  employeeBenefits: any[] = [];
  employees: any[] = [];
  grades: any[] = [];
  jobRoles: any[] = [];
  loading = false;
  showForm = false;
  editMode = false;
  formData: any = {};
  selectedItem: any = null;
  saving = false;

  benefitTypes = ['HEALTH', 'DENTAL', 'VISION', 'LIFE_INSURANCE', 'DISABILITY', 'RETIREMENT', 'OTHER'];
  allowanceTypes = ['HOUSING', 'TRANSPORT', 'MEAL', 'PHONE', 'INTERNET', 'EDUCATION', 'OTHER'];
  revisionTypes = ['ANNUAL', 'PROMOTION', 'AD_HOC', 'MARKET_ADJUSTMENT'];
  bonusTypes = ['PERFORMANCE', 'ANNUAL', 'SIGNING', 'REFERRAL', 'SPOT', 'PROJECT', 'OTHER'];
  calculationBasis = ['FIXED', 'PERCENTAGE_BASIC', 'PERCENTAGE_CTC', 'PERFORMANCE_BASED'];
  frequencies = ['MONTHLY', 'QUARTERLY', 'ANNUAL', 'ONE_TIME'];

  constructor(
    private compensationService: CompensationService,
    private employeeService: EmployeeService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReferenceData();
    this.loadData();
  }

  loadReferenceData(): void {
    this.employeeService.getActive().subscribe({
      next: (data) => this.employees = data,
      error: (err) => console.error('Error loading employees:', err)
    });

    this.compensationService.getGrades().subscribe({
      next: (data) => this.grades = data,
      error: () => this.grades = []
    });

    this.compensationService.getJobRoles().subscribe({
      next: (data) => this.jobRoles = data,
      error: () => this.jobRoles = []
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    this.showForm = false;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    switch (this.activeTab) {
      case 'salary-bands':
        this.compensationService.getSalaryBands().subscribe({
          next: (data) => { this.salaryBands = data; this.loading = false; },
          error: () => { this.salaryBands = []; this.loading = false; }
        });
        break;
      case 'salary-revision':
        this.compensationService.getSalaryRevisions().subscribe({
          next: (data) => { this.salaryRevisions = data; this.loading = false; },
          error: () => { this.salaryRevisions = []; this.loading = false; }
        });
        break;
      case 'bonus-incentive':
        this.compensationService.getBonusIncentives().subscribe({
          next: (data) => { this.bonusIncentives = data; this.loading = false; },
          error: () => { this.bonusIncentives = []; this.loading = false; }
        });
        break;
      case 'benefit-plans':
        this.compensationService.getBenefitPlans().subscribe({
          next: (data) => { this.benefitPlans = data; this.loading = false; },
          error: () => { this.benefitPlans = []; this.loading = false; }
        });
        break;
      case 'allowances':
        this.compensationService.getAllowances().subscribe({
          next: (data) => { this.allowances = data; this.loading = false; },
          error: () => { this.allowances = []; this.loading = false; }
        });
        break;
      case 'enrollment':
        this.compensationService.getEmployeeBenefits().subscribe({
          next: (data) => { this.employeeBenefits = data; this.loading = false; },
          error: () => { this.employeeBenefits = []; this.loading = false; }
        });
        this.compensationService.getBenefitPlans().subscribe({
          next: (data) => this.benefitPlans = data,
          error: () => this.benefitPlans = []
        });
        break;
      default:
        this.loading = false;
    }
  }

  openForm(item?: any): void {
    this.editMode = !!item;
    this.selectedItem = item;

    switch (this.activeTab) {
      case 'salary-bands':
        this.formData = item ? { ...item } : {
          bandCode: '',
          name: '',
          gradeId: null,
          jobRoleId: null,
          minSalary: 0,
          midSalary: 0,
          maxSalary: 0,
          currency: 'USD',
          payFrequency: 'MONTHLY',
          hraPercentage: 0,
          daPercentage: 0,
          taPercentage: 0,
          medicalAllowancePercentage: 0,
          specialAllowancePercentage: 0,
          effectiveFrom: new Date().toISOString().split('T')[0],
          isActive: true
        };
        break;
      case 'salary-revision':
        this.formData = item ? { ...item } : {
          employeeId: null,
          revisionType: 'ANNUAL',
          currentSalary: 0,
          revisedSalary: 0,
          incrementPercentage: 0,
          effectiveDate: new Date().toISOString().split('T')[0],
          reason: ''
        };
        break;
      case 'bonus-incentive':
        this.formData = item ? { ...item } : {
          name: '',
          bonusType: 'PERFORMANCE',
          calculationBasis: 'FIXED',
          amount: 0,
          percentage: 0,
          frequency: 'ANNUAL',
          eligibilityRules: '',
          isActive: true
        };
        break;
      case 'benefit-plans':
        this.formData = item ? { ...item } : {
          planCode: '',
          name: '',
          description: '',
          benefitType: 'HEALTH',
          category: '',
          provider: '',
          employerContribution: 0,
          employeeContribution: 0,
          contributionType: 'FIXED',
          coverageAmount: 0,
          waitingPeriodDays: 0,
          effectiveFrom: new Date().toISOString().split('T')[0],
          isActive: true,
          isMandatory: false
        };
        break;
      case 'allowances':
        this.formData = item ? { ...item } : {
          name: '',
          allowanceType: 'HOUSING',
          calculationBasis: 'FIXED',
          amount: 0,
          percentage: 0,
          isTaxable: true,
          isActive: true,
          effectiveFrom: new Date().toISOString().split('T')[0]
        };
        break;
      case 'enrollment':
        this.formData = item ? { ...item } : {
          employeeId: null,
          benefitPlanId: null,
          enrollmentDate: new Date().toISOString().split('T')[0],
          coverageType: 'EMPLOYEE_ONLY',
          status: 'ACTIVE'
        };
        break;
    }
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.formData = {};
    this.editMode = false;
    this.selectedItem = null;
  }

  calculateIncrement(): void {
    if (this.formData.currentSalary && this.formData.incrementPercentage) {
      const increment = this.formData.currentSalary * (this.formData.incrementPercentage / 100);
      this.formData.revisedSalary = this.formData.currentSalary + increment;
    }
  }

  onEmployeeChange(): void {
    const employee = this.employees.find(e => e.id === this.formData.employeeId);
    if (employee) {
      this.formData.currentSalary = employee.salary || 0;
    }
  }

  save(): void {
    if (this.saving) return;
    this.saving = true;

    const onSuccess = () => { 
      this.saving = false; 
      this.cdr.detectChanges();
      this.toastService.success('Saved successfully'); 
      this.closeForm(); 
      this.loadData(); 
    };
    const onError = (msg: string) => (err: any) => { 
      this.saving = false; 
      this.cdr.detectChanges();
      console.error(err); 
      this.toastService.error(msg); 
    };

    switch (this.activeTab) {
      case 'salary-bands':
        if (this.editMode && this.selectedItem) {
          this.compensationService.updateSalaryBand(this.selectedItem.id, this.formData).subscribe({
            next: onSuccess,
            error: onError('Error updating salary band')
          });
        } else {
          this.compensationService.createSalaryBand(this.formData).subscribe({
            next: onSuccess,
            error: onError('Error creating salary band')
          });
        }
        break;
      case 'salary-revision':
        this.compensationService.createSalaryRevision(this.formData).subscribe({
          next: onSuccess,
          error: onError('Error creating salary revision')
        });
        break;
      case 'bonus-incentive':
        if (this.editMode && this.selectedItem) {
          this.compensationService.updateBonusIncentive(this.selectedItem.id, this.formData).subscribe({
            next: onSuccess,
            error: onError('Error updating bonus/incentive')
          });
        } else {
          this.compensationService.createBonusIncentive(this.formData).subscribe({
            next: onSuccess,
            error: onError('Error creating bonus/incentive')
          });
        }
        break;
      case 'benefit-plans':
        if (this.editMode && this.selectedItem) {
          this.compensationService.updateBenefitPlan(this.selectedItem.id, this.formData).subscribe({
            next: onSuccess,
            error: onError('Error updating benefit plan')
          });
        } else {
          this.compensationService.createBenefitPlan(this.formData).subscribe({
            next: onSuccess,
            error: onError('Error creating benefit plan')
          });
        }
        break;
      case 'allowances':
        if (this.editMode && this.selectedItem) {
          this.compensationService.updateAllowance(this.selectedItem.id, this.formData).subscribe({
            next: onSuccess,
            error: onError('Error updating allowance')
          });
        } else {
          this.compensationService.createAllowance(this.formData).subscribe({
            next: onSuccess,
            error: onError('Error creating allowance')
          });
        }
        break;
      case 'enrollment':
        if (this.editMode && this.selectedItem) {
          this.compensationService.updateEmployeeBenefit(this.selectedItem.id, this.formData).subscribe({
            next: onSuccess,
            error: onError('Error updating enrollment')
          });
        } else {
          this.compensationService.enrollEmployeeInBenefit(this.formData).subscribe({
            next: onSuccess,
            error: onError('Error enrolling employee')
          });
        }
        break;
    }
  }

  delete(id: number): void {
    if (!confirm('Are you sure you want to delete this item?')) return;

    switch (this.activeTab) {
      case 'salary-bands':
        this.compensationService.deleteSalaryBand(id).subscribe({
          next: () => { this.toastService.success('Salary band deleted'); this.loadData(); },
          error: (err) => { console.error(err); this.toastService.error('Error deleting salary band'); }
        });
        break;
      case 'bonus-incentive':
        this.compensationService.deleteBonusIncentive(id).subscribe({
          next: () => { this.toastService.success('Bonus/incentive deleted'); this.loadData(); },
          error: (err) => { console.error(err); this.toastService.error('Error deleting bonus/incentive'); }
        });
        break;
      case 'benefit-plans':
        this.compensationService.deleteBenefitPlan(id).subscribe({
          next: () => { this.toastService.success('Benefit plan deleted'); this.loadData(); },
          error: (err) => { console.error(err); this.toastService.error('Error deleting benefit plan'); }
        });
        break;
      case 'allowances':
        this.compensationService.deleteAllowance(id).subscribe({
          next: () => { this.toastService.success('Allowance deleted'); this.loadData(); },
          error: (err) => { console.error(err); this.toastService.error('Error deleting allowance'); }
        });
        break;
      case 'enrollment':
        this.compensationService.cancelEmployeeBenefit(id).subscribe({
          next: () => { this.toastService.success('Enrollment canceled'); this.loadData(); },
          error: (err) => { console.error(err); this.toastService.error('Error canceling enrollment'); }
        });
        break;
    }
  }

  approveRevision(id: number): void {
    this.compensationService.approveSalaryRevision(id, 1).subscribe({
      next: () => { this.toastService.success('Revision approved'); this.loadData(); },
      error: (err) => { console.error(err); this.toastService.error('Error approving revision'); }
    });
  }

  rejectRevision(id: number): void {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.compensationService.rejectSalaryRevision(id, reason).subscribe({
        next: () => { this.toastService.success('Revision rejected'); this.loadData(); },
        error: (err) => { console.error(err); this.toastService.error('Error rejecting revision'); }
      });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  }

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleDateString() : '';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'PENDING': 'bg-warning',
      'APPROVED': 'bg-success',
      'REJECTED': 'bg-danger',
      'ACTIVE': 'bg-success',
      'INACTIVE': 'bg-secondary',
      'CANCELLED': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }
}
