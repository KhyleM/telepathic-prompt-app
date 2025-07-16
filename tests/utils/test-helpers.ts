import { Page, expect } from '@playwright/test';

/**
 * Test Utilities and Helpers
 * 
 * Common helper functions for Playwright tests to reduce code duplication
 * and provide consistent test patterns across the application.
 * 
 * Updated to work with the actual page structure and reliable selectors.
 */

/**
 * Mock the recommendations API with sample data
 */
export async function mockRecommendationsAPI(page: Page, recommendations = [
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
]) {
  await page.route('/api/recommend', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ recommendations })
    });
  });
}

/**
 * Fill the recommendation form with test data
 */
export async function fillRecommendationForm(page: Page, options = {
  prompts: 'How to improve user experience\nBest practices for SEO',
  domain: 'web development agency'
}) {
  await page.fill('textarea', options.prompts);
  await page.fill('input[type="text"]', options.domain);
}

/**
 * Submit the recommendation form and wait for results
 */
export async function submitRecommendationForm(page: Page) {
  await page.click('button:has-text("Get Recommendations")');
  
  // Wait for loading to complete first
  await page.waitForLoadState('networkidle');
  
  // Wait for Loading... text to disappear
  await expect(page.locator('text=Loading...')).not.toBeVisible({ timeout: 10000 });
  
  // Wait for results section to appear
  await expect(page.locator('h2:has-text("Your Search Prompts")')).toBeVisible({ timeout: 10000 });
  
  // Scroll down to ensure recommendations are visible
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  
  await expect(page.locator('h2:has-text("Recommendations")')).toBeVisible({ timeout: 15000 });
}

/**
 * Navigate to My Recommendations page
 */
export async function navigateToMyRecommendations(page: Page) {
  await page.click('a:has-text("My Recommendations")');
  await expect(page).toHaveURL('/my-recommendations');
}

/**
 * Navigate back to home page from My Recommendations
 */
export async function navigateBackToHome(page: Page) {
  await page.click('a:has-text("Back to Generator")');
  await expect(page).toHaveURL('/');
}

/**
 * Verify recommendation headings are displayed correctly
 */
export async function verifyRecommendationHeadings(page: Page, expectedCount = 5) {
  // Wait for loading to complete first
  await waitForLoadingToComplete(page);
  
  // Scroll to make sure recommendations are visible
  await page.locator('h2:has-text("Recommendations")').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  
  // Based on the actual page structure, recommendations are shown as h3 elements
  await expect(page.locator('h3')).toHaveCount(expectedCount, { timeout: 15000 });
}

/**
 * Verify user is not authenticated (shows sign in button)
 */
export async function verifyNotAuthenticated(page: Page) {
  await expect(page.locator('button:has-text("Sign in with GitHub")')).toBeVisible();
  await expect(page.locator('text=Signed in as')).not.toBeVisible();
}

/**
 * Wait for loading state to complete
 */
export async function waitForLoadingToComplete(page: Page) {
  // Wait for network idle
  await page.waitForLoadState('networkidle');
  
  // Wait for loading text to disappear
  await expect(page.locator('text=Loading...')).not.toBeVisible({ timeout: 10000 });
  
  // Wait for loading button to disappear (if it exists)
  try {
    await expect(page.locator('button:has-text("Loading...")')).not.toBeVisible({ timeout: 5000 });
  } catch {
    // Loading button might not exist, that's okay
  }
}

/**
 * Mock API error response
 */
export async function mockAPIError(page: Page, endpoint: string, status = 500) {
  await page.route(endpoint, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Server error occurred'
      })
    });
  });
}

/**
 * Check that form validation works correctly
 */
export async function verifyFormValidation(page: Page) {
  // Button should be disabled initially
  await expect(page.locator('button:has-text("Get Recommendations")')).toBeDisabled();

  // Fill only prompts field
  await page.fill('textarea', 'Test prompt');
  await expect(page.locator('button:has-text("Get Recommendations")')).toBeDisabled();

  // Clear prompts and fill only domain field
  await page.fill('textarea', '');
  await page.fill('input[type="text"]', 'test domain');
  await expect(page.locator('button:has-text("Get Recommendations")')).toBeDisabled();

  // Fill both fields - button should be enabled
  await page.fill('textarea', 'Test prompt');
  await expect(page.locator('button:has-text("Get Recommendations")')).toBeEnabled();
}

/**
 * Verify that page elements are visible
 */
export async function verifyHomePageElements(page: Page) {
  await expect(page.locator('h1:has-text("Search Prompt Recommender")')).toBeVisible();
  await expect(page.locator('textarea')).toBeVisible();
  await expect(page.locator('input[type="text"]')).toBeVisible();
  await expect(page.locator('button:has-text("Get Recommendations")')).toBeVisible();
  await expect(page.locator('a:has-text("My Recommendations")')).toBeVisible();
}

/**
 * Create a recommendation API mock with specified count
 */
export async function createRecommendationMock(page: Page, count: number = 5) {
  const recommendations = Array.from({ length: count }, (_, i) => ({
    prompt: `Test recommendation ${i + 1}`,
    similarity: 0.9 - (i * 0.1),
    explanation: `This is test explanation ${i + 1} for the recommendation.`
  }));

  await page.route('/api/recommend', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ recommendations })
    });
  });
}

/**
 * Verify specific recommendation content
 */
export async function verifyRecommendationContent(page: Page, prompt: string, explanation: string, similarity: number) {
  await expect(page.locator(`h3:has-text("${prompt}")`)).toBeVisible();
  await expect(page.locator(`text=${explanation}`)).toBeVisible();
  await expect(page.locator(`text=Similarity: ${(similarity * 100).toFixed(1)}%`)).toBeVisible();
}

/**
 * Verify table structure and content
 */
export async function verifyUserPromptsTable(page: Page, prompts: string[]) {
  await expect(page.locator('table')).toBeVisible();
  
  for (const prompt of prompts) {
    await expect(page.locator(`text=${prompt}`)).toBeVisible();
  }
}