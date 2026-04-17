import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

/**
 * Service de notifications admin — backoffice (port 4201).
 * S'abonne à /topic/admin/reports pour les signalements en temps réel.
 * Charge les non-lues depuis MySQL (userId = 0 = admin global).
 */
@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {

  private readonly BASE_URL = 'http://localhost:8082/api/notifications';

  // Convention : userId = 0 pour les notifications admin globales
  private readonly ADMIN_USER_ID = 0;

  private countSubject = new BehaviorSubject<number>(0);
  private messagesSubject = new BehaviorSubject<any[]>([]);

  count$ = this.countSubject.asObservable();
  messages$ = this.messagesSubject.asObservable();

  private stompClient: any = null;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  connect(): void {
    const userId = this.authService.getUserId();
    const email = this.authService.getEmail();

    // Vérifie juste qu'un admin est bien connecté
    if (!userId || userId <= 0) {
      return;
    }

    if (this.stompClient?.active) {
      return;
    }

    // Charger les notifications admin persistées
    this.chargerNotificationsAdmin();

    // WebSocket vers le topic admin
    this.connecterWebSocketAdmin();
  }

  private chargerNotificationsAdmin(): void {
    this.http.get<any[]>(`${this.BASE_URL}/user/${this.ADMIN_USER_ID}/unread`).subscribe({
      next: (notifications) => {
        if (notifications?.length) {
          this.messagesSubject.next(notifications);
          this.countSubject.next(notifications.length);
          this.jouerSon();
          console.log(`[NotifAdmin] ${notifications.length} notification(s) admin chargée(s)`);
        }
      },
      error: (err) => console.error('[NotifAdmin] Erreur chargement :', err)
    });
  }

  private connecterWebSocketAdmin(): void {
    const topic = '/topic/admin/reports';

    import('@stomp/stompjs').then(({ Client }) => {
      this.stompClient = new Client({
        brokerURL: 'ws://localhost:8082/ws',
        reconnectDelay: 5000,

        onConnect: () => {
          console.log('[NotifAdmin] WebSocket connecté → topic :', topic);

          this.stompClient.subscribe(topic, (frame: { body: string }) => {
            try {
              const notification = JSON.parse(frame.body);
              console.log('[NotifAdmin] Notification reçue :', notification);

              const current = this.messagesSubject.getValue();
              this.messagesSubject.next([notification, ...current]);
              this.countSubject.next(this.countSubject.getValue() + 1);
              this.jouerSon();
            } catch (e) {
              console.error('[NotifAdmin] Erreur parsing :', e);
            }
          });
        },

        onStompError: (frame: any) => {
          console.error('[NotifAdmin] Erreur STOMP :', frame);
        }
      });

      this.stompClient.activate();
    });
  }

  resetCount(): void {
    this.countSubject.next(0);
    this.http.put(
      `${this.BASE_URL}/user/${this.ADMIN_USER_ID}/read-all`,
      {}
    ).subscribe();
  }

  private jouerSon(): void {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // silencieux
    }
  }

  getMessages(): any[] {
    return this.messagesSubject.getValue();
  }

  ngOnDestroy(): void {
    this.stompClient?.deactivate();
  }
}