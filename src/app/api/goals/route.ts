import { NextRequest } from 'next/server';

const PROMPT = (goal: string, freeHours: number) =>
  `You are a planning assistant. Break down the user's goal into specific, actionable steps.

Goal: "${goal}"
User's free time: ${freeHours} hours per day

Create 3 difficulty levels:

EASY — so simple it's impossible not to do (even with zero energy)
MEDIUM — meaningful progress, 20–40 minutes
HARD — a full step that requires focus and concentration

Rules:
- Every task starts with an action verb
- Specific and measurable (not "work on it" but "write 3 paragraphs")
- EASY tasks should be almost laughably simple
- 5–7 tasks per level

Respond strictly in JSON with no extra text or markdown:
{
  "easy": ["task 1", "task 2", ...],
  "medium": ["task 1", "task 2", ...],
  "hard": ["task 1", "task 2", ...]
}`;

function fallbackTasks(goal: string) {
  return {
    easy: [
      `Open your notes for "${goal}"`,
      'Read what you have so far for 2 minutes',
      'Write one sentence about your goal',
      'Find one useful resource online',
      'Set a 5-minute timer and just look at the task',
    ],
    medium: [
      'Write a simple outline with 3 sections',
      'Work on the first section for 20 minutes',
      'Find 3 good references and save the links',
      'Review and edit what you have so far',
      'Write a summary of what is left to do',
    ],
    hard: [
      'Complete a full section from start to finish',
      'Do a focused 45-minute deep work session',
      'Write and edit two sections back to back',
      'Review everything and finalize the main argument',
      'Prepare the final version for submission',
    ],
  };
}

export async function POST(req: NextRequest) {
  const { goal, freeHours = 4 } = await req.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(fallbackTasks(goal));
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: PROMPT(goal, freeHours) }],
      }),
    });

    const data = await res.json();
    const text: string = data.content?.[0]?.text ?? '';
    const tasks = JSON.parse(text);
    return Response.json(tasks);
  } catch {
    return Response.json(fallbackTasks(goal));
  }
}
