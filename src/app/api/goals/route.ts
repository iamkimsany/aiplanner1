import { NextRequest } from 'next/server';

interface TaskWithSimplified {
  text: string;
  simplified: [string, string];
}

interface GoalResponse {
  easy:   TaskWithSimplified[];
  medium: TaskWithSimplified[];
  hard:   TaskWithSimplified[];
}

const PROMPT = (goal: string, energy: string, freeHours: number): string =>
  `You are a smart daily planner. Break down this goal into small, concrete daily actions a person can realistically do today.

Goal: "${goal}"
Energy level: ${energy} (low/medium/high)
Available time today: ${freeHours} hours

Rules:
- Tasks must be SPECIFIC actions, not restatements of the goal
- For physical goals (run, workout, exercise): give distance/time/reps for TODAY only
  Example: goal is "Run 10km" → today's easy task = "Run 2km at easy pace"
  Example: goal is "Run 10km" → today's medium task = "Run 5km with 2 min walk breaks"
  Example: goal is "Run 10km" → today's hard task = "Run 7km continuous"
- For study goals: give specific chapter/topic/problem count
- For habit goals: give exact duration or count
- EASY tasks must feel almost too simple
- Each task should take 15–45 minutes maximum

Return ONLY this JSON, no markdown, no explanation:
{
  "easy": [
    {"text": "specific task", "simplified": ["even simpler", "simplest possible"]},
    {"text": "specific task", "simplified": ["even simpler", "simplest possible"]},
    {"text": "specific task", "simplified": ["even simpler", "simplest possible"]}
  ],
  "medium": [
    {"text": "specific task", "simplified": ["even simpler", "simplest possible"]},
    {"text": "specific task", "simplified": ["even simpler", "simplest possible"]},
    {"text": "specific task", "simplified": ["even simpler", "simplest possible"]}
  ],
  "hard": [
    {"text": "specific task", "simplified": ["even simpler", "simplest possible"]},
    {"text": "specific task", "simplified": ["even simpler", "simplest possible"]},
    {"text": "specific task", "simplified": ["even simpler", "simplest possible"]}
  ]
}`;

function fallback(goal: string): GoalResponse {
  // Detect goal category by keywords so fallback tasks are at least plausible
  const g = goal.toLowerCase();
  const isPhysical = /run|walk|jog|gym|workout|exercise|swim|bike|cycle|hike|lift|squat|push.?up|pull.?up|cardio|yoga|stretch/i.test(g);
  const isStudy    = /study|exam|test|read|chapter|course|learn|homework|essay|paper|thesis|math|code|program/i.test(g);

  if (isPhysical) {
    return {
      easy: [
        { text: 'Go for a 10-minute easy walk or light jog',                      simplified: ['Walk for 5 minutes outside',               'Put on your shoes and step outside'] },
        { text: 'Do 10 minutes of stretching or warm-up exercises',               simplified: ['Do 5 minutes of light stretching',          'Stretch your legs for 2 minutes'] },
        { text: 'Do 3 sets of 10 bodyweight squats',                              simplified: ['Do 1 set of 10 squats',                     'Do 5 squats'] },
      ],
      medium: [
        { text: 'Complete a 20-minute steady-pace cardio session',                simplified: ['Do 10 minutes of cardio',                   'Walk briskly for 10 minutes'] },
        { text: 'Do a 25-minute full-body workout (squats, push-ups, lunges)',     simplified: ['Do 3 exercises for 10 min',                  'Do 2 sets of squats and push-ups'] },
        { text: 'Run or jog for 20 minutes at a comfortable pace',                simplified: ['Run for 10 minutes then walk',               'Walk fast for 20 minutes'] },
      ],
      hard: [
        { text: 'Complete a 40-minute high-intensity workout session',            simplified: ['Do 25 minutes of moderate intensity',        'Do 15 minutes of high intensity'] },
        { text: 'Run continuously for 30 minutes at a challenging pace',          simplified: ['Run 20 minutes then walk 5',                 'Run 15 minutes without stopping'] },
        { text: 'Do a 45-minute progressive strength training session',           simplified: ['Do 30 minutes of strength training',         'Complete 3 compound exercises'] },
      ],
    };
  }

  if (isStudy) {
    return {
      easy: [
        { text: 'Read 5 pages of your study material',                            simplified: ['Read 2 pages',                              'Open the book and read 1 page'] },
        { text: 'Review your notes from the last session for 10 minutes',         simplified: ['Skim your notes for 5 minutes',             'Open your notes'] },
        { text: 'Write a 3-bullet summary of what you already know',              simplified: ['Write 1 bullet point',                      'Think of one thing you know about it'] },
      ],
      medium: [
        { text: 'Study one full topic or chapter section for 25 minutes',         simplified: ['Study for 15 minutes',                      'Read the section headings and summaries'] },
        { text: 'Solve 5 practice problems or answer 10 review questions',        simplified: ['Solve 2 problems',                          'Read through 1 problem and attempt it'] },
        { text: 'Write a 1-page summary of today\'s study topic',                simplified: ['Write 3 key points in your own words',       'Write the main idea in one sentence'] },
      ],
      hard: [
        { text: 'Complete one full chapter with notes and a written summary',     simplified: ['Complete half a chapter with notes',         'Read the chapter without notes'] },
        { text: 'Do a 45-minute timed practice test or problem set',             simplified: ['Do 25 minutes of practice problems',         'Do 10 minutes of timed problems'] },
        { text: 'Write and review detailed notes covering 2 full topics',         simplified: ['Write notes for 1 topic',                    'Write rough notes for 1 topic'] },
      ],
    };
  }

  // Generic fallback
  return {
    easy: [
      { text: `Spend 10 minutes planning your approach to "${goal}"`,             simplified: ['Think about one first step for 5 min',      'Write down the goal on paper'] },
      { text: `Do one small concrete action toward "${goal}" right now`,          simplified: ['Find one resource related to the goal',      'Search online for how to start'] },
      { text: `Set up your workspace or tools needed for "${goal}"`,              simplified: ['Gather your materials',                      'Clear your desk or open the app'] },
    ],
    medium: [
      { text: `Work directly on "${goal}" for 20 uninterrupted minutes`,          simplified: ['Work on it for 10 minutes',                  'Set a 5-min timer and start'] },
      { text: `Complete one clear, defined step of "${goal}"`,                    simplified: ['Start the step without finishing it',        'Write down the steps involved'] },
      { text: `Review your progress on "${goal}" and plan the next action`,       simplified: ['Write what you have done so far',            'Look at your notes for 5 min'] },
    ],
    hard: [
      { text: `Work on "${goal}" for a focused 40-minute deep session`,           simplified: ['Do a 25-minute Pomodoro session',            'Work for 15 minutes without stopping'] },
      { text: `Complete two consecutive work blocks on "${goal}"`,                simplified: ['Complete one work block',                    'Start one block and work for 20 min'] },
      { text: `Reach a clear checkpoint on "${goal}" you can measure`,            simplified: ['Make any meaningful measurable progress',    'Write down what your checkpoint would be'] },
    ],
  };
}

export async function POST(req: NextRequest) {
  const { goal, energy = 'medium', freeHours = 4 } = await req.json();

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
        messages: [{ role: 'user', content: PROMPT(goal, energy, freeHours) }],
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
