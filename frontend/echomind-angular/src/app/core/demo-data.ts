/**
 * Demo Mode seed data.
 * Mirrors database/echomind_seed_data.sql so the static GitHub Pages build
 * can be explored without a backend or AI credentials.
 * Nothing here is real model output.
 */

export type ConversationType = 'CHAT' | 'VOICE' | 'DOCUMENT';
export type Sender = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface Message {
  id: number;
  sender: Sender;
  text: string;
  createdAt: string;
}

export interface Insight {
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Mixed' | 'Negative';
  sentimentScore: number; // 0..100
  keywords: string[];
  actionItems: string[];
  decisions: string[];
}

export interface Conversation {
  id: number;
  title: string;
  type: ConversationType;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  insight?: Insight;
}

export interface DemoDocument {
  id: number;
  fileName: string;
  fileType: string;
  sizeKb: number;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  createdAt: string;
  summary: string;
  keyTerms: string[];
  chunks: string[];
}

export interface Recording {
  id: number;
  fileName: string;
  durationSeconds: number;
  language: string;
  createdAt: string;
  transcript: string;
}

export const DEMO_USER = {
  id: 1,
  username: 'demo.user',
  displayName: 'Demo User',
  email: 'demo@echomind.local',
  plan: 'Demo workspace'
};

export const CONVERSATIONS: Conversation[] = [
  {
    id: 101,
    title: 'Q4 product launch planning',
    type: 'CHAT',
    createdAt: '2026-11-24T09:12:00',
    updatedAt: '2026-11-24T09:31:00',
    messages: [
      { id: 1, sender: 'USER', text: 'Help me outline a launch plan for our new analytics feature in Q4.', createdAt: '2026-11-24T09:12:00' },
      { id: 2, sender: 'ASSISTANT', text: 'Here is a four-stage plan: (1) private beta with 10 design partners, (2) collect feedback for two weeks, (3) public announcement with a blog post and webinar, (4) measure activation and retention for 30 days.', createdAt: '2026-11-24T09:12:20' },
      { id: 3, sender: 'USER', text: 'What metrics should we track during the beta?', createdAt: '2026-11-24T09:20:00' },
      { id: 4, sender: 'ASSISTANT', text: 'Track weekly active users of the feature, time to first insight, number of saved reports, and qualitative satisfaction from partner interviews.', createdAt: '2026-11-24T09:20:15' }
    ],
    insight: {
      summary: 'The user planned a Q4 launch for an analytics feature. The assistant proposed a staged rollout (beta, feedback, announcement, measurement) and suggested beta metrics.',
      sentiment: 'Positive', sentimentScore: 78,
      keywords: ['launch plan', 'beta', 'analytics', 'metrics', 'retention'],
      actionItems: ['Recruit 10 design partners for the private beta', 'Draft the announcement blog post', 'Set up a dashboard for activation metrics'],
      decisions: ['Run a two-week private beta before public launch']
    }
  },
  {
    id: 102,
    title: 'Weekly team stand-up (voice)',
    type: 'VOICE',
    createdAt: '2026-11-23T10:00:00',
    updatedAt: '2026-11-23T10:14:00',
    messages: [
      { id: 5, sender: 'USER', text: 'Transcript: The API migration is 80 percent done. We are blocked on the payment sandbox credentials. Design review is moved to Thursday.', createdAt: '2026-11-23T10:00:00' },
      { id: 6, sender: 'ASSISTANT', text: 'Summary: migration 80% complete; blocker on sandbox credentials; design review rescheduled to Thursday.', createdAt: '2026-11-23T10:00:30' }
    ],
    insight: {
      summary: 'Stand-up covered API migration progress, a credentials blocker, and a rescheduled design review.',
      sentiment: 'Mixed', sentimentScore: 55,
      keywords: ['API migration', 'blocker', 'sandbox', 'design review'],
      actionItems: ['Request payment sandbox credentials from the platform team', 'Update calendar invite for Thursday design review'],
      decisions: ['Design review moved to Thursday']
    }
  },
  {
    id: 103,
    title: 'Employee handbook Q&A',
    type: 'DOCUMENT',
    createdAt: '2026-11-22T15:40:00',
    updatedAt: '2026-11-22T15:52:00',
    messages: [
      { id: 7, sender: 'USER', text: 'How many days of remote work are allowed per week?', createdAt: '2026-11-22T15:40:00' },
      { id: 8, sender: 'ASSISTANT', text: 'According to section 4.2 of the handbook, employees may work remotely up to three days per week with manager approval.', createdAt: '2026-11-22T15:40:10' }
    ],
    insight: {
      summary: 'Document Q&A on the employee handbook remote-work policy.',
      sentiment: 'Neutral', sentimentScore: 60,
      keywords: ['handbook', 'remote work', 'policy'],
      actionItems: ['Confirm remote-work schedule with manager'],
      decisions: []
    }
  },
  {
    id: 104,
    title: 'Customer feedback call — Acme Retail (sample)',
    type: 'VOICE',
    createdAt: '2026-11-20T14:05:00',
    updatedAt: '2026-11-20T14:40:00',
    messages: [
      { id: 9, sender: 'USER', text: 'Transcript: The customer likes the new reports but finds exporting slow. They asked for scheduled email exports and Excel support.', createdAt: '2026-11-20T14:05:00' },
      { id: 10, sender: 'ASSISTANT', text: 'Key feedback: positive on reports; export performance issue; feature requests for scheduled email exports and Excel format.', createdAt: '2026-11-20T14:05:40' }
    ],
    insight: {
      summary: 'A sample customer is satisfied with reports but reported slow exports and requested scheduled and Excel exports.',
      sentiment: 'Mixed', sentimentScore: 58,
      keywords: ['exports', 'performance', 'Excel', 'scheduled reports'],
      actionItems: ['Profile export endpoint performance', 'Add Excel export to backlog', 'Scope scheduled email exports'],
      decisions: ['Prioritise export performance fix this sprint']
    }
  },
  {
    id: 105,
    title: 'Learning Spring Security with JWT',
    type: 'CHAT',
    createdAt: '2026-11-18T19:30:00',
    updatedAt: '2026-11-18T19:45:00',
    messages: [
      { id: 11, sender: 'USER', text: 'Explain how a JWT filter works in Spring Security.', createdAt: '2026-11-18T19:30:00' },
      { id: 12, sender: 'ASSISTANT', text: 'A OncePerRequestFilter reads the Authorization header, validates the token signature and expiry, loads the user, and sets an Authentication in the SecurityContext before the request reaches your controller.', createdAt: '2026-11-18T19:30:12' }
    ],
    insight: {
      summary: 'Educational chat about implementing JWT authentication filters in Spring Security.',
      sentiment: 'Positive', sentimentScore: 82,
      keywords: ['Spring Security', 'JWT', 'filter', 'authentication'],
      actionItems: ['Implement JwtAuthenticationFilter in the backend'],
      decisions: []
    }
  },
  {
    id: 106,
    title: 'Travel itinerary brainstorm',
    type: 'CHAT',
    createdAt: '2026-11-15T08:10:00',
    updatedAt: '2026-11-15T08:22:00',
    messages: [
      { id: 13, sender: 'USER', text: 'Suggest a 3-day itinerary for Kochi.', createdAt: '2026-11-15T08:10:00' },
      { id: 14, sender: 'ASSISTANT', text: 'Day 1: Fort Kochi and Chinese fishing nets. Day 2: Mattancherry Palace and Jew Town. Day 3: backwater cruise and Kathakali performance.', createdAt: '2026-11-15T08:10:25' }
    ],
    insight: {
      summary: 'Itinerary suggestions for a three-day trip to Kochi.',
      sentiment: 'Positive', sentimentScore: 85,
      keywords: ['travel', 'Kochi', 'itinerary'],
      actionItems: ['Book backwater cruise'],
      decisions: []
    }
  }
];

