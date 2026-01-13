import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number | null;
  message: string;
  timestamp: Date;
  read: boolean;
  isOwn: boolean;
}

interface ChatUser {
  id: number;
  name: string;
  avatar: string;
  online: boolean;
  lastMessage?: string;
  unreadCount: number;
}

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-panel.component.html',
  styleUrls: ['./chat-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatPanelComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  currentUserId: number = 1;
  currentUserName: string = 'Admin';
  
  users: ChatUser[] = [];
  selectedUser: ChatUser | null = null;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  searchQuery: string = '';
  
  activeTab: 'chats' | 'contacts' = 'chats';
  loading: boolean = false;

  private messagePollingInterval: any;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUserId = (user as any).id || 1;
      this.currentUserName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
    }
    
    this.loadUsers();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadUsers(): void {
    this.users = [
      { id: 2, name: 'John Smith', avatar: 'JS', online: true, lastMessage: 'Thanks for the update!', unreadCount: 2 },
      { id: 3, name: 'Sarah Johnson', avatar: 'SJ', online: true, lastMessage: 'Meeting at 3pm?', unreadCount: 0 },
      { id: 4, name: 'Mike Wilson', avatar: 'MW', online: false, lastMessage: 'Report submitted', unreadCount: 1 },
      { id: 5, name: 'Emily Davis', avatar: 'ED', online: true, lastMessage: 'Sounds good!', unreadCount: 0 },
      { id: 6, name: 'HR Department', avatar: 'HR', online: true, lastMessage: 'Policy update attached', unreadCount: 3 }
    ];
    this.cdr.markForCheck();
  }

  selectUser(user: ChatUser): void {
    this.selectedUser = user;
    user.unreadCount = 0;
    this.loadMessages(user.id);
  }

  loadMessages(userId: number): void {
    this.loading = true;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.messages = [
        { id: 1, senderId: userId, senderName: this.selectedUser?.name || '', receiverId: this.currentUserId, message: 'Hi, how are you?', timestamp: new Date(Date.now() - 3600000), read: true, isOwn: false },
        { id: 2, senderId: this.currentUserId, senderName: this.currentUserName, receiverId: userId, message: 'I\'m doing great, thanks for asking!', timestamp: new Date(Date.now() - 3000000), read: true, isOwn: true },
        { id: 3, senderId: userId, senderName: this.selectedUser?.name || '', receiverId: this.currentUserId, message: 'Did you get a chance to review the report?', timestamp: new Date(Date.now() - 2400000), read: true, isOwn: false },
        { id: 4, senderId: this.currentUserId, senderName: this.currentUserName, receiverId: userId, message: 'Yes, I reviewed it. Looks good!', timestamp: new Date(Date.now() - 1800000), read: true, isOwn: true },
        { id: 5, senderId: userId, senderName: this.selectedUser?.name || '', receiverId: this.currentUserId, message: this.selectedUser?.lastMessage || 'Thanks!', timestamp: new Date(Date.now() - 600000), read: true, isOwn: false }
      ];
      this.loading = false;
      this.cdr.markForCheck();
    }, 300);
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedUser) return;

    const message: ChatMessage = {
      id: Date.now(),
      senderId: this.currentUserId,
      senderName: this.currentUserName,
      receiverId: this.selectedUser.id,
      message: this.newMessage.trim(),
      timestamp: new Date(),
      read: false,
      isOwn: true
    };

    this.messages.push(message);
    this.selectedUser.lastMessage = this.newMessage.trim();
    this.newMessage = '';
    this.cdr.markForCheck();

    setTimeout(() => this.scrollToBottom(), 100);
  }

  scrollToBottom(): void {
    const container = document.querySelector('.messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(date: Date): string {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  get filteredUsers(): ChatUser[] {
    if (!this.searchQuery.trim()) return this.users;
    const query = this.searchQuery.toLowerCase();
    return this.users.filter(u => u.name.toLowerCase().includes(query));
  }

  get totalUnread(): number {
    return this.users.reduce((sum, u) => sum + u.unreadCount, 0);
  }

  goBack(): void {
    this.selectedUser = null;
    this.messages = [];
    this.cdr.markForCheck();
  }

  closePanel(): void {
    this.close.emit();
  }

  private startPolling(): void {
    this.messagePollingInterval = setInterval(() => {
      this.cdr.markForCheck();
    }, 30000);
  }

  private stopPolling(): void {
    if (this.messagePollingInterval) {
      clearInterval(this.messagePollingInterval);
    }
  }
}
