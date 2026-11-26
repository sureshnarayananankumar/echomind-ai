import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService, UserSettings } from '../core/settings.service';
import { SpeechService } from '../core/speech.service';
import { DEMO_USER, WEEKLY_USAGE } from '../core/demo-data';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  template: `
  <div class="grid g-2" style="align-items:start">
    <div class="card stack" style="gap:14px">
      <div class="card-head" style="margin:0"><h2>Profile</h2><span class="badge demo">Demo account</span></div>
      <div><label>Display name</label><input [(ngModel)]="form.displayName"></div>
      <div><label>Email</label><input [value]="user.email" disabled></div>
      <div><label>Workspace</label><input [value]="user.plan" disabled></div>
    </div>

    <div class="card stack" style="gap:14px">
      <h2>Voice & language</h2>
      <div><label>Preferred language</label>
        <select [(ngModel)]="form.preferredLanguage">
          <option value="en-US">English (US)</option><option value="en-IN">English (India)</option><option value="en-GB">English (UK)</option>
          <option value="hi-IN">Hindi</option><option value="ta-IN">Tamil</option><option value="ar-SA">Arabic</option>
        </select></div>
      <div><label>Preferred voice</label>
        <select [(ngModel)]="form.preferredVoice">
          <option value="">Browser default</option>
          @for (v of voices; track v.name) { <option [value]="v.name">{{ v.name }} ({{ v.lang }})</option> }
        </select></div>
      <div><label>Speech rate: {{ form.speechRate }}</label><input type="range" min="0.5" max="2" step="0.1" [(ngModel)]="form.speechRate"></div>
      <label class="row" style="color:var(--text);font-size:14px"><input type="checkbox" style="width:auto" [(ngModel)]="form.speechEnabled"> Read replies aloud after voice input</label>
    </div>

    <div class="card stack" style="gap:14px">
      <h2>AI response preferences</h2>
      <div class="seg">
        @for (s of styles; track s) { <button type="button" [class.on]="form.responseStyle === s" (click)="form.responseStyle = s">{{ s }}</button> }
      </div>
      <div><label>Theme</label>
        <select [(ngModel)]="form.theme"><option value="dark">Dark</option><option value="light">Light</option></select></div>
      <div class="notice small">AI provider keys are configured on the Spring Boot backend via environment variables and are never stored in the browser.</div>
    </div>

    <div class="card">
      <div class="card-head"><h2>Usage history (7 days)</h2></div>
      <table style="width:100%;border-collapse:collapse" class="small">
        <tr class="muted"><th align="left">Day</th><th align="right">Chat</th><th align="right">Voice</th><th align="right">Docs</th></tr>
        @for (d of usage; track d.day) {
          <tr style="border-top:1px solid var(--border)"><td style="padding:6px 0">{{ d.day }}</td><td align="right">{{ d.chat }}</td><td align="right">{{ d.voice }}</td><td align="right">{{ d.document }}</td></tr>
        }
      </table>
    </div>
  </div>
  <div class="row" style="margin-top:16px;justify-content:flex-end">
    @if (saved()) { <span class="small" style="color:var(--good)">✓ Saved in this browser</span> }
    <button class="btn" (click)="reset()">Reset</button>
    <button class="btn primary" (click)="save()">Save settings</button>
  </div>
  `,
  styles: [`
    .seg { display:flex; border:1px solid var(--border); border-radius:10px; overflow:hidden; }
    .seg button { flex:1; background:transparent; border:none; color: var(--muted); padding:9px; cursor:pointer; font: inherit; }
    .seg button.on { background: var(--accent-soft); color: var(--text); }
  `]
})
export class SettingsComponent {
  private svc = inject(SettingsService);
  user = DEMO_USER;
  usage = WEEKLY_USAGE;
  voices = inject(SpeechService).voices();
  styles: UserSettings['responseStyle'][] = ['Concise', 'Balanced', 'Detailed'];
  form: UserSettings = { ...this.svc.settings() };
  saved = signal(false);

  save() { this.svc.update({ ...this.form, speechRate: +this.form.speechRate }); this.flash(); }
  reset() { this.svc.reset(); this.form = { ...this.svc.settings() }; this.flash(); }
  private flash() { this.saved.set(true); setTimeout(() => this.saved.set(false), 2000); }
}
