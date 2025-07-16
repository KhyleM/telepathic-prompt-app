import { test, expect } from '@playwright/test';

/**
 * Working Tests Based on Actual Page Structure
 * 
 * These tests are based on the actual page structure as seen in the error snapshots
 */

test.describe('Working Tests', () => {
  
  test('should display exactly 5 recommendations after form submission', async ({ page }) => {
    // Mock the API response
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

    // Navigate to home page
    await page.goto('/');
    
    // Fill and submit the form
    await page.fill('textarea', 'How to improve user experience\nBest practices for SEO');
    await page.fill('input[type="text"]', 'web development agency');
    await page.click('button:has-text("Get Recommendations")');

    // Wait for results to load
    await expect(page.locator('h2:has-text("Your Search Prompts")')).toBeVisible();
    await expect(page.locator('h2:has-text("Recommendations")')).toBeVisible();

    // Based on the snapshot, recommendations are shown as h3 elements
    // Count all h3 elements that contain recommendation titles
    const recommendationHeadings = page.locator('h3');
    await expect(recommendationHeadings).toHaveCount(5);

    // Verify each specific recommendation is displayed
    await expect(page.locator('h3:has-text("User interface design best practices")')).toBeVisible();
    await expect(page.locator('h3:has-text("Mobile-first design principles")')).toBeVisible();
    await expect(page.locator('h3:has-text("Website performance optimization")')).toBeVisible();
    await expect(page.locator('h3:has-text("Accessibility standards implementation")')).toBeVisible();
    await expect(page.locator('h3:has-text("Content management system selection")')).toBeVisible();

    // Verify similarity scores are displayed
    await expect(page.locator('text=Similarity: 89.0%')).toBeVisible();
    await expect(page.locator('text=Similarity: 85.0%')).toBeVisible();
    await expect(page.locator('text=Similarity: 82.0%')).toBeVisible();
    await expect(page.locator('text=Similarity: 78.0%')).toBeVisible();
    await expect(page.locator('text=Similarity: 75.0%')).toBeVisible();

    // Verify explanations are displayed
    await expect(page.locator('text=This prompt is highly relevant for web development agencies')).toBeVisible();
    await expect(page.locator('text=Essential for modern web development agencies')).toBeVisible();
  });

  test('should display the home page correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check that the main heading is visible
    await expect(page.locator('h1:has-text("Search Prompt Recommender")')).toBeVisible();
    
    // Check that form elements are present
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('button:has-text("Get Recommendations")')).toBeVisible();
    
    // Check that the button is initially disabled (no input)
    await expect(page.locator('button:has-text("Get Recommendations")')).toBeDisabled();
    
    // Check navigation elements
    await expect(page.locator('a:has-text("My Recommendations")')).toBeVisible();
    await expect(page.locator('button:has-text("Sign in with GitHub")')).toBeVisible();
  });

  test('should enable submit button when form is filled', async ({ page }) => {
    await page.goto('/');
    
    // Fill in the form
    await page.fill('textarea', 'How to improve user experience\nBest practices for SEO');
    await page.fill('input[type="text"]', 'web development agency');
    
    // Button should now be enabled
    await expect(page.locator('button:has-text("Get Recommendations")')).toBeEnabled();
  });

  test('should validate required form fields', async ({ page }) => {
    await page.goto('/');
    
    // Try to submit with empty fields
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
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error response
    await page.route('/api/recommend', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Failed to get recommendations'
        })
      });
    });

    await page.goto('/');

    // Fill and submit the form
    await page.fill('textarea', 'Test prompt');
    await page.fill('input[type="text"]', 'test domain');
    await page.click('button:has-text("Get Recommendations")');

    // Wait for the results section to appear
    await expect(page.locator('h2:has-text("Your Search Prompts")')).toBeVisible();
    await expect(page.locator('h2:has-text("Recommendations")')).toBeVisible();
    
    // Should show no recommendations message
    await expect(page.locator('text=No recommendations found.')).toBeVisible();
  });

  test('should display user prompts in table format', async ({ page }) => {
    // Mock API response
    await page.route('/api/recommend', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          recommendations: [
            {
              prompt: 'Test recommendation',
              similarity: 0.85,
              explanation: 'Test explanation'
            }
          ]
        })
      });
    });

    await page.goto('/');

    // Fill form with multiple prompts
    await page.fill('textarea', 'First prompt\nSecond prompt\nThird prompt');
    await page.fill('input[type="text"]', 'test domain');
    await page.click('button:has-text("Get Recommendations")');

    // Wait for results
    await expect(page.locator('h2:has-text("Your Search Prompts")')).toBeVisible();

    // Check table structure
    await expect(page.locator('table')).toBeVisible();
    
    // Check that all prompts are displayed in the table
    await expect(page.locator('text=First prompt')).toBeVisible();
    await expect(page.locator('text=Second prompt')).toBeVisible();
    await expect(page.locator('text=Third prompt')).toBeVisible();
  });

  test('should navigate to My Recommendations page', async ({ page }) => {
    await page.goto('/');
    
    // Click on My Recommendations link
    await page.click('a:has-text("My Recommendations")');
    
    // Should navigate to the My Recommendations page
    await expect(page).toHaveURL('/my-recommendations');
    
    // Should show login prompt for unauthenticated users
    await expect(page.locator('text=Log in to see your previous recommendations')).toBeVisible();
    await expect(page.locator('text=Sign in with GitHub to view and manage your saved recommendations.')).toBeVisible();
  });

  test('should show loading state', async ({ page }) => {
    // Mock API with delay
    await page.route('/api/recommend', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          recommendations: [
            {
              prompt: 'Test recommendation',
              similarity: 0.85,
              explanation: 'Test explanation'
            }
          ]
        })
      });
    });

    await page.goto('/');

    // Fill and submit form
    await page.fill('textarea', 'Test prompt');
    await page.fill('input[type="text"]', 'test domain');
    await page.click('button:has-text("Get Recommendations")');

    // Should show loading state
    await expect(page.locator('button:has-text("Loading...")')).toBeVisible();
    
    // Loading should eventually disappear and show results
    await expect(page.locator('h2:has-text("Recommendations")')).toBeVisible({ timeout: 10000 });
  });
});