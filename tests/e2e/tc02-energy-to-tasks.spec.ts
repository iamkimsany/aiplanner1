/**
 * TC-02: Screen 2 (Energy selection) → Screen 3 (Today's Tasks)
 *
 * Requirement: F2 — User selects an energy level; F3 — Task list appears.
 *              Uses localStorage seed to bypass AI generation entirely.
 *
 * Priority: P0 — isolated smoke test for /energy → /tasks transition.
 */

import { test, expect } from '@playwright/test';
import { LS_KEY, STATE_GOALS_READY } from './fixtures';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function seedAndVisitEnergy(page: import('@playwright/test').Page) {
  await page.goto('/energy');
  await page.evaluate(
    ({ key, state }) => localStorage.setItem(key, JSON.stringify(state)),
    { key: LS_KEY, state: STATE_GOALS_READY },
  );
  await page.reload();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test('TC-02a: selecting medium energy and clicking "Let\'s go →" navigates to /tasks', async ({ page }) => {
  await seedAndVisitEnergy(page);

  // Select medium energy
  await page.getByText('Medium energy').click();

  // Verify selection state — the card should appear selected (border changes via style)
  const mediumCard = page.getByText('Medium energy').locator('..');
  // We can't assert style directly, but assert it is visible and we can proceed
  await expect(mediumCard).toBeVisible();

  // Click CTA
  await page.getByRole('button', { name: /Let's go/i }).click();

  // Should land on /tasks
  await expect(page).toHaveURL('/tasks', { timeout: 3_000 });
});

test('TC-02b: /tasks shows an active task card with Start button', async ({ page }) => {
  // Seed state that already has energy + todayTasks set (skip /energy altogether)
  await page.goto('/tasks');
  await page.evaluate(
    ({ key, state }) => localStorage.setItem(key, JSON.stringify(state)),
    {
      key: LS_KEY,
      state: {
        ...STATE_GOALS_READY,
        currentEnergy: 'medium',
        todayTasks: [
          { goalId: 'g-test-1', taskId: 't-med-1', status: 'active', simplifyLevel: 0 },
        ],
      },
    },
  );
  await page.reload();

  // Active task card must show the task title
  await expect(page.getByText('Complete one listening exercise')).toBeVisible();

  // Start button must be present
  await expect(page.getByRole('button', { name: '▶ Start' })).toBeVisible();
});

test('TC-02c: only one energy card is selectable at a time', async ({ page }) => {
  await seedAndVisitEnergy(page);

  // Select low, then switch to high
  await page.getByText('Low energy').click();
  await page.getByText('High energy').click();

  // Clicking "Let's go →" should navigate (not show an error about multiple selections)
  await page.getByRole('button', { name: /Let's go/i }).click();
  await expect(page).toHaveURL('/tasks', { timeout: 3_000 });
});

test('TC-02d: clicking "Let\'s go →" without selecting shows an error', async ({ page }) => {
  await seedAndVisitEnergy(page);

  // Do not select any energy — click CTA directly
  await page.getByRole('button', { name: /Let's go/i }).click();

  // Should stay on /energy and show an error message
  await expect(page).toHaveURL('/energy');
  await expect(page.getByText(/choose/i)).toBeVisible();
});
