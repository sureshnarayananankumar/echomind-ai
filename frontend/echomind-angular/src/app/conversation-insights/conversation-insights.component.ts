import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { DemoAiService } from '../core/demo-ai.service';
import { Insight } from '../core/demo-data';

@Component({
  selector: 'app-conversation-insights',
  imports: [DatePipe],
  template: `
  <div class="grid g-side" style="align-items:start">
    <div class="card">
      <div class="card-head"><h2>Conversations</h2></div>
      <ul class="list">
        @for (c of ai.conversations(); track c.id) {
          <li class="list-item" [class.selected]="c.id === activeId()" (click)="router.navigate(['/insights', c.id])">
            <div class="grow"><div class="ellipsis">{{ c.title }}</div>
              <div class="row small muted" style="gap:6px"><span [class]="'badge ' + c.type">{{ c.type }}</span>{{ c.updatedAt | date:'MMM d' }}</div></div>
          </li>
        }
      </ul>
    </div>

    @if (active(); as c) {
      <div class="stack" style="gap:16px">
        <div class="card">
          <div class="card-head">
            <div><h2>{{ c.title }}</h2><span class="small muted">{{ c.messages.length }} messages · {{ c.createdAt | date:'medium' }}</span></div>
            <span class="badge demo">{{ c.insight ? 'Sample insight' : 'Demo heuristic' }}</span>
          </div>
          <h3 class="muted small">SUMMARY</h3>
          <p style="margin:6px 0 0">{{ insight()?.summary }}</p>
        </div>
        <div class="grid g-2">
          <div class="card">
            <h3 class="muted small">SENTIMENT</h3>
            <div class="row" style="margin:10px 0">
              <span [class]="'badge ' + insight()?.sentiment" style="font-size:13px">{{ insight()?.sentiment }}</span>
              <span class="spacer"></span><b>{{ insight()?.sentimentScore }}/100</b>
            </div>
            <div class="meter"><div [style.width.%]="insight()?.sentimentScore"></div></div>
          </div>
          <div class="card">
            <h3 class="muted small" style="margin-bottom:10px">TOPICS & KEYWORDS</h3>
            @for (k of insight()?.keywords; track k) { <span class="chip">{{ k }}</span> }
          </div>
        </div>
        <div class="grid g-2">
          <div class="card">
            <h3 class="muted small" style="margin-bottom:8px">ACTION ITEMS</h3>
            <ul class="list">
              @for (a of insight()?.actionItems; track $index) {
                <li class="row" style="padding:6px 0;align-items:flex-start">
                  <input type="checkbox" style="width:auto;margin-top:3px" [checked]="done().has(a)" (change)="toggle(a)">
                  <span [style.text-decoration]="done().has(a) ? 'line-through' : ''">{{ a }}</span></li>
              }
            </ul>
          </div>
          <div class="card">
            <h3 class="muted small" style="margin-bottom:8px">DECISIONS</h3>
            @for (d of insight()?.decisions; track $index) { <p style="margin:0 0 6px">✔ {{ d }}</p> }
            @empty { <p class="muted small">No decisions recorded.</p> }
          </div>
        </div>
        <div class="card">
          <h3 class="muted small" style="margin-bottom:8px">TRANSCRIPT</h3>
          @for (m of c.messages; track m.id) {
            <p style="margin:0 0 8px"><b>{{ m.sender === 'USER' ? 'User' : 'EchoMind' }}:</b> {{ m.text }}</p>
          }
        </div>
      </div>
    } @else { <div class="card empty">Select a conversation.</div> }
  </div>
  `,
  styles: [`
    .meter { height:8px; border-radius:999px; background: var(--panel-2); overflow:hidden; }
    .meter div { height:100%; background: linear-gradient(90deg, var(--bad), var(--warn), var(--good)); }
  `]
})
export class ConversationInsightsComponent {
  id = input<string>();
  ai = inject(DemoAiService);
  router = inject(Router);
  activeId = signal<number | null>(null);
  done = signal(new Set<string>());

  active = computed(() => this.ai.conversations().find(c => c.id === this.activeId()));
  insight = computed<Insight | undefined>(() => { const c = this.active(); return c ? c.insight ?? this.ai.generateInsight(c) : undefined; });

  constructor() {
    effect(() => this.activeId.set(Number(this.id()) || this.ai.conversations()[0]?.id || null), { allowSignalWrites: true });
  }

  toggle(a: string) {
    this.done.update(s => { const n = new Set(s); n.has(a) ? n.delete(a) : n.add(a); return n; });
  }
}
