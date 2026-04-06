import { Component } from '@angular/core';

type PaymentHistoryStatus = 'Paid' | 'Scheduled' | 'Processing' | 'Cancelled';
type PaymentHistoryMethod = 'Bank Transfer' | 'Card' | 'Escrow Release' | 'Wallet Settlement';

interface PaymentHistoryStat {
  label: string;
  value: string;
  caption: string;
}

interface PaymentHistoryTimelineItem {
  title: string;
  date: string;
  description: string;
}

interface PaymentHistoryRecord {
  id: string;
  title: string;
  client: string;
  amount: string;
  netAmount: string;
  method: PaymentHistoryMethod;
  status: PaymentHistoryStatus;
  period: string;
  paidAt: string;
  reference: string;
  description: string;
  timeline: PaymentHistoryTimelineItem[];
}

@Component({
  selector: 'app-payments-history',
  templateUrl: './payments-history.component.html',
  styleUrls: ['./payments-history.component.css']
})
export class PaymentsHistoryComponent {
  readonly paymentStats: PaymentHistoryStat[] = [
    {
      label: 'Total paid',
      value: '$26,480',
      caption: 'All successful historical payouts tracked in the platform'
    },
    {
      label: 'This quarter',
      value: '$9,840',
      caption: 'Total payment value recorded during the current quarter'
    },
    {
      label: 'Average payout',
      value: '$1,324',
      caption: 'Mean value across validated completed payments'
    }
  ];

  readonly statusFilters: Array<PaymentHistoryStatus | 'All'> = [
    'All',
    'Paid',
    'Scheduled',
    'Processing',
    'Cancelled'
  ];

  selectedStatus: PaymentHistoryStatus | 'All' = 'All';

