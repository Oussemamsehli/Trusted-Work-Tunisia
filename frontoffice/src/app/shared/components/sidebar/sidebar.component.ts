import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthUser } from '../../../core/models/auth.model';

interface QuickNavItem {
  label: string;
  icon: string;
  route?: string;
  badge?: string;
  disabled?: boolean;
  isLogout?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = true;
  @Output() toggleCollapse = new EventEmitter<void>();

  currentUser: AuthUser | null = null;

  quickItems: QuickNavItem[] = [
    {
      label: 'Dashboard',
      icon: 'fa-house',
      route: '/app/dashboard'
    },
    {
      label: 'Profil',
      icon: 'fa-user',
      route: '/app/profile/profile-overview'
    },
    {
      label: 'Certifications',
      icon: 'fa-certificate',
      route: '/app/profile/certifications'
    },
    {
      label: 'Skills',
      icon: 'fa-lightbulb',
      route: '/app/profile/skills'
    },
    {
      label: 'Settings',
      icon: 'fa-gear',
      route: '/app/profile/settings'
    },
    {
      label: 'KYC',
      icon: 'fa-id-card',
      route: '/app/profile/kyc'
    },
    {
      label: 'Trust Passport',
      icon: 'fa-passport',
      route: '/app/profile/trust-passport'
    },
    {
      label: 'Trust Score',
      icon: 'fa-shield-halved',
      route: '/app/reputation/trust-score'
    },
    {
      label: 'Badges',
      icon: 'fa-award',
      route: '/app/reputation/badges'
    },
    {
      label: 'Badges & XP',
      icon: 'fa-medal',
      route: '/app/reputation/badges-xp'
    },
    {
      label: 'Reviews',
      icon: 'fa-star',
      route: '/app/reputation/reviews'
    },
    {
      label: 'History',
      icon: 'fa-clock-rotate-left',
      route: '/app/reputation/history'
    },
    {
      label: 'Progression',
      icon: 'fa-chart-line',
      route: '/app/reputation/progression'
    },
    {
      label: 'Freelance Jobs',
      icon: 'fa-briefcase',
      route: '/app/opportunities/freelance-jobs'
    },
    {
      label: 'Recruitment Overview',
      icon: 'fa-binoculars',
      route: '/app/recruitment/overview'
    },
    {
      label: 'Recruitment Jobs',
      icon: 'fa-user-tie',
      route: '/app/opportunities/recruitment-jobs'
    },
    {
      label: 'Events Overview',
      icon: 'fa-calendar-days',
      route: '/app/opportunities/events-overview'
    },
    {
      label: 'Events List',
      icon: 'fa-list-check',
      route: '/app/opportunities/events-list'
    },
    {
      label: 'Challenges',
      icon: 'fa-bolt',
      route: '/app/opportunities/challenges'
    },
    {
      label: 'Saved Items',
      icon: 'fa-bookmark',
      route: '/app/opportunities/saved-items'
    },
    {
      label: 'Applications',
      icon: 'fa-file-signature',
      route: '/app/activity/applications'
    },
    {
      label: 'Contracts',
      icon: 'fa-file-contract',
      route: '/app/activity/contracts'
    },
    {
      label: 'Deliveries',
      icon: 'fa-box-open',
      route: '/app/activity/deliveries'
    },
    {
      label: 'Participations',
      icon: 'fa-user-group',
      route: '/app/activity/participations'
    },
    {
      label: 'My Reviews',
      icon: 'fa-comment-dots',
      route: '/app/activity/my-reviews'
    },
    {
      label: 'Messages',
      icon: 'fa-envelope',
      route: '/app/messages',
      badge: '2'
    },
    {
      label: 'Notifications',
      icon: 'fa-bell',
      route: '/app/notifications'
    },
    {
      label: 'Wallet',
      icon: 'fa-wallet',
      route: '/app/finance/wallet'
    },
    {
      label: 'Transactions',
      icon: 'fa-arrow-right-arrow-left',
      route: '/app/finance/transactions'
    },
    {
      label: 'Escrow',
      icon: 'fa-lock',
      route: '/app/finance/escrow'
    },
    {
      label: 'Payments History',
      icon: 'fa-receipt',
      route: '/app/finance/payments-history'
    },
    {
      label: 'Support',
      icon: 'fa-life-ring',
      route: '/app/support/reclamations'
    }
  ];

  logoutItem: QuickNavItem = {
    label: 'Déconnexion',
    icon: 'fa-right-from-bracket',
    isLogout: true
  };

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentAuthUser();
  }

  onToggleCollapse(): void {
    this.toggleCollapse.emit();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}