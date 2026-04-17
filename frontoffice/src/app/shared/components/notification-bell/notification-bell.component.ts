import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit, OnDestroy {

  private notificationService = inject(NotificationService);
  private router              = inject(Router);

  count    = 0;
  hasPulse = false;
  isOpen   = false;
  messages: any[] = [];

  private sub!: Subscription;
  private msgSub!: Subscription;

  ngOnInit(): void {
    this.sub = this.notificationService.count$.subscribe((n: number) => {
      this.count    = n;
      this.hasPulse = n > 0;
    });

    this.msgSub = this.notificationService.messages$.subscribe((msgs: any[]) => {
      this.messages = msgs;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.msgSub?.unsubscribe();
  }

  get displayCount(): string {
    return this.count > 99 ? '99+' : String(this.count);
  }

  togglePanel(event: Event): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.notificationService.resetCount();
    }
  }

  /**
   * Clic sur une notification → navigation vers la page concernée
   */
  onNotifClick(msg: any): void {
    this.isOpen = false;

    // Extraire le profileId depuis le payload JSON si disponible
    try {
      if (msg.payload) {
        const payload = typeof msg.payload === 'string'
          ? JSON.parse(msg.payload)
          : msg.payload;

        if (payload.profileId) {
          // Naviguer vers le profil public concerné
          this.router.navigate(['/app/freelancers', payload.profileId]);
          return;
        }
      }
    } catch (e) { /* payload non parseable — navigation par défaut */ }

    // Navigation par défaut selon le type
    switch (msg.type) {
      case 'NEW_REVIEW':
        this.router.navigate(['/app/profile/reviews']);
        break;
      case 'NEW_ENDORSEMENT':
        this.router.navigate(['/app/profile/endorsements']);
        break;
      default:
        this.router.navigate(['/app/dashboard']);
    }
  }

  // Fermer au clic en dehors
  @HostListener('document:click')
  onClickOutside(): void {
    this.isOpen = false;
  }

  getIcon(type: string): string {
    switch (type) {
      case 'NEW_REVIEW':      return 'fas fa-star';
      case 'NEW_ENDORSEMENT': return 'fas fa-thumbs-up';
      case 'NEW_REPORT':      return 'fas fa-flag';
      default:                return 'fas fa-bell';
    }
  }

  getIconColor(type: string): string {
    switch (type) {
      case 'NEW_REVIEW':      return '#f59e0b';
      case 'NEW_ENDORSEMENT': return '#3b82f6';
      case 'NEW_REPORT':      return '#ef4444';
      default:                return '#8b92a5';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date   = new Date(dateStr);
    const diffMs  = new Date().getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1)  return 'À l\'instant';
    if (diffMin < 60) return `Il y a ${diffMin} min`;

    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24)   return `Il y a ${diffH}h`;

    return `Il y a ${Math.floor(diffH / 24)}j`;
  }
}