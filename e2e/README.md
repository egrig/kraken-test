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

## 📖 Quick Navigation

**Choose your path:**

1. **Already have Docker & Node.js installed?** → Go to [Quick Start](#-quick-start)
2. **Fresh Ubuntu/Linux machine?** → Start with [Fresh Ubuntu/Debian Linux Machine](#fresh-ubuntudebian-linux-machine)
3. **macOS user?** → See [macOS Setup](#macos)
4. **Windows user?** → See [Windows Setup](#windows)
5. **Want to test in a container (Docker-in-Docker)?** → See [Testing in Linux Containers](#-testing-in-linux-containers-docker-in-docker)

## 🛠 Prerequisites

You need the following installed on your system:
- **Docker Desktop** (macOS/Windows) or **Docker Engine** (Linux)
- **Docker Compose** v2.0+
- **Node.js** v18+
- **Git**

> **📍 Don't have these installed?** Jump to [Platform-Specific Setup](#-platform-specific-setup) for installation instructions, then come back here.

## 🚀 Quick Start

> **Note:** This guide assumes you already have Docker, Node.js, and Git installed. If not, see [Platform-Specific Setup](#-platform-specific-setup) first.

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

### 3. Install Test Dependencies

```bash
cd e2e

# Install dependencies (first time only)
npm install

# Install Playwright browsers (REQUIRED on fresh Linux systems)
npx playwright install --with-deps chromium
```

> **Note:** The `--with-deps` flag is **required** on fresh Linux installations. It installs all system dependencies (fonts, libraries, codecs) needed for browser automation.

### 4. Run Tests

```bash
# Run all tests
npm test

# Or with explicit BASE_URL
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

## 🌐 Platform-Specific Setup

Choose your platform and follow the installation instructions, then return to the [Quick Start](#-quick-start) section.

### Fresh Ubuntu/Debian Linux Machine

If you're on a fresh Ubuntu or Debian system, install all prerequisites:

```bash
# 1. Update package list
sudo apt-get update

# 2. Install Git and curl
sudo apt-get install -y git curl

# 3. Install Docker and Docker Compose
sudo apt-get install -y ca-certificates gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 4. Start Docker service
sudo service docker start

# 5. Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt-get install -y nodejs

# 6. Verify installations
git --version
docker --version
docker compose version
node --version
npm --version
```

✅ **All prerequisites installed!** Now go to [Quick Start](#-quick-start) to clone the repo and run tests.

---

### macOS

```bash
# Using Homebrew
brew install docker
brew install node
brew install git  # Usually pre-installed
```

Then go to [Quick Start](#-quick-start).

---

### Windows

Install these from official websites:
1. **Docker Desktop**: https://www.docker.com/products/docker-desktop
2. **Node.js v18+**: https://nodejs.org/
3. **Git**: https://git-scm.com/download/win

Then go to [Quick Start](#-quick-start).

## 🐧 Testing in Linux Containers (Docker-in-Docker)

> **⚠️ Special Scenario:** This section is for testing the setup inside a Docker container (Docker-in-Docker). If you're on an actual Ubuntu/Linux machine, use [Fresh Ubuntu/Debian Linux Machine](#fresh-ubuntudebian-linux-machine) instead.

**Use case:** Validate the entire setup process in an isolated container environment (useful for Mac/Windows users wanting to test on Linux, or for CI/CD validation).

### Prerequisites
- Docker must run in **privileged mode** for Docker-in-Docker to work
- The Docker daemon must be started manually inside the container

### Complete Setup from Scratch

```bash
# 1. On your host machine: Create Ubuntu container in privileged mode
docker run -it --privileged --name ubuntu-test -p 4200:4200 -p 8000:8000 ubuntu:22.04 bash

# 2. Inside the container: Install prerequisites
apt-get update
apt-get install -y git curl ca-certificates gnupg lsb-release

# 3. Install Docker
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 4. Start Docker daemon (ignore ulimit warnings)
dockerd > /var/log/docker.log 2>&1 &

# 5. Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 6. Clone and setup the project
git clone https://github.com/egrig/kraken-test.git
cd kraken-test

# 7. Start application services
docker compose up -d backend frontend

# 8. Verify services are running
curl http://localhost:8000/api/
curl -I http://localhost:4200

# 9. Install test dependencies
cd e2e
npm install
npx playwright install --with-deps chromium

# 10. Run tests
npm test
```

### Architecture
```
Host Machine
└── Ubuntu Container (privileged mode)
    ├── Docker Daemon
    │   ├── Backend Container (Django on :8000)
    │   └── Frontend Container (Angular on :4200)
    └── Test Environment (Ubuntu host)
        ├── Node.js/npm
        └── Playwright tests → http://localhost:4200
```

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
