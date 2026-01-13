import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { WebSocketService, ChatMessagePayload } from '../../services/websocket.service';

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
  employeeCode?: string;
  avatar: string;
  online: boolean;
  lastMessage?: string;
  unreadCount: number;
}

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
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
  connectionStatus: 'connected' | 'connecting' | 'disconnected' = 'disconnected';
  isTyping: boolean = false;
  typingUser: string = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private websocketService: WebSocketService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUserId = (user as any).id || 1;
      this.currentUserName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
    }
    
    this.loadUsers();
    this.initializeWebSocket();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.websocketService.disconnect();
  }

  private initializeWebSocket(): void {
    this.websocketService.connect(this.currentUserId);

    const connectionSub = this.websocketService.connectionStatus.subscribe(status => {
      this.connectionStatus = status;
      this.cdr.markForCheck();
    });
    this.subscriptions.push(connectionSub);

    const messageSub = this.websocketService.incomingMessages.subscribe(message => {
      this.handleIncomingMessage(message);
    });
    this.subscriptions.push(messageSub);

    const typingSub = this.websocketService.typingIndicator.subscribe(typing => {
      if (this.selectedUser && typing.userId === this.selectedUser.id) {
        this.isTyping = typing.isTyping;
        this.typingUser = typing.userName;
        this.cdr.markForCheck();
        
        if (typing.isTyping) {
          setTimeout(() => {
            this.isTyping = false;
            this.cdr.markForCheck();
          }, 3000);
        }
      }
    });
    this.subscriptions.push(typingSub);

    const statusSub = this.websocketService.userOnlineStatus.subscribe(status => {
      const user = this.users.find(u => u.id === status.userId);
      if (user) {
        user.online = status.online;
        this.cdr.markForCheck();
      }
    });
    this.subscriptions.push(statusSub);
  }

  private handleIncomingMessage(message: ChatMessagePayload): void {
    if (this.selectedUser && message.senderId === this.selectedUser.id) {
      const chatMessage: ChatMessage = {
        id: message.id,
        senderId: message.senderId,
        senderName: message.senderName,
        receiverId: message.receiverId,
        message: message.message,
        timestamp: new Date(message.timestamp),
        read: true,
        isOwn: false
      };
      this.messages.push(chatMessage);
      this.websocketService.markAsRead(message.id, this.currentUserId);
      this.cdr.markForCheck();
      setTimeout(() => this.scrollToBottom(), 100);
    } else {
      const user = this.users.find(u => u.id === message.senderId);
      if (user) {
        user.unreadCount++;
        user.lastMessage = message.message;
        this.cdr.markForCheck();
      }
    }
  }

  loadUsers(): void {
    this.http.get<any[]>('/api/users').subscribe({
      next: (users) => {
        this.users = users
          .filter(u => u.id !== this.currentUserId)
          .map(u => ({
            id: u.id,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username,
            employeeCode: u.employeeCode || u.employee?.employeeCode,
            avatar: this.getInitials(u.firstName, u.lastName),
            online: false,
            lastMessage: '',
            unreadCount: 0
          }));
        this.cdr.markForCheck();
      },
      error: () => {
        this.users = [
          { id: 2, name: 'John Smith', employeeCode: 'EMP001', avatar: 'JS', online: true, lastMessage: 'Thanks for the update!', unreadCount: 2 },
          { id: 3, name: 'Sarah Johnson', employeeCode: 'EMP002', avatar: 'SJ', online: true, lastMessage: 'Meeting at 3pm?', unreadCount: 0 },
          { id: 4, name: 'Mike Wilson', employeeCode: 'EMP003', avatar: 'MW', online: false, lastMessage: 'Report submitted', unreadCount: 1 },
          { id: 5, name: 'Emily Davis', employeeCode: 'EMP004', avatar: 'ED', online: true, lastMessage: 'Sounds good!', unreadCount: 0 },
          { id: 6, name: 'HR Department', avatar: 'HR', online: true, lastMessage: 'Policy update attached', unreadCount: 3 }
        ];
        this.cdr.markForCheck();
      }
    });
  }

  private getInitials(firstName?: string, lastName?: string): string {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  }

  selectUser(user: ChatUser): void {
    this.selectedUser = user;
    user.unreadCount = 0;
    this.loadMessages(user.id);
  }

  loadMessages(userId: number): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.http.get<any[]>(`/api/chat/messages/${userId}`).subscribe({
      next: (messages) => {
        this.messages = messages.map(m => ({
          id: m.id,
          senderId: m.senderId,
          senderName: m.senderName,
          receiverId: m.receiverId,
          message: m.message,
          timestamp: new Date(m.timestamp),
          read: m.read,
          isOwn: m.senderId === this.currentUserId
        }));
        this.loading = false;
        this.cdr.markForCheck();
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: () => {
        this.messages = [
          { id: 1, senderId: userId, senderName: this.selectedUser?.name || '', receiverId: this.currentUserId, message: 'Hi, how are you?', timestamp: new Date(Date.now() - 3600000), read: true, isOwn: false },
          { id: 2, senderId: this.currentUserId, senderName: this.currentUserName, receiverId: userId, message: 'I\'m doing great, thanks for asking!', timestamp: new Date(Date.now() - 3000000), read: true, isOwn: true },
          { id: 3, senderId: userId, senderName: this.selectedUser?.name || '', receiverId: this.currentUserId, message: 'Did you get a chance to review the report?', timestamp: new Date(Date.now() - 2400000), read: true, isOwn: false },
          { id: 4, senderId: this.currentUserId, senderName: this.currentUserName, receiverId: userId, message: 'Yes, I reviewed it. Looks good!', timestamp: new Date(Date.now() - 1800000), read: true, isOwn: true },
          { id: 5, senderId: userId, senderName: this.selectedUser?.name || '', receiverId: this.currentUserId, message: this.selectedUser?.lastMessage || 'Thanks!', timestamp: new Date(Date.now() - 600000), read: true, isOwn: false }
        ];
        this.loading = false;
        this.cdr.markForCheck();
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedUser) return;

    const messagePayload: ChatMessagePayload = {
      id: Date.now(),
      senderId: this.currentUserId,
      senderName: this.currentUserName,
      receiverId: this.selectedUser.id,
      message: this.newMessage.trim(),
      timestamp: new Date()
    };

    this.websocketService.sendMessage(messagePayload);

    const message: ChatMessage = {
      id: messagePayload.id,
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

    this.http.post('/api/chat/messages', messagePayload).subscribe({
      error: (err) => console.error('Failed to persist message:', err)
    });
  }

  onTyping(): void {
    if (this.selectedUser) {
      this.websocketService.sendTypingStatus(
        this.currentUserId,
        this.currentUserName,
        true,
        this.selectedUser.id
      );
    }
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
    return this.users.filter(u => 
      u.name.toLowerCase().includes(query) || 
      (u.employeeCode && u.employeeCode.toLowerCase().includes(query))
    );
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

  getConnectionStatusClass(): string {
    switch (this.connectionStatus) {
      case 'connected': return 'status-connected';
      case 'connecting': return 'status-connecting';
      default: return 'status-disconnected';
    }
  }

  getConnectionStatusText(): string {
    switch (this.connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      default: return 'Offline';
    }
  }
}
