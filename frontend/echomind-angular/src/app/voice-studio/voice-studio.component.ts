import { Component, ElementRef, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemoAiService } from '../core/demo-ai.service';
import { SpeechService } from '../core/speech.service';
import { SettingsService } from '../core/settings.service';

@Component({
  selector: 'app-voice-studio',
  imports: [FormsModule, DatePipe],
  template: `
  <div class="stack" style="gap:16px">
    @if (!speech.recognitionSupported) {
      <div class="notice">Live speech recognition isn't available in this browser. Chrome or Edge on desktop works best. You can still record audio, type a transcript and use text-to-speech.</div>
    }
    <div class="grid g-2">
      <div class="card">
        <div class="card-head"><h2>Record</h2>
          <span class="badge" [style.color]="recording() ? 'var(--bad)' : ''">{{ recording() ? '● Recording ' + fmt(elapsed()) : 'Idle' }}</span>
        </div>
        <canvas #wave class="wave" width="600" height="120" aria-label="Live microphone waveform"></canvas>
        <div class="row" style="margin-top:14px">
          <div style="flex:1;min-width:140px"><label>Language</label>
            <select [(ngModel)]="lang">
              @for (l of languages; track l.code) { <option [value]="l.code">{{ l.name }}</option> }
            </select>
          </div>
          <button class="mic" [class.on]="recording()" (click)="toggle()" [attr.aria-label]="recording() ? 'Stop recording' : 'Start recording'">
            {{ recording() ? '■' : '🎙' }}
          </button>
        </div>
        @if (speech.error() || micError()) { <div class="notice error small" style="margin-top:10px">{{ micError() || speech.error() }}</div> }
        <div class="row" style="margin-top:14px">
          <label class="btn sm" style="margin:0">⬆ Upload audio<input type="file" accept="audio/*" hidden (change)="upload($event)"></label>
          @if (audioUrl()) { <audio [src]="audioUrl()" controls style="height:34px;flex:1;min-width:180px"></audio> }
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h2>Transcript</h2>
          <div class="row"><button class="btn sm" (click)="transcript.set('')">Clear</button>
          <button class="btn sm primary" [disabled]="!transcript().trim()" (click)="save()">Save</button></div>
        </div>
        <textarea rows="7" [ngModel]="transcript()" (ngModelChange)="transcript.set($event)" placeholder="Your speech will appear here. You can edit it before saving."></textarea>
        @if (speech.interim()) { <p class="small muted" style="margin:6px 0 0"><i>{{ speech.interim() }}</i></p> }
        @if (saved()) { <p class="small" style="color:var(--good);margin:6px 0 0">✓ Saved to recording history</p> }
      </div>
    </div>

    <div class="grid g-2">
      <div class="card">
        <div class="card-head"><h2>Text-to-speech</h2>
          @if (!speech.synthesisSupported) { <span class="badge">Not supported</span> }</div>
        <textarea rows="4" [(ngModel)]="ttsText" placeholder="Type something for EchoMind to read aloud"></textarea>
        <div class="row" style="margin-top:10px">
          <div style="flex:2;min-width:160px"><label>Voice</label>
            <select [(ngModel)]="voice">
              <option value="">Browser default</option>
              @for (v of voices(); track v.name) { <option [value]="v.name">{{ v.name }} ({{ v.lang }})</option> }
            </select></div>
          <div style="flex:1;min-width:100px"><label>Rate {{ rate }}</label><input type="range" min="0.5" max="2" step="0.1" [(ngModel)]="rate"></div>
        </div>
        <div class="row" style="margin-top:12px">
          <button class="btn primary" [disabled]="!ttsText.trim()" (click)="speak(ttsText)">▶ Speak</button>
          <button class="btn" (click)="speech.stopSpeaking()">■ Stop</button>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h2>Recording history</h2><span class="small muted">{{ ai.recordings().length }} items</span></div>
        <ul class="list">
          @for (r of ai.recordings(); track r.id) {
            <li class="list-item" (click)="transcript.set(r.transcript)">
              <span>🎧</span>
              <div class="grow"><div class="ellipsis">{{ r.fileName }}</div>
                <div class="small muted ellipsis">{{ r.transcript }}</div></div>
              <div class="small muted" style="text-align:right">{{ fmt(r.durationSeconds) }}<br>{{ r.createdAt | date:'MMM d' }}</div>
              <button class="btn sm" (click)="speak(r.transcript); $event.stopPropagation()">🔊</button>
            </li>
          }
        </ul>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .wave { width:100%; height:120px; background: var(--bg-2); border-radius: 12px; border:1px solid var(--border); display:block; }
    .mic { width:64px; height:64px; border-radius:50%; border:none; cursor:pointer; font-size:24px; color:#fff;
      background: linear-gradient(135deg, var(--accent), var(--accent-2)); box-shadow: 0 6px 20px rgba(124,92,255,.45); }
    .mic.on { background: var(--bad); animation: ring 1.3s infinite; }
    @keyframes ring { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,.5) } 100% { box-shadow: 0 0 0 18px rgba(239,68,68,0) } }
  `]
})
export class VoiceStudioComponent implements OnDestroy {
  ai = inject(DemoAiService);
  speech = inject(SpeechService);
  private settings = inject(SettingsService);
  wave = viewChild<ElementRef<HTMLCanvasElement>>('wave');

