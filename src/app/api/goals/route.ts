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
      { text: `Open your notes or materials for "${goal}"`,           simplified: ['Look at your materials for 1 minute',       'Find the relevant file or notebook'] },
      { text: `Read what you have so far on "${goal}" for 2 min`,    simplified: ['Skim the first section',                    'Open the document'] },
      { text: `Write one sentence about your progress on "${goal}"`, simplified: ['Type one word that describes it',            'Think about it for 1 min'] },
      { text: `Find one useful resource for "${goal}" online`,       simplified: ['Search for it and save one link',           'Google the topic name'] },
    ],
    medium: [
      { text: `Write a 3-step action plan for "${goal}"`,                   simplified: ['Write 3 bullet points only',                  'Write one thing you need to do'] },
      { text: `Work on "${goal}" for 20 focused minutes`,                   simplified: ['Work on it for 10 minutes',                    'Set a timer and start for 5 min'] },
      { text: `Find 3 good references for "${goal}" and save the links`,    simplified: ['Find 1 reference',                             'Google the main topic'] },
      { text: `Review and edit your progress on "${goal}"`,                 simplified: ['Read what you have without editing',           'Open your notes and scroll through'] },
    ],
    hard: [
      { text: `Complete one full milestone for "${goal}" from start to finish`,  simplified: ['Complete half a milestone',              'Make meaningful progress for 30 min'] },
      { text: `Do a focused 45-min deep work session on "${goal}"`,              simplified: ['Do a 25-min Pomodoro session',            'Work for 10 min uninterrupted'] },
      { text: `Make two major steps of progress on "${goal}" back to back`,      simplified: ['Complete one major step fully',           'Draft one step without stopping'] },
      { text: `Review everything and prepare the next phase of "${goal}"`,       simplified: ['Review the last two sessions',           'Read through all your progress once'] },
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
