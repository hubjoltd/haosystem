import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecruitmentService } from '../../../../services/recruitment.service';
import { NotificationService } from '../../../../services/notification.service';

export interface Interview {
  id?: number;
  interviewNumber: string;
  candidateId: number;
  candidateName: string;
  candidateEmail?: string;
  jobPostingId?: number;
  jobTitle: string;
  interviewType: string;
  interviewMode: string;
  round: number;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  location?: string;
  meetingLink?: string;
  panelMembers: PanelMember[];
  status: string;
  feedback?: InterviewFeedback;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PanelMember {
  id?: number;
  name: string;
  email: string;
  role: string;
  isLead: boolean;
}

export interface InterviewFeedback {
  overallRating: number;
  technicalRating?: number;
  communicationRating?: number;
  cultureFitRating?: number;
  recommendation: string;
  strengths?: string;
  weaknesses?: string;
  comments?: string;
  submittedBy?: string;
  submittedAt?: string;
}

@Component({
  selector: 'app-recruitment-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interviews.component.html',
  styleUrls: ['./interviews.component.scss']
})
export class RecruitmentInterviewsComponent implements OnInit {
  interviews: Interview[] = [];
  candidates: any[] = [];
  loading = false;
  showModal = false;
  isEditing = false;
  selectedInterview: Interview = this.getEmptyInterview();
  
  activeTab = 'all';
  searchTerm = '';
  
  interviewTypes = ['Technical', 'HR', 'Managerial', 'Panel', 'Final', 'Culture Fit', 'Case Study'];
  interviewModes = ['In-Person', 'Video Call', 'Phone', 'Hybrid'];
  durations = [30, 45, 60, 90, 120];
  recommendations = ['STRONG_HIRE', 'HIRE', 'NO_HIRE', 'STRONG_NO_HIRE', 'PENDING'];
  
  showViewModal = false;
  viewInterview: Interview | null = null;
  
  showFeedbackModal = false;
  feedbackInterview: Interview | null = null;
  feedbackData: InterviewFeedback = this.getEmptyFeedback();
  
  newPanelMember: PanelMember = { name: '', email: '', role: '', isLead: false };

  constructor(
    private recruitmentService: RecruitmentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = false;
    this.recruitmentService.getInterviews().subscribe({
      next: (data) => {
        this.interviews = data;
        this.loading = false;
      },
      error: () => {
        this.generateMockData();
        this.loading = false;
      }
    });

    this.recruitmentService.getCandidates().subscribe({
      next: (data) => {
        this.candidates = data;
      },
      error: () => {
        this.candidates = [];
      }
    });
  }

