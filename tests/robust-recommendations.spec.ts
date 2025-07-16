import { test, expect } from '@playwright/test';

/**
 * Robust Recommendations Tests
 * 
 * These tests are designed to handle timing, scrolling, and viewport issues
 * that were causing failures in the original tests.
 */

test.describe('Robust Recommendations Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should successfully generate and display 5 recommendations', async ({ page }) => {
    // Mock the API response before any interaction
    await page.route('/api/recommend', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          recommendations: [
            {
              prompt: 'User interface design best practices',
              similarity: 0.89,
              explanation: 'This prompt is highly relevant for web development agencies focusing on creating intuitive user experiences.'
            },
            {
              prompt: 'Mobile-first design principles',
              similarity: 0.85,
              explanation: 'Essential for modern web development agencies to ensure responsive and mobile-optimized websites.'
            },
            {
              prompt: 'Website performance optimization',
              similarity: 0.82,
              explanation: 'Critical for web development agencies to deliver fast-loading, efficient websites to clients.'
            },
            {
              prompt: 'Accessibility standards implementation',
              similarity: 0.78,
              explanation: 'Important for web development agencies to create inclusive websites that serve all users.'
            },
            {
              prompt: 'Content management system selection',
              similarity: 0.75,
              explanation: 'Valuable for web development agencies to choose the right CMS for client projects.'
            }
          ]
        })
      });
    });

    // Verify initial page state
    await expect(page.locator('h1')).toContainText('Search Prompt Recommender');
    
    // Fill the form using robust selectors
    const textarea = page.locator('textarea');
    const textInput = page.locator('input[type="text"]');
    const submitButton = page.locator('button', { hasText: 'Get Recommendations' });
    
    await expect(textarea).toBeVisible();
    await expect(textInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    // Fill form data
    await textarea.fill('How to improve user experience\\nBest practices for SEO');
    await textInput.fill('web development agency');
    
    // Verify button is enabled before clicking
    await expect(submitButton).toBeEnabled();
    
    // Submit the form
    await submitButton.click();
    
    // Step 1: Wait for the prompts table to appear (this loads first)
    await expect(page.locator('h2', { hasText: 'Your Search Prompts' })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('table')).toBeVisible();
    
    // Step 2: Wait for recommendations section to be available in DOM
    await expect(page.locator('h2', { hasText: 'Recommendations' })).toBeVisible({ timeout: 20000 });
    
    // Step 3: Scroll to ensure recommendations are in viewport
    await page.locator('h2', { hasText: 'Recommendations' }).scrollIntoViewIfNeeded();
    
    // Step 4: Wait a moment for any animations/rendering
    await page.waitForTimeout(2000);
    
    // Step 5: Count the h3 elements (recommendation titles)
    const h3Elements = page.locator('h3');
    await expect(h3Elements).toHaveCount(5, { timeout: 10000 });
    
    // Step 6: Verify specific recommendations are present
    await expect(page.locator('h3', { hasText: 'User interface design best practices' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Mobile-first design principles' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Website performance optimization' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Accessibility standards implementation' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Content management system selection' })).toBeVisible();
    
    // Step 7: Verify similarity scores are displayed
    await expect(page.locator('text=Similarity: 89.0%')).toBeVisible();
    await expect(page.locator('text=Similarity: 85.0%')).toBeVisible();
    
    // Step 8: Verify user prompts are in the table
    await expect(page.locator('text=How to improve user experience')).toBeVisible();
    await expect(page.locator('text=Best practices for SEO')).toBeVisible();
  });

  test('should handle different viewport sizes', async ({ page }) => {
    // Test mobile viewport specifically
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mock API
    await page.route('/api/recommend', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          recommendations: Array.from({ length: 5 }, (_, i) => ({
            prompt: `Mobile recommendation ${i + 1}`,
            similarity: 0.9 - (i * 0.1),
            explanation: `Mobile explanation ${i + 1}`
          }))
        })
      });
    });
    
    // Fill and submit form on mobile
    await page.fill('textarea', 'Mobile test prompt');
    await page.fill('input[type="text"]', 'mobile domain');
    await page.click('button:has-text("Get Recommendations")');
    
    // Wait for results with mobile-specific handling
    await expect(page.locator('h2:has-text("Your Search Prompts")')).toBeVisible({ timeout: 20000 });
    
    // Scroll down to see recommendations on mobile
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    await expect(page.locator('h2:has-text("Recommendations")')).toBeVisible({ timeout: 15000 });
    
    // Count recommendations on mobile
    await expect(page.locator('h3')).toHaveCount(5, { timeout: 15000 });
  });

  test('should handle slow API responses', async ({ page }) => {
    // Mock API with delay
    await page.route('/api/recommend', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          recommendations: [
            {
              prompt: 'Delayed recommendation',
              similarity: 0.95,
              explanation: 'This recommendation took a while to load'
            }
          ]
        })
      });
    });
    
    // Fill and submit form
    await page.fill('textarea', 'Slow API test');
    await page.fill('input[type="text"]', 'slow domain');
    await page.click('button:has-text("Get Recommendations")');
    
    // Should show loading state
    await expect(page.locator('button:has-text("Loading...")')).toBeVisible();
    
    // Wait for results with extended timeout
    await expect(page.locator('h2:has-text("Recommendations")')).toBeVisible({ timeout: 30000 });
    
    // Verify content loaded
    await page.locator('h2:has-text("Recommendations")').scrollIntoViewIfNeeded();
    await expect(page.locator('h3:has-text("Delayed recommendation")')).toBeVisible({ timeout: 10000 });
  });
});