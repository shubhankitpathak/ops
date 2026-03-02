# ops — Deploy Your Projects in Seconds

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" />
  <img src="https://img.shields.io/badge/D1_SQLite-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" />
</p>

**ops** is a self-hosted deployment platform that connects your GitHub repositories to Cloudflare Pages — automatically. Push your code, and ops handles secrets injection, GitHub Actions workflows, Cloudflare project creation, and deployment tracking, all in one flow.

---

## ✨ Features

| Feature | Description |
|---|---|
| **One-click deploys** | Select a repo, configure, deploy. ops provisions everything automatically. |
| **GitHub Actions integration** | Commits a workflow file to your repo and sets all required secrets for you. |
| **Cloudflare Pages hosting** | Every project gets a `*.pages.dev` subdomain with global CDN and free SSL. |
| **Deployment tracking** | Real-time status, live build logs with step-by-step progress, and history. |
| **AI failure analysis** | Failed deploy? Click "Analyze with AI" for root cause analysis and fix suggestions. |
| **Rollback** | Promote any previous successful deployment back to production in one click. |
| **Analytics dashboard** | Per-project traffic, bandwidth, response times, and status code breakdowns. |
| **Team management** | Invite collaborators with `viewer` or `maintainer` roles per project, or bulk-invite across all projects. |
| **Smart caching** | D1-backed cache layer for GitHub API responses with configurable TTLs. |
| **Encrypted token storage** | GitHub OAuth tokens stored encrypted (AES-GCM) at rest. |

---

## 🏗️ Architecture

```
Browser ──→ Next.js on Cloudflare Pages (App Router)
                │
                ├── /api/auth/*          GitHub OAuth (login, callback, logout)
                ├── /api/projects/*      Project CRUD, deployments, rollback, analytics
                ├── /api/repos/*         GitHub repo listing & type detection
                └── /api/stats/*         Dashboard stats
                         │
                  Cloudflare D1 (SQLite)
                  ┌──────────────────────────┐
                  │ users                    │
                  │ sessions                 │
                  │ projects                 │
                  │ deployments              │
                  │ project_members          │
                  │ cache                    │
                  └──────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
        GitHub API            Cloudflare API
        (repos, secrets,      (Pages projects,
         workflows, logs)      Analytics, env vars)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A [Cloudflare account](https://dash.cloudflare.com) with Pages enabled
- A [GitHub OAuth App](https://github.com/settings/developers)
- Wrangler CLI: `npm install -g wrangler`

### 1. Clone & Install

```bash
git clone https://github.com/your-username/ops.git
cd ops
npm install
```

### 2. Create a GitHub OAuth App

1. Go to **GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App**
2. Set **Homepage URL** to `http://localhost:3000`
3. Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback`
4. Copy the **Client ID** and generate a **Client Secret**

### 3. Create a Cloudflare D1 Database

```bash
wrangler d1 create ops-db
```

Copy the `database_id` from the output into `wrangler.jsonc`.

### 4. Configure Environment Variables

Create a `.dev.vars` file in the project root:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Cloudflare
CF_ACCOUNT_ID=your_cloudflare_account_id
CF_API_TOKEN=your_cloudflare_api_token

# Encryption (generate a random 32+ char string)
ENCRYPTION_SECRET=your_random_secret_at_least_32_characters

# AI Analysis (optional)
OPENROUTER_API_KEY=your_openrouter_api_key

# Environment
ENVIRONMENT=development
```

> **CF_API_TOKEN** needs these permissions:
> - `Account → Cloudflare Pages → Edit`
> - `Account → Analytics → Read` (for analytics dashboard)
> - `User → API Tokens → Read`

### 5. Run Database Migrations

```bash
wrangler d1 migrations apply ops-db --local
```

### 6. Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with GitHub.

---

## 📁 Project Structure

```
ops/
├── app/
│   ├── api/
│   │   ├── auth/           # OAuth login, callback, logout, /me
│   │   ├── projects/       # Project management, deployments, members, rollback, analytics
│   │   ├── repos/          # GitHub repo listing & framework detection
│   │   └── stats/          # Dashboard statistics
│   ├── dashboard/          # Main dashboard page
│   ├── new-project/        # Repo selection & configuration flow
│   └── projects/[id]/      # Project detail, analytics, team management
├── components/
│   ├── ui/                 # Navbar, Button, Card, Badge, Input, Loading
│   ├── LogViewer.js        # Live build log viewer with step progress
│   └── AIAnalysis.js       # AI-powered failure analysis component
├── hooks/
│   └── useDeploymentPolling.js  # Smart polling hook (10–15s based on status)
├── lib/
│   ├── ai/                 # OpenRouter AI integration
│   ├── auth/               # Session management, GitHub OAuth helpers
│   ├── cache/              # D1-backed caching layer (repos, deployments)
│   ├── cloudflare/         # Pages API, analytics, env vars, client
│   ├── crypto/             # AES-GCM token encryption/decryption
│   ├── db/                 # Drizzle ORM schema, migrations, helpers
│   └── github/             # GitHub REST & GraphQL API clients
├── drizzle/
│   └── migrations/         # SQL migration files
├── wrangler.jsonc           # Cloudflare Workers/Pages config
└── drizzle.config.js        # Drizzle ORM config
```

