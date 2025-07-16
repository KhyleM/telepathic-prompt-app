const { test, expect } = require('@playwright/test');

test('basic test', async ({ page }) => {
  console.log('Starting basic test...');
  await page.goto('https://example.com');
  console.log('Page loaded');
  const title = await page.title();
  console.log('Title:', title);
  expect(title).toBeTruthy();
});