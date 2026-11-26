# Architecture

```text
┌───────────────────────────┐        HTTPS / JSON + JWT        ┌────────────────────────────┐
│ Angular 19 SPA            │ ───────────────────────────────▶ │ Spring Boot 3 API          │
│  • Dashboard, Chat, Voice │                                   │  controller → service      │
│  • Documents, Insights    │ ◀─────────────────────────────── │  → repository (JPA)        │
│  • Web Speech API (STT/TTS)│                                  │  security: JWT filter      │
│  • Demo Mode services     │                                   │  ai: AiProvider interface  │
└───────────────────────────┘                                   └─────────┬──────────┬───────┘
      GitHub Pages (static)                                               │          │
                                                                          ▼          ▼
                                                                   MySQL 8     LLM provider
                                                                (users, convs,  (DEMO or any
                                                                 messages, …)   OpenAI-compatible)
```

## Frontend

- **Standalone components** — one lazy-loaded route per feature folder.
- **Signals** for state; `DemoAiService` holds in-memory seed data mirroring `database/echomind_seed_data.sql`.
- **Hash routing** so deep links work on GitHub Pages.
- `SpeechService` wraps `SpeechRecognition` and `speechSynthesis`; unsupported browsers get a clear notice.
- To go live, replace `DemoAiService` methods with `HttpClient` calls to the API below and add an auth interceptor.

## Backend

| Package | Responsibility |
| --- | --- |
| `config` | Security filter chain, CORS, OpenAPI, global error handler |
| `security` | `JwtService` (HS256), `JwtAuthenticationFilter`, `AuthUser` principal |
| `controller` | REST endpoints — thin, validated DTOs |
| `service` | Business logic: auth, conversations, insights, documents (chunking + retrieval), voice, dashboard |
| `repository` | Spring Data JPA interfaces |
| `entity` | JPA entities mapped to the SQL schema (`ddl-auto: none`) |
| `ai` | `AiProvider` abstraction with `DemoAiProvider` and `OpenAiCompatibleProvider` |

### Document Q&A (basic RAG)

1. Upload → text extracted (PDFBox for PDF) → split into ~800-character chunks → stored in `document_chunks`.
2. Question → keyword-overlap scoring selects the top 3 chunks.
3. `AiProvider.answerFromContext` is instructed to answer only from those passages; sources are returned.

Next step: replace keyword scoring with embeddings + a vector store.

## Security notes

- Passwords hashed with BCrypt; stateless JWT sessions.
- AI keys and DB credentials come only from environment variables.
- Every data query is scoped by the authenticated user's id.
- Demo Mode output is always labelled as simulated.
