'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { QuizState } from '@/lib/types';
import { trackEvent } from '@/lib/analytics';

const LABELS = ['A', 'B', 'C', 'D'];

function getScoreMessage(score: number): { text: string; color: string } {
  if (score === 100) return { text: 'PERFECT SCORE!!! 🏆', color: 'text-yellow-300' };
  if (score >= 90) return { text: 'Outstanding! 🌟', color: 'text-green-300' };
  if (score >= 70) return { text: 'Great job! 👍', color: 'text-blue-300' };
  if (score >= 50) return { text: 'Not bad! Keep at it! 💪', color: 'text-purple-300' };
  return { text: 'Keep practicing! 📚', color: 'text-orange-300' };
}

function playVictoryChime() {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    // Ascending C-major arpeggio: C5 E5 G5 C6 E6
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      osc.start(t);
      osc.stop(t + 0.55);
    });
  } catch {
    // AudioContext not available — silently skip
  }
}

async function celebrate() {
  // Haptic feedback (Android only — iOS doesn't support navigator.vibrate)
  if ('vibrate' in navigator) {
    navigator.vibrate([80, 40, 80, 40, 160, 40, 80, 40, 80, 80, 400]);
  }

  // Victory chime (works everywhere, including iOS)
  playVictoryChime();

  // Fireworks confetti
  const { default: confetti } = await import('canvas-confetti');

  const COLORS = ['#a855f7', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f97316'];

  const burst = (angle: number, x: number) => {
    confetti({
      angle,
      spread: 60,
      particleCount: 90,
      origin: { x, y: 0.65 },
      colors: COLORS,
      scalar: 1.1,
    });
  };

  // Left and right cannon bursts
  setTimeout(() => burst(65, 0.05), 0);
  setTimeout(() => burst(115, 0.95), 120);
  setTimeout(() => burst(75, 0.1), 500);
  setTimeout(() => burst(105, 0.9), 620);

  // Big center shower
  setTimeout(() => {
    confetti({
      particleCount: 220,
      spread: 110,
      origin: { x: 0.5, y: 0.4 },
      colors: COLORS,
      scalar: 1.2,
    });
  }, 1000);

  // Final side cannons
  setTimeout(() => burst(60, 0), 1600);
  setTimeout(() => burst(120, 1), 1720);
}

export default function ResultsPage() {
  const router = useRouter();
  const [state, setState] = useState<QuizState | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const celebrationFired = useRef(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('quizState');
    if (!raw) {
      router.replace('/');
      return;
    }
    setState(JSON.parse(raw) as QuizState);
  }, [router]);

  useEffect(() => {
    if (!state) return;

    const correct = state.answers.filter(
      (a, i) => a === state.questions[i].correctIndex
    ).length;
    const score = Math.round((correct / state.questions.length) * 100);

    // Track quiz completion
    trackEvent('quiz_completed', {
      topic: state.config.displayTopic,
      count: state.config.count,
      difficulty: state.config.difficulty,
      score,
      correct,
      perfect: score === 100 ? 1 : 0,
    });

    // Animate count-up
    let current = 0;
    const step = Math.max(1, Math.ceil(score / 40));
    const timer = setInterval(() => {
      current = Math.min(current + step, score);
      setDisplayScore(current);
      if (current >= score) {
        clearInterval(timer);
        if (score === 100 && !celebrationFired.current) {
          celebrationFired.current = true;
          celebrate();
        }
      }
    }, 28);

    return () => clearInterval(timer);
  }, [state]);

  if (!state) return null;

  const { questions, answers, config } = state;
  const correct = answers.filter((a, i) => a === questions[i].correctIndex).length;
  const score = Math.round((correct / questions.length) * 100);
  const { text: scoreMessage, color: scoreColor } = getScoreMessage(score);

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-2xl">
        {/* Score display */}
        <div className="text-center mb-10 animate-pop-in">
          <p className="text-purple-300 font-bold text-lg mb-1">{config.displayTopic} Quiz</p>

          <div className="text-[7rem] leading-none font-black text-white mb-2 tabular-nums">
            {displayScore}%
          </div>

          <div className={`text-3xl font-black mb-2 ${scoreColor}`}>{scoreMessage}</div>

          <div className="text-purple-300 text-lg font-bold">
            {correct} out of {questions.length} correct
          </div>
        </div>

        {/* Per-question review */}
        <div className="flex flex-col gap-4 mb-8">
          {questions.map((q, qi) => {
            const userAnswer = answers[qi];
            const isCorrect = userAnswer === q.correctIndex;

            return (
              <div
                key={qi}
                style={{ animationDelay: `${qi * 60}ms` }}
                className={[
                  'rounded-2xl p-5 border-2 animate-slide-up',
                  isCorrect
                    ? 'bg-green-900/30 border-green-500/40'
                    : 'bg-red-900/30 border-red-500/40',
                ].join(' ')}
              >
                {/* Question */}
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl flex-shrink-0 mt-0.5">
                    {isCorrect ? '✅' : '❌'}
                  </span>
                  <p className="text-white font-bold text-base leading-snug">{q.question}</p>
                </div>

                {/* Answers */}
                <div className="ml-10 flex flex-col gap-1.5 text-sm font-bold">
                  {!isCorrect && (
                    <div className="flex items-center gap-2 text-red-300">
                      <span className="bg-red-500/25 px-2.5 py-0.5 rounded-lg shrink-0">
                        You: {LABELS[userAnswer]}
                      </span>
                      <span className="text-red-300/80">{q.choices[userAnswer]}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-green-300">
                    <span className="bg-green-500/25 px-2.5 py-0.5 rounded-lg shrink-0">
                      {isCorrect ? 'Correct' : `Answer: ${LABELS[q.correctIndex]}`}
                    </span>
                    <span className="text-green-300/80">{q.choices[q.correctIndex]}</span>
                  </div>
                  {q.explanation && (
                    <p className="text-white/50 text-xs italic mt-1">{q.explanation}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Play again */}
        <button
          onClick={() => router.push('/')}
          className="w-full py-6 rounded-2xl text-2xl font-black bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-400 hover:to-violet-500 shadow-xl transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] select-none"
        >
          Play Again! 🧙‍♂️
        </button>
      </div>
    </main>
  );
}
