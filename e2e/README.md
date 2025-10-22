# End-to-End Test Suite for RealWorld Application

This repository contains a comprehensive end-to-end test suite for the [RealWorld Django REST Framework + Angular](https://github.com/gothinkster/realworld-django-rest-framework-angular) application using Playwright.

## 📋 Test Coverage

### Core User Journeys (7 tests)
- **Authentication** (`auth.spec.ts`)
  - Register a new user
  - Login successfully
  - Login with wrong password shows error

- **Article Management** (`article.spec.ts`)
  - Create article with tags, appears in My Articles
  - Edit and delete article
  - Tag filter shows only matching articles

- **Social Features** (`follow-feed.spec.ts`)
  - User A follows B; B publishes; A sees in My Feed

### Authorization & Profile (2 tests)
- **Authorization & Profile** (`authorization.spec.ts`)
  - Profile bio update reflects on public profile
  - Unauthorized user cannot edit another user's article

## 🛠 Prerequisites

- **Docker Desktop** (macOS/Windows) or **Docker Engine** (Linux)
- **Docker Compose** v2.0+
- **Node.js** v18+
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone git@github.com:egrig/kraken-test.git
cd kraken-test
```

### 2. Start the Application (Backend + Frontend)

```bash
docker compose up -d backend frontend
```

Wait for services to be ready (~30 seconds):

```bash
# Verify backend is running
curl http://localhost:8000/api/

# Verify frontend is accessible
curl http://localhost:4200
```

You should see JSON response from backend and HTML from frontend.

### 3. Run Tests

```bash
cd e2e

# Install dependencies (first time only)
npm install

# Run all tests
BASE_URL=http://localhost:4200 npx playwright test

# Run specific test file
BASE_URL=http://localhost:4200 npx playwright test tests/auth.spec.ts

# Run tests in headed mode (see browser)
BASE_URL=http://localhost:4200 npx playwright test --headed

# Run tests with UI mode (interactive)
BASE_URL=http://localhost:4200 npx playwright test --ui
```

## ⚙️ Configuration

### Environment Variables

You can override default configuration using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Frontend URL | `http://localhost:4200` |
| `USER_PASSWORD` | Default password for test users | `Test1234!` |

### Configuration File

Edit `e2e/config.yaml` to change defaults:

```yaml
baseUrl: http://localhost:4200
defaultUser:
  email: user@example.com
  password: Test1234!
  username: testuser
```

## 📊 Viewing Test Results

### HTML Report

After running tests, generate and view an HTML report:

```bash
cd e2e
npx playwright show-report
```

### Trace Viewer (Debugging Failed Tests)

If a test fails, you can view a detailed trace:

```bash
cd e2e
npx playwright show-trace test-results/<test-name>/trace.zip
```

The trace includes:
- Screenshots at each step
- Network requests
- Console logs
- DOM snapshots

## 🐳 Docker Architecture

The application uses two services:

1. **backend** - Django REST API (port 8000)
2. **frontend** - Angular SPA (port 4200)

Tests run on the host machine and access the application through `localhost`.

## 🧪 Test Structure

```
e2e/
├── tests/
│   ├── auth.spec.ts              # User registration and login
│   ├── article.spec.ts           # Article CRUD and tag filtering
│   ├── follow-feed.spec.ts       # Follow and personalized feed
│   └── authorization.spec.ts     # Profile updates and authorization
├── playwright.config.ts          # Playwright configuration
├── config.yaml                   # Test parameters (URLs, credentials)
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🔧 Troubleshooting

### Application Not Starting

```bash
# Check container status
docker compose ps

# View logs
docker compose logs backend
docker compose logs frontend

# Restart services
docker compose down
docker compose up -d backend frontend
```

### Tests Timing Out

- Ensure backend and frontend are fully started before running tests
- Check that ports 4200 and 8000 are not blocked by firewall
- Increase timeout in `playwright.config.ts` if needed (default: 60s per test)

### Port Already in Use

```bash
# Find process using port 4200 or 8000
lsof -i :4200
lsof -i :8000

# Kill the process or change ports in docker-compose.yml
```

### Docker Compose Build Errors

```bash
# Clean rebuild
docker compose down -v
docker compose build --no-cache
docker compose up -d backend frontend
```

## 🌐 Running on Different Platforms

The test suite runs on any platform with Node.js and Docker:

### macOS
```bash
# Using Homebrew
brew install docker
brew install node
```

### Windows
Install Docker Desktop and Node.js from their official websites.

### Linux (Ubuntu)
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin nodejs npm
```

Then follow the Quick Start instructions above.

## 🎯 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Start application
        run: docker compose up -d backend frontend
      
      - name: Wait for services
        run: sleep 30
      
      - name: Install dependencies
        working-directory: ./e2e
        run: npm install
      
      - name: Install Playwright browsers
        working-directory: ./e2e
        run: npx playwright install --with-deps chromium
      
      - name: Run E2E tests
        working-directory: ./e2e
        run: BASE_URL=http://localhost:4200 npx playwright test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: e2e/playwright-report/
```

## 📝 Writing New Tests

1. Create a new file in `e2e/tests/` following the naming convention: `<feature>.spec.ts`
2. Import required utilities:
   ```typescript
   import { test, expect } from '@playwright/test';
   import * as yaml from 'yaml';
   import * as fs from 'fs';
   ```
3. Load configuration:
   ```typescript
   const cfg = yaml.parse(fs.readFileSync('./config.yaml', 'utf8'));
   const BASE_URL = process.env.BASE_URL || cfg.baseUrl;
   ```
4. Use descriptive test names and organize with `test.describe()` blocks

## 🎯 Design Principles

- **Self-contained tests**: Each test creates its own data and doesn't depend on other tests
- **Unique identifiers**: Timestamps ensure no conflicts between parallel test runs
- **Robust waits**: UI-level waits instead of brittle network/URL waits
- **Parameterized config**: Easy to adapt to different environments
- **No application changes**: Tests work with the application as-is, no code modifications required

## 📦 Dependencies

- `@playwright/test` v1.56.1 - E2E testing framework
- `yaml` v2.7.0 - Configuration file parsing

## 📄 License

This test suite follows the same license as the RealWorld application (MIT).

## 🤝 Contributing

When adding new tests:
1. Ensure they pass reliably
2. Add appropriate waits for stability
3. Use semantic locators (roles, labels) over CSS selectors
4. Update this README with new test descriptions
