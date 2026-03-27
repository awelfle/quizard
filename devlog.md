# Quizard devlog

## 2026-03-27: Added Tinylytics analytics

Added Tinylytics tracking to monitor site usage and analytics. Script loads on all pages via the root layout with `?events` parameter enabled.

Added comprehensive event tracking for quiz generation and completion:
- `quiz_generated` event tracks topic, question count, and difficulty when a quiz starts
- `quiz_completed` event tracks the same config plus score, correct count, and whether it was a perfect score
- Created analytics utility (`lib/analytics.ts`) to send events via navigator.sendBeacon
- Events enable analysis of completion rates, popular topics, and comparative stats (e.g., "12% of Star Trek hard-mode quizzes get 100%")

## 2026-03-25: Random topic feature with regeneration

Replaced the Ninjago topic button with a "Random" topic generator that uses Claude to pick varied quiz topics.

### Changes made:
- Created new API endpoint `/api/random-topic/route.ts` that generates random quiz topics using Claude Sonnet 4.6
- Updated home page to replace Ninjago with a Random (🎲) topic button
- When Random is selected, clicking "Reveal & Start!" generates a random topic, displays it, then starts the quiz
- Updated random topic prompt to ensure variety across categories (video games, movies, sports, science, animals, history, geography)
- Set temperature to 1.0 for maximum randomness in topic selection
- Topics remain popular franchises that 12-year-olds would know
- **Added regenerate button (🔄)** next to revealed random topics so users can re-roll if they don't like the topic
- Regenerate button spins while fetching a new topic

### Technical notes:
- Random topics are revealed before starting the quiz so users can see what they're about to be quizzed on
- Topics are stored in `revealedRandomTopic` state
- Button logic allows clicking "Reveal & Start!" even when random topic hasn't been generated yet
- Regenerate button reuses the same API endpoint and updates the revealed topic in place
- Other topic options (One Piece, Star Wars, Transformers, Star Trek, Other) remain unchanged
