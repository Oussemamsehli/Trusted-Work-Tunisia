import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private darkModeSubject = new BehaviorSubject<boolean>(
        localStorage.getItem('tw-theme') ? localStorage.getItem('tw-theme') === 'dark' : true
    );
    isDarkMode$ = this.darkModeSubject.asObservable();

    constructor() {
        this.applyTheme(this.darkModeSubject.value);
    }

    get isDarkMode(): boolean {
        return this.darkModeSubject.value;
    }

    toggle(): void {
        const newVal = !this.isDarkMode;
        this.darkModeSubject.next(newVal);
        this.applyTheme(newVal);
        localStorage.setItem('tw-theme', newVal ? 'dark' : 'light');
    }

    private applyTheme(isDark: boolean): void {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
}
