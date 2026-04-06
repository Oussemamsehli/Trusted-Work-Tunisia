import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent {
  @Input()  sidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  currentDate = new Date();

  constructor(private router: Router) {}

  onToggle() {
    this.toggleSidebar.emit();
  }

  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }
}