import { Component, OnInit } from '@angular/core';

interface StatCard {
  label: string;
  value: string;
  change: string;
  changeType: 'up' | 'down' | 'flat';
  icon: string;
  iconClass: string;
}

interface RecentActivity {
  user: string;
  initials: string;
  action: string;
  time: string;
  type: 'kyc' | 'review' | 'contract' | 'badge';
}

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {

  stats: StatCard[] = [
    {
      label: 'Total Users',
      value: '2,847',
      change: '+12% this month',
      changeType: 'up',
      icon: 'fa-users',
      iconClass: 'accent'
    },
    {
      label: 'Active Contracts',
      value: '394',
      change: '+8% this week',
      changeType: 'up',
      icon: 'fa-file-contract',
      iconClass: 'success'
    },
    {
      label: 'KYC Pending',
      value: '12',
      change: '3 urgent',
      changeType: 'down',
      icon: 'fa-id-card',
      iconClass: 'warning'
    },
    {
      label: 'Open Reclamations',
      value: '3',
      change: '1 auto-detected',
      changeType: 'down',
      icon: 'fa-flag',
      iconClass: 'danger'
    },
    {
      label: 'Reviews Today',
      value: '47',
      change: '+23% vs yesterday',
      changeType: 'up',
      icon: 'fa-star',
      iconClass: 'gold'
    },
    {
      label: 'Avg Trust Score',
      value: '74.2',
      change: '+1.4 this week',
      changeType: 'up',
      icon: 'fa-shield-halved',
      iconClass: 'info'
    }
  ];

  recentActivities: RecentActivity[] = [
    { user: 'Ahmed Ben Ali',     initials: 'AB', action: 'KYC submitted — awaiting review',     time: '2 min ago',  type: 'kyc' },
    { user: 'Sarra Trabelsi',    initials: 'ST', action: 'Received 5★ review on contract #482', time: '8 min ago',  type: 'review' },
    { user: 'Mohamed Gharbi',    initials: 'MG', action: 'Contract #489 signed — 2,400 DT',     time: '15 min ago', type: 'contract' },
    { user: 'Ines Mansouri',     initials: 'IM', action: 'Badge "Speed Demon" unlocked',         time: '32 min ago', type: 'badge' },
    { user: 'Yassine Bouazizi',  initials: 'YB', action: 'KYC approved — TRUSTED level',        time: '1h ago',     type: 'kyc' },
    { user: 'Rim Chouchane',     initials: 'RC', action: 'Reclamation flagged by AI — risk 87', time: '1h ago',     type: 'review' },
    { user: 'Omar Fennich',      initials: 'OF', action: 'Contract #491 completed — 5 jalons',  time: '2h ago',     type: 'contract' },
    { user: 'Nour Belhaj',       initials: 'NB', action: 'Reached EXPERT level — 25,000 XP',   time: '3h ago',     type: 'badge' },
  ];

  modules = [
    { name: 'User Service',    port: '8081', status: 'online',  endpoints: 24, icon: 'fa-user-shield' },
    { name: 'Review Service',  port: '8085', status: 'online',  endpoints: 18, icon: 'fa-star' },
    { name: 'Contract Service',port: '8083', status: 'online',  endpoints: 21, icon: 'fa-file-contract' },
    { name: 'Job Service',     port: '8082', status: 'offline', endpoints: 15, icon: 'fa-briefcase' },
    { name: 'Event Service',   port: '8087', status: 'online',  endpoints: 12, icon: 'fa-calendar-days' },
    { name: 'Recruit Service', port: '8089', status: 'offline', endpoints: 16, icon: 'fa-user-tie' },
  ];

  ngOnInit() {}

  getActivityIcon(type: string): string {
    const icons: any = {
      kyc:      'fa-id-card',
      review:   'fa-star',
      contract: 'fa-file-contract',
      badge:    'fa-trophy'
    };
    return icons[type] || 'fa-circle';
  }

  getActivityClass(type: string): string {
    const classes: any = {
      kyc:      'warning',
      review:   'accent',
      contract: 'success',
      badge:    'gold'
    };
    return classes[type] || 'accent';
  }
}