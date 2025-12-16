import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService, AttendanceRecord } from '../../../services/attendance.service';

@Component({
  selector: 'app-clock-in-out',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clock-in-out.component.html',
  styleUrls: ['./clock-in-out.component.scss']
})
export class ClockInOutComponent implements OnInit {
  currentTime: Date = new Date();
  todayRecord: AttendanceRecord | null = null;
  employees: any[] = [];
  selectedEmployeeId: number | null = null;
  loading = false;
  message = '';
  messageType = '';

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit(): void {
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  clockIn(): void {
    if (!this.selectedEmployeeId) {
      this.showMessage('Please select an employee', 'error');
      return;
    }
    this.loading = true;
    this.attendanceService.clockIn(this.selectedEmployeeId, 'WEB').subscribe({
      next: (record) => {
        this.todayRecord = record;
        this.showMessage('Clocked in successfully!', 'success');
        this.loading = false;
      },
      error: (err) => {
        this.showMessage(err.error?.error || 'Failed to clock in', 'error');
        this.loading = false;
      }
    });
  }

  clockOut(): void {
    if (!this.selectedEmployeeId) {
      this.showMessage('Please select an employee', 'error');
      return;
    }
    this.loading = true;
    this.attendanceService.clockOut(this.selectedEmployeeId).subscribe({
      next: (record) => {
        this.todayRecord = record;
        this.showMessage('Clocked out successfully!', 'success');
        this.loading = false;
      },
      error: (err) => {
        this.showMessage(err.error?.error || 'Failed to clock out', 'error');
        this.loading = false;
      }
    });
  }

  showMessage(msg: string, type: string): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}
