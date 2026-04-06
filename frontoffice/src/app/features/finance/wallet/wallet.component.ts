import { Component } from '@angular/core';

type WalletTrend = 'up' | 'down' | 'neutral';
type TransactionStatus = 'Completed' | 'Pending' | 'Escrow' | 'Failed';
type TransactionType = 'Incoming' | 'Withdrawal' | 'Escrow release' | 'Refund';

interface WalletStatCard {
  label: string;
  value: string;
  delta: string;
  trend: WalletTrend;
  description: string;
}

interface WalletAction {
  label: string;
  icon: string;
  tone: 'primary' | 'secondary' | 'ghost';
}

interface RecentTransaction {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  date: string;
  type: TransactionType;
  status: TransactionStatus;
}

interface PaymentMethod {
  brand: string;
  number: string;
  expiry: string;
  isDefault: boolean;
  tone: 'dark' | 'light';
}

interface EscrowItem {
  project: string;
  client: string;
  amount: string;
  releaseDate: string;
  progress: number;
}

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent {
  readonly statCards: WalletStatCard[] = [
    {
      label: 'Available balance',
      value: '$8,420',
      delta: '+12.4%',
      trend: 'up',
      description: 'Ready for withdrawal or direct platform use'
    },
    {
      label: 'Pending in escrow',
      value: '$3,180',
      delta: '+4 active',
      trend: 'neutral',
      description: 'Protected funds awaiting milestone validation'
    },
    {
      label: 'This month income',
      value: '$5,960',
      delta: '+18.2%',
      trend: 'up',
      description: 'Compared with the previous monthly cycle'
    },
    {
      label: 'Withdrawn',
      value: '$2,150',
      delta: '-3.1%',
      trend: 'down',
      description: 'Net transfers already sent to your payout method'
    }
  ];

  readonly quickActions: WalletAction[] = [
    {
      label: 'Withdraw funds',
      icon: 'fa-arrow-up-right-from-square',
      tone: 'primary'
    },
    {
      label: 'Add payment method',
      icon: 'fa-credit-card',
      tone: 'secondary'
    },
    {
      label: 'Export statement',
      icon: 'fa-file-arrow-down',
      tone: 'ghost'
    }
  ];

  readonly recentTransactions: RecentTransaction[] = [
    {
      id: 'TX-8452',
      title: 'Milestone payment received',
      subtitle: 'Orbit Digital Studio',
      amount: '+$1,200',
      date: 'Today · 09:24',
      type: 'Incoming',
      status: 'Completed'
    },
    {
      id: 'TX-8447',
      title: 'Wallet withdrawal',
      subtitle: 'Bank transfer · **** 2384',
      amount: '-$850',
      date: 'Yesterday · 16:10',
      type: 'Withdrawal',
      status: 'Pending'
    },
    {
      id: 'TX-8438',
      title: 'Escrow released',
      subtitle: 'BluePeak Digital',
      amount: '+$640',
      date: '02 Apr 2026 · 11:42',
      type: 'Escrow release',
      status: 'Escrow'
    },
    {
      id: 'TX-8429',
      title: 'Refund issued',
      subtitle: 'Project scope adjustment',
      amount: '-$120',
      date: '01 Apr 2026 · 18:20',
      type: 'Refund',
      status: 'Completed'
    }
  ];

  readonly paymentMethods: PaymentMethod[] = [
    {
      brand: 'Visa',
      number: '**** **** **** 2384',
      expiry: '08/28',
      isDefault: true,
      tone: 'dark'
    },
    {
      brand: 'Mastercard',
      number: '**** **** **** 6712',
      expiry: '11/27',
      isDefault: false,
      tone: 'light'
    }
  ];

  readonly escrowItems: EscrowItem[] = [
    {
      project: 'Premium dashboard redesign',
      client: 'Craftlane',
      amount: '$1,400',
      releaseDate: '05 Apr 2026',
      progress: 78
    },
    {
      project: 'Angular messaging module',
      client: 'BluePeak Digital',
      amount: '$920',
      releaseDate: '08 Apr 2026',
      progress: 62
    },
    {
      project: 'Trust score analytics integration',
      client: 'Verity Labs',
      amount: '$860',
      releaseDate: '11 Apr 2026',
      progress: 44
    }
  ];

  getTrendClass(trend: WalletTrend): string {
    switch (trend) {
      case 'up':
        return 'trend-up';
      case 'down':
        return 'trend-down';
      case 'neutral':
        return 'trend-neutral';
      default:
        return '';
    }
  }

  getStatusClass(status: TransactionStatus): string {
    switch (status) {
      case 'Completed':
        return 'status-completed';
      case 'Pending':
        return 'status-pending';
      case 'Escrow':
        return 'status-escrow';
      case 'Failed':
        return 'status-failed';
      default:
        return '';
    }
  }

  getActionClass(tone: WalletAction['tone']): string {
    switch (tone) {
      case 'primary':
        return 'action-primary';
      case 'secondary':
        return 'action-secondary';
      case 'ghost':
        return 'action-ghost';
      default:
        return '';
    }
  }

  trackByLabel(index: number, item: WalletStatCard): string {
    return item.label;
  }

  trackByTransaction(index: number, item: RecentTransaction): string {
    return item.id;
  }

  trackByPayment(index: number, item: PaymentMethod): string {
    return `${item.brand}-${item.number}`;
  }

  trackByEscrow(index: number, item: EscrowItem): string {
    return `${item.project}-${item.client}`;
  }

  trackByAction(index: number, item: WalletAction): string {
    return item.label;
  }
}