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

  // ─── Formulaire de création ───────────────────────────────────────────────
  newUser: AdminCreateUserRequest = {
    cin: 0,
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    photo: null,
    role: 'FREELANCER'
  };

  // Fichier sélectionné pour l'upload
  selectedPhotoFile: File | null = null;
  photoPreviewUrl: string | null = null;

  availableRoles: string[] = ['ADMIN', 'FREELANCER', 'CLIENT', 'MODERATOR', 'ARBITER'];

  createLoading = false;
  createSuccessMessage = '';
  createErrorMessage = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // ─── Chargement ───────────────────────────────────────────────────────────

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

  // ─── Filtrage / Recherche ─────────────────────────────────────────────────

  filterUsers(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredUsers = this.users.filter((u) => {
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const cinStr = String(u.cin || '');
      const matchSearch =
        !term ||
        fullName.includes(term) ||
        email.includes(term) ||
        cinStr.includes(term);
      const matchRole = !this.roleFilter || (u.role || '').toUpperCase() === this.roleFilter;
      return matchSearch && matchRole;
    });
  }

  onSearch(value: string): void { this.searchTerm = value; this.filterUsers(); }
  onRoleFilter(role: string): void { this.roleFilter = role; this.filterUsers(); }

  // ─── Gestion de la photo ──────────────────────────────────────────────────

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.selectedPhotoFile = file;

    // Prévisualisation locale
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoPreviewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // On stocke uniquement le nom du fichier dans le champ photo
    // L'admin devra copier le fichier dans htdocs/images manuellement
    // ou via un mécanisme d'upload côté serveur PHP/Apache.
    this.newUser.photo = file.name;
  }

  /**
   * Retourne l'URL complète vers l'image dans htdocs/images.
   */
  getPhotoUrl(photoName: string | null | undefined): string | null {
    return this.userService.getPhotoUrl(photoName);
  }

  // ─── Création d'utilisateur ───────────────────────────────────────────────

  createUser(): void {
    this.createSuccessMessage = '';
    this.createErrorMessage = '';

    if (
      !this.newUser.cin ||
      !this.newUser.firstName?.trim() ||
      !this.newUser.lastName?.trim() ||
      !this.newUser.email?.trim() ||
      !this.newUser.password?.trim() ||
      !this.newUser.role?.trim()
    ) {
      this.createErrorMessage = 'Veuillez remplir tous les champs obligatoires (CIN inclus).';
      return;
    }

    this.createLoading = true;

    const payload: AdminCreateUserRequest = {
      cin: this.newUser.cin,
      firstName: this.newUser.firstName.trim(),
      lastName: this.newUser.lastName.trim(),
      email: this.newUser.email.trim(),
      password: this.newUser.password,
      phoneNumber: this.newUser.phoneNumber?.trim() || '',
      photo: this.newUser.photo || null,
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
          'Erreur lors de la création de l\'utilisateur.';
      }
    });
  }

  resetCreateForm(): void {
    this.newUser = {
      cin: 0,
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: '',
      photo: null,
      role: 'FREELANCER'
    };
    this.selectedPhotoFile = null;
    this.photoPreviewUrl = null;
    this.createErrorMessage = '';
    this.createSuccessMessage = '';
  }

  // ─── Actions Admin ────────────────────────────────────────────────────────

  suspendUser(user: UserDTO): void {
    if (!confirm(`Suspendre ${user.firstName} ${user.lastName} ?`)) return;
    this.userService.suspendUser(user.id).subscribe({ next: () => this.loadUsers() });
  }

  activateUser(user: UserDTO): void {
    if (!confirm(`Réactiver ${user.firstName} ${user.lastName} ?`)) return;
    this.userService.activateUser(user.id).subscribe({ next: () => this.loadUsers() });
  }

  deleteUser(user: UserDTO): void {
    if (!confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) return;
    // Le backend attend le CIN, pas l'id DB
    this.userService.deleteUser(user.cin).subscribe({ next: () => this.loadUsers() });
  }
}