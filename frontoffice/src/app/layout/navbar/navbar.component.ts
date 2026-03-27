import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(private auth: AuthService) {}

  logout(): void {
    this.auth.logout();
  }

  getEmail(): string {
    return this.auth.getEmail();
  }

  getInitials(): string {
    const email = this.auth.getEmail();
    return email ? email.charAt(0).toUpperCase() : 'U';
  }
}