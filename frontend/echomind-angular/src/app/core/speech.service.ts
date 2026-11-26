import { Injectable, NgZone, signal } from '@angular/core';

/** Thin wrapper around the browser Web Speech API (recognition + synthesis). */
@Injectable({ providedIn: 'root' })
export class SpeechService {
  readonly listening = signal(false);
  readonly interim = signal('');
  readonly error = signal<string | null>(null);
  private recognition: any = null;

  constructor(private zone: NgZone) {}

  get recognitionSupported(): boolean {
    const w = window as any;
    return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
  }

  get synthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  voices(): SpeechSynthesisVoice[] {
    return this.synthesisSupported ? window.speechSynthesis.getVoices() : [];
  }

  start(lang: string, onFinal: (text: string) => void) {
    if (!this.recognitionSupported) {
      this.error.set('Speech recognition is not supported in this browser. Try Chrome or Edge, or type instead.');
      return;
    }
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    this.recognition = new Ctor();
    this.recognition.lang = lang;
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.error.set(null);

    this.recognition.onresult = (e: any) => this.zone.run(() => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) onFinal(r[0].transcript.trim());
        else interim += r[0].transcript;
      }
      this.interim.set(interim);
    });
    this.recognition.onerror = (e: any) => this.zone.run(() => {
      this.error.set(e.error === 'not-allowed'
        ? 'Microphone permission was denied. Allow microphone access in your browser settings.'
        : `Speech recognition error: ${e.error}`);
      this.listening.set(false);
    });
    this.recognition.onend = () => this.zone.run(() => { this.listening.set(false); this.interim.set(''); });
    this.recognition.start();
    this.listening.set(true);
  }

  stop() {
    this.recognition?.stop();
    this.listening.set(false);
  }

  speak(text: string, opts: { lang?: string; voiceName?: string; rate?: number } = {}) {
    if (!this.synthesisSupported) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (opts.lang) u.lang = opts.lang;
    u.rate = opts.rate ?? 1;
    const v = this.voices().find(x => x.name === opts.voiceName);
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  }

  stopSpeaking() {
    if (this.synthesisSupported) window.speechSynthesis.cancel();
  }
}
