import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'chat', loadComponent: () => import('./ai-chat/ai-chat.component').then(m => m.AiChatComponent) },
  { path: 'chat/:id', loadComponent: () => import('./ai-chat/ai-chat.component').then(m => m.AiChatComponent) },
  { path: 'voice', loadComponent: () => import('./voice-studio/voice-studio.component').then(m => m.VoiceStudioComponent) },
  { path: 'documents', loadComponent: () => import('./document-analyzer/document-analyzer.component').then(m => m.DocumentAnalyzerComponent) },
  { path: 'insights', loadComponent: () => import('./conversation-insights/conversation-insights.component').then(m => m.ConversationInsightsComponent) },
  { path: 'insights/:id', loadComponent: () => import('./conversation-insights/conversation-insights.component').then(m => m.ConversationInsightsComponent) },
  { path: 'history', loadComponent: () => import('./history/history.component').then(m => m.HistoryComponent) },
  { path: 'settings', loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent) },
  { path: '**', redirectTo: 'dashboard' }
];
