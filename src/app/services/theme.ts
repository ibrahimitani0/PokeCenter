import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Theme {
 private isDarkMode = false;

  constructor() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      this.enableDarkMode();
    } else {
      this.enableLightMode();
    }
  }

  enableDarkMode() {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
    localStorage.setItem('theme', 'dark');
    this.isDarkMode = true;
  }

  enableLightMode() {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    this.isDarkMode = false;
  }

  toggleTheme() {
    if (this.isDarkMode) {
      this.enableLightMode();
    } else {
      this.enableDarkMode();
    }
  }

  isDark(): boolean {
    return this.isDarkMode;
  }
}
