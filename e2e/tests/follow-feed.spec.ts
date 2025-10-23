import { test, expect } from '@playwright/test';
import fs from 'fs';
import yaml from 'yaml';

const cfg = yaml.parse(fs.readFileSync('./config.yaml', 'utf8'));
const BASE_URL = process.env.BASE_URL || cfg.baseUrl || 'http://localhost:4200';
const USER_PASSWORD = process.env.USER_PASSWORD || cfg.defaultUser.password;

async function register(page, email: string, password: string, username: string) {
  await page.goto(BASE_URL + '/#/register');
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Sign up' }).click();
  await page.waitForURL(/\/\#\/login$/, { timeout: 30000 });
}

async function login(page, email: string, password: string) {
  await page.goto(BASE_URL + '/#/login');
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForFunction(() => !!localStorage.getItem('token'), null, { timeout: 30000 });
  await expect(page.getByRole('link', { name: 'New Article' })).toBeVisible({ timeout: 20000 });
}

test.describe.serial('Follow feed', () => {
  test('User A follows B; B publishes; A sees in My Feed', async ({ page, browser }) => {
    const ts = Date.now();
    const A = { email: `a${ts}@example.com`, password: USER_PASSWORD, username: `userA${ts}` };
    const B = { email: `b${ts}@example.com`, password: USER_PASSWORD, username: `userB${ts}` };

    // Register both users
    await register(page, A.email, A.password, A.username);
    await register(page, B.email, B.password, B.username);

    // User A logs in and follows B
    await login(page, A.email, A.password);
    await page.goto(`${BASE_URL}/#/profile/${B.username}`);
    await page.getByRole('button', { name: new RegExp(`Follow ${B.username}`) }).click();
    await expect(page.getByRole('button', { name: new RegExp(`Unfollow ${B.username}`) })).toBeVisible();

    // New browser context for user B to publish article
    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await login(pageB, B.email, B.password);
    await pageB.getByRole('link', { name: 'New Article' }).click();
    const title = `B post ${ts}`;
    await pageB.getByPlaceholder('Article Title').fill(title);
    await pageB.getByPlaceholder("What's this article about?").fill('about');
    await pageB.getByPlaceholder('Write your article (in markdown)').fill('body');
    await pageB.getByRole('button', { name: 'Publish Article' }).click();
    await expect(pageB.getByText('Published successfully!')).toBeVisible();

    // Back to user A: go to home and select My Feed
    await page.goto(BASE_URL + '/#/');
    await page.locator('.feed-toggle .nav a.nav-link').first().waitFor({ state: 'visible', timeout: 30000 });
    await page.locator('a.nav-link', { hasText: 'My Feed' }).first().click();
    await expect(page.getByRole('link', { name: title })).toBeVisible();

    await ctxB.close();
  });
});

