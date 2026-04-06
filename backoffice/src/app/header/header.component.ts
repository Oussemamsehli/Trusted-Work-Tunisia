import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService, RoleInfo, UserRole } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
    currentRoleInfo!: RoleInfo;
    isDarkMode = true;

    private subs: Subscription[] = [];
currentUser:any;
    constructor(
        private auth: AuthService,
        private theme: ThemeService
    ) { }

    ngOnInit(): void {
        this.subs.push(
            this.auth.currentRole$.subscribe(role => {
                this.currentRoleInfo = this.auth.getRoleInfo(role);
            })
        );
        this.subs.push(
            this.theme.isDarkMode$.subscribe(dm => this.isDarkMode = dm)
        );

            this.subs.push(
        this.auth.currentUser$.subscribe(user => {
            this.currentUser = user;
        })
    );
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe());
    }

    toggleTheme(): void {
        this.theme.toggle();
    }
}
