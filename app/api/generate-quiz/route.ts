import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getRecentQuestions, saveQuestions } from '@/lib/db';
import type { QuizQuestion } from '@/lib/types';

export const runtime = 'nodejs';

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

const DIFFICULTY_GUIDES: Record<string, string> = {
  easy: 'Famous characters, main plot points, iconic moments, and well-known facts that any casual fan would know',
  medium: 'Specific events, character backstories, relationships, key arcs, and details a regular fan would know',
  hard: 'Deep lore, obscure characters, specific numbers/dates/names, continuity details, and facts only a hardcore fan would know',
};

export async function POST(request: NextRequest) {
  try {
    const { topic, displayTopic, count, difficulty } = await request.json();

    const normalizedTopic = (topic as string).toLowerCase().trim();
    const recentQuestions = getRecentQuestions(normalizedTopic, 60);

    const avoidSection =
      recentQuestions.length > 0
        ? `\n\nRECENTLY USED QUESTIONS — do not repeat these or close variations:\n${recentQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
        : '';

    const prompt = `Create exactly ${count} multiple choice quiz questions about ${displayTopic} for 12-year-old fans.

Difficulty: ${(difficulty as string).toUpperCase()} — ${DIFFICULTY_GUIDES[difficulty] ?? DIFFICULTY_GUIDES.medium}

RULES:
- Every single fact must be 100% verifiably accurate. Never invent or guess information.
- 4 answer choices per question, exactly one correct answer.
- Wrong choices should be plausible but clearly wrong to someone who knows the material.
- Questions should be varied — mix characters, events, objects, locations, and lore.
- Make them engaging and fun for 12-year-olds.${avoidSection}

Return ONLY a raw JSON array (no markdown, no code fences, no extra text):
[
  {
    "question": "Question text here?",
    "choices": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Short explanation of why this answer is correct."
  }
]`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system:
        'You are a quiz master who creates accurate, engaging multiple choice questions for kids. Return ONLY valid JSON arrays with no markdown formatting, no code fences, and no extra text before or after the JSON.',
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    const cleaned = raw
      .replace(/^```(?:json)?\s*/m, '')
      .replace(/\s*```\s*$/m, '')
      .trim();

    const questions: QuizQuestion[] = JSON.parse(cleaned);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid response format from Claude');
    }

    saveQuestions(normalizedTopic, questions.map((q) => q.question));

    return NextResponse.json({ questions });
  } catch (err) {
    console.error('Quiz generation error:', err);
    return NextResponse.json(
      { error: 'Failed to generate quiz. Please try again.' },
      { status: 500 }
    );
  }
}
