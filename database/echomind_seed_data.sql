-- =====================================================================
-- EchoMind AI — DEMO seed data (development only)
-- Run after the schema:  mysql -u root -p echomind_ai < database/echomind_seed_data.sql
--
-- Demo login (development only — never use in production):
--   email:    demo@echomind.local
--   password: Demo@12345
-- All conversations, transcripts and insights below are SAMPLE data,
-- not real model output and not real people.
-- =====================================================================

USE echomind_ai;

INSERT INTO users (id, username, email, password_hash, created_at) VALUES
(1, 'demo.user', 'demo@echomind.local', '$2a$10$Evcb6Eafb2LNF9hHQVop5eGL4PsQCUIU2.7QfM1SQ4JiuQ0wMn31m', '2026-11-01 09:00:00');

INSERT INTO user_settings (user_id, preferred_language, preferred_voice, speech_enabled) VALUES
(1, 'en-US', NULL, TRUE);

INSERT INTO conversations (id, user_id, title, conversation_type, created_at, updated_at) VALUES
(101, 1, 'Q4 product launch planning',                 'CHAT',     '2026-11-24 09:12:00', '2026-11-24 09:31:00'),
(102, 1, 'Weekly team stand-up (voice)',               'VOICE',    '2026-11-23 10:00:00', '2026-11-23 10:14:00'),
(103, 1, 'Employee handbook Q&A',                      'DOCUMENT', '2026-11-22 15:40:00', '2026-11-22 15:52:00'),
(104, 1, 'Customer feedback call — Acme Retail (sample)', 'VOICE', '2026-11-20 14:05:00', '2026-11-20 14:40:00'),
(105, 1, 'Learning Spring Security with JWT',          'CHAT',     '2026-11-18 19:30:00', '2026-11-18 19:45:00'),
(106, 1, 'Travel itinerary brainstorm',                'CHAT',     '2026-11-15 08:10:00', '2026-11-15 08:22:00');

INSERT INTO messages (conversation_id, sender, message, created_at) VALUES
(101, 'USER',      'Help me outline a launch plan for our new analytics feature in Q4.', '2026-11-24 09:12:00'),
(101, 'ASSISTANT', 'Here is a four-stage plan: (1) private beta with 10 design partners, (2) collect feedback for two weeks, (3) public announcement with a blog post and webinar, (4) measure activation and retention for 30 days.', '2026-11-24 09:12:20'),
(101, 'USER',      'What metrics should we track during the beta?', '2026-11-24 09:20:00'),
(101, 'ASSISTANT', 'Track weekly active users of the feature, time to first insight, number of saved reports, and qualitative satisfaction from partner interviews.', '2026-11-24 09:20:15'),
(102, 'USER',      'Transcript: The API migration is 80 percent done. We are blocked on the payment sandbox credentials. Design review is moved to Thursday.', '2026-11-23 10:00:00'),
(102, 'ASSISTANT', 'Summary: migration 80% complete; blocker on sandbox credentials; design review rescheduled to Thursday.', '2026-11-23 10:00:30'),
(103, 'USER',      'How many days of remote work are allowed per week?', '2026-11-22 15:40:00'),
(103, 'ASSISTANT', 'According to section 4.2 of the handbook, employees may work remotely up to three days per week with manager approval.', '2026-11-22 15:40:10'),
(104, 'USER',      'Transcript: The customer likes the new reports but finds exporting slow. They asked for scheduled email exports and Excel support.', '2026-11-20 14:05:00'),
(104, 'ASSISTANT', 'Key feedback: positive on reports; export performance issue; feature requests for scheduled email exports and Excel format.', '2026-11-20 14:05:40'),
(105, 'USER',      'Explain how a JWT filter works in Spring Security.', '2026-11-18 19:30:00'),
(105, 'ASSISTANT', 'A OncePerRequestFilter reads the Authorization header, validates the token signature and expiry, loads the user, and sets an Authentication in the SecurityContext before the request reaches your controller.', '2026-11-18 19:30:12'),
(106, 'USER',      'Suggest a 3-day itinerary for Kochi.', '2026-11-15 08:10:00'),
(106, 'ASSISTANT', 'Day 1: Fort Kochi and Chinese fishing nets. Day 2: Mattancherry Palace and Jew Town. Day 3: backwater cruise and Kathakali performance.', '2026-11-15 08:10:25');

INSERT INTO voice_recordings (id, conversation_id, file_name, file_path, duration_seconds, created_at) VALUES
(301, 102, 'standup-2026-11-23.webm', 'uploads/audio/standup-2026-11-23.webm', 842,  '2026-11-23 10:14:00'),
(302, 104, 'acme-feedback-call.webm', 'uploads/audio/acme-feedback-call.webm', 2104, '2026-11-20 14:40:00');

