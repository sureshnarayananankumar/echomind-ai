import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SettingsService } from './core/settings.service';

interface NavItem { path: string; label: string; icon: string; }

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <div class="shell" [class.nav-open]="navOpen()">
    <aside class="sidebar">
      <div class="brand">
        <div class="logo" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="30" height="30"><rect width="32" height="32" rx="9" fill="url(#g)"/>
            <path d="M8 16h2M12 11v10M16 7v18M20 11v10M24 14v4" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
            <defs><linearGradient id="g" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#7c5cff"/><stop offset="1" stop-color="#3b82f6"/></linearGradient></defs></svg>
        </div>
        <div><div class="brand-name">EchoMind AI</div><div class="brand-tag">Speak. Ask. Understand.</div></div>
      </div>
      <nav>
        @for (item of nav; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="active" (click)="navOpen.set(false)">
            <span class="ico" [innerHTML]="item.icon"></span>{{ item.label }}
          </a>
        }
      </nav>
      <div class="side-foot">
        <span class="badge demo">Demo Mode</span>
        <p>Simulated AI responses and sample data. No real model output.</p>
      </div>
    </aside>
    <div class="scrim" (click)="navOpen.set(false)"></div>
    <main>
      <header class="topbar">
        <button class="icon-btn menu" (click)="navOpen.set(!navOpen())" aria-label="Toggle navigation">☰</button>
        <h1>{{ title() }}</h1>
        <div class="top-right">
          <button class="icon-btn" (click)="toggleTheme()" [attr.aria-label]="'Switch theme'">{{ settings.settings().theme === 'dark' ? '☀' : '☾' }}</button>
          <div class="avatar" title="Demo user">{{ initials() }}</div>
        </div>
      </header>
      <section class="content"><router-outlet /></section>
    </main>
  </div>
  `
})
export class AppComponent {
  settings = inject(SettingsService);
  private router = inject(Router);
  navOpen = signal(false);
  title = signal('Dashboard');

  nav: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: '▦' },
    { path: '/chat', label: 'AI Chat', icon: '💬' },
    { path: '/voice', label: 'Voice Studio', icon: '🎙' },
    { path: '/documents', label: 'Document Analyzer', icon: '📄' },
    { path: '/insights', label: 'Conversation Insights', icon: '✦' },
    { path: '/history', label: 'History', icon: '⟲' },
    { path: '/settings', label: 'Settings', icon: '⚙' }
  ];

  constructor() {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        const item = this.nav.find(n => e.urlAfterRedirects.startsWith(n.path));
        this.title.set(item?.label ?? 'EchoMind AI');
        document.title = `${item?.label ?? 'Home'} · EchoMind AI`;
      }
    });
  }

  initials() {
    return this.settings.settings().displayName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  }

  toggleTheme() {
    this.settings.update({ theme: this.settings.settings().theme === 'dark' ? 'light' : 'dark' });
  }
}
