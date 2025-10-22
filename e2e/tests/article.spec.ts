import { test, expect } from '@playwright/test';
import fs from 'fs';
import yaml from 'yaml';

const cfg = yaml.parse(fs.readFileSync('./config.yaml', 'utf8'));
const BASE_URL = process.env.BASE_URL || cfg.baseUrl || 'http://localhost:4200';
const USER_PASSWORD = process.env.USER_PASSWORD || cfg.defaultUser.password;

async function login(page, email: string) {
  await page.goto(BASE_URL + '/#/login');
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(USER_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForFunction(() => !!localStorage.getItem('token'), null, { timeout: 30000 });
  await expect(page.getByRole('link', { name: 'New Article' })).toBeVisible({ timeout: 20000 });
}

test.describe.serial('Article CRUD + Tags', () => {
  let createdEmail: string;
  let createdUsername: string;

  test.beforeAll(async ({ browser }) => {
    const ts = Date.now();
    createdEmail = `art${ts}@example.com`;
    createdUsername = `art${ts}`;
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE_URL + '/#/register');
    await page.getByPlaceholder('Username').fill(createdUsername);
    await page.getByPlaceholder('Email').fill(createdEmail);
    await page.getByPlaceholder('Password').fill(USER_PASSWORD);
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible({ timeout: 30000 });
    await ctx.close();
  });

  test('Create article with tags, appears in My Articles', async ({ page }) => {
    await login(page, createdEmail);
    await page.getByRole('link', { name: 'New Article' }).click();
    const ts = Date.now();
    const title = `PW Article ${ts}`;
    await page.getByPlaceholder('Article Title').fill(title);
    await page.getByPlaceholder("What's this article about?").fill('About ' + ts);
    await page.getByPlaceholder('Write your article (in markdown)').fill('Body ' + ts);
    await page.getByPlaceholder('Enter tags').fill('tagA');
    await page.getByPlaceholder('Enter tags').press('Enter');
    await page.getByPlaceholder('Enter tags').fill('tagB');
    await page.getByPlaceholder('Enter tags').press('Enter');
    await page.getByRole('button', { name: 'Publish Article' }).click();
    await expect(page.getByText('Published successfully!')).toBeVisible();

    await page.getByRole('link', { name: 'Profile' }).click();
    await expect(page.getByRole('heading', { name: createdUsername })).toBeVisible();
    await expect(page.getByRole('link', { name: title })).toBeVisible();
  });

  test('Edit and delete article', async ({ page }) => {
    await login(page, createdEmail);
    // Create a fresh article to ensure it exists
    await page.getByRole('link', { name: 'New Article' }).click();
    const ts = Date.now();
    const title = `EditMe ${ts}`;
    await page.getByPlaceholder('Article Title').fill(title);
    await page.getByPlaceholder("What's this article about?").fill('About edit');
    await page.getByPlaceholder('Write your article (in markdown)').fill('Body to edit');
    await page.getByPlaceholder('Enter tags').fill('pre');
    await page.getByPlaceholder('Enter tags').press('Enter');
    await page.getByRole('button', { name: 'Publish Article' }).click();
    await expect(page.getByText('Published successfully!')).toBeVisible();

    // Go to profile and open that article by title
    await page.getByRole('link', { name: 'Profile' }).click();
    await expect(page.getByRole('heading', { name: createdUsername })).toBeVisible();
    await page.getByRole('link', { name: title }).click();
    await page.getByRole('button', { name: 'Edit Article' }).first().click();
    await expect(page.getByRole('heading', { name: 'Article editor' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByPlaceholder('Article Title')).toHaveValue(title, { timeout: 30000 });
    await page.getByPlaceholder('Write your article (in markdown)').fill('Updated body');
    await page.getByPlaceholder('Enter tags').fill('updated');
    await page.getByPlaceholder('Enter tags').press('Enter');
    await expect(page.getByRole('button', { name: 'Publish Article' })).toBeEnabled({ timeout: 30000 });
    await page.getByRole('button', { name: 'Publish Article' }).click();
    await expect(page.getByText('Published successfully!')).toBeVisible();

    await page.goBack(); // back to article page
    await page.getByRole('button', { name: 'Delete Article' }).first().click();
    await expect(page).toHaveURL(new RegExp(`${BASE_URL}/#/?$`));
    await page.getByRole('link', { name: 'Profile' }).click();
    await expect(page.getByRole('link', { name: title, exact: true })).toHaveCount(0);
  });

  test('Tag filter shows only matching articles', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    // Click a tag from sidebar
    const tag = (await page.locator('.tag-list a.tag-pill').first().textContent())!.trim();
    await page.locator('.tag-list a.tag-pill', { hasText: tag }).first().click();
    // Verify each listed article has the tag
    const previews = page.locator('a.preview-link');
    const count = await previews.count();
    for (let i = 0; i < count; i++) {
      const item = previews.nth(i);
      await expect(item.locator('ul.tag-list')).toContainText(tag);
    }
  });
});

