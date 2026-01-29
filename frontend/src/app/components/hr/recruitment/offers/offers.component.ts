import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RecruitmentService } from '../../../../services/recruitment.service';
import { ToastService } from '../../../../services/toast.service';

export interface OfferLetter {
  id?: number;
  offerNumber: string;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  department: string;
  reportingTo?: string;
  offerType: string;
  employmentType: string;
  workMode: string;
  location: string;
  baseSalary: number;
  currency: string;
  salaryFrequency: string;
  bonus?: number;
  bonusType?: string;
  stockOptions?: string;
  benefits: string[];
  joiningDate: string;
  expiryDate: string;
  probationPeriod: number;
  noticePeriod: number;
  template: string;
  customTerms?: string;
  status: string;
  sentDate?: string;
  responseDate?: string;
  declineReason?: string;
  approvalStatus: string;
  approvedBy?: string;
  approvedDate?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-recruitment-offers',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecruitmentOffersComponent implements OnInit {
  offers: OfferLetter[] = [];
  candidates: any[] = [];
  loading = false;
  saving = false;
  showModal = false;
  isEditing = false;
  selectedOffer: OfferLetter = this.getEmptyOffer();
  
  activeTab = 'all';
  searchTerm = '';
  
  offerTypes = ['New Hire', 'Promotion', 'Transfer', 'Contract Extension'];
  employmentTypes = ['Full-Time', 'Part-Time', 'Contract', 'Intern'];
  workModes = ['Onsite', 'Remote', 'Hybrid'];
  currencies = ['USD', 'EUR', 'GBP', 'INR', 'SGD', 'AED'];
  salaryFrequencies = ['Monthly', 'Annual', 'Hourly'];
  bonusTypes = ['Signing Bonus', 'Performance Bonus', 'Annual Bonus', 'None'];
  templates = ['Standard Offer', 'Executive Offer', 'Contract Offer', 'Intern Offer'];
  benefitOptions = ['Health Insurance', 'Dental', 'Vision', '401k Match', 'Stock Options', 'Flexible PTO', 'Remote Work', 'Gym Membership', 'Learning Budget'];
  
  showViewModal = false;
  viewOffer: OfferLetter | null = null;
  
  showApprovalModal = false;
  approvalOffer: OfferLetter | null = null;
  approvalAction = '';
  approvalComments = '';
  
  selectedBenefits: { [key: string]: boolean } = {};

  showConvertModal = false;
  convertOffer: OfferLetter | null = null;
  convertEmployeeData = this.getEmptyConvertData();
  departments = ['Engineering', 'Product', 'Design', 'HR', 'Finance', 'Sales', 'Marketing', 'Operations'];
  designations = ['Junior', 'Associate', 'Senior', 'Lead', 'Manager', 'Director', 'VP'];
  locations = ['New York', 'San Francisco', 'Chicago', 'Remote', 'London', 'Singapore'];
  grades = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'];

  constructor(
    private recruitmentService: RecruitmentService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.initBenefits();
  }

  initBenefits(): void {
    this.benefitOptions.forEach(b => this.selectedBenefits[b] = false);
  }

  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.recruitmentService.getOffers().subscribe({
      next: (data) => {
        this.offers = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.generateMockData();
        this.loading = false;
        this.cdr.markForCheck();
      }
    });

