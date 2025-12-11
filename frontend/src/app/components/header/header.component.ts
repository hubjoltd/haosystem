import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  searchQuery: string = '';
  showNotifications: boolean = false;
  showProfile: boolean = false;

  notifications = [
    { id: 1, message: 'New order received', time: '5 min ago', read: false },
    { id: 2, message: 'Stock level low for Item #123', time: '1 hour ago', read: false },
    { id: 3, message: 'Contract renewal pending', time: '2 hours ago', read: true }
  ];

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showProfile = false;
  }

  toggleProfile() {
    this.showProfile = !this.showProfile;
    this.showNotifications = false;
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
}
