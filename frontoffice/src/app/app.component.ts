import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  isAuthPage = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateAuthPage(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateAuthPage(event.urlAfterRedirects);
      });
  }

  private updateAuthPage(url: string): void {
    this.isAuthPage =
      url === '/login' ||
      url === '/register' ||
      url === '/forgot-password' ||
      url.startsWith('/reset-password');
  }
}