  readonly paymentHistory: PaymentHistoryRecord[] = [
    {
      id: 'PAY-5102',
      title: 'Final milestone payout',
      client: 'Craftlane',
      amount: '$1,400',
      netAmount: '$1,344',
      method: 'Escrow Release',
      status: 'Paid',
      period: 'April 2026',
      paidAt: '05 Apr 2026 · 10:12',
      reference: 'TW-REF-92014',
      description:
        'Final payout for the premium dashboard redesign after milestone completion and escrow settlement.',
      timeline: [
        {
          title: 'Payout approved',
          date: '05 Apr 2026 · 09:32',
          description: 'Client approved the final project milestone.'
        },
        {
          title: 'Escrow released',
          date: '05 Apr 2026 · 09:50',
          description: 'Protected funds moved from escrow to wallet.'
        },
        {
          title: 'Payment archived',
          date: '05 Apr 2026 · 10:12',
          description: 'Historical payment record generated successfully.'
        }
      ]
    },
    {
      id: 'PAY-5091',
      title: 'Monthly wallet settlement',
      client: 'TrustedWork Settlement Engine',
      amount: '$2,050',
      netAmount: '$2,050',
      method: 'Wallet Settlement',
      status: 'Processing',
      period: 'April 2026',
      paidAt: '04 Apr 2026 · 16:20',
      reference: 'TW-REF-91980',
      description:
        'Scheduled internal settlement transferring approved wallet income into the reporting cycle.',
      timeline: [
        {
          title: 'Settlement prepared',
          date: '04 Apr 2026 · 14:10',
          description: 'System grouped eligible payout entries.'
        },
        {
          title: 'Processing started',
          date: '04 Apr 2026 · 16:20',
          description: 'Settlement engine started the payout reconciliation.'
        },
        {
          title: 'Awaiting completion',
          date: '04 Apr 2026 · 16:50',
          description: 'Final archive confirmation is still pending.'
        }
      ]
    },
    {
      id: 'PAY-5078',
      title: 'Project delivery payment',
      client: 'Orbit Digital Studio',
      amount: '$980',
      netAmount: '$941',
      method: 'Bank Transfer',
      status: 'Paid',
      period: 'March 2026',
      paidAt: '31 Mar 2026 · 11:40',
      reference: 'TW-REF-91742',
      description:
        'Validated project payment sent after delivery approval and direct transfer to the linked payout account.',
      timeline: [
        {
          title: 'Transfer initiated',
          date: '31 Mar 2026 · 10:55',
          description: 'Bank payout request was initiated successfully.'
        },
        {
          title: 'Payment sent',
          date: '31 Mar 2026 · 11:18',
          description: 'Funds left the platform to the payout channel.'
        },
        {
          title: 'Payment confirmed',
          date: '31 Mar 2026 · 11:40',
          description: 'The transfer was recorded as paid.'
        }
      ]
    },
    {
      id: 'PAY-5066',
      title: 'Client scope adjustment payout',
      client: 'BluePeak Digital',
      amount: '$620',
      netAmount: '$595',
      method: 'Card',
      status: 'Scheduled',
      period: 'March 2026',
      paidAt: '06 Apr 2026 · 09:00',
      reference: 'TW-REF-91621',
      description:
        'Scheduled payout related to a project adjustment following partial revision and acceptance.',
      timeline: [
        {
          title: 'Schedule created',
          date: '03 Apr 2026 · 12:00',
          description: 'Future payout window was assigned automatically.'
        },
        {
          title: 'Method validated',
          date: '03 Apr 2026 · 12:25',
          description: 'Destination card passed eligibility verification.'
        },
        {
          title: 'Awaiting due date',
          date: '04 Apr 2026 · 08:30',
          description: 'The payout remains queued until scheduled execution.'
        }
      ]
    },
    {
      id: 'PAY-5050',
      title: 'Cancelled release',
      client: 'Verity Labs',
      amount: '$860',
      netAmount: '$0',
      method: 'Escrow Release',
      status: 'Cancelled',
      period: 'March 2026',
      paidAt: '30 Mar 2026 · 15:10',
      reference: 'TW-REF-91488',
      description:
        'Payment release was cancelled after a validation dispute and returned to protected review state.',
      timeline: [
        {
          title: 'Release initiated',
          date: '30 Mar 2026 · 14:20',
          description: 'Escrow release workflow started after milestone review.'
        },
        {
          title: 'Dispute raised',
          date: '30 Mar 2026 · 14:46',
          description: 'The client requested a hold before completion.'
        },
        {
          title: 'Payment cancelled',
          date: '30 Mar 2026 · 15:10',
          description: 'The record was marked cancelled and funds were held.'
        }
      ]
    }
  ];

  selectedPayment: PaymentHistoryRecord = this.paymentHistory[0];

  get filteredPayments(): PaymentHistoryRecord[] {
    if (this.selectedStatus === 'All') {
      return this.paymentHistory;
    }

    return this.paymentHistory.filter(
      (item) => item.status === this.selectedStatus
    );
  }

  selectStatus(status: PaymentHistoryStatus | 'All'): void {
    this.selectedStatus = status;
    this.syncSelectedPayment();
  }

  selectPayment(payment: PaymentHistoryRecord): void {
    this.selectedPayment = payment;
  }

  getStatusClass(status: PaymentHistoryStatus): string {
    switch (status) {
      case 'Paid':
        return 'status-paid';
      case 'Scheduled':
        return 'status-scheduled';
      case 'Processing':
        return 'status-processing';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  trackByLabel(index: number, item: PaymentHistoryStat): string {
    return item.label;
  }

  trackByPayment(index: number, item: PaymentHistoryRecord): string {
    return item.id;
  }

  private syncSelectedPayment(): void {
    const visiblePayments = this.filteredPayments;

    if (!visiblePayments.length) {
      return;
    }

    const stillExists = visiblePayments.some(
      (item) => item.id === this.selectedPayment.id
    );

    if (!stillExists) {
      this.selectedPayment = visiblePayments[0];
    }
  }
}