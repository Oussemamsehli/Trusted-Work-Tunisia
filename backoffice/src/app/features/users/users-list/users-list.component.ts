import { Component, OnInit } from '@angular/core';
import { UserService, UserDTO } from '../../../core/services/user.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {

  users: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];
  loading = true;
  searchQuery = '';
  selectedRole = 'ALL';
  selectedStatus = 'ALL';
  actionLoading: number | null = null;

  roles = ['ALL', 'FREELANCER', 'CLIENT', 'ADMIN'];
  statuses = ['ALL', 'ACTIVE', 'SUSPENDED'];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(u => {
      const matchSearch = !this.searchQuery ||
        u.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        u.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchRole = this.selectedRole === 'ALL' || u.role === this.selectedRole;
      const matchStatus = this.selectedStatus === 'ALL' || u.accountStatus === this.selectedStatus;

      return matchSearch && matchRole && matchStatus;
    });
  }

  onSearch() { this.applyFilters(); }
  onRoleFilter(role: string) { this.selectedRole = role; this.applyFilters(); }
  onStatusFilter(status: string) { this.selectedStatus = status; this.applyFilters(); }

  suspendUser(user: UserDTO) {
    if (!confirm(`Suspendre ${user.firstName} ${user.lastName} ?`)) return;
    this.actionLoading = user.id;
    this.userService.suspendUser(user.id).subscribe({
      next: () => { this.loadUsers(); this.actionLoading = null; },
      error: () => { this.actionLoading = null; }
    });
  }

  activateUser(user: UserDTO) {
    this.actionLoading = user.id;
    this.userService.activateUser(user.id).subscribe({
      next: () => { this.loadUsers(); this.actionLoading = null; },
      error: () => { this.actionLoading = null; }
    });
  }

  getInitials(u: UserDTO): string {
    return (u.firstName?.[0] || '') + (u.lastName?.[0] || '');
  }

  getAvatarClass(role: string): string {
    const map: any = { FREELANCER: 'accent', CLIENT: 'success', ADMIN: 'danger' };
    return map[role] || 'accent';
  }

  getRoleBadge(role: string): string {
    const map: any = { FREELANCER: 'badge-accent', CLIENT: 'badge-success', ADMIN: 'badge-danger' };
    return map[role] || 'badge-muted';
  }

  getStatusBadge(status: string): string {
    return status === 'ACTIVE' ? 'badge-success' : 'badge-danger';
  }

  getKycBadge(kyc: string): string {
    const map: any = { APPROVED: 'badge-success', PENDING: 'badge-warning', REJECTED: 'badge-danger' };
    return map[kyc] || 'badge-muted';
  }
}