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
        'ENTREPRISE',
        'ARBITRE',
        'MODERATOR'
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
                this.users = data;
                this.filteredUsers = data;
                this.filterUsers();
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    filterUsers(): void {
        this.filteredUsers = this.users.filter(u => {
            const matchSearch = !this.searchTerm ||
                u.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                u.lastName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                u.email?.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchRole = !this.roleFilter || u.role === this.roleFilter;

            return matchSearch && matchRole;
        });
    }

    onSearch(val: string): void {
        this.searchTerm = val;
        this.filterUsers();
    }

    onRoleFilter(role: string): void {
        this.roleFilter = this.roleFilter === role ? '' : role;
        this.filterUsers();
    }

    createUser(): void {
        this.createSuccessMessage = '';
        this.createErrorMessage = '';

        if (!this.newUser.firstName || !this.newUser.lastName || !this.newUser.email || !this.newUser.password || !this.newUser.role) {
            this.createErrorMessage = 'Veuillez remplir tous les champs obligatoires.';
            return;
        }

        this.createLoading = true;

        this.userService.createUser(this.newUser).subscribe({
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
    }

    suspendUser(user: UserDTO): void {
        if (!confirm(`Suspendre ${user.firstName} ${user.lastName} ?`)) return;
        this.userService.suspendUser(user.id).subscribe(() => this.loadUsers());
    }

    activateUser(user: UserDTO): void {
        this.userService.activateUser(user.id).subscribe(() => this.loadUsers());
    }

    deleteUser(user: UserDTO): void {
        if (!confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) return;
        this.userService.deleteUser(user.id).subscribe(() => this.loadUsers());
    }
}