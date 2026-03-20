'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { QuizState } from '@/lib/types';

const LABELS = ['A', 'B', 'C', 'D'];

export default function QuizPage() {
  const router = useRouter();
  const [state, setState] = useState<QuizState | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('quizState');
    if (!raw) {
      router.replace('/');
      return;
    }
    setState(JSON.parse(raw) as QuizState);
  }, [router]);

  if (!state) return null;

  const { questions, answers, config } = state;
  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSelect = (idx: number) => {
    if (selectedAnswer !== null || transitioning) return;
    setSelectedAnswer(idx);
  };

  const handleNext = () => {
    if (selectedAnswer === null || transitioning) return;

    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedAnswer;
    const newState = { ...state, answers: newAnswers };
    sessionStorage.setItem('quizState', JSON.stringify(newState));

    if (isLast) {
      router.push('/results');
      return;
    }

    setTransitioning(true);
    setTimeout(() => {
      setState(newState);
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setTransitioning(false);
    }, 220);
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-6">
      {/* Progress */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex justify-between items-center text-sm font-bold mb-2">
          <span className="text-purple-300">{config.displayTopic}</span>
          <span className="text-white/70">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div
        key={currentIndex}
        className={[
          'w-full max-w-2xl bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-5',
          'transition-opacity duration-200',
          transitioning ? 'opacity-0' : 'opacity-100 animate-pop-in',
        ].join(' ')}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-purple-500/30 text-purple-200 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
            {config.difficulty}
          </span>
          <span className="text-white/40 text-sm font-bold">
            Q{currentIndex + 1}
          </span>
        </div>
        <p className="text-white text-xl sm:text-2xl font-bold leading-relaxed">
          {question.question}
        </p>
      </div>

      {/* Answer choices */}
      <div
        className={[
          'w-full max-w-2xl flex flex-col gap-3 mb-6',
          'transition-opacity duration-200',
          transitioning ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
      >
        {question.choices.map((choice, idx) => {
          const isSelected = selectedAnswer === idx;
          const isAnswered = selectedAnswer !== null;

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={isAnswered}
              className={[
                'w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left font-bold text-lg',
                'transition-all duration-150 min-h-[68px] select-none',
                isSelected
                  ? 'bg-purple-600/80 ring-4 ring-purple-400/50 text-white scale-[1.02] shadow-lg'
                  : isAnswered
                  ? 'bg-white/5 text-white/40 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer',
              ].join(' ')}
            >
              <span
                className={[
                  'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                  'text-sm font-black transition-colors duration-150',
                  isSelected ? 'bg-white text-purple-700' : 'bg-white/20 text-white',
                ].join(' ')}
              >
                {LABELS[idx]}
              </span>
              <span className="leading-snug">{choice}</span>
            </button>
          );
        })}
      </div>

      {/* Next / Finish button */}
      <div className="w-full max-w-2xl">
        <button
          onClick={handleNext}
          disabled={selectedAnswer === null}
          className={[
            'w-full py-5 rounded-2xl text-xl font-black transition-all duration-150 select-none',
            selectedAnswer !== null
              ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-400 hover:to-violet-500 shadow-lg active:scale-[0.98]'
              : 'bg-white/10 text-white/30 cursor-not-allowed',
          ].join(' ')}
        >
          {isLast ? 'See Results! 🏁' : 'Next Question →'}
        </button>
      </div>
    </main>
  );
}
