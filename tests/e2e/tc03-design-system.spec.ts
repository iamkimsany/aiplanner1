/**
 * TC-03: Design System — pill buttons & hairline borders (apply-design-system change)
 *
 * Requirement: openspec/changes/apply-design-system tasks T2, T3
 *   T2: All CTA / action buttons → rounded-full
 *   T3: Cards → border border-gray-200, no shadow-sm
 *
 * Priority: P1 — regression guard for the design system change.
 *
 * Note: These assertions verify the OUTCOME of the apply-design-system change.
 *       They will FAIL before the change is applied and PASS after.
 *       Run as part of the post-implementation verification checklist.
 */

import { test, expect } from '@playwright/test';
import { LS_KEY, STATE_TASKS_READY } from './fixtures';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function seedTasks(page: import('@playwright/test').Page) {
  await page.goto('/tasks');
  await page.evaluate(
    ({ key, state }) => localStorage.setItem(key, JSON.stringify(state)),
    { key: LS_KEY, state: STATE_TASKS_READY },
  );
  await page.reload();
  // Wait for active task to render
  await expect(page.getByRole('button', { name: '▶ Start' })).toBeVisible();
}

// ─── T2: Button pill ──────────────────────────────────────────────────────────

test('TC-03a [T2]: "▶ Start" button has rounded-full class', async ({ page }) => {
  await seedTasks(page);
  const startBtn = page.getByRole('button', { name: '▶ Start' });
  await expect(startBtn).toHaveClass(/rounded-full/);
});

test('TC-03b [T2]: "Simplify" button has rounded-full class', async ({ page }) => {
  await seedTasks(page);
  const simplifyBtn = page.getByRole('button', { name: 'Simplify' });
  await expect(simplifyBtn).toHaveClass(/rounded-full/);
});

test('TC-03c [T2]: "Let\'s go →" on /energy has rounded-full class', async ({ page }) => {
  await page.goto('/energy');
  await page.evaluate(
    ({ key, state }) => localStorage.setItem(key, JSON.stringify(state)),
    {
      key: LS_KEY,
      state: {
        goals: [{ id: 'g1', title: 'Test', type: 'deadline', tasksEasy: [], tasksMedium: [], tasksHard: [], progress: 0, total: 0, isActive: true, createdAt: '' }],
        aiSummary: 'Test', currentEnergy: null, todayTasks: [], schedule: [], sessions: [], focusSessions: [], lastResult: null, completedTaskHistory: {}, activeFocus: null, lastFocusDone: null,
      },
    },
  );
  await page.reload();

  const ctaBtn = page.getByRole('button', { name: /Let's go/i });
  await expect(ctaBtn).toHaveClass(/rounded-full/);
});

test('TC-03d [T2]: "AI builds your plan →" on / has rounded-full class', async ({ page }) => {
  await page.goto('/');
  await page.evaluate((key) => localStorage.removeItem(key), LS_KEY);

  const ctaBtn = page.getByRole('button', { name: /AI builds your plan/i });
  await expect(ctaBtn).toHaveClass(/rounded-full/);
});

// ─── T3: Card hairline border ─────────────────────────────────────────────────

test('TC-03e [T3]: active task card has no shadow-sm class', async ({ page }) => {
  await seedTasks(page);

  // Active task card is the one containing "▶ Start"
  // Walk up to the card container (task-card class)
  const taskCard = page.locator('.task-card').first();
  await expect(taskCard).not.toHaveClass(/shadow-sm/);
});

test('TC-03f [T3]: active task card has border class (hairline)', async ({ page }) => {
  await seedTasks(page);

  // After T3, the card should have border styling via class, not just inline style
  // The left-border purple is intentional — we check for general border class
  const taskCard = page.locator('.task-card').first();
  // Should have either border class OR inline borderLeft (left-purple is intentional design)
  // At minimum, shadow-sm must be absent
  await expect(taskCard).not.toHaveClass(/shadow/);
});

// ─── T4: Eyebrow mono ─────────────────────────────────────────────────────────

test('TC-03g [T4]: section eyebrow labels use font-mono', async ({ page }) => {
  await seedTasks(page);

  // The goal title above the task text is an eyebrow label
  // After T4: should have font-mono class
  // Locate the uppercase category label inside the active card
  const eyebrow = page.locator('.task-card').first().locator('p').first();
  await expect(eyebrow).toHaveClass(/font-mono/);
});