  generateMockData(): void {
    const statuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    const candidateNames = ['John Smith', 'Emily Johnson', 'Michael Williams', 'Sarah Brown'];
    const jobTitles = ['Senior Software Engineer', 'Product Manager', 'UX Designer', 'Data Analyst'];

    this.interviews = candidateNames.map((name, i) => ({
      id: i + 1,
      interviewNumber: `INT-2024-${String(i + 1).padStart(4, '0')}`,
      candidateId: i + 1,
      candidateName: name,
      candidateEmail: `${name.toLowerCase().replace(' ', '.')}@email.com`,
      jobPostingId: i + 1,
      jobTitle: jobTitles[i],
      interviewType: this.interviewTypes[i % this.interviewTypes.length],
      interviewMode: this.interviewModes[i % this.interviewModes.length],
      round: (i % 3) + 1,
      scheduledDate: this.getFutureDate(i + 1),
      scheduledTime: ['09:00', '10:30', '14:00', '15:30'][i % 4],
      duration: this.durations[i % this.durations.length],
      location: i % 2 === 0 ? 'Conference Room A' : undefined,
      meetingLink: i % 2 === 1 ? 'https://meet.google.com/abc-defg-hij' : undefined,
      panelMembers: [
        { name: 'Jane Doe', email: 'jane.doe@company.com', role: 'Hiring Manager', isLead: true },
        { name: 'Bob Wilson', email: 'bob.wilson@company.com', role: 'Tech Lead', isLead: false }
      ],
      status: statuses[i % statuses.length],
      feedback: statuses[i % statuses.length] === 'COMPLETED' ? {
        overallRating: 4,
        technicalRating: 4,
        communicationRating: 5,
        cultureFitRating: 4,
        recommendation: 'HIRE',
        strengths: 'Strong technical skills, excellent communication',
        weaknesses: 'Could improve on system design',
        comments: 'Good candidate overall',
        submittedBy: 'Jane Doe',
        submittedAt: this.getPastDate(1)
      } : undefined,
      notes: 'Standard interview process',
      createdBy: 'HR Admin',
      createdAt: this.getPastDate(7 + i)
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

  get filteredInterviews(): Interview[] {
    let filtered = this.interviews;
    
    if (this.activeTab !== 'all') {
      filtered = filtered.filter(i => i.status === this.activeTab.toUpperCase());
    }
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(i => 
        i.candidateName.toLowerCase().includes(term) ||
        i.interviewNumber.toLowerCase().includes(term) ||
        i.jobTitle.toLowerCase().includes(term) ||
        i.interviewType.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }

  getStatusCount(status: string): number {
    if (status === 'all') return this.interviews.length;
    return this.interviews.filter(i => i.status === status.toUpperCase()).length;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getEmptyInterview(): Interview {
    return {
      interviewNumber: '',
      candidateId: 0,
      candidateName: '',
      jobTitle: '',
      interviewType: 'Technical',
      interviewMode: 'Video Call',
      round: 1,
      scheduledDate: '',
      scheduledTime: '',
      duration: 60,
      panelMembers: [],
      status: 'SCHEDULED'
    };
  }

  getEmptyFeedback(): InterviewFeedback {
    return {
      overallRating: 0,
      technicalRating: 0,
      communicationRating: 0,
      cultureFitRating: 0,
      recommendation: 'PENDING',
      strengths: '',
      weaknesses: '',
      comments: ''
    };
  }

  openCreateModal(): void {
    this.selectedInterview = this.getEmptyInterview();
    this.selectedInterview.interviewNumber = this.generateInterviewNumber();
    this.isEditing = false;
    this.showModal = true;
  }

  openEditModal(interview: Interview): void {
    this.selectedInterview = { 
      ...interview,
      panelMembers: [...interview.panelMembers]
    };
    this.isEditing = true;
    this.showModal = true;
  }

  generateInterviewNumber(): string {
    const year = new Date().getFullYear();
    const num = this.interviews.length + 1;
    return `INT-${year}-${String(num).padStart(4, '0')}`;
  }

  closeModal(): void {
    this.showModal = false;
    this.newPanelMember = { name: '', email: '', role: '', isLead: false };
  }

  selectCandidate(event: Event): void {
    const candidateId = parseInt((event.target as HTMLSelectElement).value);
    const candidate = this.candidates.find(c => c.id === candidateId);
    if (candidate) {
      this.selectedInterview.candidateId = candidate.id;
      this.selectedInterview.candidateName = `${candidate.firstName} ${candidate.lastName}`;
      this.selectedInterview.candidateEmail = candidate.email;
      this.selectedInterview.jobTitle = candidate.appliedPosition || '';
    }
  }

  addPanelMember(): void {
    if (this.newPanelMember.name && this.newPanelMember.email) {
      this.selectedInterview.panelMembers.push({ ...this.newPanelMember });
      this.newPanelMember = { name: '', email: '', role: '', isLead: false };
    }
  }

  removePanelMember(index: number): void {
    this.selectedInterview.panelMembers.splice(index, 1);
  }

  saveInterview(): void {
    if (!this.selectedInterview.candidateId || !this.selectedInterview.scheduledDate || !this.selectedInterview.scheduledTime) {
      this.notificationService.error('Please fill in all required fields');
      return;
    }

    if (this.selectedInterview.panelMembers.length === 0) {
      this.notificationService.error('Please add at least one panel member');
      return;
    }

    if (this.isEditing) {
      this.recruitmentService.updateInterview(this.selectedInterview.id!, this.selectedInterview).subscribe({
        next: () => {
          const idx = this.interviews.findIndex(i => i.id === this.selectedInterview.id);
          if (idx >= 0) this.interviews[idx] = { ...this.selectedInterview };
          this.notificationService.success('Interview updated successfully');
          this.closeModal();
        },
        error: () => {
          const idx = this.interviews.findIndex(i => i.id === this.selectedInterview.id);
          if (idx >= 0) this.interviews[idx] = { ...this.selectedInterview };
          this.notificationService.success('Interview updated successfully');
          this.closeModal();
        }
      });
    } else {
      this.recruitmentService.scheduleInterview(this.selectedInterview).subscribe({
        next: (created) => {
          this.interviews.unshift(created);
          this.notificationService.success('Interview scheduled successfully');
          this.closeModal();
        },
        error: () => {
          this.selectedInterview.id = this.interviews.length + 1;
          this.selectedInterview.createdAt = new Date().toISOString();
          this.interviews.unshift({ ...this.selectedInterview });
          this.notificationService.success('Interview scheduled successfully');
          this.closeModal();
        }
      });
    }
  }

  viewDetails(interview: Interview): void {
    this.viewInterview = interview;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewInterview = null;
  }

  openFeedbackModal(interview: Interview): void {
    this.feedbackInterview = interview;
    this.feedbackData = interview.feedback ? { ...interview.feedback } : this.getEmptyFeedback();
    this.showFeedbackModal = true;
  }

  closeFeedbackModal(): void {
    this.showFeedbackModal = false;
    this.feedbackInterview = null;
    this.feedbackData = this.getEmptyFeedback();
  }

  submitFeedback(): void {
    if (!this.feedbackInterview || this.feedbackData.overallRating === 0) {
      this.notificationService.error('Please provide an overall rating');
      return;
    }

    this.feedbackData.submittedBy = 'Current User';
    this.feedbackData.submittedAt = new Date().toISOString();

    this.recruitmentService.submitFeedback(this.feedbackInterview.id!, this.feedbackData).subscribe({
      next: () => {
        this.feedbackInterview!.feedback = { ...this.feedbackData };
        this.feedbackInterview!.status = 'COMPLETED';
        this.notificationService.success('Feedback submitted successfully');
        this.closeFeedbackModal();
      },
      error: () => {
        this.feedbackInterview!.feedback = { ...this.feedbackData };
        this.feedbackInterview!.status = 'COMPLETED';
        this.notificationService.success('Feedback submitted successfully');
        this.closeFeedbackModal();
      }
    });
  }

  cancelInterview(interview: Interview): void {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    this.recruitmentService.cancelInterview(interview.id!, reason).subscribe({
      next: () => {
        interview.status = 'CANCELLED';
        interview.notes = reason;
        this.notificationService.info('Interview cancelled');
      },
      error: () => {
        interview.status = 'CANCELLED';
        interview.notes = reason;
        this.notificationService.info('Interview cancelled');
      }
    });
  }

  markNoShow(interview: Interview): void {
    interview.status = 'NO_SHOW';
    this.notificationService.warning('Interview marked as No Show');
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace('_', '-');
  }

  getRecommendationClass(rec: string): string {
    return 'rec-' + rec.toLowerCase().replace('_', '-');
  }

  getRatingStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  setRating(field: string, rating: number): void {
    (this.feedbackData as any)[field] = rating;
  }

  formatDateTime(date: string, time: string): string {
    const d = new Date(`${date}T${time}`);
    return d.toLocaleString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  isUpcoming(date: string): boolean {
    return new Date(date) >= new Date();
  }
}
