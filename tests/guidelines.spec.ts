import { test, expect } from '@playwright/test';

test('guidelines page lists items and navigates to detail', async ({ page }) => {
  await page.goto('/guidelines');

  // Verify we are on the Guidelines page
  await expect(page.locator('h1').first()).toHaveText(/Clinical Guidelines/i);

  // Check if at least one guideline link exists
  const firstGuidelineLink = page.locator('a[href^="/guidelines/"]').first();
  await expect(firstGuidelineLink).toBeVisible();

  // Click the first guideline and verify we land on the detail page
  await firstGuidelineLink.click();
  
  // Verify the detail page has the 'Verified Medical Protocol' badge or text
  await expect(page.locator('text=Verified Medical Protocol')).toBeVisible({ timeout: 10000 });
});
