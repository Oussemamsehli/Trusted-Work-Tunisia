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
    // On utilise le CIN comme identifiant pour le loading spinner
    actionLoadingCin: number | null = null;

    constructor(private userService: UserService) {}

    ngOnInit(): void { this.loadPending(); }

    loadPending(): void {
        this.loading = true;
        this.userService.getPendingKyc().subscribe({
            next: (data) => { this.pendingUsers = data; this.loading = false; },
            error: () => this.loading = false
        });
    }

    getPhotoUrl(photoName: string | null | undefined): string | null {
        return this.userService.getPhotoUrl(photoName);
    }

    approve(user: UserDTO): void {
        this.actionLoadingCin = user.cin;
        // Le backend attend le CIN pour identifier l'utilisateur
        this.userService.reviewKyc(user.cin, 'APPROVED').subscribe({
            next: () => { this.actionLoadingCin = null; this.loadPending(); },
            error: () => this.actionLoadingCin = null
        });
    }

    reject(user: UserDTO): void {
        const reason = prompt('Raison du rejet :');
        if (!reason) return;
        this.actionLoadingCin = user.cin;
        this.userService.reviewKyc(user.cin, 'REJECTED', reason).subscribe({
            next: () => { this.actionLoadingCin = null; this.loadPending(); },
            error: () => this.actionLoadingCin = null
        });
    }
}