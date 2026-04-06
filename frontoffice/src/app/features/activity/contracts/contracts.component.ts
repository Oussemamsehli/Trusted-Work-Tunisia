import { Component } from '@angular/core';

interface ContractStat {
  label: string;
  value: string;
  tone?: 'default' | 'accent' | 'success' | 'warning';
}

interface ContractMilestone {
  label: string;
  done: boolean;
}

interface ContractItem {
  id: string;
  client: string;
  title: string;
  type: string;
  budget: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Pending Signature' | 'Completed' | 'On Hold';
  summary: string;
  milestones: ContractMilestone[];
}

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.css']
})
export class ContractsComponent {
  selectedContractId = 'contract-1';

  readonly stats: ContractStat[] = [
    { label: 'Active contracts', value: '06', tone: 'accent' },
    { label: 'Pending signature', value: '02', tone: 'warning' },
    { label: 'Completed', value: '14', tone: 'success' },
    { label: 'Contract value', value: '28K TND', tone: 'default' }
  ];

  readonly contracts: ContractItem[] = [
    {
      id: 'contract-1',
      client: 'Nova Studio',
      title: 'Senior UI/UX Design Retainer',
      type: 'Monthly freelance contract',
      budget: '4,500 TND / month',
      startDate: '01 Apr 2026',
      endDate: '30 Jun 2026',
      status: 'Active',
      summary: 'Long-term design collaboration focused on dashboard redesign, UX optimization and product consistency.',
      milestones: [
        { label: 'Contract signed', done: true },
        { label: 'Kickoff completed', done: true },
        { label: 'Mid-review validation', done: true },
        { label: 'Final closure', done: false }
      ]
    },
    {
      id: 'contract-2',
      client: 'Pixel Forge',
      title: 'Brand System Contract',
      type: 'Project-based agreement',
      budget: '6,800 TND',
      startDate: '08 Apr 2026',
      endDate: '25 May 2026',
      status: 'Pending Signature',
      summary: 'Creation of a complete visual identity system including logos, brand rules and communication assets.',
      milestones: [
        { label: 'Proposal approved', done: true },
        { label: 'Contract signed', done: false },
        { label: 'Design production', done: false },
        { label: 'Final handoff', done: false }
      ]
    },
    {
      id: 'contract-3',
      client: 'Trusted Labs',
      title: 'Product Design Sprint',
      type: 'Fixed-price contract',
      budget: '8,200 TND',
      startDate: '10 Mar 2026',
      endDate: '28 Mar 2026',
      status: 'Completed',
      summary: 'A fast product design mission including research, wireframes and clickable prototypes for a SaaS platform.',
      milestones: [
        { label: 'Contract signed', done: true },
        { label: 'Sprint delivery', done: true },
        { label: 'Client approval', done: true },
        { label: 'Final closure', done: true }
      ]
    }
  ];

  get selectedContract(): ContractItem {
    return this.contracts.find(item => item.id === this.selectedContractId) ?? this.contracts[0];
  }

  selectContract(id: string): void {
    this.selectedContractId = id;
  }

  getStatusClass(status: ContractItem['status']): string {
    switch (status) {
      case 'Active':
        return 'status-badge status-badge--active';
      case 'Pending Signature':
        return 'status-badge status-badge--pending';
      case 'Completed':
        return 'status-badge status-badge--completed';
      case 'On Hold':
        return 'status-badge status-badge--hold';
      default:
        return 'status-badge';
    }
  }

  getStatToneClass(tone?: ContractStat['tone']): string {
    switch (tone) {
      case 'accent':
        return 'stat-value stat-value--accent';
      case 'success':
        return 'stat-value stat-value--success';
      case 'warning':
        return 'stat-value stat-value--warning';
      default:
        return 'stat-value';
    }
  }
}