'use client';

import { useState } from 'react';
import { DNA_QUESTIONS } from '@/lib/dna-quiz';
import LucideIcon from './LucideIcon';

interface DNAQuizProps {
  onComplete: (answers: number[]) => void;
  onRetake?: () => void;
}

export default function DNAQuiz({ onComplete }: DNAQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [animating, setAnimating] = useState(false);

  const question = DNA_QUESTIONS[currentQuestion];
  const total = DNA_QUESTIONS.length;

  const handleSelect = (optionIndex: number) => {
    if (animating) return;
    setAnimating(true);

    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < total - 1) {
      // 300ms后跳下一题
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setAnimating(false);
      }, 300);
    } else {
      // 最后一题，直接出结果
      setTimeout(() => {
        onComplete(newAnswers);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFAE0] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-[#1B4332] mb-2">
            Discover Your Healing DNA
          </h1>
          <p className="text-[#1B4332]/60 text-sm">
            5 questions to find your perfect healing destination
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {DNA_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i < currentQuestion
                  ? 'w-3 h-3 bg-[#1B4332]'
                  : i === currentQuestion
                    ? 'w-4 h-4 bg-[#52B788]'
                    : 'w-3 h-3 bg-[#ccc] border-2 border-[#ccc] bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Question card */}
        <div
          className={`transition-all duration-300 ${
            animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          <h2 className="font-serif text-xl text-[#1B4332] text-center mb-6">
            {question.text}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className="w-full text-left bg-white rounded-xl p-4 border-2 border-transparent hover:border-[#52B788] transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <div className="flex items-center gap-4">
                  <LucideIcon name={option.emoji} className="w-8 h-8 text-[#1B4332]" />
                  <div className="flex-1">
                    <div className="font-medium text-[#1B4332] group-hover:text-[#52B788] transition-colors">
                      {option.label}
                    </div>
                    <div className="text-xs text-[#1B4332]/60 mt-0.5">
                      {option.sublabel}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Back button + Question counter */}
        <div className="flex items-center justify-between mt-6">
          {currentQuestion > 0 ? (
            <button
              onClick={() => {
                const prevAnswers = answers.slice(0, -1);
                setAnswers(prevAnswers);
                setCurrentQuestion(currentQuestion - 1);
              }}
              className="text-sm text-[#1B4332]/50 hover:text-[#52B788] transition-colors flex items-center gap-1"
            >
              ← Previous
            </button>
          ) : (
            <span />
          )}
          <p className="text-sm text-[#1B4332]/40">
            {currentQuestion + 1} / {total}
          </p>
        </div>
      </div>
    </div>
  );
}
