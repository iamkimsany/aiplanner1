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

const PROMPT = (goal: string): string =>
  `Break down this goal into sequential, concrete steps.

Goal: "${goal}"

Think about what someone would realistically do step by step to achieve this goal.

Create 3 levels — each level has 3-5 tasks:

EASY: The very first small steps. So simple that even with zero energy you could do them. These are the beginning actions.

MEDIUM: Real progress steps. These move you meaningfully toward the goal. 30-45 minutes each.

HARD: Significant steps. These require focus and energy. These are the heavy work.

Rules:
- Every task starts with a verb (Write, Record, Run, Read, Open, Create...)
- Tasks must be SPECIFIC (not 'work on it', not 'make progress', not 'spend time on')
- Tasks should follow a logical sequence — easy tasks happen before medium, medium before hard
- Do NOT repeat the goal title in the task text

Return ONLY valid JSON, no markdown, no explanation:
{
  "easy": [
    {"text": "specific first step", "simplified": ["even simpler version", "absolute minimum version"]},
    {"text": "specific first step 2", "simplified": ["even simpler version", "absolute minimum version"]}
  ],
  "medium": [
    {"text": "specific progress step", "simplified": ["simpler version", "minimum version"]}
  ],
  "hard": [
    {"text": "specific hard step", "simplified": ["simpler version", "minimum version"]}
  ]
}`;

