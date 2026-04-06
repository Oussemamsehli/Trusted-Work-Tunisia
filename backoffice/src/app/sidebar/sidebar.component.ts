import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, MenuItem, UserRole } from '../services/auth.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
    @Input() collapsed = false;
    @Output() collapsedChange = new EventEmitter<boolean>();

    activeItem = 'dashboard';
    menuItems: MenuItem[] = [];
    supportItems: MenuItem[] = [];
    roleColor = '#22D3EE';

    private sub!: Subscription;

    constructor(private auth: AuthService, private router: Router) {}

    ngOnInit(): void {
        this.sub = this.auth.currentRole$.subscribe(role => {
            const all = this.auth.getMenuItems(role);
            this.menuItems = all.filter(i => i.section === 'menu');
            this.supportItems = all.filter(i => i.section === 'support');
            this.roleColor = this.auth.getRoleInfo(role).color;
            this.activeItem = 'dashboard';
        });
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }

    toggleCollapse(): void {
        this.collapsed = !this.collapsed;
        this.collapsedChange.emit(this.collapsed);
    }

    setActive(id: string): void {
        this.activeItem = id;
        const item = [...this.menuItems, ...this.supportItems].find(i => i.id === id);
        if (item?.route) {
            this.router.navigate([item.route]);
        }
    }

    onLogout(): void {
        this.auth.logout();
    }
}