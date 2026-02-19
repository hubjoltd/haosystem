import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number | null;
  message: string;
  timestamp: Date;
  read: boolean;
  isOwn: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  attachmentType?: 'image' | 'document' | null;
  attachmentUrl?: string;
  attachmentName?: string;
}

interface ChatUser {
  id: number;
  name: string;
  employeeCode?: string;
  avatar: string;
  online: boolean;
  lastSeen?: Date;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, TranslateModule],
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
  selectedFile: File | null = null;
  
  activeTab: 'chats' | 'contacts' = 'chats';
  loading: boolean = false;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' = 'disconnected';
  isTyping: boolean = false;
  typingUser: string = '';
  showNewChatModal: boolean = false;
  contactSearchQuery: string = '';

  private subscriptions: Subscription[] = [];
  private notificationSound: HTMLAudioElement | null = null;
  private notificationPermission: NotificationPermission = 'default';
  private pollingTimer: any = null;
  private lastMessageId: number = 0;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUserId = (user as any).userId || (user as any).id || 1;
      this.currentUserName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
    }
    
    this.initNotifications();
    this.loadUsers();
    this.startPolling();
  }

  private initNotifications(): void {
    this.createNotificationSound();
    
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
      if (this.notificationPermission === 'default') {
        Notification.requestPermission().then(permission => {
          this.notificationPermission = permission;
        });
      }
    }
  }

  private createNotificationSound(): void {
    try {
      const base64Sound = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYZANQEzAAAAAAD/+1DEAAAFkANf9AAAIhIgaI8wYABEREREREREMQxDEMQxDEMQxDEMQxDEMQxDEMQxDEMQxDEMQ0RE/8QxDEMQ0REREf/EREREf//xEREREf///xEREf////8RERH/////8RERERERERERERERERERERERERERERERERERET//xEREf///////xERERERERH///////ERERERERERERERERERET//8RH///+IiP///8RH////iIj///8RH///+IiP///////xE//tQxAwAAADSAAAAAAAAANIAAAAARERERERERERET/xERERERERERH/8RERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERf/8REX//ERF//xERf/8RH//EREREREREREREREf/8REf/8REf/8REf/8REf/8REf/8REf//EREREf/8RERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERER';
      
      this.notificationSound = new Audio(base64Sound);
      this.notificationSound.volume = 0.6;
    } catch (e) {
      this.notificationSound = null;
    }
  }

  private audioContext: AudioContext | null = null;

  private playBeepSound(): void {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(660, this.audioContext.currentTime + 0.1);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (e) {
    }
  }

  private playNotificationSound(): void {
    this.playBeepSound();
    if (this.notificationSound) {
      this.notificationSound.currentTime = 0;
      this.notificationSound.play().catch(() => {});
    }
  }

  private showBrowserNotification(title: string, body: string): void {
    if (this.notificationPermission === 'granted' && document.hidden) {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'chat-message',
        requireInteraction: false
      });
      setTimeout(() => notification.close(), 5000);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.stopPolling();
  }

  private startPolling(): void {
    this.connectionStatus = 'connected';
    this.cdr.markForCheck();
    
    this.pollingTimer = setInterval(() => {
      this.pollUnreadCounts();
      if (this.selectedUser) {
        this.pollNewMessages();
      }
    }, 3000);
  }

  private stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  private pollUnreadCounts(): void {
    this.http.get<any>('/api/chat/unread').subscribe({
      next: (result) => {
        if (result && typeof result.count === 'number') {
          if (result.count === 0) {
            let changed = false;
            for (const user of this.users) {
              if (user.unreadCount > 0) {
                user.unreadCount = 0;
                changed = true;
              }
            }
            if (changed) this.cdr.markForCheck();
          } else {
            for (const user of this.users) {
              if (this.selectedUser && user.id === this.selectedUser.id) continue;
              this.http.get<any>(`/api/chat/unread/${user.id}`).subscribe({
                next: (unreadResult) => {
                  if (unreadResult && typeof unreadResult.count === 'number') {
                    const prevCount = user.unreadCount;
                    user.unreadCount = unreadResult.count;
                    if (unreadResult.count !== prevCount) {
                      this.cdr.markForCheck();
                    }
                  }
                }
              });
            }
          }
        }
      }
    });
  }

  private pollNewMessages(): void {
    if (!this.selectedUser) return;

    this.http.get<any[]>(`/api/chat/messages/${this.selectedUser.id}`).subscribe({
      next: (serverMessages) => {
        if (!serverMessages || serverMessages.length === 0) return;
        
        let hasNew = false;
        const existingIds = new Set(this.messages.map(m => m.id));
        
        for (const m of serverMessages) {
          if (!existingIds.has(m.id)) {
            const isOwn = m.senderId === this.currentUserId;
            const chatMessage: ChatMessage = {
              id: m.id,
              senderId: m.senderId,
              senderName: m.senderName,
              receiverId: m.receiverId,
              message: m.message,
              timestamp: new Date(m.timestamp),
              read: isOwn ? m.read : true,
              isOwn: isOwn,
              status: isOwn ? 'delivered' : undefined
            };
            this.messages.push(chatMessage);
            hasNew = true;
            
            if (!isOwn) {
              this.playNotificationSound();
              this.showBrowserNotification(m.senderName, m.message.substring(0, 100));
            }
          }
        }
        
        if (hasNew) {
          this.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          
          if (this.selectedUser) {
            const lastMsg = serverMessages[serverMessages.length - 1];
            if (lastMsg) {
              this.selectedUser.lastMessage = lastMsg.message?.substring(0, 50) || '';
              this.selectedUser.lastMessageTime = new Date(lastMsg.timestamp);
            }
          }
          
          this.cdr.markForCheck();
          setTimeout(() => this.scrollToBottom(), 100);
        }
      },
      error: () => {}
    });
  }

  loadUsers(): void {
    this.http.get<any[]>('/api/employees').subscribe({
      next: (employees) => {
        if (employees && employees.length > 0) {
          this.users = employees
            .filter(e => e.id !== this.currentUserId)
            .map(e => ({
              id: e.id,
              name: `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.email || 'Unknown',
              employeeCode: e.employeeCode,
              avatar: this.getInitials(e.firstName, e.lastName),
              online: false,
              lastMessage: '',
              unreadCount: 0
            }));
          if (this.users.length === 0 && employees.length > 0) {
            this.users = employees.map(e => ({
              id: e.id,
              name: `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.email || 'Unknown',
              employeeCode: e.employeeCode,
              avatar: this.getInitials(e.firstName, e.lastName),
              online: false,
              lastMessage: '',
              unreadCount: 0
            }));
          }
          this.cdr.markForCheck();
        } else {
          this.loadUsersFromUsersEndpoint();
        }
      },
      error: () => {
        this.loadUsersFromUsersEndpoint();
      }
    });
  }

  private loadUsersFromUsersEndpoint(): void {
    this.http.get<any[]>('/api/users').subscribe({
      next: (users) => {
        if (!users || users.length === 0) {
          this.users = [];
          this.cdr.markForCheck();
          return;
        }
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
        if (this.users.length === 0 && users.length > 0) {
          this.users = users.map(u => ({
            id: u.id,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username,
            employeeCode: u.employeeCode || u.employee?.employeeCode,
            avatar: this.getInitials(u.firstName, u.lastName),
            online: false,
            lastMessage: '',
            unreadCount: 0
          }));
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.users = [];
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
    this.messages = [];
    this.cdr.markForCheck();

    this.http.post('/api/chat/read', { senderId: userId }).subscribe();

    this.http.get<any[]>(`/api/chat/messages/${userId}`).subscribe({
      next: (messages) => {
        const uniqueMessages = new Map<number, ChatMessage>();
        messages.forEach(m => {
          uniqueMessages.set(m.id, {
            id: m.id,
            senderId: m.senderId,
            senderName: m.senderName,
            receiverId: m.receiverId,
            message: m.message,
            timestamp: new Date(m.timestamp),
            read: m.read,
            isOwn: m.senderId === this.currentUserId,
            status: m.senderId === this.currentUserId ? 'delivered' : undefined
          });
        });
        this.messages = Array.from(uniqueMessages.values());
        this.loading = false;
        this.cdr.markForCheck();
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: () => {
        this.messages = [];
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  sendMessage(): void {
    if ((!this.newMessage.trim() && !this.selectedFile) || !this.selectedUser) return;

    let messageText = this.newMessage.trim();
    
    if (this.selectedFile) {
      const reader = new FileReader();
      const fileName = this.selectedFile.name;
      const fileType = this.getAttachmentType(fileName);
      
      reader.onload = (e) => {
        const fileData = e.target?.result as string;
        this.sendMessageWithContent(messageText || '', fileData, fileName, fileType);
        this.selectedFile = null;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.sendMessageWithContent(messageText);
    }
  }

  private getAttachmentType(filename: string): 'image' | 'document' {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '')) {
      return 'image';
    }
    return 'document';
  }

  private sendMessageWithContent(content: string, attachmentData?: string, attachmentName?: string, attachmentType?: 'image' | 'document'): void {
    if (!this.selectedUser) return;
    
    const tempId = Date.now();
    const message: ChatMessage = {
      id: tempId,
      senderId: this.currentUserId,
      senderName: this.currentUserName,
      receiverId: this.selectedUser.id,
      message: content,
      timestamp: new Date(),
      read: false,
      isOwn: true,
      status: 'sending',
      attachmentType: attachmentType || null,
      attachmentUrl: attachmentData,
      attachmentName: attachmentName
    };

    this.messages.push(message);
    this.selectedUser.lastMessage = attachmentName ? `📎 ${attachmentName}` : content.substring(0, 50);
    this.selectedUser.lastMessageTime = new Date();
    this.newMessage = '';
    this.cdr.markForCheck();

    setTimeout(() => this.scrollToBottom(), 100);

    const payload: any = {
      senderId: this.currentUserId,
      senderName: this.currentUserName,
      receiverId: this.selectedUser.id,
      message: content,
      timestamp: new Date()
    };
    if (attachmentData) {
      payload.attachmentData = attachmentData;
      payload.attachmentName = attachmentName;
      payload.attachmentType = attachmentType;
    }
    
    this.http.post<any>('/api/chat/messages', payload).subscribe({
      next: (savedMsg) => {
        message.status = 'delivered';
        if (savedMsg && savedMsg.id) {
          message.id = savedMsg.id;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to send message:', err);
        message.status = 'sent';
        this.cdr.markForCheck();
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.error('File size must be less than 5MB');
        input.value = '';
        return;
      }
      this.selectedFile = file;
      this.cdr.markForCheck();
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.cdr.markForCheck();
  }

  getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'fa-file-pdf';
      case 'doc':
      case 'docx': return 'fa-file-word';
      case 'xls':
      case 'xlsx': return 'fa-file-excel';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'fa-file-image';
      default: return 'fa-file';
    }
  }

  onTyping(): void {
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

  get filteredContacts(): ChatUser[] {
    if (!this.contactSearchQuery.trim()) return this.users;
    const query = this.contactSearchQuery.toLowerCase();
    return this.users.filter(u => 
      u.name.toLowerCase().includes(query) || 
      (u.employeeCode && u.employeeCode.toLowerCase().includes(query))
    );
  }

  startNewChat(user: ChatUser): void {
    this.showNewChatModal = false;
    this.contactSearchQuery = '';
    this.selectUser(user);
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

  getLastSeenText(user: ChatUser): string {
    if (!user.lastSeen) return 'Offline';
    const now = new Date();
    const lastSeen = new Date(user.lastSeen);
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Last seen just now';
    if (diffMins < 60) return `Last seen ${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Last seen ${diffHours}h ago`;
    
    return `Last seen ${lastSeen.toLocaleDateString()}`;
  }

  openImagePreview(imageUrl: string): void {
    window.open(imageUrl, '_blank');
  }

  formatLastMessageTime(date: Date | undefined): string {
    if (!date) return '';
    const now = new Date();
    const msgDate = new Date(date);
    
    if (msgDate.toDateString() === now.toDateString()) {
      return msgDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
