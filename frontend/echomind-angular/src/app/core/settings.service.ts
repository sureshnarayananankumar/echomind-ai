import { Injectable, signal, effect } from '@angular/core';

export interface UserSettings {
  displayName: string;
  preferredLanguage: string;
  preferredVoice: string;
  speechEnabled: boolean;
  speechRate: number;
  responseStyle: 'Concise' | 'Balanced' | 'Detailed';
  theme: 'dark' | 'light';
}

const KEY = 'echomind.settings';
const DEFAULTS: UserSettings = {
  displayName: 'Demo User',
  preferredLanguage: 'en-US',
  preferredVoice: '',
  speechEnabled: true,
  speechRate: 1,
  responseStyle: 'Balanced',
  theme: 'dark'
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly settings = signal<UserSettings>(this.load());

  constructor() {
    effect(() => {
      const s = this.settings();
      document.documentElement.dataset['theme'] = s.theme;
      try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
    });
  }

  update(patch: Partial<UserSettings>) {
    this.settings.update(s => ({ ...s, ...patch }));
  }

  reset() { this.settings.set({ ...DEFAULTS }); }

  private load(): UserSettings {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    } catch { return { ...DEFAULTS }; }
  }
}
