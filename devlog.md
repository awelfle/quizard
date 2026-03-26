# Quizard devlog

## 2026-03-25: Random topic feature

Replaced the Ninjago topic button with a "Random" topic generator that uses Claude to pick varied quiz topics.

### Changes made:
- Created new API endpoint `/api/random-topic/route.ts` that generates random quiz topics using Claude Sonnet 4.6
- Updated home page to replace Ninjago with a Random (🎲) topic button
- When Random is selected, clicking "Reveal & Start!" generates a random topic, displays it, then starts the quiz
- Updated random topic prompt to ensure variety across categories (video games, movies, sports, science, animals, history, geography)
- Set temperature to 1.0 for maximum randomness in topic selection
- Topics remain popular franchises that 12-year-olds would know

### Technical notes:
- Random topics are revealed before starting the quiz so users can see what they're about to be quizzed on
- Topics are stored in `revealedRandomTopic` state
- Button logic allows clicking "Reveal & Start!" even when random topic hasn't been generated yet
- Other topic options (One Piece, Star Wars, Transformers, Star Trek, Other) remain unchanged
