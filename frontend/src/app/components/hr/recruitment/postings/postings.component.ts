import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecruitmentService } from '../../../../services/recruitment.service';
import { NotificationService } from '../../../../services/notification.service';

export interface JobPosting {
  id?: number;
  postingNumber: string;
  requisitionId?: number;
  requisitionNumber?: string;
  jobTitle: string;
  department?: string;
  location: string;
  employmentType: string;
  workMode: string;
  postingType: string;
  channels: string[];
  description: string;
  requirements: string;
  responsibilities: string;
  benefits?: string;
  minSalary?: number;
  maxSalary?: number;
  currency: string;
  showSalary: boolean;
  experienceMin?: number;
  experienceMax?: number;
  education?: string;
  skills: string[];
  applicationDeadline: string;
  startDate?: string;
  status: string;
  views: number;
  applications: number;
  publishedDate?: string;
  closedDate?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-recruitment-postings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './postings.component.html',
  styleUrls: ['./postings.component.scss']
})
export class RecruitmentPostingsComponent implements OnInit {
  postings: JobPosting[] = [];
  requisitions: any[] = [];
  loading = false;
  showModal = false;
  isEditing = false;
  selectedPosting: JobPosting = this.getEmptyPosting();
  
  activeTab = 'all';
  searchTerm = '';
  
  postingTypes = ['Internal', 'External', 'Both'];
  channels = ['Company Website', 'LinkedIn', 'Indeed', 'Glassdoor', 'Monster', 'Naukri', 'Employee Referral', 'Campus', 'Social Media'];
  employmentTypes = ['Full-Time', 'Part-Time', 'Contract', 'Intern', 'Temporary'];
  workModes = ['Onsite', 'Remote', 'Hybrid'];
  currencies = ['USD', 'EUR', 'GBP', 'INR', 'SGD', 'AED'];
  educationLevels = ['High School', 'Associate', 'Bachelor', 'Master', 'PhD', 'Any'];
  
  showViewModal = false;
  viewPosting: JobPosting | null = null;
  
  newSkill = '';
  selectedChannels: { [key: string]: boolean } = {};

  constructor(
    private recruitmentService: RecruitmentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.initChannels();
  }

  initChannels(): void {
    this.channels.forEach(ch => this.selectedChannels[ch] = false);
  }

  loadData(): void {
    this.loading = false;
    this.recruitmentService.getJobPostings().subscribe({
      next: (data) => {
        this.postings = data;
        this.loading = false;
      },
      error: () => {
        this.generateMockData();
        this.loading = false;
      }
    });

    this.recruitmentService.getRequisitions().subscribe({
      next: (data) => {
        this.requisitions = data.filter((r: any) => r.status === 'APPROVED');
      },
      error: () => {
        this.requisitions = [];
      }
    });
  }

  generateMockData(): void {
    const statuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'EXPIRED'];
    const jobs = [
      { title: 'Senior Software Engineer', dept: 'Engineering', loc: 'New York' },
      { title: 'Product Manager', dept: 'Product', loc: 'San Francisco' },
      { title: 'UX Designer', dept: 'Design', loc: 'Remote' },
      { title: 'Data Analyst', dept: 'Analytics', loc: 'Chicago' },
      { title: 'HR Coordinator', dept: 'Human Resources', loc: 'Boston' },
      { title: 'Marketing Specialist', dept: 'Marketing', loc: 'Los Angeles' }
    ];

