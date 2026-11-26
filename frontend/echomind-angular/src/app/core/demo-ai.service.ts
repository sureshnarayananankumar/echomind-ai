import { Injectable, signal } from '@angular/core';
import { CONVERSATIONS, Conversation, DOCUMENTS, DemoDocument, Insight, Message, RECORDINGS, Recording } from './demo-data';

/**
 * Demo Mode AI service.
 * Produces simulated, rule-based responses so the UI works on GitHub Pages
 * without an AI provider. When the Spring Boot backend is configured, swap
 * these methods for HttpClient calls to /api/ai/chat, /api/documents/{id}/ask, etc.
 */
@Injectable({ providedIn: 'root' })
export class DemoAiService {
  readonly conversations = signal<Conversation[]>(structuredClone(CONVERSATIONS));
  readonly documents = signal<DemoDocument[]>(structuredClone(DOCUMENTS));
  readonly recordings = signal<Recording[]>(structuredClone(RECORDINGS));
  private nextId = 1000;

  createConversation(title: string, type: Conversation['type'] = 'CHAT'): Conversation {
    const now = new Date().toISOString();
    const c: Conversation = { id: this.nextId++, title, type, createdAt: now, updatedAt: now, messages: [] };
    this.conversations.update(list => [c, ...list]);
    return c;
  }

  addMessage(conversationId: number, sender: Message['sender'], text: string): Message {
    const msg: Message = { id: this.nextId++, sender, text, createdAt: new Date().toISOString() };
    this.conversations.update(list => list.map(c => c.id === conversationId
      ? { ...c, messages: [...c.messages, msg], updatedAt: msg.createdAt } : c));
    return msg;
  }

  deleteConversation(id: number) {
    this.conversations.update(list => list.filter(c => c.id !== id));
  }

  /** Simulated assistant reply with a short artificial delay. */
  reply(prompt: string): Promise<string> {
    const p = prompt.toLowerCase();
    let text: string;
    if (/\b(hi|hello|hey)\b/.test(p)) {
      text = 'Hello! I am EchoMind running in Demo Mode. Ask me to summarise, plan, explain or brainstorm and I will reply with a simulated answer.';
    } else if (p.includes('summar')) {
      text = 'Demo summary: the main points are (1) the goal you described, (2) the constraints mentioned, and (3) the next steps. Connect an LLM provider on the backend for a real summary.';
    } else if (p.includes('plan') || p.includes('roadmap')) {
      text = 'Here is a simple plan: 1) Define the outcome and success metric. 2) Break the work into weekly milestones. 3) Identify risks and owners. 4) Review progress every Friday.';
    } else if (p.includes('java') || p.includes('spring')) {
      text = 'In Spring Boot, keep controllers thin, put business logic in @Service classes, use Spring Data JPA repositories for persistence and validate request DTOs with Jakarta Bean Validation.';
    } else if (p.includes('angular')) {
      text = 'For Angular, prefer standalone components, signals for local state, lazy-loaded routes per feature and HttpClient interceptors for auth headers.';
    } else if (p.includes('voice') || p.includes('speech')) {
      text = 'Voice Studio uses the browser Web Speech API for speech-to-text and text-to-speech. Support varies by browser — Chrome and Edge work best.';
    } else if (p.endsWith('?')) {
      text = `Good question. In Demo Mode I can't call a real model, but a full answer to "${prompt.slice(0, 80)}" would come from the backend AI provider via POST /api/ai/chat.`;
    } else {
      text = `Noted. I captured: "${prompt.slice(0, 120)}". In a live setup this would be sent to the configured LLM with the conversation history for context.`;
    }
    return new Promise(res => setTimeout(() => res(text), 600 + Math.random() * 600));
  }

  /** Very small keyword-based retrieval over document chunks (demo RAG). */
  askDocument(doc: DemoDocument, question: string): { answer: string; source?: string } {
    const words = question.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    let best = '', bestScore = 0;
    for (const chunk of doc.chunks) {
      const c = chunk.toLowerCase();
      const score = words.reduce((s, w) => s + (c.includes(w) ? 1 : 0), 0);
      if (score > bestScore) { best = chunk; bestScore = score; }
    }
    if (!bestScore) {
      return { answer: 'I could not find a relevant passage in this document for that question (demo keyword search).' };
    }
    return { answer: `Based on the document: ${best}`, source: best };
  }

  analyzeText(name: string, text: string): DemoDocument {
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 20);
    const chunks = sentences.length ? sentences.slice(0, 40) : [text.slice(0, 500)];
    const doc: DemoDocument = {
      id: this.nextId++, fileName: name, fileType: 'text/plain', sizeKb: Math.max(1, Math.round(text.length / 1024)),
      status: 'PROCESSED', createdAt: new Date().toISOString(),
      summary: chunks.slice(0, 2).join(' ').slice(0, 300) || 'Empty document.',
      keyTerms: this.keywords(text, 6), chunks
    };
    this.documents.update(d => [doc, ...d]);
    return doc;
  }

  addRecording(transcript: string, durationSeconds: number, language: string) {
    const r: Recording = {
      id: this.nextId++, fileName: `recording-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.webm`,
      durationSeconds, language, createdAt: new Date().toISOString(), transcript
    };
    this.recordings.update(list => [r, ...list]);
    return r;
  }

  /** Simple heuristic insight generator for conversations without seeded insights. */
  generateInsight(c: Conversation): Insight {
    const all = c.messages.map(m => m.text).join(' ');
    const pos = (all.match(/\b(good|great|like|love|thanks|helpful|success)\b/gi) || []).length;
    const neg = (all.match(/\b(slow|blocked|issue|problem|bad|fail|error)\b/gi) || []).length;
    const score = Math.max(10, Math.min(95, 60 + pos * 8 - neg * 8));
    const sentiment: Insight['sentiment'] = pos && neg ? 'Mixed' : score >= 65 ? 'Positive' : score <= 40 ? 'Negative' : 'Neutral';
    const actionItems = c.messages
      .flatMap(m => m.text.split(/(?<=[.!?])\s+/))
      .filter(s => /\b(should|need to|will|todo|must|let's)\b/i.test(s))
      .slice(0, 4);
    return {
      summary: c.messages.length ? `Conversation with ${c.messages.length} messages about "${c.title}".` : 'No messages yet.',
      sentiment, sentimentScore: score, keywords: this.keywords(all, 5),
      actionItems: actionItems.length ? actionItems : ['No explicit action items detected'], decisions: []
    };
  }

  keywords(text: string, n: number): string[] {
    const stop = new Set('the and for that with this from have are was were will your you our their they them what when where which about into there would could should been being also more than then just like some only over such very can not but its it’s it is to of in on a an as at by or be we i me my do does how why'.split(' '));
    const freq = new Map<string, number>();
    for (const w of text.toLowerCase().match(/[a-z][a-z-]{3,}/g) || []) {
      if (!stop.has(w)) freq.set(w, (freq.get(w) || 0) + 1);
    }
    return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(e => e[0]);
  }
}