  languages = [
    { code: 'en-US', name: 'English (US)' }, { code: 'en-IN', name: 'English (India)' }, { code: 'en-GB', name: 'English (UK)' },
    { code: 'hi-IN', name: 'Hindi' }, { code: 'ta-IN', name: 'Tamil' }, { code: 'ar-SA', name: 'Arabic' },
    { code: 'fr-FR', name: 'French' }, { code: 'es-ES', name: 'Spanish' }, { code: 'de-DE', name: 'German' }
  ];
  lang = this.settings.settings().preferredLanguage;
  voice = this.settings.settings().preferredVoice;
  rate = this.settings.settings().speechRate;
  ttsText = 'Hello, I am EchoMind. Speak, ask, understand, discover.';

  recording = signal(false);
  elapsed = signal(0);
  transcript = signal('');
  saved = signal(false);
  micError = signal<string | null>(null);
  audioUrl = signal<string | null>(null);
  voices = signal<SpeechSynthesisVoice[]>([]);

  private stream?: MediaStream;
  private recorder?: MediaRecorder;
  private chunks: Blob[] = [];
  private audioCtx?: AudioContext;
  private raf = 0;
  private timer: any;

  constructor() {
    const load = () => this.voices.set(this.speech.voices());
    load();
    if (this.speech.synthesisSupported) window.speechSynthesis.onvoiceschanged = load;
    queueMicrotask(() => this.drawIdle());
  }

  async toggle() {
    if (this.recording()) return this.stop();
    this.micError.set(null); this.saved.set(false);
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      this.micError.set('Microphone access was blocked or no microphone was found. Check your browser permissions.');
      return;
    }
    this.chunks = [];
    if ('MediaRecorder' in window) {
      this.recorder = new MediaRecorder(this.stream);
      this.recorder.ondataavailable = e => this.chunks.push(e.data);
      this.recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        this.audioUrl.set(URL.createObjectURL(blob));
      };
      this.recorder.start();
    }
    this.visualize(this.stream);
    this.speech.start(this.lang, t => this.transcript.update(x => (x + ' ' + t).trim()));
    this.recording.set(true);
    this.elapsed.set(0);
    this.timer = setInterval(() => this.elapsed.update(s => s + 1), 1000);
  }

  stop() {
    this.speech.stop();
    this.recorder?.state === 'recording' && this.recorder.stop();
    this.stream?.getTracks().forEach(t => t.stop());
    cancelAnimationFrame(this.raf);
    this.audioCtx?.close();
    clearInterval(this.timer);
    this.recording.set(false);
    this.drawIdle();
  }

  save() {
    this.ai.addRecording(this.transcript().trim(), this.elapsed() || Math.round(this.transcript().split(' ').length / 2.5), this.lang);
    this.saved.set(true);
  }

  upload(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.audioUrl.set(URL.createObjectURL(f));
    this.transcript.set(`[Demo Mode] "${f.name}" loaded. Server-side transcription runs via POST /api/voice/transcribe when the backend speech provider is configured.`);
  }

  speak(text: string) { this.speech.speak(text, { lang: this.lang, voiceName: this.voice, rate: +this.rate }); }

  fmt(s: number) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }

  private visualize(stream: MediaStream) {
    const canvas = this.wave()?.nativeElement;
    if (!canvas) return;
    this.audioCtx = new AudioContext();
    const analyser = this.audioCtx.createAnalyser();
    analyser.fftSize = 128;
    this.audioCtx.createMediaStreamSource(stream).connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const ctx = canvas.getContext('2d')!;
    const draw = () => {
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width / data.length;
      data.forEach((v, i) => {
        const h = Math.max(3, (v / 255) * canvas.height * .9);
        const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
        g.addColorStop(0, '#7c5cff'); g.addColorStop(1, '#3b82f6');
        ctx.fillStyle = g;
        ctx.fillRect(i * w + 1, (canvas.height - h) / 2, w - 2, h);
      });
      this.raf = requestAnimationFrame(draw);
    };
    draw();
  }

  private drawIdle() {
    const canvas = this.wave()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(124,92,255,.45)';
    const n = 64, w = canvas.width / n;
    for (let i = 0; i < n; i++) {
      const h = 4 + Math.abs(Math.sin(i / 4)) * 14;
      ctx.fillRect(i * w + 1, (canvas.height - h) / 2, w - 2, h);
    }
  }

  ngOnDestroy() { if (this.recording()) this.stop(); this.speech.stopSpeaking(); }
}
