'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TOPICS = [
  { id: 'one-piece', label: 'One Piece', emoji: '🏴‍☠️', gradient: 'from-orange-500 to-red-600' },
  { id: 'star-wars', label: 'Star Wars', emoji: '⚔️', gradient: 'from-yellow-400 to-amber-600' },
  { id: 'ninjago', label: 'Ninjago', emoji: '🥷', gradient: 'from-green-500 to-emerald-700' },
  { id: 'transformers', label: 'Transformers', emoji: '🤖', gradient: 'from-blue-500 to-indigo-700' },
  { id: 'star-trek', label: 'Star Trek', emoji: '🖖', gradient: 'from-cyan-400 to-blue-700' },
  { id: 'other', label: 'Other...', emoji: '✏️', gradient: 'from-purple-500 to-pink-600' },
];

const COUNTS = [5, 10, 20];

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', emoji: '😊', gradient: 'from-green-500 to-emerald-600' },
  { id: 'medium', label: 'Medium', emoji: '🤔', gradient: 'from-yellow-400 to-orange-500' },
  { id: 'hard', label: 'Hard', emoji: '🔥', gradient: 'from-red-500 to-rose-700' },
];

export default function HomePage() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [otherText, setOtherText] = useState('');
  const [count, setCount] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topicKey =
    selectedTopic === 'other' ? otherText.trim() : selectedTopic ?? '';
  const displayTopic =
    selectedTopic === 'other'
      ? otherText.trim()
      : TOPICS.find((t) => t.id === selectedTopic)?.label ?? '';

  const canStart =
    selectedTopic !== null &&
    (selectedTopic !== 'other' || otherText.trim().length > 0) &&
    count !== null &&
    difficulty !== null;

  const handleStart = async () => {
    if (!canStart || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicKey, displayTopic, count, difficulty }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Something went wrong');
      }

      const { questions } = await res.json();

      sessionStorage.setItem(
        'quizState',
        JSON.stringify({
          config: { topic: topicKey, displayTopic, count, difficulty },
          questions,
          answers: new Array(questions.length).fill(-1),
        })
      );

      router.push('/quiz');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-4 py-10">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fade-in">
          <div className="text-7xl mb-5 animate-bounce">🎯</div>
          <p className="text-3xl font-black text-white mb-2">Generating your quiz…</p>
          <p className="text-purple-300 text-lg font-bold">
            Claude is cooking up great questions!
          </p>
        </div>
      )}

      <div className="w-full max-w-2xl animate-slide-up">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-6xl font-black text-white mb-3 drop-shadow-lg">🎯 Quiz Time!</h1>
          <p className="text-purple-300 text-xl font-bold">
            Pick your topic and show what you know!
          </p>
        </div>

        {/* Topic selection */}
        <section className="mb-8">
          <h2 className="text-white font-black text-xl mb-4">
            What do you want to be quizzed on?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TOPICS.map((t) => {
              const isSelected = selectedTopic === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTopic(t.id)}
                  className={[
                    'relative rounded-2xl p-4 font-black text-lg transition-all duration-150',
                    'flex flex-col items-center gap-2 min-h-[96px] select-none',
                    isSelected
                      ? `bg-gradient-to-br ${t.gradient} text-white shadow-xl scale-105 ring-4 ring-white/30`
                      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:scale-[1.03] active:scale-[0.97]',
                  ].join(' ')}
                >
                  <span className="text-4xl">{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {selectedTopic === 'other' && (
            <input
              type="text"
              className="mt-4 w-full rounded-2xl bg-white/10 border-2 border-purple-400 px-5 py-4 text-white placeholder-purple-400 text-lg font-bold focus:outline-none focus:border-purple-300 focus:bg-white/15 transition-all"
              placeholder="e.g. Pokémon, Harry Potter, Minecraft…"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              autoFocus
            />
          )}
        </section>

        {/* Question count */}
        <section className="mb-8">
          <h2 className="text-white font-black text-xl mb-4">How many questions?</h2>
          <div className="flex gap-3">
            {COUNTS.map((n) => {
              const isSelected = count === n;
              return (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={[
                    'flex-1 py-5 rounded-2xl text-3xl font-black transition-all duration-150 select-none',
                    isSelected
                      ? 'bg-gradient-to-br from-purple-500 to-violet-700 text-white shadow-xl scale-105 ring-4 ring-purple-300/30'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:scale-[1.03] active:scale-[0.97]',
                  ].join(' ')}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </section>

        {/* Difficulty */}
        <section className="mb-10">
          <h2 className="text-white font-black text-xl mb-4">How hard?</h2>
          <div className="flex gap-3">
            {DIFFICULTIES.map((d) => {
              const isSelected = difficulty === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={[
                    'flex-1 py-4 rounded-2xl text-lg font-black transition-all duration-150',
                    'flex flex-col items-center gap-1 select-none',
                    isSelected
                      ? `bg-gradient-to-br ${d.gradient} text-white shadow-xl scale-105 ring-4 ring-white/25`
                      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:scale-[1.03] active:scale-[0.97]',
                  ].join(' ')}
                >
                  <span className="text-3xl">{d.emoji}</span>
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 bg-red-500/20 border-2 border-red-500/50 rounded-2xl text-red-300 font-bold text-center">
            {error}
          </div>
        )}

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={!canStart || loading}
          className={[
            'w-full py-6 rounded-2xl text-2xl font-black transition-all duration-150 select-none',
            canStart
              ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-400 hover:to-violet-500 shadow-xl shadow-purple-900/50 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-white/10 text-white/30 cursor-not-allowed',
          ].join(' ')}
        >
          Start Quiz! 🚀
        </button>
      </div>
    </main>
  );
}
