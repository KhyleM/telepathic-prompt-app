import { test, expect } from '@playwright/test';

test.describe('Simple Tests', () => {
  test('can load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Just check that the page loads and has a title
    await expect(page).toHaveTitle(/Next.js|Search Prompt Recommender/);
    
    // Wait for any element to be visible to confirm page loaded
    await page.waitForLoadState('networkidle');
    
    // Check if we can find any content
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('Page URL:', page.url());
    console.log('Page title:', await page.title());
  });

  test('basic form interaction', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for any textarea (our prompts field)
    const textarea = page.locator('textarea').first();
    if (await textarea.count() > 0) {
      await textarea.fill('test prompt');
      console.log('Successfully filled textarea');
    }
    
    // Look for any text input (our domain field)
    const textInput = page.locator('input[type="text"]').first();
    if (await textInput.count() > 0) {
      await textInput.fill('test domain');
      console.log('Successfully filled text input');
    }
    
    // Look for any button
    const button = page.locator('button').first();
    if (await button.count() > 0) {
      const buttonText = await button.textContent();
      console.log('Found button with text:', buttonText);
    }
  });
});