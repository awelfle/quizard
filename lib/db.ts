import { getStore } from '@netlify/blobs';

// Keeps a rolling list of used questions per topic, capped at 500 entries.

export async function getRecentQuestions(topic: string, limit = 60): Promise<string[]> {
  try {
    const store = getStore('quiz-history');
    const data = await store.get(topic, { type: 'json' });
    if (!Array.isArray(data)) return [];
    return (data as string[]).slice(-limit);
  } catch {
    // Blobs unavailable (e.g. local dev without netlify dev) — degrade gracefully
    return [];
  }
}

export async function saveQuestions(topic: string, newQuestions: string[]): Promise<void> {
  try {
    const store = getStore('quiz-history');
    const existing = await getRecentQuestions(topic, 500);
    await store.setJSON(topic, [...existing, ...newQuestions]);
  } catch {
    // Silently skip — question history is a nice-to-have, not critical
  }
}
