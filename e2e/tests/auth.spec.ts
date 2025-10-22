import { test, expect } from '@playwright/test';
import fs from 'fs';
import yaml from 'yaml';

const cfg = yaml.parse(fs.readFileSync('./config.yaml', 'utf8'));
const BASE_URL = process.env.BASE_URL || cfg.baseUrl || 'http://localhost:4200';
const BASE_EMAIL = process.env.USER_EMAIL || cfg.defaultUser.email;
const USER_PASSWORD = process.env.USER_PASSWORD || cfg.defaultUser.password;
const BASE_USERNAME = process.env.USERNAME || cfg.defaultUser.username;

test.describe.serial('Auth', () => {
  test('Register a new user', async ({ page }) => {
    const unique = Date.now();
    const email = BASE_EMAIL.includes('@example.com') ? `user${unique}@example.com` : `${unique}-${BASE_EMAIL}`;
    const username = BASE_USERNAME.includes('testuser') ? `testuser${unique}` : `${BASE_USERNAME}${unique}`;
    await page.goto(BASE_URL + '/#/register');
    await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Password').fill(USER_PASSWORD);
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible({ timeout: 30000 });
  });

  test('Login successfully', async ({ page }) => {
    const unique = Date.now();
    const email = `login${unique}@example.com`;
    const username = `login${unique}`;
    // create user first
    await page.goto(BASE_URL + '/#/register');
    await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Password').fill(USER_PASSWORD);
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible({ timeout: 30000 });
    // then login
    await page.goto(BASE_URL + '/#/login');
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Password').fill(USER_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForFunction(() => !!localStorage.getItem('token'), null, { timeout: 30000 });
    await expect(page.getByRole('link', { name: 'New Article' })).toBeVisible({ timeout: 20000 });
  });

  test('Login with wrong password shows error', async ({ page }) => {
    const unique = Date.now();
    const email = `wrongpass${unique}@example.com`;
    const username = `wrongpass${unique}`;
    // create user first
    await page.goto(BASE_URL + '/#/register');
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Password').fill(USER_PASSWORD);
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible({ timeout: 30000 });
    // then try wrong password
    await page.goto(BASE_URL + '/#/login');
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Password').fill('WrongPass123!');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });
});

