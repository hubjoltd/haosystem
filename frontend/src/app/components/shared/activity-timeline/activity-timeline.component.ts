import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ActivityItem {
  id?: number;
  action: string;
  performedBy?: any;
  performedAt?: string;
  remarks?: string;
  oldStatus?: string;
  newStatus?: string;
  type?: string;
}

@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activity-timeline.component.html',
  styleUrls: ['./activity-timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityTimelineComponent {
  @Input() activities: ActivityItem[] = [];
  @Input() loading = false;
  @Input() showAddNote = true;
  @Input() title = 'Activity Stream';
  @Output() addNote = new EventEmitter<string>();

  newNote = '';
  submitting = false;

  constructor(private cdr: ChangeDetectorRef) {}

  submitNote(): void {
    if (!this.newNote.trim() || this.submitting) return;
    this.submitting = true;
    this.addNote.emit(this.newNote.trim());
    this.newNote = '';
    this.submitting = false;
    this.cdr.markForCheck();
  }

  getActionIcon(action: string): string {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('created') || actionLower.includes('submitted')) return 'fas fa-plus-circle';
    if (actionLower.includes('approved')) return 'fas fa-check-circle';
    if (actionLower.includes('rejected')) return 'fas fa-times-circle';
    if (actionLower.includes('cancelled')) return 'fas fa-ban';
    if (actionLower.includes('note') || actionLower.includes('comment')) return 'fas fa-comment';
    if (actionLower.includes('pending')) return 'fas fa-clock';
    if (actionLower.includes('manager')) return 'fas fa-user-tie';
    if (actionLower.includes('hr')) return 'fas fa-users';
    return 'fas fa-info-circle';
  }

  getActionClass(action: string): string {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('approved')) return 'approved';
    if (actionLower.includes('rejected')) return 'rejected';
    if (actionLower.includes('cancelled')) return 'cancelled';
    if (actionLower.includes('pending')) return 'pending';
    if (actionLower.includes('note') || actionLower.includes('comment')) return 'note';
    return 'default';
  }

  formatDateTime(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)}w ago`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)}mo ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getPerformerName(performer: any): string {
    if (!performer) return 'System';
    if (typeof performer === 'string') return performer;
    return `${performer.firstName || ''} ${performer.lastName || ''}`.trim() || performer.username || 'User';
  }

  getPerformerInitial(performer: any): string {
    const name = this.getPerformerName(performer);
    return name.charAt(0).toUpperCase();
  }
}
