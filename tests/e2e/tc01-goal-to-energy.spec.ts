/**
 * TC-01: Screen 1 (Goal entry) → Screen 2 (Energy selection)
 *
 * Requirement: F1 — User enters a goal and triggers AI plan generation.
 *              /api/goals is mocked to avoid live AI dependency in CI.
 *
 * Priority: P0 — validates the entry point of the entire app flow.
 */

import { test, expect } from '@playwright/test';
import { LS_KEY, MOCK_GOAL } from './fixtures';

// ─── Mock API response ────────────────────────────────────────────────────────

const API_RESPONSE = {
  goals: [MOCK_GOAL],
  aiSummary: "You have 3 hours free today. Let's make it count.",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  // Start from clean state (no prior goals)
  await page.goto('/');
  await page.evaluate((key) => localStorage.removeItem(key), LS_KEY);
});

test('TC-01a: clicking "AI builds your plan →" calls /api/goals and navigates to /energy', async ({ page }) => {
  // ── Arrange: intercept the AI API ─────────────────────────────────────────
  await page.route('/api/goals', async (route) => {
    expect(route.request().method()).toBe('POST');
    await route.fulfill({
      status:      200,
      contentType: 'application/json',
      body:        JSON.stringify(API_RESPONSE),
    });
  });

  await page.goto('/');

  // ── Act: add a goal ────────────────────────────────────────────────────────
  // Open the goal form (button label may vary — adjust if form is already visible)
  const addGoalBtn = page.getByRole('button', { name: /add.*goal/i });
  if (await addGoalBtn.isVisible()) {
    await addGoalBtn.click();
  }

  // Fill the goal text input (first visible textbox on the page)
  const goalInput = page.getByRole('textbox').first();
  await goalInput.fill('Pass advanced French exam');

  // Click the main CTA
  const ctaButton = page.getByRole('button', { name: /AI builds your plan/i });
  await ctaButton.click();

  // ── Assert ─────────────────────────────────────────────────────────────────
  await expect(page).toHaveURL('/energy', { timeout: 5_000 });
});

test('TC-01b: /energy shows three energy option cards after navigation', async ({ page }) => {
  // Seed state as if AI already responded (skip form interaction)
  await page.goto('/energy');
  await page.evaluate(
    ({ key, state }) => localStorage.setItem(key, JSON.stringify(state)),
    { key: LS_KEY, state: { goals: [MOCK_GOAL], aiSummary: 'Test summary', currentEnergy: null, todayTasks: [], schedule: [], sessions: [], focusSessions: [], lastResult: null, completedTaskHistory: {}, activeFocus: null, lastFocusDone: null } },
  );
  await page.reload();

  // All three energy option buttons must be visible
  await expect(page.getByText('Low energy')).toBeVisible();
  await expect(page.getByText('Medium energy')).toBeVisible();
  await expect(page.getByText('High energy')).toBeVisible();

  // CTA must be present
  await expect(page.getByRole('button', { name: /Let's go/i })).toBeVisible();
});

test('TC-01c: /energy redirects to / when no goals exist', async ({ page }) => {
  // Empty state — guard should redirect
  await page.goto('/energy');
  await page.evaluate((key) => localStorage.removeItem(key), LS_KEY);
  await page.reload();

  await expect(page).toHaveURL('/', { timeout: 3_000 });
});
