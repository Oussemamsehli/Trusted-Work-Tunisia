import { Component } from '@angular/core';

type TransactionStatus = 'Completed' | 'Pending' | 'Escrow' | 'Failed';
type TransactionDirection = 'Incoming' | 'Outgoing';
type TransactionCategory =
  | 'Milestone payment'
  | 'Withdrawal'
  | 'Escrow release'
  | 'Refund'
  | 'Platform fee';

interface TransactionStat {
  label: string;
  value: string;
  caption: string;
}

interface TransactionTimelineItem {
  title: string;
  date: string;
  description: string;
}

interface TransactionRecord {
  id: string;
  title: string;
  category: TransactionCategory;
  direction: TransactionDirection;
  amount: string;
  netAmount: string;
  status: TransactionStatus;
  date: string;
  clientOrSource: string;
  paymentMethod: string;
  fee: string;
  description: string;
  timeline: TransactionTimelineItem[];
}

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent {
  readonly transactionStats: TransactionStat[] = [
    {
      label: 'Total volume',
      value: '$18,240',
      caption: 'All financial movements over the current cycle'
    },
    {
      label: 'Incoming funds',
      value: '$12,380',
      caption: 'Payments, releases and project earnings'
    },
    {
      label: 'Outgoing funds',
      value: '$5,860',
      caption: 'Withdrawals, fees and reimbursements'
    }
  ];

  readonly statusFilters: Array<TransactionStatus | 'All'> = [
    'All',
    'Completed',
    'Pending',
    'Escrow',
    'Failed'
  ];

  readonly directionFilters: Array<TransactionDirection | 'All'> = [
    'All',
    'Incoming',
    'Outgoing'
  ];

  selectedStatus: TransactionStatus | 'All' = 'All';
  selectedDirection: TransactionDirection | 'All' = 'All';

  readonly transactions: TransactionRecord[] = [
    {
      id: 'TX-8452',
      title: 'Milestone payment received',
      category: 'Milestone payment',
      direction: 'Incoming',
      amount: '+$1,200',
      netAmount: '$1,152',
      status: 'Completed',
      date: '04 Apr 2026 · 09:24',
      clientOrSource: 'Orbit Digital Studio',
      paymentMethod: 'Escrow → Wallet',
      fee: '$48',
      description:
        'Payment received after milestone approval for premium dashboard delivery. Funds have been cleared to the main wallet balance.',
      timeline: [
        {
          title: 'Escrow confirmed',
          date: '04 Apr 2026 · 08:48',
          description: 'Client approved the milestone and escrow release was initiated.'
        },
        {
          title: 'Transfer processed',
          date: '04 Apr 2026 · 09:10',
          description: 'Payment moved from escrow balance into the wallet.'
        },
        {
          title: 'Transaction completed',
          date: '04 Apr 2026 · 09:24',
          description: 'Net amount was added after platform service deduction.'
        }
      ]
    },
    {
      id: 'TX-8447',
      title: 'Wallet withdrawal',
      category: 'Withdrawal',
      direction: 'Outgoing',
      amount: '-$850',
      netAmount: '$850',
      status: 'Pending',
      date: '03 Apr 2026 · 16:10',
      clientOrSource: 'Primary bank account',
      paymentMethod: 'Visa **** 2384',
      fee: '$0',
      description:
        'Manual withdrawal request initiated by the user from the available wallet balance to the default bank-linked payout method.',
      timeline: [
        {
          title: 'Withdrawal requested',
          date: '03 Apr 2026 · 16:10',
          description: 'User requested a transfer from wallet to payout method.'
        },
        {
          title: 'Verification in progress',
          date: '03 Apr 2026 · 16:18',
          description: 'Compliance checks are running before settlement.'
        },
        {
          title: 'Awaiting bank confirmation',
          date: '03 Apr 2026 · 18:00',
          description: 'The payout is queued for the next banking cycle.'
        }
      ]
    },
    {
      id: 'TX-8438',
      title: 'Escrow released',
      category: 'Escrow release',
      direction: 'Incoming',
      amount: '+$640',
      netAmount: '$614',
      status: 'Escrow',
      date: '02 Apr 2026 · 11:42',
      clientOrSource: 'BluePeak Digital',
      paymentMethod: 'Escrow release',
      fee: '$26',
      description:
        'Partial milestone release initiated after project validation. Funds are transitioning between escrow and main balance.',
      timeline: [
        {
          title: 'Milestone validated',
          date: '02 Apr 2026 · 10:56',
          description: 'Client marked the deliverable as accepted.'
        },
        {
          title: 'Escrow unlocked',
          date: '02 Apr 2026 · 11:15',
          description: 'Protected funds were authorized for release.'
        },
        {
          title: 'Transfer in escrow state',
          date: '02 Apr 2026 · 11:42',
          description: 'Final reconciliation is still ongoing.'
        }
      ]
    },
    {
      id: 'TX-8429',
      title: 'Refund issued',
      category: 'Refund',
      direction: 'Outgoing',
      amount: '-$120',
      netAmount: '$120',
      status: 'Completed',
      date: '01 Apr 2026 · 18:20',
      clientOrSource: 'Scope adjustment',
      paymentMethod: 'Wallet balance',
      fee: '$0',
      description:
        'Partial refund sent following a negotiated scope adjustment on a previously approved micro-deliverable.',
      timeline: [
        {
          title: 'Refund approved',
          date: '01 Apr 2026 · 17:50',
          description: 'Both parties agreed on a partial reimbursement.'
        },
        {
          title: 'Wallet deduction processed',
          date: '01 Apr 2026 · 18:05',
          description: 'Refund amount reserved from available balance.'
        },
        {
          title: 'Refund completed',
          date: '01 Apr 2026 · 18:20',
          description: 'Client reimbursement reflected successfully.'
        }
      ]
    },
    {
      id: 'TX-8421',
      title: 'Platform service fee',
      category: 'Platform fee',
      direction: 'Outgoing',
      amount: '-$36',
      netAmount: '$36',
      status: 'Completed',
      date: '31 Mar 2026 · 14:02',
      clientOrSource: 'TrustedWork fee engine',
      paymentMethod: 'Automatic deduction',
      fee: '$36',
      description:
        'Automated service charge linked to a completed project payout on the platform.',
      timeline: [
        {
          title: 'Fee calculated',
          date: '31 Mar 2026 · 13:59',
          description: 'System calculated service charge on completed payout.'
        },
        {
          title: 'Automatic deduction',
          date: '31 Mar 2026 · 14:01',
          description: 'The fee was deducted from the transaction amount.'
        },
        {
          title: 'Fee recorded',
          date: '31 Mar 2026 · 14:02',
          description: 'Entry added to financial reporting history.'
        }
      ]
    }
  ];

  selectedTransaction: TransactionRecord = this.transactions[0];

  get filteredTransactions(): TransactionRecord[] {
    return this.transactions.filter((transaction) => {
      const matchesStatus =
        this.selectedStatus === 'All' || transaction.status === this.selectedStatus;

      const matchesDirection =
        this.selectedDirection === 'All' ||
        transaction.direction === this.selectedDirection;

      return matchesStatus && matchesDirection;
    });
  }

  selectStatus(status: TransactionStatus | 'All'): void {
    this.selectedStatus = status;
    this.syncSelectedTransaction();
  }

  selectDirection(direction: TransactionDirection | 'All'): void {
    this.selectedDirection = direction;
    this.syncSelectedTransaction();
  }

  selectTransaction(transaction: TransactionRecord): void {
    this.selectedTransaction = transaction;
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

  getDirectionClass(direction: TransactionDirection): string {
    switch (direction) {
      case 'Incoming':
        return 'direction-incoming';
      case 'Outgoing':
        return 'direction-outgoing';
      default:
        return '';
    }
  }

  trackByLabel(index: number, item: TransactionStat): string {
    return item.label;
  }

  trackByTransaction(index: number, item: TransactionRecord): string {
    return item.id;
  }

  private syncSelectedTransaction(): void {
    const visibleTransactions = this.filteredTransactions;

    if (!visibleTransactions.length) {
      return;
    }

    const stillExists = visibleTransactions.some(
      (item) => item.id === this.selectedTransaction.id
    );

    if (!stillExists) {
      this.selectedTransaction = visibleTransactions[0];
    }
  }
}