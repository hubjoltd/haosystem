import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { WebSocketService, ChatMessagePayload } from '../../services/websocket.service';
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

  constructor(
    private authService: AuthService,
    private websocketService: WebSocketService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUserId = (user as any).id || 1;
      this.currentUserName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
    }
    
    this.initNotifications();
    this.loadUsers();
    this.initializeWebSocket();
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
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      const duration = 0.15;
      const sampleRate = audioContext.sampleRate;
      const buffer = audioContext.createBuffer(1, sampleRate * duration * 2, sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        if (t < duration) {
          data[i] = Math.sin(2 * Math.PI * 880 * t) * Math.exp(-3 * t) * 0.5;
        } else {
          const t2 = t - duration;
          data[i] = Math.sin(2 * Math.PI * 660 * t2) * Math.exp(-3 * t2) * 0.5;
        }
      }
      
      this.notificationSound = new Audio();
      const offlineContext = new OfflineAudioContext(1, buffer.length, sampleRate);
      const source = offlineContext.createBufferSource();
      source.buffer = buffer;
      source.connect(offlineContext.destination);
      source.start();
      
      offlineContext.startRendering().then(renderedBuffer => {
        const wav = this.audioBufferToWav(renderedBuffer);
        const blob = new Blob([wav], { type: 'audio/wav' });
        this.notificationSound = new Audio(URL.createObjectURL(blob));
        this.notificationSound.volume = 0.5;
      }).catch(() => {});
    } catch (e) {
      this.notificationSound = null;
    }
  }

  private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const data = buffer.getChannelData(0);
    const dataLength = data.length * bytesPerSample;
    const headerLength = 44;
    const arrayBuffer = new ArrayBuffer(headerLength + dataLength);
    const view = new DataView(arrayBuffer);
    
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);
    
    let offset = 44;
    for (let i = 0; i < data.length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    
    return arrayBuffer;
  }

  private playNotificationSound(): void {
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
    if (this.messages.some(m => m.id === message.id)) {
      return;
    }

    this.playNotificationSound();
    this.showBrowserNotification(message.senderName, message.message.substring(0, 100));

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
        user.lastMessageTime = new Date(message.timestamp);
        this.toastService.info(`New message from ${message.senderName}: ${message.message.substring(0, 50)}${message.message.length > 50 ? '...' : ''}`);
        this.cdr.markForCheck();
      }
    }
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
    
    const messagePayload: ChatMessagePayload = {
      id: Date.now(),
      senderId: this.currentUserId,
      senderName: this.currentUserName,
      receiverId: this.selectedUser.id,
      message: content,
      timestamp: new Date()
    };

    this.websocketService.sendMessage(messagePayload);

    const message: ChatMessage = {
      id: messagePayload.id,
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

    const payload: any = { ...messagePayload };
    if (attachmentData) {
      payload.attachmentData = attachmentData;
      payload.attachmentName = attachmentName;
      payload.attachmentType = attachmentType;
    }
    
    this.http.post('/api/chat/messages', payload).subscribe({
      next: () => {
        message.status = 'sent';
        setTimeout(() => {
          message.status = 'delivered';
          this.cdr.markForCheck();
        }, 1000);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to persist message:', err);
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