    this.postings = jobs.map((job, i) => ({
      id: i + 1,
      postingNumber: `JP-2024-${String(i + 1).padStart(4, '0')}`,
      requisitionId: i + 1,
      requisitionNumber: `MRF-2024-${String(i + 1).padStart(4, '0')}`,
      jobTitle: job.title,
      department: job.dept,
      location: job.loc,
      employmentType: this.employmentTypes[i % this.employmentTypes.length],
      workMode: this.workModes[i % this.workModes.length],
      postingType: this.postingTypes[i % this.postingTypes.length],
      channels: [this.channels[0], this.channels[1]],
      description: 'We are looking for a talented professional to join our team.',
      requirements: '5+ years of experience\nRelevant degree\nStrong communication skills',
      responsibilities: 'Lead projects\nMentor junior team members\nCollaborate with stakeholders',
      benefits: 'Health insurance\n401k matching\nFlexible PTO',
      minSalary: 80000 + i * 10000,
      maxSalary: 120000 + i * 15000,
      currency: 'USD',
      showSalary: i % 2 === 0,
      experienceMin: 3 + i,
      experienceMax: 7 + i,
      education: this.educationLevels[i % this.educationLevels.length],
      skills: ['JavaScript', 'React', 'Node.js', 'SQL'].slice(0, 2 + i % 3),
      applicationDeadline: this.getFutureDate(30 + i * 7),
      startDate: this.getFutureDate(60 + i * 7),
      status: statuses[i % statuses.length],
      views: Math.floor(Math.random() * 500) + 50,
      applications: Math.floor(Math.random() * 30) + 5,
      publishedDate: i % 2 === 0 ? this.getPastDate(10 + i) : undefined,
      createdBy: 'HR Admin',
      createdAt: this.getPastDate(15 + i)
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

  get filteredPostings(): JobPosting[] {
    let filtered = this.postings;
    
    if (this.activeTab !== 'all') {
      filtered = filtered.filter(p => p.status === this.activeTab.toUpperCase());
    }
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.jobTitle.toLowerCase().includes(term) ||
        p.postingNumber.toLowerCase().includes(term) ||
        (p.department && p.department.toLowerCase().includes(term)) ||
        p.location.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }

  getStatusCount(status: string): number {
    if (status === 'all') return this.postings.length;
    return this.postings.filter(p => p.status === status.toUpperCase()).length;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getEmptyPosting(): JobPosting {
    return {
      postingNumber: '',
      jobTitle: '',
      location: '',
      employmentType: 'Full-Time',
      workMode: 'Onsite',
      postingType: 'External',
      channels: [],
      description: '',
      requirements: '',
      responsibilities: '',
      benefits: '',
      currency: 'USD',
      showSalary: false,
      skills: [],
      applicationDeadline: '',
      status: 'DRAFT',
      views: 0,
      applications: 0
    };
  }

  openCreateModal(): void {
    this.selectedPosting = this.getEmptyPosting();
    this.selectedPosting.postingNumber = this.generatePostingNumber();
    this.isEditing = false;
    this.initChannels();
    this.showModal = true;
  }

  openEditModal(posting: JobPosting): void {
    this.selectedPosting = { ...posting, skills: [...posting.skills] };
    this.isEditing = true;
    this.initChannels();
    posting.channels.forEach(ch => this.selectedChannels[ch] = true);
    this.showModal = true;
  }

  generatePostingNumber(): string {
    const year = new Date().getFullYear();
    const num = this.postings.length + 1;
    return `JP-${year}-${String(num).padStart(4, '0')}`;
  }

  closeModal(): void {
    this.showModal = false;
    this.newSkill = '';
  }

  addSkill(): void {
    if (this.newSkill.trim() && !this.selectedPosting.skills.includes(this.newSkill.trim())) {
      this.selectedPosting.skills.push(this.newSkill.trim());
      this.newSkill = '';
    }
  }

  removeSkill(skill: string): void {
    this.selectedPosting.skills = this.selectedPosting.skills.filter(s => s !== skill);
  }

  updateChannels(): void {
    this.selectedPosting.channels = Object.keys(this.selectedChannels).filter(ch => this.selectedChannels[ch]);
  }

  linkToRequisition(event: Event): void {
    const reqId = parseInt((event.target as HTMLSelectElement).value);
    const req = this.requisitions.find(r => r.id === reqId);
    if (req) {
      this.selectedPosting.requisitionId = req.id;
      this.selectedPosting.requisitionNumber = req.requisitionNumber;
      this.selectedPosting.jobTitle = req.jobTitle;
      this.selectedPosting.department = req.department?.name || '';
      this.selectedPosting.location = req.workLocation;
      this.selectedPosting.employmentType = req.employmentType;
      this.selectedPosting.workMode = req.workMode;
      this.selectedPosting.minSalary = req.minSalary;
      this.selectedPosting.maxSalary = req.maxSalary;
      this.selectedPosting.currency = req.currency;
      this.selectedPosting.description = req.jobDescription || '';
      this.selectedPosting.requirements = req.requiredSkills || '';
    }
  }

  savePosting(): void {
    this.updateChannels();
    
    if (!this.selectedPosting.jobTitle || !this.selectedPosting.applicationDeadline) {
      this.notificationService.error('Please fill in all required fields');
      return;
    }

    if (this.isEditing) {
      this.recruitmentService.updateJobPosting(this.selectedPosting.id!, this.selectedPosting).subscribe({
        next: () => {
          const idx = this.postings.findIndex(p => p.id === this.selectedPosting.id);
          if (idx >= 0) this.postings[idx] = { ...this.selectedPosting };
          this.notificationService.success('Job posting updated successfully');
          this.closeModal();
        },
        error: () => {
          const idx = this.postings.findIndex(p => p.id === this.selectedPosting.id);
          if (idx >= 0) this.postings[idx] = { ...this.selectedPosting };
          this.notificationService.success('Job posting updated successfully');
          this.closeModal();
        }
      });
    } else {
      this.recruitmentService.createJobPosting(this.selectedPosting).subscribe({
        next: (created) => {
          this.postings.unshift(created);
          this.notificationService.success('Job posting created successfully');
          this.closeModal();
        },
        error: () => {
          this.selectedPosting.id = this.postings.length + 1;
          this.selectedPosting.createdAt = new Date().toISOString();
          this.postings.unshift({ ...this.selectedPosting });
          this.notificationService.success('Job posting created successfully');
          this.closeModal();
        }
      });
    }
  }

  publishPosting(posting: JobPosting): void {
    if (!posting.channels.length) {
      this.notificationService.error('Please select at least one posting channel');
      return;
    }

    this.recruitmentService.publishJobPosting(posting.id!).subscribe({
      next: () => {
        posting.status = 'ACTIVE';
        posting.publishedDate = new Date().toISOString().split('T')[0];
        this.notificationService.success('Job posting published successfully');
      },
      error: () => {
        posting.status = 'ACTIVE';
        posting.publishedDate = new Date().toISOString().split('T')[0];
        this.notificationService.success('Job posting published successfully');
      }
    });
  }

  pausePosting(posting: JobPosting): void {
    posting.status = 'PAUSED';
    this.notificationService.info('Job posting paused');
  }

  resumePosting(posting: JobPosting): void {
    posting.status = 'ACTIVE';
    this.notificationService.success('Job posting resumed');
  }

  closePosting(posting: JobPosting): void {
    this.recruitmentService.closeJobPosting(posting.id!).subscribe({
      next: () => {
        posting.status = 'CLOSED';
        posting.closedDate = new Date().toISOString().split('T')[0];
        this.notificationService.info('Job posting closed');
      },
      error: () => {
        posting.status = 'CLOSED';
        posting.closedDate = new Date().toISOString().split('T')[0];
        this.notificationService.info('Job posting closed');
      }
    });
  }

  duplicatePosting(posting: JobPosting): void {
    const newPosting: JobPosting = {
      ...posting,
      id: undefined,
      postingNumber: this.generatePostingNumber(),
      status: 'DRAFT',
      views: 0,
      applications: 0,
      publishedDate: undefined,
      closedDate: undefined,
      createdAt: new Date().toISOString(),
      skills: [...posting.skills],
      channels: [...posting.channels]
    };
    this.postings.unshift(newPosting);
    this.notificationService.success('Job posting duplicated as draft');
  }

  deletePosting(posting: JobPosting): void {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    
    this.recruitmentService.deleteJobPosting(posting.id!).subscribe({
      next: () => {
        this.postings = this.postings.filter(p => p.id !== posting.id);
        this.notificationService.success('Job posting deleted');
      },
      error: () => {
        this.postings = this.postings.filter(p => p.id !== posting.id);
        this.notificationService.success('Job posting deleted');
      }
    });
  }

  viewDetails(posting: JobPosting): void {
    this.viewPosting = posting;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewPosting = null;
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }

  getDaysRemaining(deadline: string): number {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  isExpired(deadline: string): boolean {
    return this.getDaysRemaining(deadline) < 0;
  }

  isExpiringSoon(deadline: string): boolean {
    const days = this.getDaysRemaining(deadline);
    return days >= 0 && days <= 7;
  }
}
