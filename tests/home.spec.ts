import { test, expect } from '@playwright/test';

test('homepage has expected title and main sections', async ({ page }) => {
  await page.goto('/');

  // Verify the page title
  await expect(page).toHaveTitle(/MedConnect/i);

  // Check if main heading is visible
  const heading = page.locator('h1').first();
  await expect(heading).toBeVisible();

  // Check if navigation links are present
  await expect(page.locator('a:has-text("Knowledge")').first()).toBeVisible();
  await expect(page.locator('a:has-text("Learning")').first()).toBeVisible();
});
