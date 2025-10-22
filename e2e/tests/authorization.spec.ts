import { test, expect } from '@playwright/test';
import fs from 'fs';
import yaml from 'yaml';

const cfg = yaml.parse(fs.readFileSync('./config.yaml', 'utf8'));
const BASE_URL = process.env.BASE_URL || cfg.baseUrl || 'http://localhost:4200';
const USER_PASSWORD = process.env.USER_PASSWORD || cfg.defaultUser.password;

test.describe('Authorization & Profile', () => {
  test('Profile bio update reflects on public profile', async ({ page }) => {
    const ts = Date.now();
    const email = `biotest${ts}@example.com`;
    const username = `biotest${ts}`;
    const originalBio = `Original bio ${ts}`;
    const updatedBio = `Updated bio ${ts} - now with more details!`;

    // Register user
    await page.goto(BASE_URL + '/#/register');
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Password').fill(USER_PASSWORD);
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible({ timeout: 30000 });

    // Login
    await page.goto(BASE_URL + '/#/login');
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Password').fill(USER_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForFunction(() => !!localStorage.getItem('token'), null, { timeout: 30000 });
    await expect(page.getByRole('link', { name: 'New Article' })).toBeVisible({ timeout: 20000 });

    // Go to settings and add bio
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Your Settings' })).toBeVisible();
    await page.getByPlaceholder('Short bio about you').fill(originalBio);
    await page.getByRole('button', { name: 'Update Settings' }).click();
    await expect(page.getByText('Updated successfully!')).toBeVisible({ timeout: 30000 });

    // Navigate to own profile and verify bio
    await page.getByRole('link', { name: 'Profile' }).click();
    await expect(page.getByRole('heading', { name: username })).toBeVisible();
    await expect(page.getByText(originalBio)).toBeVisible();

    // Update bio to new value
    await page.getByRole('button', { name: 'Edit Profile Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Your Settings' })).toBeVisible();
    await page.getByPlaceholder('Short bio about you').fill(updatedBio);
    await page.getByRole('button', { name: 'Update Settings' }).click();
    await expect(page.getByText('Updated successfully!')).toBeVisible({ timeout: 30000 });

    // Verify updated bio on profile
    await page.getByRole('link', { name: 'Profile' }).click();
    await expect(page.getByRole('heading', { name: username })).toBeVisible();
    await expect(page.getByText(updatedBio)).toBeVisible();
    await expect(page.getByText(originalBio)).not.toBeVisible();
  });

  test('Unauthorized user cannot edit another user\'s article', async ({ page, browser }) => {
    const ts = Date.now();
    const authorEmail = `author${ts}@example.com`;
    const authorUsername = `author${ts}`;
    const otherEmail = `other${ts}@example.com`;
    const otherUsername = `other${ts}`;

    // Register and login as author
    await page.goto(BASE_URL + '/#/register');
    await page.getByPlaceholder('Username').fill(authorUsername);
    await page.getByPlaceholder('Email').fill(authorEmail);
    await page.getByPlaceholder('Password').fill(USER_PASSWORD);
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible({ timeout: 30000 });

    await page.goto(BASE_URL + '/#/login');
    await page.getByPlaceholder('Email').fill(authorEmail);
    await page.getByPlaceholder('Password').fill(USER_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForFunction(() => !!localStorage.getItem('token'), null, { timeout: 30000 });
    await expect(page.getByRole('link', { name: 'New Article' })).toBeVisible({ timeout: 20000 });

    // Create an article as author
    await page.getByRole('link', { name: 'New Article' }).click();
    const title = `Protected Article ${ts}`;
    await page.getByPlaceholder('Article Title').fill(title);
    await page.getByPlaceholder("What's this article about?").fill('This is protected');
    await page.getByPlaceholder('Write your article (in markdown)').fill('Original content');
    await page.getByRole('button', { name: 'Publish Article' }).click();
    await expect(page.getByText('Published successfully!')).toBeVisible({ timeout: 30000 });

    // Logout
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Your Settings' })).toBeVisible();
    await page.getByRole('button', { name: 'Or click here to logout.' }).click();
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible({ timeout: 30000 });

    // Register and login as different user
    await page.goto(BASE_URL + '/#/register');
    await page.getByPlaceholder('Username').fill(otherUsername);
    await page.getByPlaceholder('Email').fill(otherEmail);
    await page.getByPlaceholder('Password').fill(USER_PASSWORD);
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible({ timeout: 30000 });

    await page.goto(BASE_URL + '/#/login');
    await page.getByPlaceholder('Email').fill(otherEmail);
    await page.getByPlaceholder('Password').fill(USER_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForFunction(() => !!localStorage.getItem('token'), null, { timeout: 30000 });
    await expect(page.getByRole('link', { name: 'New Article' })).toBeVisible({ timeout: 20000 });

    // View author's article
    await page.goto(BASE_URL + '/#/');
    await page.getByRole('link', { name: title }).first().click();
    
    // Verify "Edit Article" button is NOT visible (not the owner)
    await expect(page.getByRole('button', { name: 'Edit Article' })).not.toBeVisible();
    
    // Verify "Delete Article" button is NOT visible (not the owner)
    await expect(page.getByRole('button', { name: 'Delete Article' })).not.toBeVisible();
    
    // Verify Follow/Favorite buttons ARE visible (for non-owners)
    await expect(page.getByRole('button', { name: new RegExp(`Follow ${authorUsername}`) }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Favorite Article' }).first()).toBeVisible();
    
    console.log(`✓ Other user cannot see Edit/Delete buttons for author's article`);
    console.log(`✓ Authorization controls working correctly`);
  });
});

