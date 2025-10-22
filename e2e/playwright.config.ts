import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import yaml from 'yaml';

let baseURL = process.env.BASE_URL || 'http://localhost:4200';
try {
  const file = fs.readFileSync('./config.yaml', 'utf8');
  const cfg = yaml.parse(file);
  if (!process.env.BASE_URL && cfg?.baseUrl) baseURL = cfg.baseUrl;
} catch {}

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  reporter: [['list']],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ]
});