function fallback(goal: string): GoalResponse {
  const g = goal.toLowerCase();

  // Physical / fitness goals
  if (/run|jog|walk|gym|workout|exercise|swim|bike|cycle|hike|lift|squat|push.?up|pull.?up|cardio|yoga|stretch|fitness/i.test(g)) {
    return {
      easy: [
        { text: 'Put on your workout clothes and shoes',                          simplified: ['Lay out your workout clothes',              'Find your shoes'] },
        { text: 'Do a 10-minute warm-up stretch routine',                         simplified: ['Stretch for 5 minutes',                    'Do 3 basic stretches'] },
        { text: 'Walk briskly for 15 minutes',                                    simplified: ['Walk around the block once',               'Step outside for 5 minutes'] },
      ],
      medium: [
        { text: 'Run 3km at a comfortable, steady pace',                          simplified: ['Run 1.5km then walk back',                 'Jog for 15 minutes'] },
        { text: 'Complete a 30-minute interval run (1 min fast / 2 min slow)',    simplified: ['Do 20 minutes of intervals',               'Alternate fast and slow for 10 min'] },
        { text: 'Do a 25-minute full-body workout (squats, push-ups, lunges)',    simplified: ['Do 2 sets of each exercise',               'Do just squats and push-ups'] },
      ],
      hard: [
        { text: 'Run 6km continuous at a challenging pace',                       simplified: ['Run 4km continuous',                      'Run 3km without stopping'] },
        { text: 'Complete a 45-minute strength training session',                 simplified: ['Do 30 minutes of strength training',       'Complete 4 compound exercises'] },
        { text: 'Finish a full workout including warm-up, main set, and cooldown',simplified: ['Do the main set only',                    'Do a 20-minute workout'] },
      ],
    };
  }

  // Video / content creation goals
  if (/video|youtube|film|record|edit|podcast|reel|tiktok|content|post|upload|shoot/i.test(g)) {
    return {
      easy: [
        { text: 'Open your notes app and write 3 video ideas',                    simplified: ['Write 1 video idea',                      'Think of a topic and say it out loud'] },
        { text: 'Pick one idea and write a working title',                        simplified: ['Write a rough title',                     'Write one word that describes the topic'] },
        { text: 'Search for 3 similar videos and note what works',               simplified: ['Watch 1 similar video',                   'Search for the topic online'] },
      ],
      medium: [
        { text: 'Write a full video script (intro + 3 main points + outro)',      simplified: ['Write a bullet-point outline only',       'Write just the intro paragraph'] },
        { text: 'Record a rough draft on your phone in one take',                 simplified: ['Record just the intro',                   'Record yourself speaking the outline'] },
        { text: 'Create a simple thumbnail using Canva or your phone',           simplified: ['Find a background image for the thumbnail','Sketch the thumbnail on paper'] },
      ],
      hard: [
        { text: 'Record the final version with good lighting and clear audio',    simplified: ['Record in natural window light',          'Record one section at full quality'] },
        { text: 'Edit the full video: cuts, captions, music, transitions',        simplified: ['Cut out mistakes and silences only',      'Make 3 edits to improve the video'] },
        { text: 'Upload to YouTube with title, description, tags, and thumbnail', simplified: ['Upload as unlisted and fill in the title', 'Upload the file and save as draft'] },
      ],
    };
  }

  // Study / learning goals
  if (/study|exam|test|learn|read|chapter|course|homework|essay|paper|thesis|math|code|program|degree|class|lecture/i.test(g)) {
    return {
      easy: [
        { text: 'Open your study material and read the first page',               simplified: ['Open the book or file',                   'Find where you left off'] },
        { text: 'Write down 3 things you already know about this topic',          simplified: ['Write 1 thing you know',                  'Think about the topic for 2 minutes'] },
        { text: 'Review your notes from the last session for 10 minutes',         simplified: ['Skim your notes for 5 minutes',           'Open your notes and read the headings'] },
      ],
      medium: [
        { text: 'Read and take notes on one full chapter section',                simplified: ['Read the section without notes',          'Read just the first half'] },
        { text: 'Solve 5 practice problems or complete 10 review questions',      simplified: ['Solve 2 problems',                        'Attempt 1 problem fully'] },
        { text: 'Write a 1-page summary of the topic in your own words',         simplified: ['Write 3 key points',                      'Write the main idea in one sentence'] },
      ],
      hard: [
        { text: 'Complete a full chapter with detailed notes and a summary',      simplified: ['Complete half the chapter with notes',    'Read the chapter once through'] },
        { text: 'Do a 45-minute timed practice test without looking at notes',    simplified: ['Do 25 minutes of timed practice',         'Answer 10 questions from memory'] },
        { text: 'Write a complete outline or essay draft covering 2 topics',      simplified: ['Write an outline for 1 topic',            'Write bullet points for the main ideas'] },
      ],
    };
  }

  // Generic sequential fallback — no time-box filler, no goal restatements
  return {
    easy: [
      { text: `Open a blank note and write down everything you know about this goal`,   simplified: ['Write 3 bullet points about the goal',      'Write the first step that comes to mind'] },
      { text: 'Search online for one concrete example of someone who achieved this',    simplified: ['Search for the topic online',               'Watch a 5-minute intro video about it'] },
      { text: 'List the 3 most important first steps you need to take',                 simplified: ['Write 1 first step',                        'Think about what you need to start'] },
    ],
    medium: [
      { text: 'Complete the first concrete action from your step list',                 simplified: ['Start the action, even partially',          'Prepare everything needed for the action'] },
      { text: 'Research and gather the specific tools or materials you need',           simplified: ['Find 1 tool or resource you need',          'Write down what tools you would need'] },
      { text: 'Finish the second step from your plan and document the result',          simplified: ['Start the second step',                     'Review and refine the first step'] },
    ],
    hard: [
      { text: 'Complete the hardest or most-avoided step on your list',                 simplified: ['Start the hard step and do 50%',            'Break the hard step into 3 smaller parts'] },
      { text: 'Finish a complete, shareable or usable version of your work',            simplified: ['Finish a rough draft version',              'Complete two-thirds of the final version'] },
      { text: 'Review your output, fix the biggest issues, and prepare the next phase', simplified: ['Review only and write a fix list',          'Fix the top 2 issues you notice'] },
    ],
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { goal, pdfBase64 } = body;

  console.log('PDF received:', !!pdfBase64, 'length:', pdfBase64?.length ?? 0);
  console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);

  if (!process.env.OPENAI_API_KEY) {
    console.log('No API key — returning fallback');
    return Response.json(fallback(goal));
  }

  // Only use the PDF if it has real content (strips any accidental empty string)
  const validPdf = pdfBase64 && pdfBase64.length > 100 ? pdfBase64 : null;
  console.log('Using PDF:', !!validPdf, '| Using text-only:', !validPdf);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: validPdf ? [
            {
              type: 'text',
              text: `You are a study planner. Goal: "${goal}". Read the attached PDF and generate specific sequential tasks based on its actual content. Return ONLY valid JSON no markdown: {"easy":[{"text":"...","simplified":["...","..."]}],"medium":[...],"hard":[...]}`,
            },
            {
              type: 'image_url',
              image_url: { url: `data:application/pdf;base64,${validPdf}` },
            },
          ] : [
            {
              type: 'text',
              text: `You are a planner. Break down this goal into specific sequential steps: "${goal}". Return ONLY valid JSON no markdown: {"easy":[{"text":"...","simplified":["...","..."]}],"medium":[...],"hard":[...]}`,
            },
          ],
        }],
      }),
    });

    console.log('OpenAI response status:', response.status);
    const data = await response.json();
    console.log('OpenAI response:', JSON.stringify(data).slice(0, 300));

    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('No content from OpenAI');

    const parsed: GoalResponse = JSON.parse(content.replace(/```json|```/g, '').trim());
    return Response.json(parsed);
  } catch {
    return Response.json(fallback(goal));
  }
}
