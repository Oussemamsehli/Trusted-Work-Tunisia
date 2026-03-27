import { Component, OnInit } from '@angular/core';
import { UserService, UserDTO, AdminCreateUserRequest } from '../services/user.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  users: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];
  searchTerm = '';
  roleFilter = '';
  loading = true;

  newUser: AdminCreateUserRequest = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'FREELANCER'
  };

  availableRoles: string[] = [
    'ADMIN',
    'FREELANCER',
    'CLIENT',
    'MODERATOR',
    'ARBITER'
  ];

  createLoading = false;
  createSuccessMessage = '';
  createErrorMessage = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;

    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data ?? [];
        this.filterUsers();
        this.loading = false;
      },
      error: () => {
        this.users = [];
        this.filteredUsers = [];
        this.loading = false;
      }
    });
  }

  filterUsers(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredUsers = this.users.filter((u) => {
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const role = (u.role || '').toUpperCase();

      const matchSearch =
        !term ||
        fullName.includes(term) ||
        email.includes(term) ||
        String(u.id).includes(term);

      const matchRole = !this.roleFilter || role === this.roleFilter;

      return matchSearch && matchRole;
    });
  }

  onSearch(value: string): void {
    this.searchTerm = value;
    this.filterUsers();
  }

  onRoleFilter(role: string): void {
    this.roleFilter = role;
    this.filterUsers();
  }

  createUser(): void {
    this.createSuccessMessage = '';
    this.createErrorMessage = '';

    if (
      !this.newUser.firstName?.trim() ||
      !this.newUser.lastName?.trim() ||
      !this.newUser.email?.trim() ||
      !this.newUser.password?.trim() ||
      !this.newUser.role?.trim()
    ) {
      this.createErrorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.createLoading = true;

    const payload: AdminCreateUserRequest = {
      firstName: this.newUser.firstName.trim(),
      lastName: this.newUser.lastName.trim(),
      email: this.newUser.email.trim(),
      password: this.newUser.password,
      phoneNumber: this.newUser.phoneNumber?.trim() || '',
      role: this.newUser.role
    };

    this.userService.createUser(payload).subscribe({
      next: () => {
        this.createLoading = false;
        this.createSuccessMessage = 'Utilisateur créé avec succès.';
        this.resetCreateForm();
        this.loadUsers();
      },
      error: (error: any) => {
        this.createLoading = false;
        this.createErrorMessage =
          error?.error?.message ||
          error?.error?.error ||
          'Erreur lors de la création de l’utilisateur.';
      }
    });
  }

  resetCreateForm(): void {
    this.newUser = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: '',
      role: 'FREELANCER'
    };

    this.createErrorMessage = '';
    this.createSuccessMessage = '';
  }

  suspendUser(user: UserDTO): void {
    if (!confirm(`Suspendre ${user.firstName} ${user.lastName} ?`)) {
      return;
    }

    this.userService.suspendUser(user.id).subscribe({
      next: () => this.loadUsers()
    });
  }

  activateUser(user: UserDTO): void {
    if (!confirm(`Réactiver ${user.firstName} ${user.lastName} ?`)) {
      return;
    }

    this.userService.activateUser(user.id).subscribe({
      next: () => this.loadUsers()
    });
  }

  deleteUser(user: UserDTO): void {
    if (!confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) {
      return;
    }

    this.userService.deleteUser(user.id).subscribe({
      next: () => this.loadUsers()
    });
  }
}