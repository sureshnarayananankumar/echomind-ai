import { Component, ElementRef, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DemoAiService } from '../core/demo-ai.service';
import { SpeechService } from '../core/speech.service';
import { SettingsService } from '../core/settings.service';

@Component({
  selector: 'app-ai-chat',
  imports: [FormsModule, DatePipe],
  template: `
  <div class="grid g-side chat-layout">
    <div class="card conv-list">
      <div class="card-head"><h2>Conversations</h2><button class="btn sm primary" (click)="newChat()">+ New</button></div>
      <input placeholder="Search conversations…" [(ngModel)]="search" />
      <ul class="list" style="margin-top:10px">
        @for (c of filtered(); track c.id) {
          <li class="list-item" [class.selected]="c.id === activeId()" (click)="open(c.id)">
            <div class="grow"><div class="ellipsis">{{ c.title }}</div><div class="small muted">{{ c.updatedAt | date:'MMM d, h:mm a' }}</div></div>
          </li>
        } @empty { <li class="empty small">No chats match.</li> }
      </ul>
    </div>

    <div class="card chat-pane">
      @if (active(); as c) {
        <div class="card-head">
          <div><h2>{{ c.title }}</h2><span class="badge demo">Demo responses</span></div>
          <div class="row">
            <button class="btn sm" (click)="exportChat()">⬇ Export</button>
            <button class="btn sm danger" (click)="remove(c.id)">Delete</button>
          </div>
        </div>
        <div class="messages" #scroller>
          @for (m of c.messages; track m.id) {
            <div class="msg" [class.user]="m.sender === 'USER'">
              <div class="bubble">
                <div class="who small">{{ m.sender === 'USER' ? 'You' : 'EchoMind (demo)' }} · {{ m.createdAt | date:'h:mm a' }}</div>
                <div>{{ m.text }}</div>
                @if (m.sender === 'ASSISTANT') {
                  <div class="row tools">
                    <button class="btn sm" (click)="copy(m.text)">{{ copied() === m.id ? '✓ Copied' : 'Copy' }}</button>
                    <button class="btn sm" (click)="speak(m.text)">🔊 Listen</button>
                  </div>
                }
              </div>
            </div>
          } @empty {
            <div class="empty">Start the conversation — try “Help me plan a project roadmap”.</div>
          }
          @if (thinking()) { <div class="msg"><div class="bubble typing"><span></span><span></span><span></span></div></div> }
        </div>
        <form class="composer" (ngSubmit)="send()">
          <textarea rows="2" [(ngModel)]="draft" name="draft" placeholder="Message EchoMind… (Enter to send, Shift+Enter for new line)"
            (keydown.enter)="onEnter($event)"></textarea>
          <button type="button" class="icon-btn" [class.rec]="speech.listening()" (click)="toggleMic()" title="Dictate">🎙</button>
          <button class="btn primary" [disabled]="!draft.trim() || thinking()">Send</button>
        </form>
        @if (speech.error()) { <div class="notice error small" style="margin-top:8px">{{ speech.error() }}</div> }
      } @else {
        <div class="empty">Select a conversation or start a new one.<br><br><button class="btn primary" (click)="newChat()">+ New chat</button></div>
      }
    </div>
  </div>
  `,
  styles: [`
    .chat-layout { align-items: start; }
    .conv-list { max-height: calc(100vh - 130px); overflow: auto; }
    .chat-pane { display:flex; flex-direction:column; height: calc(100vh - 130px); min-height: 480px; }
    .messages { flex:1; overflow:auto; display:flex; flex-direction:column; gap:12px; padding: 4px 2px 12px; }
    .msg { display:flex; }
    .msg.user { justify-content:flex-end; }
    .bubble { max-width: 78%; background: var(--panel-2); border:1px solid var(--border); padding:10px 14px; border-radius: 14px 14px 14px 4px; white-space: pre-wrap; }
    .msg.user .bubble { background: linear-gradient(135deg, var(--accent), var(--accent-2)); color:#fff; border-color: transparent; border-radius: 14px 14px 4px 14px; }
    .who { opacity:.7; margin-bottom:3px; }
    .tools { margin-top:8px; }
    .composer { display:flex; gap:8px; align-items:flex-end; border-top:1px solid var(--border); padding-top:12px; }
    .composer textarea { resize: none; }
    .rec { background: var(--bad); color:#fff; animation: pulse 1.2s infinite; }
    @keyframes pulse { 50% { box-shadow: 0 0 0 6px rgba(239,68,68,.25); } }
    .typing span { display:inline-block; width:7px; height:7px; margin:0 2px; border-radius:50%; background: var(--muted); animation: blink 1s infinite; }
    .typing span:nth-child(2) { animation-delay:.2s } .typing span:nth-child(3) { animation-delay:.4s }
    @keyframes blink { 50% { opacity:.2 } }
  `]
})
export class AiChatComponent {
  id = input<string>();
  private ai = inject(DemoAiService);
  private router = inject(Router);
  speech = inject(SpeechService);
  private settings = inject(SettingsService);
  scroller = viewChild<ElementRef<HTMLDivElement>>('scroller');