INSERT INTO transcripts (recording_id, transcript_text, language_code, created_at) VALUES
(301, 'The API migration is 80 percent done. We are blocked on the payment sandbox credentials. Design review is moved to Thursday.', 'en-US', '2026-11-23 10:15:00'),
(302, 'The customer likes the new reports but finds exporting slow. They asked for scheduled email exports and Excel support.', 'en-US', '2026-11-20 14:41:00');

INSERT INTO ai_insights (conversation_id, summary, sentiment, keywords, action_items, created_at) VALUES
(101, 'The user planned a Q4 launch for an analytics feature. The assistant proposed a staged rollout and suggested beta metrics.', 'Positive',
     'launch plan,beta,analytics,metrics,retention', 'Recruit 10 design partners for the private beta|Draft the announcement blog post|Set up a dashboard for activation metrics', '2026-11-24 09:32:00'),
(102, 'Stand-up covered API migration progress, a credentials blocker, and a rescheduled design review.', 'Mixed',
     'API migration,blocker,sandbox,design review', 'Request payment sandbox credentials from the platform team|Update calendar invite for Thursday design review', '2026-11-23 10:16:00'),
(103, 'Document Q&A on the employee handbook remote-work policy.', 'Neutral',
     'handbook,remote work,policy', 'Confirm remote-work schedule with manager', '2026-11-22 15:53:00'),
(104, 'A sample customer is satisfied with reports but reported slow exports and requested scheduled and Excel exports.', 'Mixed',
     'exports,performance,Excel,scheduled reports', 'Profile export endpoint performance|Add Excel export to backlog|Scope scheduled email exports', '2026-11-20 14:42:00'),
(105, 'Educational chat about implementing JWT authentication filters in Spring Security.', 'Positive',
     'Spring Security,JWT,filter,authentication', 'Implement JwtAuthenticationFilter in the backend', '2026-11-18 19:46:00');

INSERT INTO documents (id, user_id, file_name, file_type, file_path, processing_status, created_at) VALUES
(201, 1, 'employee-handbook-2026.pdf', 'application/pdf', 'uploads/docs/employee-handbook-2026.pdf', 'PROCESSED', '2026-11-22 15:30:00'),
(202, 1, 'api-design-guidelines.txt', 'text/plain',       'uploads/docs/api-design-guidelines.txt',  'PROCESSED', '2026-11-19 11:00:00');

INSERT INTO document_chunks (document_id, chunk_number, chunk_text) VALUES
(201, 1, 'Section 3.1 Working hours: Standard working hours are 9:30 to 18:30, Sunday to Thursday.'),
(201, 2, 'Section 4.2 Remote work: Employees may work remotely up to three days per week with manager approval.'),
(201, 3, 'Section 5.1 Annual leave: Employees receive 30 calendar days of paid annual leave per year.'),
(201, 4, 'Section 7.3 IT security: Passwords must be at least 12 characters and multi-factor authentication is mandatory.'),
(202, 1, 'Use plural nouns for resources, e.g. /api/conversations.'),
(202, 2, 'Version APIs in the URL path only for breaking changes.'),
(202, 3, 'Paginate list endpoints with page and size query parameters.'),
(202, 4, 'Return errors as JSON with code, message and timestamp fields.');

INSERT INTO usage_logs (user_id, feature_name, units_used, created_at) VALUES
(1, 'CHAT', 14, '2026-11-20 18:00:00'), (1, 'VOICE', 4, '2026-11-20 18:00:00'), (1, 'DOCUMENT', 3, '2026-11-20 18:00:00'),
(1, 'CHAT', 6,  '2026-11-21 18:00:00'), (1, 'VOICE', 1, '2026-11-21 18:00:00'),
(1, 'CHAT', 18, '2026-11-22 18:00:00'), (1, 'VOICE', 6, '2026-11-22 18:00:00'), (1, 'DOCUMENT', 4, '2026-11-22 18:00:00'),
(1, 'CHAT', 22, '2026-11-23 18:00:00'), (1, 'VOICE', 7, '2026-11-23 18:00:00'), (1, 'DOCUMENT', 5, '2026-11-23 18:00:00'),
(1, 'CHAT', 19, '2026-11-24 18:00:00'), (1, 'VOICE', 9, '2026-11-24 18:00:00'), (1, 'DOCUMENT', 2, '2026-11-24 18:00:00'),
(1, 'CHAT', 25, '2026-11-25 18:00:00'), (1, 'VOICE', 5, '2026-11-25 18:00:00'), (1, 'DOCUMENT', 6, '2026-11-25 18:00:00'),
(1, 'CHAT', 21, '2026-11-26 18:00:00'), (1, 'VOICE', 8, '2026-11-26 18:00:00'), (1, 'DOCUMENT', 3, '2026-11-26 18:00:00');

ALTER TABLE conversations AUTO_INCREMENT = 1000;
ALTER TABLE documents AUTO_INCREMENT = 1000;
ALTER TABLE voice_recordings AUTO_INCREMENT = 1000;
