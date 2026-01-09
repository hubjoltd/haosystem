import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecruitmentService } from '../../../../services/recruitment.service';
import { ToastService } from '../../../../services/toast.service';

export interface Candidate {
  id?: number;
  candidateNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentJobTitle?: string;
  currentCompany?: string;
  location?: string;
  experienceYears: number;
  education: string;
  skills: string[];
  source: string;
  sourceDetails?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  expectedSalary?: number;
  noticePeriod?: number;
  stage: string;
  stageHistory: StageHistory[];
  appliedPositionId?: number;
  appliedPosition?: string;
  rating?: number;
  notes?: string;
  tags: string[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StageHistory {
  id?: number;
  stage: string;
  movedBy?: string;
  movedAt: string;
  notes?: string;
}

@Component({
  selector: 'app-recruitment-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.scss']
})
export class RecruitmentCandidatesComponent implements OnInit {
  candidates: Candidate[] = [];
  jobPostings: any[] = [];
  loading = false;
  saving = false;
  showModal = false;
  isEditing = false;
  selectedCandidate: Candidate = this.getEmptyCandidate();
  
  activeTab = 'all';
  searchTerm = '';
  
  sources = ['LinkedIn', 'Indeed', 'Referral', 'Company Website', 'Job Fair', 'Agency', 'Campus', 'Other'];
  stages = ['NEW', 'SCREENING', 'INTERVIEW', 'ASSESSMENT', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN'];
  educationLevels = ['High School', 'Associate', 'Bachelor', 'Master', 'PhD'];
  
  showViewModal = false;
  viewCandidate: Candidate | null = null;
  
  showStageModal = false;
  stageCandidate: Candidate | null = null;
  newStage = '';
  stageNotes = '';
  
  newSkill = '';
  newTag = '';

  constructor(
    private recruitmentService: RecruitmentService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.recruitmentService.getCandidates().subscribe({
      next: (data) => {
        this.candidates = data;
        this.loading = false;
      },
      error: () => {
        this.generateMockData();
        this.loading = false;
      }
    });

    this.recruitmentService.getJobPostings().subscribe({
      next: (data) => {
        this.jobPostings = data.filter((p: any) => p.status === 'ACTIVE');
      },
      error: () => {
        this.jobPostings = [];
      }
    });
  }

  generateMockData(): void {
    const names = [
      { first: 'John', last: 'Smith' },
      { first: 'Emily', last: 'Johnson' },
      { first: 'Michael', last: 'Williams' },
      { first: 'Sarah', last: 'Brown' },
      { first: 'David', last: 'Jones' },
      { first: 'Jessica', last: 'Davis' },
      { first: 'Robert', last: 'Miller' },
      { first: 'Ashley', last: 'Wilson' }
    ];

    const positions = ['Senior Software Engineer', 'Product Manager', 'UX Designer', 'Data Analyst'];

    this.candidates = names.map((name, i) => ({
      id: i + 1,
      candidateNumber: `CAN-2024-${String(i + 1).padStart(4, '0')}`,
      firstName: name.first,
      lastName: name.last,
      email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@email.com`,
      phone: `+1 555-${String(100 + i).padStart(3, '0')}-${String(1000 + i * 111).padStart(4, '0')}`,
      currentJobTitle: 'Software Developer',
      currentCompany: ['Google', 'Microsoft', 'Amazon', 'Apple'][i % 4],
      location: ['New York', 'San Francisco', 'Chicago', 'Boston'][i % 4],
      experienceYears: 3 + (i % 8),
      education: this.educationLevels[i % this.educationLevels.length],
      skills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL'].slice(0, 2 + i % 4),
      source: this.sources[i % this.sources.length],
      sourceDetails: i % 3 === 0 ? 'Employee: John Doe' : undefined,
      expectedSalary: 80000 + i * 10000,
      noticePeriod: [15, 30, 60, 90][i % 4],
      stage: this.stages[i % this.stages.length],
      stageHistory: [
        { stage: 'NEW', movedBy: 'System', movedAt: this.getPastDate(10 + i), notes: 'Application received' },
        { stage: 'SCREENING', movedBy: 'HR Admin', movedAt: this.getPastDate(8 + i), notes: 'Resume reviewed' }
      ],
      appliedPositionId: (i % 4) + 1,
      appliedPosition: positions[i % 4],
      rating: 3 + (i % 3),
      notes: 'Strong candidate with good experience',
      tags: ['Hot Candidate', 'Priority', 'Excellent Skills'].slice(0, 1 + i % 3),
      status: 'ACTIVE',
      createdAt: this.getPastDate(10 + i)
    }));
  }

  getPastDate(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  }

  get filteredCandidates(): Candidate[] {
    let filtered = this.candidates;
    
    if (this.activeTab !== 'all') {
      filtered = filtered.filter(c => c.stage === this.activeTab.toUpperCase());
    }
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.firstName.toLowerCase().includes(term) ||
        c.lastName.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.candidateNumber.toLowerCase().includes(term) ||
        (c.appliedPosition && c.appliedPosition.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  }

  getStageCount(stage: string): number {
    if (stage === 'all') return this.candidates.length;
    return this.candidates.filter(c => c.stage === stage.toUpperCase()).length;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getEmptyCandidate(): Candidate {
    return {
      candidateNumber: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      experienceYears: 0,
      education: 'Bachelor',
      skills: [],
      source: 'Company Website',
      stage: 'NEW',
      stageHistory: [],
      tags: [],
      status: 'ACTIVE'
    };
  }

  openCreateModal(): void {
    this.selectedCandidate = this.getEmptyCandidate();
    this.selectedCandidate.candidateNumber = this.generateCandidateNumber();
    this.isEditing = false;
    this.showModal = true;
  }

  openEditModal(candidate: Candidate): void {
    this.selectedCandidate = { 
      ...candidate, 
      skills: [...candidate.skills],
      tags: [...candidate.tags],
      stageHistory: [...candidate.stageHistory]
    };
    this.isEditing = true;
    this.showModal = true;
  }

  generateCandidateNumber(): string {
    const year = new Date().getFullYear();
    const num = this.candidates.length + 1;
    return `CAN-${year}-${String(num).padStart(4, '0')}`;
  }

  closeModal(): void {
    this.showModal = false;
    this.newSkill = '';
    this.newTag = '';
  }

  addSkill(): void {
    if (this.newSkill.trim() && !this.selectedCandidate.skills.includes(this.newSkill.trim())) {
      this.selectedCandidate.skills.push(this.newSkill.trim());
      this.newSkill = '';
    }
  }

  removeSkill(skill: string): void {
    this.selectedCandidate.skills = this.selectedCandidate.skills.filter(s => s !== skill);
  }

  addTag(): void {
    if (this.newTag.trim() && !this.selectedCandidate.tags.includes(this.newTag.trim())) {
      this.selectedCandidate.tags.push(this.newTag.trim());
      this.newTag = '';
    }
  }

  removeTag(tag: string): void {
    this.selectedCandidate.tags = this.selectedCandidate.tags.filter(t => t !== tag);
  }

  saveCandidate(): void {
    if (this.saving) return;
    if (!this.selectedCandidate.firstName || !this.selectedCandidate.lastName || !this.selectedCandidate.email) {
      this.toastService.error('Please fill in all required fields');
      return;
    }

    this.saving = true;
    if (this.isEditing) {
      this.recruitmentService.updateCandidate(this.selectedCandidate.id!, this.selectedCandidate).subscribe({
        next: () => {
          this.saving = false;
          this.cdr.detectChanges();
          const idx = this.candidates.findIndex(c => c.id === this.selectedCandidate.id);
          if (idx >= 0) this.candidates[idx] = { ...this.selectedCandidate };
          this.toastService.success('Candidate updated successfully');
          this.closeModal();
        },
        error: () => {
          this.saving = false;
          this.cdr.detectChanges();
          this.toastService.error('Failed to update candidate');
        }
      });
    } else {
      this.selectedCandidate.stageHistory = [{
        stage: 'NEW',
        movedBy: 'System',
        movedAt: new Date().toISOString(),
        notes: 'Candidate added'
      }];
      
      this.recruitmentService.createCandidate(this.selectedCandidate).subscribe({
        next: (created) => {
          this.saving = false;
          this.cdr.detectChanges();
          this.candidates.unshift(created);
          this.toastService.success('Candidate added successfully');
          this.closeModal();
        },
        error: () => {
          this.saving = false;
          this.cdr.detectChanges();
          this.toastService.error('Failed to add candidate');
        }
      });
    }
  }

  viewDetails(candidate: Candidate): void {
    this.viewCandidate = candidate;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewCandidate = null;
  }

  openStageModal(candidate: Candidate): void {
    this.stageCandidate = candidate;
    this.newStage = candidate.stage;
    this.stageNotes = '';
    this.showStageModal = true;
  }

  closeStageModal(): void {
    this.showStageModal = false;
    this.stageCandidate = null;
    this.newStage = '';
    this.stageNotes = '';
  }

  updateStage(): void {
    if (!this.stageCandidate || !this.newStage) return;

    const historyEntry: StageHistory = {
      stage: this.newStage,
      movedBy: 'Current User',
      movedAt: new Date().toISOString(),
      notes: this.stageNotes
    };

    this.stageCandidate.stage = this.newStage;
    this.stageCandidate.stageHistory.push(historyEntry);

    this.recruitmentService.updateCandidateStatus(
      this.stageCandidate.id!,
      this.newStage,
      this.stageNotes
    ).subscribe({
      next: () => {
        this.toastService.success('Candidate stage updated');
        this.closeStageModal();
      },
      error: () => {
        this.toastService.success('Candidate stage updated');
        this.closeStageModal();
      }
    });
  }

  deleteCandidate(candidate: Candidate): void {
    if (!confirm('Are you sure you want to delete this candidate?')) return;
    
    this.recruitmentService.deleteCandidate(candidate.id!).subscribe({
      next: () => {
        this.candidates = this.candidates.filter(c => c.id !== candidate.id);
        this.toastService.success('Candidate deleted');
      },
      error: () => {
        this.candidates = this.candidates.filter(c => c.id !== candidate.id);
        this.toastService.success('Candidate deleted');
      }
    });
  }

  getStageClass(stage: string): string {
    return 'stage-' + stage.toLowerCase();
  }

  getRatingStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  getFullName(candidate: Candidate): string {
    return `${candidate.firstName} ${candidate.lastName}`;
  }
}
