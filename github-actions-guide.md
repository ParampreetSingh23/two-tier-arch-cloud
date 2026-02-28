# GitHub Actions & CI/CD — Beginner's Guide for AttendTrack

## What is CI/CD and why does it matter?

Imagine you're working on AttendTrack and you push some code that accidentally breaks the login page. Without CI/CD, you'd only find out when a user reports it — maybe hours later. With CI/CD, you find out **within 2 minutes of pushing**, before anyone is affected.

| Term | What it means | Example for AttendTrack |
|---|---|---|
| **CI** (Continuous Integration) | Automatically test & build your code on every push | Build the React app, validate Prisma schema |
| **CD** (Continuous Delivery) | Automatically package & prepare for deployment | Build Docker images, push to Docker Hub |
| **CD** (Continuous Deployment) | Automatically deploy to production | Push to a cloud server (AWS, DigitalOcean, etc.) |

**The goal:** Every time you push code, machines automatically check that nothing is broken — so you can ship with confidence.

---

## What is GitHub Actions?

GitHub Actions is GitHub's built-in CI/CD system. You write **workflow files** (YAML) inside `.github/workflows/` and GitHub runs them automatically on their servers (called **runners**) — **for free** for public repos, and with 2000 free minutes/month for private repos.

### Key Concepts

```
Workflow       → The entire automated process (defined in a .yml file)
  └── Job      → A group of steps that run on one machine
        └── Step → A single command or action
```

**Actions** are pre-built steps shared by the community. Example:
- `actions/checkout@v4` → downloads your code
- `actions/setup-node@v4` → installs Node.js
- `docker/build-push-action@v5` → builds and pushes a Docker image

---

## Our Workflow: `.github/workflows/ci-cd.yml`

```
Every push / PR to main
        │
        ▼
┌─────────────────────┐
│   Job 1: Build Check │  ← Runs on EVERY push and PR
│                     │
│  1. Checkout code   │
│  2. Install deps    │
│  3. Validate Prisma │
│  4. Build React app │
└────────┬────────────┘
         │ Only if Job 1 passed AND it's a push to main
         ▼
┌──────────────────────────┐
│  Job 2: Docker Push      │  ← Runs only on main branch
│                          │
│  1. Login to Docker Hub  │
│  2. Build server image   │
│  3. Push server image    │
│  4. Build client image   │
│  5. Push client image    │
└──────────────────────────┘
```

---

## Setup Steps

### Step 1: Push your project to GitHub

If you haven't already:
```bash
cd /Users/pampi/Workstation/Docker/AttendTrack
git init
git add .
git commit -m "Initial commit: AttendTrack with Docker"
git remote add origin https://github.com/YOUR_USERNAME/attendtrack.git
git push -u origin main
```

> **Important:** Make sure `.env` files are in your `.gitignore` — never commit secrets to GitHub!

---

### Step 2: Create a Docker Hub account & token

1. Go to [hub.docker.com](https://hub.docker.com) and create a free account
2. Click your profile → **Account Settings** → **Security** → **New Access Token**
3. Name it `github-actions`, select **Read & Write**, click **Generate**
4. Copy the token — you'll only see it once

---

### Step 3: Add secrets to GitHub

GitHub Actions cannot use your local `.env` file. You add secrets securely in GitHub:

1. Open your repo on GitHub
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

| Secret Name | Value |
|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | The token you just created |

Secrets are encrypted and never exposed in logs — even if someone forks your repo, they can't access them.

---

### Step 4: Watch it run

After pushing to `main`:

1. Go to your GitHub repo
2. Click the **Actions** tab
3. You'll see your workflow running in real time

**Green checkmark ✅** = everything passed  
**Red X ❌** = something failed — click to see exactly which step and the error log

---

## What happens on a Pull Request?

When a teammate (or you) opens a PR:
- Job 1 (`build-check`) runs automatically
- GitHub shows the result on the PR page
- You can require it to pass before merging (set in repo Settings → Branch protection rules)

This means **bad code can never be merged to main** without passing the build check.

---

## Gotchas

| Issue | Solution |
|---|---|
| Workflow file not running | Must be in `.github/workflows/` with `.yml` extension |
| `DOCKERHUB_TOKEN` not found | Double-check the secret name matches exactly (case-sensitive) |
| Prisma generate fails in CI | Already handled — no DB needed for `prisma generate` |
| Build takes too long | We use `cache-from: type=gha` to cache Docker layers between runs |

---

## Next Steps (when you're ready)

- **Add automated tests** — write Jest tests, add a `test` step to Job 1
- **Deploy automatically** — SSH into your server and run `docker-compose pull && docker-compose up -d`
- **Deploy to cloud** — integrate with AWS ECS, Google Cloud Run, or DigitalOcean App Platform
- **Branch protection** — require CI to pass before any PR can be merged to main
