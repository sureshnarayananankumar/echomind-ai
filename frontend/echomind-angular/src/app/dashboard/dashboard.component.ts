import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DemoAiService } from '../core/demo-ai.service';
import { DASHBOARD_TOTALS, WEEKLY_USAGE } from '../core/demo-data';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe],
  template: `
  <div class="stack" style="gap:18px">
    <div class="card hero">
      <div>
        <span class="badge demo">Demo Mode · sample data</span>
        <h2 style="font-size:22px;margin-top:8px">Welcome back, Demo User</h2>
        <p class="muted" style="margin:4px 0 0">Turn chats, voice notes and documents into searchable knowledge.</p>
      </div>
      <div class="row">
        <a class="btn primary" routerLink="/chat">💬 New chat</a>
        <a class="btn" routerLink="/voice">🎙 Start voice session</a>
        <a class="btn" routerLink="/documents">📄 Analyze document</a>
      </div>
    </div>

    <div class="grid g-4">
      @for (s of stats; track s.label) {
        <div class="card stat">
          <div class="muted small">{{ s.label }}</div>
          <div class="stat-val">{{ s.value }}</div>
          <div class="small" [style.color]="'var(--good)'">{{ s.delta }}</div>
        </div>
      }
    </div>

    <div class="grid g-3x">
      <div class="card">
        <div class="card-head"><h2>Activity · last 7 days</h2>
          <div class="row small legend">
            <span><i style="background:#7c5cff"></i>Chat</span><span><i style="background:#2dd4bf"></i>Voice</span><span><i style="background:#3b82f6"></i>Document</span>
          </div>
        </div>
        <div class="bars" role="img" aria-label="Stacked bar chart of daily sessions by type">
          @for (d of usage; track d.day) {
            <div class="bar-col" [title]="d.day + ': ' + (d.chat + d.voice + d.document) + ' sessions'">
              <div class="bar-stack" [style.height.%]="(d.chat + d.voice + d.document) / maxDay * 100">
                <div [style.flex]="d.document" style="background:#3b82f6"></div>
                <div [style.flex]="d.voice" style="background:#2dd4bf"></div>
                <div [style.flex]="d.chat" style="background:#7c5cff"></div>
              </div>
              <div class="small muted">{{ d.day }}</div>
            </div>
          }
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Session mix</h2></div>
        <div class="donut-wrap">
          <svg viewBox="0 0 42 42" class="donut">
            @for (seg of mix(); track seg.label) {
              <circle cx="21" cy="21" r="15.915" fill="none" [attr.stroke]="seg.color" stroke-width="5"
                [attr.stroke-dasharray]="seg.pct + ' ' + (100 - seg.pct)" [attr.stroke-dashoffset]="25 - seg.offset"/>
            }
            <text x="21" y="22.5" text-anchor="middle" class="donut-text">{{ totals.conversations }}</text>
          </svg>
          <ul class="list">
            @for (seg of mix(); track seg.label) {
              <li class="row small" style="padding:4px 0"><i class="dot" [style.background]="seg.color"></i>{{ seg.label }}<span class="spacer"></span><b>{{ seg.value }}</b></li>
            }
          </ul>
        </div>
      </div>
    </div>

    <div class="grid g-2">
      <div class="card">
        <div class="card-head"><h2>Recent conversations</h2><a routerLink="/history" class="small">View all</a></div>
        <ul class="list">
          @for (c of recent(); track c.id) {
            <li class="list-item" [routerLink]="c.type === 'CHAT' ? ['/chat', c.id] : ['/insights', c.id]">
              <span class="badge" [class]="'badge ' + c.type">{{ c.type }}</span>
              <div class="grow"><div class="ellipsis">{{ c.title }}</div><div class="small muted">{{ c.messages.length }} messages</div></div>
              <span class="small muted">{{ c.updatedAt | date:'MMM d' }}</span>
            </li>
          }
        </ul>
      </div>
      <div class="card">
        <div class="card-head"><h2>Open action items</h2><a routerLink="/insights" class="small">Insights</a></div>
        <ul class="list">
          @for (a of actions(); track $index) {
            <li class="row" style="padding:7px 0;border-bottom:1px solid var(--border)">
              <span style="color:var(--accent)">☐</span><span class="grow">{{ a.text }}</span>
              <span class="small muted ellipsis" style="max-width:40%">{{ a.from }}</span>
            </li>
          }
        </ul>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .hero { display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap;
      background: linear-gradient(120deg, rgba(124,92,255,.22), rgba(59,130,246,.12) 60%, var(--panel)); }
    .stat-val { font-size: 28px; font-weight: 700; margin: 4px 0; }
    .g-3x { grid-template-columns: 2fr 1fr; }
    @media (max-width: 860px) { .g-3x { grid-template-columns: 1fr; } }
    .bars { display:flex; align-items:flex-end; gap:14px; height:220px; padding-top:8px; }
    .bar-col { flex:1; height:100%; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; gap:6px; }
    .bar-stack { width:100%; max-width:46px; display:flex; flex-direction:column; border-radius:8px 8px 3px 3px; overflow:hidden; }
    .bar-stack div { min-height:2px; }
    .bar-stack div + div { border-bottom: 2px solid var(--panel); }
    .legend i, .dot { display:inline-block; width:9px; height:9px; border-radius:3px; margin-right:5px; }
    .legend { gap: 12px; }
    .donut-wrap { display:flex; flex-direction:column; align-items:center; gap:12px; }
    .donut { width: 150px; transform: rotate(0deg); }
    .donut-text { font-size: 7px; font-weight: 700; fill: var(--text); }
    .donut-wrap .list { width: 100%; }
  `]
})
export class DashboardComponent {
  private ai = inject(DemoAiService);
  totals = DASHBOARD_TOTALS;
  usage = WEEKLY_USAGE;
  maxDay = Math.max(...WEEKLY_USAGE.map(d => d.chat + d.voice + d.document));

  stats = [
    { label: 'Total conversations', value: DASHBOARD_TOTALS.conversations, delta: '▲ 12% vs last week' },
    { label: 'Chat sessions', value: DASHBOARD_TOTALS.chatSessions, delta: '▲ 9%' },
    { label: 'Voice sessions', value: DASHBOARD_TOTALS.voiceSessions, delta: '▲ 21%' },
    { label: 'Minutes transcribed', value: DASHBOARD_TOTALS.minutesTranscribed, delta: '▲ 17%' }
  ];

  mix = computed(() => {
    const t = this.totals;
    const raw = [
      { label: 'Chat', value: t.chatSessions, color: '#7c5cff' },
      { label: 'Voice', value: t.voiceSessions, color: '#2dd4bf' },
      { label: 'Document', value: t.documentSessions, color: '#3b82f6' }
    ];
    let offset = 0;
    return raw.map(r => { const pct = r.value / t.conversations * 100; const seg = { ...r, pct, offset }; offset += pct; return seg; });
  });

  recent = computed(() => [...this.ai.conversations()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5));
  actions = computed(() => this.ai.conversations().flatMap(c => (c.insight?.actionItems ?? []).map(text => ({ text, from: c.title }))).slice(0, 6));
}
