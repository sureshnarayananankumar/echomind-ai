# API documentation

Base URL (local): `http://localhost:8080` · Interactive docs: `/swagger-ui.html` · OpenAPI JSON: `/v3/api-docs`

All endpoints except `/api/auth/**` need `Authorization: Bearer <token>`.

Errors use one shape:

```json
{ "code": "VALIDATION_ERROR", "message": "Request validation failed", "timestamp": "2026-11-26T10:00:00Z", "fields": { "email": "must be a well-formed email address" } }
```

## Auth

### `POST /api/auth/login`
```json
{ "email": "demo@echomind.local", "password": "Demo@12345" }
```
→ `200`
```json
{ "token": "eyJhbGciOi...", "expiresInMinutes": 1440, "user": { "id": 1, "username": "demo.user", "email": "demo@echomind.local" } }
```

### `POST /api/auth/register`
`{ "username": "...", "email": "...", "password": "min 8 chars" }` → `201` (same body as login) · `409` if email exists.

## Conversations

| Request | Notes |
| --- | --- |
| `GET /api/conversations?type=CHAT&q=launch&page=0&size=20` | Paged; `q` searches titles and message text |
| `POST /api/conversations` `{ "title": "Sprint planning", "type": "CHAT" }` | `201` |
| `GET /api/conversations/{id}/messages` | Ordered oldest → newest |
| `POST /api/conversations/{id}/messages` `{ "message": "Hi", "generateReply": true }` | Saves the user message and the AI reply; uses the last 12 messages as context |
| `DELETE /api/conversations/{id}` | `204`, cascades messages/insights |

Send-message response:
```json
{
  "userMessage": { "id": 51, "sender": "USER", "message": "Hi", "createdAt": "..." },
  "assistantMessage": { "id": 52, "sender": "ASSISTANT", "message": "[Demo] ...", "createdAt": "..." },
  "demoMode": true
}
```

## AI

`POST /api/ai/chat` `{ "prompt": "Explain JWT", "history": [] }` → `{ "reply": "...", "provider": "DEMO", "demoMode": true }`

## Voice

`POST /api/voice/transcribe` — multipart: `audio` (optional file), `transcript` (optional browser transcript), `languageCode`, `durationSeconds`.
→ `{ "recordingId": 1001, "transcript": "...", "languageCode": "en-US", "demoMode": true }`

`POST /api/voice/speech` `{ "text": "Hello" }` → `501` until a server TTS provider is configured.

## Documents

| Request | Notes |
| --- | --- |
| `GET /api/documents` | List user documents |
| `POST /api/documents` multipart `file` | PDF or TXT, ≤ 10 MB → `201` |
| `POST /api/documents/{id}/ask` `{ "question": "How many remote days?" }` | `{ "answer": "...", "sources": ["..."], "demoMode": true }` |

## Insights, dashboard, usage

| Request | Response |
| --- | --- |
| `GET /api/insights/{conversationId}?regenerate=false` | `{ summary, sentiment, keywords[], actionItems[], createdAt, demoMode }` |
| `GET /api/dashboard/summary` | Totals + `last7Days[{ date, CHAT, VOICE, DOCUMENT }]` |
| `GET /api/usage?days=30` | `[{ feature, units, at }]` |
