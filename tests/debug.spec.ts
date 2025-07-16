import { test, expect } from '@playwright/test';

test.describe('Debug Tests', () => {
  test('debug page content', async ({ page }) => {
    // Navigate to home page
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    
    // Log the page title and URL
    console.log('Page title:', await page.title());
    console.log('Page URL:', page.url());
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-home.png', fullPage: true });
    
    // Log the page content
    const pageContent = await page.content();
    console.log('Page contains "Search Prompt Recommender":', pageContent.includes('Search Prompt Recommender'));
    console.log('Page contains form elements:', pageContent.includes('prompts') && pageContent.includes('domain'));
    
    // Check if basic elements exist
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    console.log('Number of h1 elements:', h1Count);
    
    if (h1Count > 0) {
      const h1Text = await h1.first().textContent();
      console.log('First h1 text:', h1Text);
    }
    
    // Check for form elements
    const promptsInput = page.locator('#prompts');
    const domainInput = page.locator('#domain');
    const button = page.locator('button');
    
    console.log('Prompts input exists:', await promptsInput.count() > 0);
    console.log('Domain input exists:', await domainInput.count() > 0);
    console.log('Button count:', await button.count());
    
    if (await button.count() > 0) {
      const buttonText = await button.first().textContent();
      console.log('First button text:', buttonText);
    }
    
    // List all elements on page for debugging
    const allElements = await page.locator('*').evaluateAll(elements => 
      elements.slice(0, 50).map(el => ({
        tag: el.tagName,
        id: el.id,
        class: el.className,
        text: el.textContent?.substring(0, 50)
      }))
    );
    console.log('First 50 elements:', JSON.stringify(allElements, null, 2));
  });
});