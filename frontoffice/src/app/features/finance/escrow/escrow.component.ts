import { Component } from '@angular/core';

type EscrowStatus = 'Secured' | 'Pending Release' | 'Released' | 'Under Review';
type EscrowPriority = 'Low' | 'Medium' | 'High';

interface EscrowStat {
  label: string;
  value: string;
  caption: string;
}

interface EscrowTimelineItem {
  title: string;
  date: string;
  description: string;
}

interface EscrowRecord {
  id: string;
  project: string;
  client: string;
  amount: string;
  securedAmount: string;
  releaseDate: string;
  milestone: string;
  progress: number;
  status: EscrowStatus;
  priority: EscrowPriority;
  description: string;
  timeline: EscrowTimelineItem[];
}

@Component({
  selector: 'app-escrow',
  templateUrl: './escrow.component.html',
  styleUrls: ['./escrow.component.css']
})
export class EscrowComponent {
  readonly escrowStats: EscrowStat[] = [
    {
      label: 'Secured funds',
      value: '$3,180',
      caption: 'Protected inside escrow until milestone approval'
    },
    {
      label: 'Active escrow cases',
      value: '6',
      caption: 'Projects currently managed through secure release'
    },
    {
      label: 'Next expected release',
      value: '05 Apr',
      caption: 'Closest scheduled milestone settlement'
    }
  ];

  readonly statusFilters: Array<EscrowStatus | 'All'> = [
    'All',
    'Secured',
    'Pending Release',
    'Released',
    'Under Review'
  ];

  selectedStatus: EscrowStatus | 'All' = 'All';

  readonly escrowRecords: EscrowRecord[] = [
    {
      id: 'ESC-9021',
      project: 'Premium dashboard redesign',
      client: 'Craftlane',
      amount: '$1,400',
      securedAmount: '$1,400',
      releaseDate: '05 Apr 2026',
      milestone: 'Final UI system delivery',
      progress: 78,
      status: 'Pending Release',
      priority: 'High',
      description:
        'Funds are currently secured pending the final validation of the premium dashboard redesign and handoff assets.',
      timeline: [
        {
          title: 'Escrow funded',
          date: '28 Mar 2026 · 09:00',
          description: 'Client deposited the full milestone amount into escrow.'
        },
        {
          title: 'Work submitted',
          date: '03 Apr 2026 · 15:30',
          description: 'Freelancer delivered the final UI package for review.'
        },
        {
          title: 'Awaiting client validation',
          date: '04 Apr 2026 · 10:20',
          description: 'Release is pending confirmation from the client.'
        }
      ]
    },
    {
      id: 'ESC-9014',
      project: 'Angular messaging module',
      client: 'BluePeak Digital',
      amount: '$920',
      securedAmount: '$920',
      releaseDate: '08 Apr 2026',
      milestone: 'Chat panel integration',
      progress: 62,
      status: 'Secured',
      priority: 'Medium',
      description:
        'The milestone amount remains protected in escrow while the messaging module implementation continues.',
      timeline: [
        {
          title: 'Escrow opened',
          date: '30 Mar 2026 · 11:10',
          description: 'Secure transaction created for the active milestone.'
        },
        {
          title: 'Development phase active',
          date: '02 Apr 2026 · 09:50',
          description: 'Project progress moved past the halfway mark.'
        },
        {
          title: 'Funds remain protected',
          date: '04 Apr 2026 · 08:40',
          description: 'No release request has been issued yet.'
        }
      ]
    },
    {
      id: 'ESC-9008',
      project: 'Trust score analytics integration',
      client: 'Verity Labs',
      amount: '$860',
      securedAmount: '$860',
      releaseDate: '11 Apr 2026',
      milestone: 'Analytics delivery review',
      progress: 44,
      status: 'Under Review',
      priority: 'High',
      description:
        'Escrow is temporarily under review after the client requested additional clarification on analytics deliverables.',
      timeline: [
        {
          title: 'Funds secured',
          date: '29 Mar 2026 · 14:00',
          description: 'Escrow deposit was successfully confirmed.'
        },
        {
          title: 'Review flag raised',
          date: '03 Apr 2026 · 12:45',
          description: 'The client asked for clarification before release.'
        },
        {
          title: 'Support moderation active',
          date: '04 Apr 2026 · 09:15',
          description: 'Case is being monitored to protect both parties.'
        }
      ]
    },
    {
      id: 'ESC-8997',
      project: 'Landing page optimization',
      client: 'Orbit Digital Studio',
      amount: '$540',
      securedAmount: '$540',
      releaseDate: '01 Apr 2026',
      milestone: 'Conversion-focused redesign',
      progress: 100,
      status: 'Released',
      priority: 'Low',
      description:
        'This escrow case has already been completed and the secured amount was released successfully to the wallet.',
      timeline: [
        {
          title: 'Escrow funded',
          date: '24 Mar 2026 · 10:00',
          description: 'Client deposited the milestone amount.'
        },
        {
          title: 'Milestone approved',
          date: '01 Apr 2026 · 10:40',
          description: 'Client validated the redesigned landing page.'
        },
        {
          title: 'Funds released',
          date: '01 Apr 2026 · 11:05',
          description: 'Escrow moved to wallet after final confirmation.'
        }
      ]
    }
  ];

  selectedEscrow: EscrowRecord = this.escrowRecords[0];

  get filteredEscrowRecords(): EscrowRecord[] {
    if (this.selectedStatus === 'All') {
      return this.escrowRecords;
    }

    return this.escrowRecords.filter(
      (item) => item.status === this.selectedStatus
    );
  }

  selectStatus(status: EscrowStatus | 'All'): void {
    this.selectedStatus = status;
    this.syncSelectedEscrow();
  }

  selectEscrow(item: EscrowRecord): void {
    this.selectedEscrow = item;
  }

  getStatusClass(status: EscrowStatus): string {
    switch (status) {
      case 'Secured':
        return 'status-secured';
      case 'Pending Release':
        return 'status-pending-release';
      case 'Released':
        return 'status-released';
      case 'Under Review':
        return 'status-under-review';
      default:
        return '';
    }
  }

  getPriorityClass(priority: EscrowPriority): string {
    switch (priority) {
      case 'Low':
        return 'priority-low';
      case 'Medium':
        return 'priority-medium';
      case 'High':
        return 'priority-high';
      default:
        return '';
    }
  }

  trackByLabel(index: number, item: EscrowStat): string {
    return item.label;
  }

  trackByEscrow(index: number, item: EscrowRecord): string {
    return item.id;
  }

  private syncSelectedEscrow(): void {
    const visibleRecords = this.filteredEscrowRecords;

    if (!visibleRecords.length) {
      return;
    }

    const stillExists = visibleRecords.some(
      (item) => item.id === this.selectedEscrow.id
    );

    if (!stillExists) {
      this.selectedEscrow = visibleRecords[0];
    }
  }
}