import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) throw new Error('CLAUDE_API_KEY environment variable is not set');

    const prompt = `Generate ONE random, fun quiz topic that a 12-year-old would enjoy being quizzed on.

IMPORTANT: Pick from a WIDE VARIETY of popular franchises and subjects. Don't default to the same topic. Rotate through different categories.

Categories to pick from:
- Video games: Minecraft, Roblox, Fortnite, Pokemon, Mario, Sonic, Among Us
- Movies/TV: Marvel, Star Wars, Harry Potter, Disney, Pixar, Lord of the Rings, Avatar
- Sports: NBA, NFL, Soccer, Baseball, Olympics
- Science: Space, Dinosaurs, The Ocean, Weather, The Human Body, Volcanoes
- Animals: Sharks, Big Cats, Prehistoric Animals, Reptiles, Birds, Insects
- History: Ancient Egypt, Ancient Rome, Pirates, Vikings, The Titanic, World War II
- Geography: Countries, Flags, Capitals, Landmarks, Oceans

The topic should be:
- A well-known, popular franchise or subject that kids would know
- Specific enough to make good quiz questions
- Not offensive or inappropriate

Respond with ONLY the topic name, nothing else. No explanation, no punctuation at the end, just the topic name.`;

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 50,
        temperature: 1.0,
        system: 'You generate random quiz topics for kids. Always respond with just the topic name, nothing else. Be creative and varied - pick different topics each time, rotating through many different categories.',
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

    const topic = data.content[0]?.type === 'text' ? data.content[0].text.trim() : '';

    if (!topic) {
      throw new Error('Failed to generate a random topic');
    }

    return NextResponse.json({ topic });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Random topic generation error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
