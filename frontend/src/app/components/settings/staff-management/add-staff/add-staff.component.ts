import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

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

  staff = {
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    isAdmin: false,
    isStaffMember: true,
    phone: '',
    hourlyRate: 0,
    profileImage: ''
  };

  roles: string[] = ['Admin', 'Manager', 'Staff', 'Viewer', 'Ganesh'];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.staffId = parseInt(id);
    }
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  saveStaff() {
    if (!this.staff.firstName.trim() || !this.staff.lastName.trim()) {
      alert('First name and last name are required');
      return;
    }

    if (!this.staff.email.trim()) {
      alert('Email is required');
      return;
    }

    this.router.navigate(['/app/settings/staff']);
  }

  cancel() {
    this.router.navigate(['/app/settings/staff']);
  }
}
