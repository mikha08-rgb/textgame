import { test, expect } from '@playwright/test';

test('test harness loads successfully', async ({ page }) => {
  await page.goto('/');

  // Check that the page title is present
  await expect(page.locator('h1')).toContainText('AI Adventure Engine');

  // Verify the test harness is visible
  await expect(page.locator('.test-harness')).toBeVisible();
});

test('can see world generation preset button', async ({ page }) => {
  await page.goto('/');

  // Find the "World Generation (Full)" button
  const button = page.getByText('World Generation (Full)');
  await expect(button).toBeVisible();
});
