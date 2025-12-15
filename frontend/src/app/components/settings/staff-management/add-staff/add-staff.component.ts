import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StaffService, Staff } from '../../../../services/staff.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-add-staff',
  standalone: false,
  templateUrl: './add-staff.component.html',
  styleUrls: ['./add-staff.component.scss']
})
export class AddStaffComponent implements OnInit {
  editMode: boolean = false;
  staffId: number | null = null;
  activeTab: string = 'profile';
  saving: boolean = false;

  staff: Staff = {
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    isAdmin: false,
    isStaffMember: true,
    phone: '',
    hourlyRate: 0,
    active: true
  };

  password: string = '';
  roles: any[] = [];

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private staffService: StaffService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.staffId = parseInt(id);
      this.loadStaff();
    }
  }

  loadRoles(): void {
    this.staffService.getRoles().subscribe({
      next: (data) => {
        console.log('Roles loaded:', data);
        this.roles = data;
      },
      error: (err) => {
        console.error('Error loading roles:', err);
        this.roles = [];
      }
    });
  }

  loadStaff(): void {
    if (this.staffId) {
      this.staffService.getById(this.staffId).subscribe({
        next: (data) => {
          this.staff = data;
        },
        error: (err) => {
          console.error('Error loading staff:', err);
        }
      });
    }
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  saveStaff(): void {
    if (!this.staff.firstName?.trim() || !this.staff.lastName?.trim()) {
      this.notificationService.error('First name and last name are required');
      return;
    }

    if (!this.staff.email?.trim()) {
      this.notificationService.error('Email is required');
      return;
    }

    if (!this.editMode && (!this.password || this.password.length < 6)) {
      this.notificationService.error('Password must be at least 6 characters');
      return;
    }

    this.saving = true;

    const staffData: any = { ...this.staff };
    if (!this.editMode && this.password) {
      staffData.password = this.password;
    }

    if (this.editMode && this.staffId) {
      this.staffService.update(this.staffId, this.staff).subscribe({
        next: () => {
          this.notificationService.success('Staff updated successfully');
          this.router.navigate(['/app/settings/staff']);
        },
        error: (err) => {
          this.notificationService.error(err.error?.error || 'Error updating staff');
          this.saving = false;
        }
      });
    } else {
      this.staffService.create(staffData).subscribe({
        next: () => {
          this.notificationService.success('Staff created successfully');
          this.router.navigate(['/app/settings/staff']);
        },
        error: (err) => {
          this.notificationService.error(err.error?.error || 'Error creating staff');
          this.saving = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/app/settings/staff']);
  }
}
