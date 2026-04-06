import { Component, OnInit } from '@angular/core';
import { UserService, UserDTO } from '../../../core/services/user.service';

@Component({
  selector: 'app-kyc-management',
  templateUrl: './kyc-management.component.html',
  styleUrls: ['./kyc-management.component.css']
})
export class KycManagementComponent implements OnInit {

  pendingUsers: UserDTO[] = [];
  loading = true;
  actionLoading: number | null = null;
  selectedUser: UserDTO | null = null;
  notes = '';

  constructor(private userService: UserService) {}

  ngOnInit() { this.loadPending(); }

  loadPending() {
    this.loading = true;
    this.userService.getPendingKyc().subscribe({
      next: (data) => { this.pendingUsers = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openReview(user: UserDTO) {
    this.selectedUser = user;
    this.notes = '';
  }

  closeReview() {
    this.selectedUser = null;
    this.notes = '';
  }

  approve() {
    if (!this.selectedUser) return;
    this.actionLoading = this.selectedUser.cin;
    this.userService.reviewKyc(this.selectedUser.cin, 'APPROVED', this.notes).subscribe({
      next: () => { this.closeReview(); this.loadPending(); this.actionLoading = null; },
      error: () => { this.actionLoading = null; }
    });
  }

  reject() {
    if (!this.selectedUser) return;
    this.actionLoading = this.selectedUser.cin;
    this.userService.reviewKyc(this.selectedUser.cin, 'REJECTED', this.notes).subscribe({
      next: () => { this.closeReview(); this.loadPending(); this.actionLoading = null; },
      error: () => { this.actionLoading = null; }
    });
  }

  getInitials(u: UserDTO): string {
    return (u.firstName?.[0] || '') + (u.lastName?.[0] || '');
  }
}