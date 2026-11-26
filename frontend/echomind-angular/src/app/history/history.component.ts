import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DemoAiService } from '../core/demo-ai.service';

type Filter = 'ALL' | 'CHAT' | 'VOICE' | 'DOCUMENT';

interface Row { id: number; type: Exclude<Filter, 'ALL'>; title: string; snippet: string; date: string; route: any[]; detail: string; }

@Component({
  selector: 'app-history',
  imports: [FormsModule, DatePipe],
  template: `
  <div class="card">
    <div class="row" style="margin-bottom:14px">
      <input style="flex:1;min-width:220px" placeholder="Search conversations, transcripts and documents…" [ngModel]="q()" (ngModelChange)="q.set($event)">
      <div class="seg">
        @for (f of filters; track f) {
          <button [class.on]="filter() === f" (click)="filter.set(f)">{{ f === 'ALL' ? 'All' : f[0] + f.slice(1).toLowerCase() }}</button>
        }
      </div>
    </div>
    <div class="small muted" style="margin-bottom:8px">{{ rows().length }} results</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Type</th><th>Title</th><th class="hide-sm">Details</th><th>Date</th><th></th></tr></thead>
        <tbody>
          @for (r of rows(); track r.type + r.id) {
            <tr>
              <td><span [class]="'badge ' + r.type">{{ r.type }}</span></td>
              <td><div class="ellipsis" style="max-width:320px">{{ r.title }}</div><div class="small muted ellipsis" style="max-width:320px">{{ r.snippet }}</div></td>
              <td class="hide-sm small muted">{{ r.detail }}</td>
              <td class="small">{{ r.date | date:'MMM d, y · h:mm a' }}</td>
              <td><button class="btn sm" (click)="router.navigate(r.route)">Open</button></td>
            </tr>
          } @empty { <tr><td colspan="5" class="empty">No matching activity.</td></tr> }
        </tbody>
      </table>
    </div>
  </div>
  `,
  styles: [`
    .seg { display:flex; border:1px solid var(--border); border-radius:10px; overflow:hidden; }
    .seg button { background:transparent; border:none; color: var(--muted); padding:8px 14px; cursor:pointer; font: inherit; }
    .seg button.on { background: var(--accent-soft); color: var(--text); }
    .table-wrap { overflow-x:auto; }
    table { width:100%; border-collapse: collapse; }
    th { text-align:left; font-size:12px; color: var(--muted); font-weight:500; padding:8px; border-bottom:1px solid var(--border); }
    td { padding:10px 8px; border-bottom:1px solid var(--border); vertical-align: middle; }
    @media (max-width: 700px) { .hide-sm { display:none; } }
  `]
})
export class HistoryComponent {
  ai = inject(DemoAiService);
  router = inject(Router);
  filters: Filter[] = ['ALL', 'CHAT', 'VOICE', 'DOCUMENT'];
  filter = signal<Filter>('ALL');
  q = signal('');

  all = computed<Row[]>(() => [
    ...this.ai.conversations().map(c => ({
      id: c.id, type: c.type, title: c.title, snippet: c.messages.at(-1)?.text ?? '', date: c.updatedAt,
      route: c.type === 'CHAT' ? ['/chat', c.id] : ['/insights', c.id], detail: `${c.messages.length} messages`
    })),
    ...this.ai.recordings().map(r => ({
      id: r.id, type: 'VOICE' as const, title: r.fileName, snippet: r.transcript, date: r.createdAt,
      route: ['/voice'], detail: `${Math.round(r.durationSeconds / 60)} min · ${r.language}`
    })),
    ...this.ai.documents().map(d => ({
      id: d.id, type: 'DOCUMENT' as const, title: d.fileName, snippet: d.summary, date: d.createdAt,
      route: ['/documents'], detail: `${d.sizeKb} KB · ${d.status}`
    }))
  ].sort((a, b) => b.date.localeCompare(a.date)));

  rows = computed(() => {
    const q = this.q().toLowerCase();
    return this.all().filter(r => (this.filter() === 'ALL' || r.type === this.filter())
      && (!q || r.title.toLowerCase().includes(q) || r.snippet.toLowerCase().includes(q)));
  });
}
