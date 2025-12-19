import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-compensation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compensation.component.html',
  styleUrl: './compensation.component.scss'
})
export class CompensationComponent implements OnInit {
  activeTab = 'salary-bands';
  salaryBands: any[] = [];
  salaryRevisions: any[] = [];
  bonusIncentives: any[] = [];
  healthInsurance: any[] = [];
  dentalVision: any[] = [];
  allowances: any[] = [];
  enrollments: any[] = [];
  loading = false;
  showForm = false;
  formData: any = {};

  ngOnInit(): void {
    this.loadData();
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    this.showForm = false;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    setTimeout(() => { this.loading = false; }, 500);
  }

  openForm(): void {
    this.showForm = true;
    this.formData = {};
  }

  closeForm(): void {
    this.showForm = false;
    this.formData = {};
  }

  save(): void {
    alert(`Saved: ${JSON.stringify(this.formData)}`);
    this.closeForm();
  }
}