  search = '';
  draft = '';
  thinking = signal(false);
  copied = signal<number | null>(null);
  activeId = signal<number | null>(null);

  chats = computed(() => this.ai.conversations().filter(c => c.type === 'CHAT'));
  active = computed(() => this.ai.conversations().find(c => c.id === this.activeId()));

  constructor() {
    effect(() => {
      const id = Number(this.id());
      this.activeId.set(id || this.chats()[0]?.id || null);
    }, { allowSignalWrites: true });
    effect(() => { this.active()?.messages.length; this.thinking(); queueMicrotask(() => this.scrollDown()); });
  }

  filtered() {
    const q = this.search.toLowerCase();
    return this.chats().filter(c => !q || c.title.toLowerCase().includes(q) || c.messages.some(m => m.text.toLowerCase().includes(q)));
  }

  open(id: number) { this.router.navigate(['/chat', id]); }

  newChat() {
    const c = this.ai.createConversation('New conversation');
    this.open(c.id);
  }

  remove(id: number) {
    if (!confirm('Delete this conversation? (demo data only)')) return;
    this.ai.deleteConversation(id);
    this.router.navigate(['/chat']);
  }

  onEnter(e: Event) {
    const ke = e as KeyboardEvent;
    if (!ke.shiftKey) { ke.preventDefault(); this.send(); }
  }

  async send() {
    const c = this.active();
    const text = this.draft.trim();
    if (!c || !text || this.thinking()) return;
    this.draft = '';
    if (c.messages.length === 0 && c.title === 'New conversation') {
      this.ai.conversations.update(l => l.map(x => x.id === c.id ? { ...x, title: text.slice(0, 48) } : x));
    }
    this.ai.addMessage(c.id, 'USER', text);
    this.thinking.set(true);
    const reply = await this.ai.reply(text);
    this.ai.addMessage(c.id, 'ASSISTANT', reply);
    this.thinking.set(false);
    if (this.settings.settings().speechEnabled && this.lastWasVoice) this.speak(reply);
    this.lastWasVoice = false;
  }

  private lastWasVoice = false;
  toggleMic() {
    if (this.speech.listening()) { this.speech.stop(); return; }
    this.speech.start(this.settings.settings().preferredLanguage, t => { this.draft = (this.draft + ' ' + t).trim(); this.lastWasVoice = true; });
  }

  speak(text: string) {
    const s = this.settings.settings();
    this.speech.speak(text, { lang: s.preferredLanguage, voiceName: s.preferredVoice, rate: s.speechRate });
  }

  async copy(text: string) {
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    const msg = this.active()?.messages.find(m => m.text === text);
    this.copied.set(msg?.id ?? null);
    setTimeout(() => this.copied.set(null), 1500);
  }

  exportChat() {
    const c = this.active();
    if (!c) return;
    const md = `# ${c.title}\n\n_Exported from EchoMind AI (Demo Mode)_\n\n` +
      c.messages.map(m => `**${m.sender === 'USER' ? 'You' : 'EchoMind'}** (${m.createdAt}):\n\n${m.text}\n`).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
    a.download = `${c.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  private scrollDown() {
    const el = this.scroller()?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
