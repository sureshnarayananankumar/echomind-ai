import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemoAiService } from '../core/demo-ai.service';

interface QA { q: string; a: string; source?: string; }

@Component({
  selector: 'app-document-analyzer',
  imports: [FormsModule, DatePipe],
  template: `
  <div class="grid g-side" style="align-items:start">
    <div class="stack">
      <label class="card drop" [class.over]="over()" (dragover)="$event.preventDefault(); over.set(true)" (dragleave)="over.set(false)" (drop)="drop($event)">
        <input type="file" accept=".txt,.md,.pdf,text/plain,application/pdf" hidden (change)="pick($event)">
        <div style="font-size:28px">📄</div>
        <b>Drop a TXT or PDF file</b>
        <span class="small muted">or click to browse · processed in your browser</span>
      </label>
      @if (error()) { <div class="notice error small">{{ error() }}</div> }
      <div class="card">
        <div class="card-head"><h2>Documents</h2><span class="small muted">{{ ai.documents().length }}</span></div>
        <ul class="list">
          @for (d of ai.documents(); track d.id) {
            <li class="list-item" [class.selected]="d.id === selectedId()" (click)="select(d.id)">
              <span>{{ d.fileType.includes('pdf') ? '📕' : '📝' }}</span>
              <div class="grow"><div class="ellipsis">{{ d.fileName }}</div><div class="small muted">{{ d.sizeKb }} KB · {{ d.createdAt | date:'MMM d' }}</div></div>
              <span class="badge" [style.color]="d.status === 'PROCESSED' ? 'var(--good)' : ''">{{ d.status }}</span>
            </li>
          }
        </ul>
      </div>
    </div>

    @if (doc(); as d) {
      <div class="stack" style="gap:16px">
        <div class="card">
          <div class="card-head"><h2>{{ d.fileName }}</h2><span class="badge demo">Demo analysis</span></div>
          <h3 class="muted small">SUMMARY</h3>
          <p style="margin:6px 0 14px">{{ d.summary }}</p>
          <h3 class="muted small" style="margin-bottom:6px">KEY TERMS</h3>
          @for (k of d.keyTerms; track k) { <span class="chip">{{ k }}</span> }
        </div>
        <div class="card">
          <div class="card-head"><h2>Ask this document</h2></div>
          <form class="row" (ngSubmit)="ask()">
            <input style="flex:1;min-width:200px" [(ngModel)]="question" name="q" placeholder="e.g. How many days of remote work are allowed?">
            <button class="btn primary" [disabled]="!question.trim()">Ask</button>
          </form>
          <div class="stack" style="margin-top:14px">
            @for (x of answers(); track $index) {
              <div class="qa"><div class="small muted">Q: {{ x.q }}</div><div>{{ x.a }}</div>
                @if (x.source) { <div class="small src">Source passage highlighted below</div> }</div>
            }
          </div>
        </div>
        <div class="card">
          <div class="card-head"><h2>Extracted passages</h2><span class="small muted">{{ d.chunks.length }} chunks</span></div>
          <ol class="chunks">
            @for (c of d.chunks; track $index) { <li [class.hit]="c === lastSource()">{{ c }}</li> }
          </ol>
        </div>
      </div>
    } @else {
      <div class="card empty">Upload or select a document to see its analysis.</div>
    }
  </div>
  `,
  styles: [`
    .drop { display:flex; flex-direction:column; align-items:center; gap:4px; text-align:center; border-style:dashed; cursor:pointer; padding:26px; margin:0; color: var(--text); }
    .drop.over { border-color: var(--accent); background: var(--accent-soft); }
    .qa { padding:10px 12px; border-left:3px solid var(--accent); background: var(--panel-2); border-radius: 8px; }
    .src { color: var(--accent); margin-top:4px; }
    .chunks { margin:0; padding-left:20px; display:flex; flex-direction:column; gap:8px; }
    .chunks li { padding:6px 8px; border-radius:8px; }
    .chunks li.hit { background: var(--accent-soft); outline:1px solid var(--accent); }
  `]
})
export class DocumentAnalyzerComponent {
  ai = inject(DemoAiService);
  selectedId = signal<number | null>(this.ai.documents()[0]?.id ?? null);
  doc = computed(() => this.ai.documents().find(d => d.id === this.selectedId()));
  question = '';
  qa = signal<Record<number, QA[]>>({});
  answers = computed(() => this.qa()[this.selectedId() ?? -1] ?? []);
  lastSource = computed(() => this.answers()[0]?.source);
  over = signal(false);
  error = signal<string | null>(null);

  select(id: number) { this.selectedId.set(id); }

  pick(e: Event) { const f = (e.target as HTMLInputElement).files?.[0]; if (f) this.process(f); }
  drop(e: DragEvent) { e.preventDefault(); this.over.set(false); const f = e.dataTransfer?.files?.[0]; if (f) this.process(f); }

  async process(f: File) {
    this.error.set(null);
    if (f.size > 5 * 1024 * 1024) { this.error.set('File is larger than 5 MB.'); return; }
    let text: string;
    if (f.type === 'application/pdf' || f.name.endsWith('.pdf')) {
      text = await this.roughPdfText(f);
      if (text.length < 40) {
        text = `This PDF (${f.name}) could not be parsed in the browser demo. With the backend running, PDFs are extracted server-side (Apache PDFBox) via POST /api/documents.`;
      }
    } else {
      text = await f.text();
    }
    const d = this.ai.analyzeText(f.name, text);
    if (f.type) d.fileType = f.type;
    this.selectedId.set(d.id);
  }

  /** Best-effort extraction of literal text runs from uncompressed PDFs (demo only). */
  private async roughPdfText(f: File): Promise<string> {
    const raw = new TextDecoder('latin1').decode(await f.arrayBuffer());
    const parts = raw.match(/\(([^()]{2,})\)\s*Tj/g) || [];
    return parts.map(p => p.replace(/^\(|\)\s*Tj$/g, '')).join(' ');
  }

  ask() {
    const d = this.doc();
    const q = this.question.trim();
    if (!d || !q) return;
    const r = this.ai.askDocument(d, q);
    this.qa.update(m => ({ ...m, [d.id]: [{ q, a: r.answer, source: r.source }, ...(m[d.id] ?? [])] }));
    this.question = '';
  }
}
