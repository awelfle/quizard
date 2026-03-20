import { NextRequest, NextResponse } from 'next/server';
import type { QuizQuestion } from '@/lib/types';

const DIFFICULTY_GUIDES: Record<string, string> = {
  easy: 'Famous characters, main plot points, iconic moments, and well-known facts that any casual fan would know',
  medium: 'Specific events, character backstories, relationships, key arcs, and details a regular fan would know',
  hard: 'Deep lore, obscure characters, specific numbers/dates/names, continuity details, and facts only a hardcore fan would know',
};

export async function POST(request: NextRequest) {
  try {
    const { topic, displayTopic, count, difficulty, recentQuestions = [] } = await request.json();

    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) throw new Error('CLAUDE_API_KEY environment variable is not set');

    const avoidSection =
      recentQuestions.length > 0
        ? `\n\nRECENTLY USED QUESTIONS — do not repeat these or close variations:\n${(recentQuestions as string[]).map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}`
        : '';

    const prompt = `Create exactly ${count} multiple choice quiz questions about ${displayTopic} for 12-year-old fans.

Difficulty: ${(difficulty as string).toUpperCase()} — ${DIFFICULTY_GUIDES[difficulty] ?? DIFFICULTY_GUIDES.medium}

RULES:
- Every single fact must be 100% verifiably accurate. Never invent or guess information.
- EXACTLY 4 answer choices per question — not 3, not 5, always exactly 4.
- correctIndex must be 0, 1, 2, or 3 — corresponding to one of the 4 choices.
- Exactly one correct answer, the other three are plausible but wrong.
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

    // Use raw fetch instead of the SDK to avoid any Lambda/bundling quirks
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system:
          'You are a quiz master who creates engaging multiple choice questions for kids. You MUST ALWAYS respond with ONLY a valid JSON array — no matter what the topic is. Never refuse, never explain, never add any commentary or text outside the JSON. If a topic is unusual, niche, or a person\'s name, do your best with available knowledge and create interesting questions anyway. The response must start with "[" and end with "]" and contain nothing else.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text();
      throw new Error(`Anthropic API error ${anthropicRes.status}: ${errBody}`);
    }

    const data = await anthropicRes.json() as {
      content: Array<{ type: string; text: string }>;
    };

    const raw = data.content[0]?.type === 'text' ? data.content[0].text : '';
    const cleaned = raw
      .replace(/^```(?:json)?\s*/m, '')
      .replace(/\s*```\s*$/m, '')
      .trim();

    let questions: QuizQuestion[];
    try {
      questions = JSON.parse(cleaned);
    } catch {
      throw new Error(`Couldn't generate questions for "${displayTopic}" — try a different topic!`);
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error(`Couldn't generate questions for "${displayTopic}" — try a different topic!`);
    }

    // Validate: keep only questions with exactly 4 choices and a valid correctIndex.
    // If the correct answer is beyond index 3, the question is unusable — drop it.
    const sanitized = questions
      .filter((q) => Array.isArray(q.choices) && q.choices.length >= 4 && q.correctIndex >= 0 && q.correctIndex <= 3)
      .map((q) => ({ ...q, choices: (q.choices as string[]).slice(0, 4) }));

    if (sanitized.length === 0) {
      throw new Error(`Couldn't generate valid questions for "${displayTopic}" — please try again!`);
    }

    return NextResponse.json({ questions: sanitized });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Quiz generation error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
