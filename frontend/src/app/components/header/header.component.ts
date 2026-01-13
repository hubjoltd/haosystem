import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserNotificationService, UserNotification } from '../../services/user-notification.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

interface Language {
  code: string;
  name: string;
  flag: string;
  enabled: boolean;
}

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() openChatPanel = new EventEmitter<void>();

  searchQuery: string = '';
  showNotifications: boolean = false;
  showProfile: boolean = false;
  showLanguageMenu: boolean = false;
  showChat: boolean = false;

  notifications: UserNotification[] = [];
  unreadCount: number = 0;
  unreadChatCount: number = 0;
  currentUserName: string = 'User';
  currentLanguage: string = 'en';
  private pollSubscription?: Subscription;

  availableLanguages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸', enabled: true },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', enabled: true },
    { code: 'fr', name: 'French', flag: '🇫🇷', enabled: false },
    { code: 'de', name: 'German', flag: '🇩🇪', enabled: false },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', enabled: false },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', enabled: false },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', enabled: false },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', enabled: false }
  ];

  constructor(
    private userNotificationService: UserNotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUserName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.username;
    }
    
    this.loadLanguageSettings();
    this.loadNotifications();
    this.pollSubscription = this.userNotificationService.startPolling(30000).subscribe({
      next: (result) => {
        this.unreadCount = result.count;
        this.loadNotifications();
      },
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
  }

  loadLanguageSettings(): void {
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang) {
      this.currentLanguage = savedLang;
    }
    
    const enabledLangs = localStorage.getItem('enabledLanguages');
    if (enabledLangs) {
      try {
        const enabled = JSON.parse(enabledLangs);
        this.availableLanguages.forEach(lang => {
          lang.enabled = enabled.includes(lang.code);
        });
      } catch (e) {}
    }
  }

  loadNotifications(): void {
    this.userNotificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = data.filter(n => !n.read).length;
      },
      error: () => {
        this.notifications = [];
        this.unreadCount = 0;
      }
    });
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showProfile = false;
    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  toggleProfile() {
    this.showProfile = !this.showProfile;
    this.showNotifications = false;
    this.showLanguageMenu = false;
  }

  toggleLanguageMenu() {
    this.showLanguageMenu = !this.showLanguageMenu;
    this.showNotifications = false;
    this.showProfile = false;
  }

  setLanguage(langCode: string) {
    const lang = this.availableLanguages.find(l => l.code === langCode);
    if (lang && lang.enabled) {
      this.currentLanguage = langCode;
      localStorage.setItem('selectedLanguage', langCode);
      this.showLanguageMenu = false;
    }
  }

  toggleLanguageEnabled(lang: Language, event: Event) {
    event.stopPropagation();
    lang.enabled = !lang.enabled;
    localStorage.setItem('enabledLanguages', JSON.stringify(
      this.availableLanguages.filter(l => l.enabled).map(l => l.code)
    ));
  }

  toggleChat() {
    this.showChat = !this.showChat;
    this.showNotifications = false;
    this.showProfile = false;
    this.showLanguageMenu = false;
    this.openChatPanel.emit();
  }

  getUnreadCount(): number {
    return this.unreadCount;
  }

  markAsRead(notification: UserNotification): void {
    if (!notification.read) {
      this.userNotificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.read = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      });
    }
    
    if (notification.referenceType === 'PurchaseRequisition' && notification.referenceId) {
      this.router.navigate(['/app/purchase/requisition']);
      this.showNotifications = false;
    }
  }

  markAllAsRead(): void {
    this.userNotificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
      }
    });
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'PR_APPROVAL': return 'fa-file-alt';
      case 'PO_CREATED': return 'fa-shopping-cart';
      case 'STOCK_ALERT': return 'fa-exclamation-triangle';
      default: return 'fa-info-circle';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
