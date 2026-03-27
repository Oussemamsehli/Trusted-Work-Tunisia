import { Component, OnInit } from '@angular/core';
import { UserService, UserDTO } from '../services/user.service';

@Component({
    selector: 'app-kyc-list',
    templateUrl: './kyc-list.component.html',
    styleUrl: './kyc-list.component.css'
})
export class KycListComponent implements OnInit {
    pendingUsers: UserDTO[] = [];
    loading = true;
    actionLoading: number | null = null;

    constructor(private userService: UserService) {}

    ngOnInit(): void { this.loadPending(); }

    loadPending(): void {
        this.loading = true;
        this.userService.getPendingKyc().subscribe({
            next: (data) => { this.pendingUsers = data; this.loading = false; },
            error: () => this.loading = false
        });
    }

    approve(user: UserDTO): void {
        this.actionLoading = user.id;
        this.userService.reviewKyc(user.id, 'APPROVED').subscribe({
            next: () => { this.actionLoading = null; this.loadPending(); },
            error: () => this.actionLoading = null
        });
    }

    reject(user: UserDTO): void {
        const reason = prompt('Raison du rejet :');
        if (!reason) return;
        this.actionLoading = user.id;
        this.userService.reviewKyc(user.id, 'REJECTED', reason).subscribe({
            next: () => { this.actionLoading = null; this.loadPending(); },
            error: () => this.actionLoading = null
        });
    }
}