import { NextRequest } from 'next/server';

interface TaskWithSimplified {
  text: string;
  simplified: [string, string];
}

interface GoalResponse {
  summary: string;
  easy:   TaskWithSimplified[];
  medium: TaskWithSimplified[];
  hard:   TaskWithSimplified[];
}

const PROMPT = (goal: string, freeHours: number): string =>
  `You are a planning assistant. Break down the user's goal into specific, actionable tasks.

Goal: "${goal}"
Free time available today: ~${freeHours} hours

Create 3 difficulty levels:
EASY   — so simple it's impossible not to do, ~5 min
MEDIUM — meaningful progress, 20–40 min
HARD   — a full focused step, 45+ min

Rules:
- Every task starts with an action verb
- Be specific and measurable ("write 3 paragraphs", not "work on it")
- EASY tasks should feel almost laughably simple
- Each task has 2 progressively simpler fallback versions
- 3–5 tasks per level

Respond strictly in JSON (no markdown, no extra keys):
{
  "summary": "one warm sentence about this goal and the best first step",
  "easy": [
    { "text": "task text", "simplified": ["simpler version", "simplest version"] }
  ],
  "medium": [ ... ],
  "hard":   [ ... ]
}`;

function fallback(goal: string): GoalResponse {
  return {
    summary: `Let's break "${goal}" into small, doable steps — starting with the easiest one.`,
    easy: [
      { text: `Open your notes for "${goal}"`,          simplified: ['Look at your notes for 1 minute',      'Find the file or notebook'] },
      { text: 'Read what you have so far for 2 min',   simplified: ['Skim the first paragraph',             'Open the document'] },
      { text: 'Write one sentence about your goal',    simplified: ['Type one word that describes it',      'Think about it for 1 min'] },
      { text: 'Find one useful resource online',       simplified: ['Search for it and save one link',      'Google the topic name'] },
    ],
    medium: [
      { text: 'Write a simple 3-section outline',              simplified: ['Write 3 bullet headings only',      'Write the topic at the top'] },
      { text: 'Work on the first section for 20 min',          simplified: ['Write one paragraph in section 1',  'Write the first sentence'] },
      { text: 'Find 3 good references and save the links',     simplified: ['Find 1 reference',                  'Google the main topic'] },
      { text: 'Review and lightly edit what you have so far',  simplified: ['Read it once without editing',      'Open the document and scroll through'] },
    ],
    hard: [
      { text: 'Complete a full section from start to finish',       simplified: ['Write half a section',              'Write one paragraph'] },
      { text: 'Do a focused 45-min deep work session',              simplified: ['Do a 25-min Pomodoro session',       'Work for 10 min uninterrupted'] },
      { text: 'Write and refine two sections back to back',         simplified: ['Complete one section fully',         'Draft one section without editing'] },
      { text: 'Review everything and prepare the final version',    simplified: ['Review the last two sections',       'Read through the whole thing once'] },
    ],
  };
}

export async function POST(req: NextRequest) {
  const { goal, freeHours = 4 } = await req.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(fallback(goal));
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
        max_tokens: 2048,
        messages: [{ role: 'user', content: PROMPT(goal, freeHours) }],
      }),
    });

    const data  = await res.json();
    const text: string = data.content?.[0]?.text ?? '';
    const parsed: GoalResponse = JSON.parse(text);
    return Response.json(parsed);
  } catch {
    return Response.json(fallback(goal));
  }
}