---

## 🔄 How Deployment Works

When you deploy a project, ops executes these steps automatically:

1. **Create Cloudflare Pages project** — provisions a `*.pages.dev` subdomain
2. **Check for existing workflow** — avoids overwriting custom CI configurations
3. **Inject `ops_CF_TOKEN` secret** — into your GitHub repo
4. **Inject `ops_ACCOUNT_ID` secret** — into your GitHub repo
5. **Set custom env vars** — both as GitHub Secrets and Cloudflare Pages env vars
6. **Set `ops_PROJECT_NAME` variable** — so the workflow knows which Pages project to deploy to
7. **Commit the GitHub Actions workflow** — a `.github/workflows/deploy.yml` file that builds and deploys on every push
8. **Save project to database** — tracks the project and its metadata
9. **Track initial deployment** — records the first deployment with commit details

After setup, every `git push` to your production branch automatically deploys to Cloudflare Pages.

---

## 🗄️ Database Schema

| Table | Purpose |
|---|---|
| `users` | GitHub OAuth users with encrypted access tokens |
| `sessions` | User sessions with 7-day expiry |
| `projects` | Deployed projects linking GitHub repos to Cloudflare Pages |
| `deployments` | Deployment history synced from GitHub Actions runs |
| `project_members` | Team access with `viewer` / `maintainer` roles |
| `cache` | Generic key-value cache with TTL for API responses |

---

## 🔐 Security

- **Encrypted tokens** — GitHub OAuth tokens are encrypted with AES-GCM before being stored in D1. The `ENCRYPTION_SECRET` never leaves your environment.
- **HttpOnly cookies** — Sessions use `HttpOnly; SameSite=lax` cookies to prevent XSS and CSRF attacks.
- **Minimal OAuth scope** — ops only requests `public_repo` and `workflow` scopes from GitHub.
- **Permission checks** — Every API endpoint verifies the authenticated user owns or is a member of the requested project.

---

## 🤖 AI Failure Analysis

When a deployment fails, ops can analyze the build logs using OpenRouter and suggest fixes. To enable this:

1. Get a free API key at [openrouter.ai](https://openrouter.ai)
2. Add `OPENROUTER_API_KEY=sk-or-...` to your `.dev.vars`

The analysis identifies the failure category (dependency, build, configuration, runtime, etc.), pinpoints the root cause, and suggests concrete fix steps.

---

## 📊 Analytics

The analytics dashboard displays per-project metrics including total requests, bandwidth, unique visitors, response time percentiles (p50, p95, p99), and HTTP status code distributions. When the Cloudflare Analytics API is unavailable (e.g. during local development), realistic data is generated based on your project's deployment history so the UI always renders meaningfully.

---

## 👥 Team Collaboration

### Per-project roles

| Role | Permissions |
|---|---|
| `owner` | Full control, can delete project, manage all members |
| `maintainer` | Can view deployments, trigger rollbacks, invite viewers |
| `viewer` | Read-only access to project details and deployment history |

### Bulk invite

From the dashboard, owners can invite a collaborator to **all owned projects** at once using the "Bulk Invite" panel — useful for onboarding new teammates quickly.

---

## 🛠️ Deployment to Production

```bash
# Build the Next.js app for Cloudflare
npm run build

# Deploy to Cloudflare Pages via Wrangler
wrangler pages deploy .worker-next/assets
```

Run migrations against your production D1 database:

```bash
wrangler d1 migrations apply ops-db --remote
```

Set production secrets via the Cloudflare dashboard or Wrangler:

```bash
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put ENCRYPTION_SECRET
# ... etc
```

---

## 🧪 Testing Endpoints

ops includes several test/debug routes for local development:

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Database connectivity check |
| `GET /api/test-crypto` | Verify AES-GCM encryption |
| `GET /api/test-session?action=check` | Inspect current session |
| `GET /api/test-github?action=repos` | Verify GitHub API access |
| `GET /api/test-cloudflare/verify` | Verify Cloudflare API token |
| `GET /api/test-analytics` | Test Cloudflare Analytics API |
| `GET /api/test-cache?action=test` | Verify D1 cache layer |
| `GET /api/debug/users` | List all users (dev only) |

---

## ⚙️ Configuration Reference

### `wrangler.jsonc`

```jsonc
{
  "name": "ops",
  "compatibility_date": "2024-12-01",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [{
    "binding": "DB",
    "database_name": "ops-db",
    "database_id": "<your-database-id>",
    "migrations_dir": "drizzle/migrations"
  }],
  "vars": { "ENVIRONMENT": "production" }
}
```

### Cache TTLs

| Data | TTL |
|---|---|
| GitHub repos list | 5 minutes |
| Deployment status | 30 seconds |
| GitHub rate limit | 1 minute |
| Repo details | 10 minutes |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with Next.js · Deployed on Cloudflare Pages · Powered by GitHub Actions
</p>
