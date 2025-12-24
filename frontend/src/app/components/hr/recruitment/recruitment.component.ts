import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RecruitmentService } from '../../../services/recruitment.service';

@Component({
  selector: 'app-recruitment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recruitment.component.html',
  styleUrl: './recruitment.component.scss'
})
export class RecruitmentComponent implements OnInit {
  activeTab = 'requisitions';
  requisitions: any[] = [];
  jobPostings: any[] = [];
  candidates: any[] = [];
  interviews: any[] = [];
  dashboard: any = {};
  loading = false;
  showForm = false;
  editingItem: any = null;
  formData: any = {};

  showPostingForm = false;
  postingData: any = {};
  approvedRequisitions: any[] = [];

  showCandidateForm = false;
  candidateData: any = {};
  activePostings: any[] = [];

  showInterviewForm = false;
  interviewData: any = {};
  allCandidates: any[] = [];

  constructor(
    private recruitmentService: RecruitmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadRequisitions();
  }

  loadDashboard(): void {
    this.recruitmentService.getDashboard().subscribe({
      next: (data) => this.dashboard = data,
      error: (err) => console.error('Error loading dashboard:', err)
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    this.showForm = false;
    switch (tab) {
      case 'requisitions': this.loadRequisitions(); break;
      case 'postings': this.loadJobPostings(); break;
      case 'candidates': this.loadCandidates(); break;
      case 'interviews': this.loadInterviews(); break;
    }
  }

  loadRequisitions(): void {
    this.loading = false;
    this.recruitmentService.getRequisitions().subscribe({
      next: (data) => { this.requisitions = data; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  loadJobPostings(): void {
    this.loading = false;
    this.recruitmentService.getJobPostings().subscribe({
      next: (data) => { this.jobPostings = data; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  loadCandidates(): void {
    this.loading = false;
    this.recruitmentService.getCandidates().subscribe({
      next: (data) => { this.candidates = data; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  loadInterviews(): void {
    this.loading = false;
    this.recruitmentService.getUpcomingInterviews().subscribe({
      next: (data) => { this.interviews = data; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  openForm(item?: any): void {
    this.editingItem = item || null;
    this.formData = item ? { ...item } : {};
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingItem = null;
    this.formData = {};
  }

  saveRequisition(): void {
    const obs = this.editingItem
      ? this.recruitmentService.updateRequisition(this.editingItem.id, this.formData)
      : this.recruitmentService.createRequisition(this.formData);
    obs.subscribe({
      next: () => { this.closeForm(); this.loadRequisitions(); },
      error: (err) => { console.error(err); alert('Error saving requisition'); }
    });
  }

  submitRequisition(id: number): void {
    if (confirm('Submit this requisition for approval?')) {
      this.recruitmentService.submitRequisition(id).subscribe({
        next: () => this.loadRequisitions(),
        error: (err) => console.error(err)
      });
    }
  }

  approveRequisition(id: number): void {
    if (confirm('Approve this requisition?')) {
      this.recruitmentService.approveRequisition(id, 1).subscribe({
        next: () => this.loadRequisitions(),
        error: (err) => console.error(err)
      });
    }
  }

  publishPosting(id: number): void {
    if (confirm('Publish this job posting?')) {
      this.recruitmentService.publishJobPosting(id).subscribe({
        next: () => this.loadJobPostings(),
        error: (err) => console.error(err)
      });
    }
  }

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleDateString() : '';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'DRAFT': 'bg-secondary', 'PENDING': 'bg-warning', 'APPROVED': 'bg-success',
      'ACTIVE': 'bg-primary', 'CLOSED': 'bg-dark', 'REJECTED': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  openPostingForm(): void {
    this.postingData = { postingType: 'EXTERNAL' };
    this.loadApprovedRequisitions();
    this.showPostingForm = true;
  }

  closePostingForm(): void {
    this.showPostingForm = false;
    this.postingData = {};
  }

  loadApprovedRequisitions(): void {
    this.recruitmentService.getRequisitions().subscribe({
      next: (data) => this.approvedRequisitions = data.filter((r: any) => r.status === 'APPROVED'),
      error: (err) => console.error(err)
    });
  }

  saveJobPosting(): void {
    this.recruitmentService.createJobPosting(this.postingData).subscribe({
      next: () => { this.closePostingForm(); this.loadJobPostings(); this.loadDashboard(); },
      error: (err) => { console.error(err); alert('Error creating job posting'); }
    });
  }

  openCandidateForm(): void {
    this.candidateData = {};
    this.loadActivePostings();
    this.showCandidateForm = true;
  }

  closeCandidateForm(): void {
    this.showCandidateForm = false;
    this.candidateData = {};
  }

  loadActivePostings(): void {
    this.recruitmentService.getActiveJobPostings().subscribe({
      next: (data) => this.activePostings = data,
      error: (err) => console.error(err)
    });
  }

  saveCandidate(): void {
    this.recruitmentService.createCandidate(this.candidateData).subscribe({
      next: () => { this.closeCandidateForm(); this.loadCandidates(); this.loadDashboard(); },
      error: (err) => { console.error(err); alert('Error adding candidate'); }
    });
  }

  openInterviewForm(): void {
    this.interviewData = { interviewType: 'PHONE', interviewMode: 'VIRTUAL' };
    this.loadAllCandidatesForForm();
    this.showInterviewForm = true;
  }

  loadAllCandidatesForForm(): void {
    this.recruitmentService.getCandidates().subscribe({
      next: (data) => this.allCandidates = data,
      error: (err) => console.error(err)
    });
  }

  closeInterviewForm(): void {
    this.showInterviewForm = false;
    this.interviewData = {};
  }

  saveInterview(): void {
    this.recruitmentService.scheduleInterview(this.interviewData).subscribe({
      next: () => { this.closeInterviewForm(); this.loadInterviews(); this.loadDashboard(); },
      error: (err) => { console.error(err); alert('Error scheduling interview'); }
    });
  }

  goToOffers(): void {
    this.router.navigate(['/app/hr/recruitment/offers']);
  }

  goToEmployees(): void {
    this.router.navigate(['/app/hr/employees']);
  }

  goToOnboarding(): void {
    this.router.navigate(['/app/hr/onboarding']);
  }
}