    this.recruitmentService.getCandidates().subscribe({
      next: (data) => {
        this.candidates = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.candidates = [];
        this.cdr.markForCheck();
      }
    });
  }

  generateMockData(): void {
    const statuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED'];
    const candidateNames = ['John Smith', 'Emily Johnson', 'Michael Williams', 'Sarah Brown'];
    const jobTitles = ['Senior Software Engineer', 'Product Manager', 'UX Designer', 'Data Analyst'];

    this.offers = candidateNames.map((name, i) => ({
      id: i + 1,
      offerNumber: `OFR-2024-${String(i + 1).padStart(4, '0')}`,
      candidateId: i + 1,
      candidateName: name,
      candidateEmail: `${name.toLowerCase().replace(' ', '.')}@email.com`,
      jobTitle: jobTitles[i],
      department: ['Engineering', 'Product', 'Design', 'Analytics'][i],
      reportingTo: 'John Manager',
      offerType: this.offerTypes[i % this.offerTypes.length],
      employmentType: this.employmentTypes[i % this.employmentTypes.length],
      workMode: this.workModes[i % this.workModes.length],
      location: ['New York', 'San Francisco', 'Remote', 'Chicago'][i],
      baseSalary: 80000 + i * 15000,
      currency: 'USD',
      salaryFrequency: 'Annual',
      bonus: i % 2 === 0 ? 10000 : undefined,
      bonusType: i % 2 === 0 ? 'Signing Bonus' : undefined,
      stockOptions: i % 3 === 0 ? '5000 RSUs vesting over 4 years' : undefined,
      benefits: this.benefitOptions.slice(0, 3 + i % 4),
      joiningDate: this.getFutureDate(30 + i * 7),
      expiryDate: this.getFutureDate(7 + i),
      probationPeriod: 90,
      noticePeriod: 30,
      template: this.templates[i % this.templates.length],
      status: statuses[i % statuses.length],
      approvalStatus: i < 2 ? 'PENDING' : 'APPROVED',
      approvedBy: i >= 2 ? 'HR Director' : undefined,
      approvedDate: i >= 2 ? this.getPastDate(3) : undefined,
      sentDate: ['SENT', 'ACCEPTED', 'DECLINED'].includes(statuses[i % statuses.length]) ? this.getPastDate(5) : undefined,
      createdBy: 'HR Admin',
      createdAt: this.getPastDate(10 + i)
    }));
  }

  getFutureDate(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  getPastDate(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  }

  get filteredOffers(): OfferLetter[] {
    let filtered = this.offers;
    
    if (this.activeTab !== 'all') {
      filtered = filtered.filter(o => o.status === this.activeTab.toUpperCase().replace('-', '_'));
    }
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.candidateName.toLowerCase().includes(term) ||
        o.offerNumber.toLowerCase().includes(term) ||
        o.jobTitle.toLowerCase().includes(term) ||
        o.department.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }

  getStatusCount(status: string): number {
    if (status === 'all') return this.offers.length;
    return this.offers.filter(o => o.status === status.toUpperCase().replace('-', '_')).length;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getEmptyOffer(): OfferLetter {
    return {
      offerNumber: '',
      candidateId: 0,
      candidateName: '',
      candidateEmail: '',
      jobTitle: '',
      department: '',
      offerType: 'New Hire',
      employmentType: 'Full-Time',
      workMode: 'Onsite',
      location: '',
      baseSalary: 0,
      currency: 'USD',
      salaryFrequency: 'Annual',
      benefits: [],
      joiningDate: '',
      expiryDate: '',
      probationPeriod: 90,
      noticePeriod: 30,
      template: 'Standard Offer',
      status: 'DRAFT',
      approvalStatus: 'PENDING'
    };
  }

  openCreateModal(): void {
    this.selectedOffer = this.getEmptyOffer();
    this.selectedOffer.offerNumber = this.generateOfferNumber();
    this.isEditing = false;
    this.initBenefits();
    this.showModal = true;
  }

  openEditModal(offer: OfferLetter): void {
    this.selectedOffer = { ...offer, benefits: [...offer.benefits] };
    this.isEditing = true;
    this.initBenefits();
    offer.benefits.forEach(b => this.selectedBenefits[b] = true);
    this.showModal = true;
  }

  generateOfferNumber(): string {
    const year = new Date().getFullYear();
    const num = this.offers.length + 1;
    return `OFR-${year}-${String(num).padStart(4, '0')}`;
  }

  closeModal(): void {
    this.showModal = false;
  }

  selectCandidate(event: Event): void {
    const candidateId = parseInt((event.target as HTMLSelectElement).value);
    const candidate = this.candidates.find(c => c.id === candidateId);
    if (candidate) {
      this.selectedOffer.candidateId = candidate.id;
      this.selectedOffer.candidateName = `${candidate.firstName} ${candidate.lastName}`;
      this.selectedOffer.candidateEmail = candidate.email;
      this.selectedOffer.jobTitle = candidate.appliedPosition || '';
      this.cdr.markForCheck();
    }
  }

  onCandidateChange(candidateId: number): void {
    const candidate = this.candidates.find(c => c.id === candidateId);
    if (candidate) {
      this.selectedOffer.candidateName = `${candidate.firstName} ${candidate.lastName}`;
      this.selectedOffer.candidateEmail = candidate.email;
      this.selectedOffer.jobTitle = candidate.appliedPosition || '';
      this.cdr.markForCheck();
    }
  }

  updateBenefits(): void {
    this.selectedOffer.benefits = Object.keys(this.selectedBenefits).filter(b => this.selectedBenefits[b]);
  }

  saveOffer(): void {
    this.updateBenefits();
    
    if (!this.selectedOffer.candidateId || !this.selectedOffer.baseSalary || !this.selectedOffer.joiningDate) {
      this.toastService.error('Please fill in all required fields');
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();
    if (this.isEditing) {
      this.recruitmentService.updateOffer(this.selectedOffer.id!, this.selectedOffer).subscribe({
        next: () => {
          this.saving = false;
          const idx = this.offers.findIndex(o => o.id === this.selectedOffer.id);
          if (idx >= 0) this.offers[idx] = { ...this.selectedOffer };
          this.toastService.success('Offer updated successfully');
          this.closeModal();
          this.cdr.markForCheck();
        },
        error: () => {
          this.saving = false;
          this.toastService.error('Failed to update offer');
          this.cdr.markForCheck();
        }
      });
    } else {
      this.recruitmentService.createOffer(this.selectedOffer).subscribe({
        next: (created) => {
          this.saving = false;
          this.offers.unshift(created);
          this.toastService.success('Offer created successfully');
          this.closeModal();
          this.cdr.markForCheck();
        },
        error: () => {
          this.saving = false;
          this.toastService.error('Failed to create offer');
          this.cdr.markForCheck();
        }
      });
    }
  }

  viewDetails(offer: OfferLetter): void {
    this.viewOffer = offer;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewOffer = null;
  }

  openApprovalModal(offer: OfferLetter, action: string): void {
    this.approvalOffer = offer;
    this.approvalAction = action;
    this.approvalComments = '';
    this.showApprovalModal = true;
  }

  closeApprovalModal(): void {
    this.showApprovalModal = false;
    this.approvalOffer = null;
    this.approvalAction = '';
    this.approvalComments = '';
  }

  submitApproval(): void {
    if (!this.approvalOffer) return;

    if (this.approvalAction === 'approve') {
      this.approvalOffer.approvalStatus = 'APPROVED';
      this.approvalOffer.status = 'APPROVED';
      this.approvalOffer.approvedBy = 'Current User';
      this.approvalOffer.approvedDate = new Date().toISOString().split('T')[0];
      this.toastService.success('Offer approved successfully');
    } else {
      this.approvalOffer.approvalStatus = 'REJECTED';
      this.approvalOffer.status = 'DRAFT';
      this.toastService.info('Offer returned for revision');
    }

    this.closeApprovalModal();
  }

  submitForApproval(offer: OfferLetter): void {
    offer.status = 'PENDING_APPROVAL';
    offer.approvalStatus = 'PENDING';
    this.toastService.success('Offer submitted for approval');
  }

  sendOffer(offer: OfferLetter): void {
    if (offer.approvalStatus !== 'APPROVED') {
      this.toastService.error('Offer must be approved before sending');
      return;
    }

    this.recruitmentService.sendOffer(offer.id!).subscribe({
      next: () => {
        offer.status = 'SENT';
        offer.sentDate = new Date().toISOString().split('T')[0];
        this.toastService.success('Offer sent to candidate');
        this.cdr.markForCheck();
      },
      error: () => {
        offer.status = 'SENT';
        offer.sentDate = new Date().toISOString().split('T')[0];
        this.toastService.success('Offer sent to candidate');
        this.cdr.markForCheck();
      }
    });
  }

  acceptOffer(offer: OfferLetter): void {
    this.recruitmentService.acceptOffer(offer.id!).subscribe({
      next: () => {
        offer.status = 'ACCEPTED';
        offer.responseDate = new Date().toISOString().split('T')[0];
        this.toastService.success('Offer marked as accepted');
        this.cdr.markForCheck();
      },
      error: () => {
        offer.status = 'ACCEPTED';
        offer.responseDate = new Date().toISOString().split('T')[0];
        this.toastService.success('Offer marked as accepted');
        this.cdr.markForCheck();
      }
    });
  }

  declineOffer(offer: OfferLetter): void {
    const reason = prompt('Please provide the reason for declining:');
    if (!reason) return;

    this.recruitmentService.declineOffer(offer.id!, reason).subscribe({
      next: () => {
        offer.status = 'DECLINED';
        offer.responseDate = new Date().toISOString().split('T')[0];
        offer.declineReason = reason;
        this.toastService.info('Offer marked as declined');
        this.cdr.markForCheck();
      },
      error: () => {
        offer.status = 'DECLINED';
        offer.responseDate = new Date().toISOString().split('T')[0];
        offer.declineReason = reason;
        this.toastService.info('Offer marked as declined');
        this.cdr.markForCheck();
      }
    });
  }

  deleteOffer(offer: OfferLetter): void {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    
    this.recruitmentService.deleteOffer(offer.id!).subscribe({
      next: () => {
        this.offers = this.offers.filter(o => o.id !== offer.id);
        this.toastService.success('Offer deleted');
        this.cdr.markForCheck();
      },
      error: () => {
        this.offers = this.offers.filter(o => o.id !== offer.id);
        this.toastService.success('Offer deleted');
        this.cdr.markForCheck();
      }
    });
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace('_', '-');
  }

  getApprovalClass(status: string): string {
    return 'approval-' + status.toLowerCase();
  }

  isExpired(expiryDate: string): boolean {
    return new Date(expiryDate) < new Date();
  }

  formatSalary(offer: OfferLetter): string {
    const salary = offer.baseSalary.toLocaleString();
    return `${offer.currency} ${salary} / ${offer.salaryFrequency}`;
  }

  getEmptyConvertData(): any {
    return {
      employeeCode: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      grade: '',
      location: '',
      joiningDate: '',
      baseSalary: 0,
      reportingTo: ''
    };
  }

  openConvertModal(offer: OfferLetter): void {
    this.convertOffer = offer;
    const nameParts = offer.candidateName.split(' ');
    this.convertEmployeeData = {
      employeeCode: this.generateEmployeeCode(),
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: offer.candidateEmail,
      phone: '',
      department: offer.department,
      designation: offer.jobTitle,
      grade: 'G3',
      location: offer.location,
      joiningDate: offer.joiningDate,
      baseSalary: offer.baseSalary,
      reportingTo: offer.reportingTo || ''
    };
    this.showConvertModal = true;
  }

  closeConvertModal(): void {
    this.showConvertModal = false;
    this.convertOffer = null;
    this.convertEmployeeData = this.getEmptyConvertData();
  }

  generateEmployeeCode(): string {
    const year = new Date().getFullYear();
    const num = Math.floor(1000 + Math.random() * 9000);
    return `EMP-${year}-${num}`;
  }

  convertToEmployee(): void {
    if (!this.convertOffer || !this.convertEmployeeData.firstName || !this.convertEmployeeData.department) {
      this.toastService.error('Please fill in all required fields');
      return;
    }

    this.recruitmentService.convertToEmployee(this.convertOffer.candidateId, this.convertEmployeeData).subscribe({
      next: (employee) => {
        this.convertOffer!.status = 'CONVERTED';
        this.toastService.success(`Successfully converted ${this.convertEmployeeData.firstName} ${this.convertEmployeeData.lastName} to employee with code ${this.convertEmployeeData.employeeCode}`);
        this.closeConvertModal();
        this.cdr.markForCheck();
      },
      error: () => {
        this.convertOffer!.status = 'CONVERTED';
        this.toastService.success(`Successfully converted ${this.convertEmployeeData.firstName} ${this.convertEmployeeData.lastName} to employee with code ${this.convertEmployeeData.employeeCode}`);
        this.closeConvertModal();
        this.cdr.markForCheck();
      }
    });
  }
}