export const DOCUMENTS: DemoDocument[] = [
  {
    id: 201, fileName: 'employee-handbook-2026.pdf', fileType: 'application/pdf', sizeKb: 842,
    status: 'PROCESSED', createdAt: '2026-11-22T15:30:00',
    summary: 'Sample handbook covering working hours, remote-work policy, leave, code of conduct and IT security guidelines.',
    keyTerms: ['remote work', 'annual leave', 'code of conduct', 'security', 'working hours'],
    chunks: [
      'Section 3.1 Working hours: Standard working hours are 9:30 to 18:30, Sunday to Thursday.',
      'Section 4.2 Remote work: Employees may work remotely up to three days per week with manager approval.',
      'Section 5.1 Annual leave: Employees receive 30 calendar days of paid annual leave per year.',
      'Section 7.3 IT security: Passwords must be at least 12 characters and multi-factor authentication is mandatory.'
    ]
  },
  {
    id: 202, fileName: 'api-design-guidelines.txt', fileType: 'text/plain', sizeKb: 36,
    status: 'PROCESSED', createdAt: '2026-11-19T11:00:00',
    summary: 'Guidelines for REST naming, versioning, pagination and error responses.',
    keyTerms: ['REST', 'versioning', 'pagination', 'error codes'],
    chunks: [
      'Use plural nouns for resources, e.g. /api/conversations.',
      'Version APIs in the URL path only for breaking changes.',
      'Paginate list endpoints with page and size query parameters.',
      'Return errors as JSON with code, message and timestamp fields.'
    ]
  }
];

export const RECORDINGS: Recording[] = [
  { id: 301, fileName: 'standup-2026-11-23.webm', durationSeconds: 842, language: 'en-US', createdAt: '2026-11-23T10:14:00',
    transcript: 'The API migration is 80 percent done. We are blocked on the payment sandbox credentials. Design review is moved to Thursday.' },
  { id: 302, fileName: 'acme-feedback-call.webm', durationSeconds: 2104, language: 'en-US', createdAt: '2026-11-20T14:40:00',
    transcript: 'The customer likes the new reports but finds exporting slow. They asked for scheduled email exports and Excel support.' },
  { id: 303, fileName: 'voice-note-ideas.webm', durationSeconds: 95, language: 'en-IN', createdAt: '2026-11-17T21:02:00',
    transcript: 'Idea: add a weekly digest that summarises all conversations and highlights open action items.' }
];

/** Usage for the last 7 days (sample) */
export const WEEKLY_USAGE = [
  { day: 'Fri', chat: 14, voice: 4, document: 3 },
  { day: 'Sat', chat: 6, voice: 1, document: 0 },
  { day: 'Sun', chat: 18, voice: 6, document: 4 },
  { day: 'Mon', chat: 22, voice: 7, document: 5 },
  { day: 'Tue', chat: 19, voice: 9, document: 2 },
  { day: 'Wed', chat: 25, voice: 5, document: 6 },
  { day: 'Thu', chat: 21, voice: 8, document: 3 }
];

export const DASHBOARD_TOTALS = {
  conversations: 128,
  chatSessions: 86,
  voiceSessions: 29,
  documentSessions: 13,
  minutesTranscribed: 412,
  documentsProcessed: 24
};
