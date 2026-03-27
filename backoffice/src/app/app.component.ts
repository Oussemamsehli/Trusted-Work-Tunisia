import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'TrustedWork';
  sidebarCollapsed = false;
  isAuthPage = true;

  private authPages = ['/login', '/forgot-password', '/reset-password'];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkUrl(this.router.url);

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => {
      this.checkUrl(event.urlAfterRedirects || event.url);
    });
  }

  private checkUrl(url: string): void {
    this.isAuthPage = this.authPages.some(page => url === page || url.startsWith(page + '?'));
  }

  onSidebarToggle(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }
}