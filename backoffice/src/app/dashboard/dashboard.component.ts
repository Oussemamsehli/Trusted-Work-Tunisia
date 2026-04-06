import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

    stats = [
        { title: 'Total Freelancers', value: '...', change: 0, positive: true, icon: 'users' },
        { title: 'Total Clients', value: '...', change: 0, positive: true, icon: 'briefcase' },
        { title: 'Utilisateurs Actifs', value: '...', change: 0, positive: true, icon: 'revenue' },
        { title: 'KYC En Attente', value: '...', change: 0, positive: false, icon: 'pending' }
    ];

    loading = true;

    chartMonths = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    projectData = [120, 180, 250, 200, 310, 280, 350, 300, 260, 340, 290, 320];
    freelancerData = [80, 100, 150, 130, 200, 170, 220, 190, 160, 210, 180, 200];

    statusData = [
        { label: 'KYC Approuvé', percentage: 0, count: 0, color: '#34D399' },
        { label: 'KYC En attente', percentage: 0, count: 0, color: '#FBBF24' },
        { label: 'KYC Rejeté', percentage: 0, count: 0, color: '#F87171' },
        { label: 'Suspendus', percentage: 0, count: 0, color: '#A78BFA' }
    ];

    totalUsersForDoughnut = 0;

    recentProjects = [
        { no: 1, project: 'Refonte Site E-commerce', client: 'Société ABC', freelancer: 'Ahmed Ben Ali', date: '15/03/2026', status: 'En cours', amount: '3,500 TND' },
        { no: 2, project: 'App Mobile Livraison', client: 'FastDelivery TN', freelancer: 'Sarra Bouaziz', date: '12/03/2026', status: 'Terminé', amount: '8,200 TND' },
        { no: 3, project: 'Logo & Branding', client: 'StartUp Plus', freelancer: 'Mohamed Trabelsi', date: '10/03/2026', status: 'En attente', amount: '1,200 TND' },
        { no: 4, project: 'Dashboard Analytics', client: 'DataViz Corp', freelancer: 'Ines Gharbi', date: '08/03/2026', status: 'En cours', amount: '5,000 TND' },
        { no: 5, project: 'API Integration', client: 'TechSolutions', freelancer: 'Youssef Meddeb', date: '05/03/2026', status: 'Annulé', amount: '2,800 TND' },
    ];

    constructor(private userService: UserService) {}

    ngOnInit(): void {
        this.loadStats();
    }

    loadStats(): void {
        this.loading = true;

        this.userService.getDashboardStats().subscribe({
            next: (data: any) => {
                this.stats = [
                    {
                        title: 'Total Freelancers',
                        value: this.formatNumber(data.totalFreelancers),
                        change: data.totalFreelancers > 0 ? 12.09 : 0,
                        positive: true,
                        icon: 'users'
                    },
                    {
                        title: 'Total Clients',
                        value: this.formatNumber(data.totalClients),
                        change: data.totalClients > 0 ? 8.5 : 0,
                        positive: true,
                        icon: 'briefcase'
                    },
                    {
                        title: 'Utilisateurs Actifs',
                        value: this.formatNumber(data.activeUsers),
                        change: data.activeUsers > 0 ? 5.2 : 0,
                        positive: true,
                        icon: 'revenue'
                    },
                    {
                        title: 'KYC En Attente',
                        value: this.formatNumber(data.kycPending),
                        change: data.kycPending > 0 ? data.kycPending : 0,
                        positive: false,
                        icon: 'pending'
                    }
                ];

                const total = (data.kycApproved || 0) + (data.kycPending || 0) + (data.kycRejected || 0) + (data.suspendedUsers || 0);
                this.totalUsersForDoughnut = data.totalUsers || 0;

                if (total > 0) {
                    this.statusData = [
                        { label: 'KYC Approuvé', percentage: Math.round((data.kycApproved / total) * 100), count: data.kycApproved, color: '#34D399' },
                        { label: 'KYC En attente', percentage: Math.round((data.kycPending / total) * 100), count: data.kycPending, color: '#FBBF24' },
                        { label: 'KYC Rejeté', percentage: Math.round((data.kycRejected / total) * 100), count: data.kycRejected, color: '#F87171' },
                        { label: 'Suspendus', percentage: Math.round((data.suspendedUsers / total) * 100), count: data.suspendedUsers, color: '#A78BFA' }
                    ];
                }

                this.loading = false;
            },
            error: (err: any) => {
                console.error('Failed to load dashboard stats:', err);
                this.loading = false;
            }
        });
    }

    private formatNumber(num: number): string {
        if (num === null || num === undefined) return '0';
        return num.toLocaleString('fr-TN');
    }

    getStatusClass(status: string): string {
        const map: Record<string, string> = {
            'En cours': 'status-active',
            'Terminé': 'status-done',
            'En attente': 'status-pending',
            'Annulé': 'status-cancelled',
            'En révision': 'status-review'
        };
        return map[status] || '';
    }

    getChartPath(data: number[]): string {
        const maxVal = 400;
        const width = 700;
        const height = 250;
        const stepX = width / (data.length - 1);

        return data.map((val, i) => {
            const x = i * stepX;
            const y = height - (val / maxVal) * height;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    }

    getChartAreaPath(data: number[]): string {
        const path = this.getChartPath(data);
        const width = 700;
        const height = 250;
        return `${path} L ${width} ${height} L 0 ${height} Z`;
    }

    getDoughnutSegments(): { offset: number; dashArray: string; color: string }[] {
        const total = this.statusData.reduce((acc, d) => acc + d.percentage, 0);
        if (total === 0) return [];

        let cumulative = 0;
        const circumference = 2 * Math.PI * 70;

        return this.statusData.map(d => {
            const segmentLength = (d.percentage / total) * circumference;
            const gap = 4;
            const offset = (cumulative / total) * circumference;
            cumulative += d.percentage;
            return {
                offset: -offset + circumference / 4,
                dashArray: `${segmentLength - gap} ${circumference - segmentLength + gap}`,
                color: d.color
            };
        });
    }
}
