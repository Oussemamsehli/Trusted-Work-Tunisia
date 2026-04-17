import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { WebsocketService } from '../../../core/services/websocket.service';

// Modèle d'une notification locale
export interface NotifItem {
  id: number;
  message: string;
  time: Date;
  read: boolean;
  type: 'NEW_REPORT' | 'REPORT_STATUS_UPDATED' | 'PROFILE_SUSPENDED' | 'OTHER';
}

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit, OnDestroy {

  @Input()  sidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  currentDate = new Date();

  // ── Notifications ──
  notifications: NotifItem[] = [];
  showDropdown = false;
  private notifCounter = 0;

  constructor(
    private authService: AuthService,
    private websocketService: WebsocketService
  ) {}

  // ───────────────────── INIT ─────────────────────
  ngOnInit(): void {
    // Connexion WebSocket et abonnement aux notifications admin
    this.websocketService.connect(() => {
      this.websocketService.subscribeToReports((message: any) => {
        this.addNotification(message);
      });
    });
  }

  // ───────────────────── NOTIFICATIONS ─────────────────────

  /** Nombre de notifications non lues */
  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  /** Ajouter une notification reçue via WebSocket */
  private addNotification(message: any): void {
    const type = message?.type || 'OTHER';

    const labels: Record<string, string> = {
      'NEW_REPORT':            'Nouveau signalement reçu',
      'REPORT_STATUS_UPDATED': 'Statut d\'un signalement mis à jour',
      'PROFILE_SUSPENDED':     'Profil suspendu automatiquement',
      'OTHER':                 'Mise à jour en temps réel'
    };

    this.notifications.unshift({
      id: ++this.notifCounter,
      message: labels[type] || labels['OTHER'],
      time: new Date(),
      read: false,
      type
    });

    // Garder max 20 notifications
    if (this.notifications.length > 20) {
      this.notifications = this.notifications.slice(0, 20);
    }
  }

  /** Ouvrir / fermer le dropdown */
  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    // Marquer toutes comme lues à l'ouverture
    if (this.showDropdown) {
      this.markAllRead();
    }
  }

  /** Marquer toutes comme lues */
  markAllRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  /** Vider toutes les notifications */
  clearAll(): void {
    this.notifications = [];
  }

  /** Icône par type de notification */
  getNotifIcon(type: string): string {
    switch (type) {
      case 'NEW_REPORT':            return 'fas fa-flag';
      case 'REPORT_STATUS_UPDATED': return 'fas fa-arrows-rotate';
      case 'PROFILE_SUSPENDED':     return 'fas fa-ban';
      default:                      return 'fas fa-bell';
    }
  }

  // ───────────────────── FERMER AU CLIC EXTÉRIEUR ─────────────────────
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-wrapper')) {
      this.showDropdown = false;
    }
  }

  // ───────────────────── ACTIONS ─────────────────────
  onToggle(): void {
    this.toggleSidebar.emit();
  }

  onLogout(): void {
    this.websocketService.disconnect();
    this.authService.logout();
  }

  // ───────────────────── DESTROY ─────────────────────
  ngOnDestroy(): void {
    this.websocketService.disconnect();
  }
}