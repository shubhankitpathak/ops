// lib/templates/index.js

/**
 * Project templates for quick start
 */

export const TEMPLATES = {
  "static-html": {
    id: "static-html",
    name: "Static HTML Site",
    description: "Simple HTML, CSS, and JavaScript website",
    icon: "🌐",
    files: [
      {
        path: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Static Site</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>Welcome to My Site</h1>
        <p>Built with ops's Deployment Hub</p>
    </header>
    
    <main>
        <section class="hero">
            <h2>Hello World! 🎉</h2>
            <p>This is a simple static website template.</p>
            <button id="clickBtn">Click Me!</button>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2025 My Website</p>
    </footer>
    
    <script src="script.js"></script>
</body>
</html>`
      },
      {
        path: "style.css",
        content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

header {
    background: rgba(255, 255, 255, 0.95);
    padding: 2rem;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

header h1 {
    color: #667eea;
    margin-bottom: 0.5rem;
}

main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.hero {
    background: white;
    padding: 3rem;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    text-align: center;
    max-width: 600px;
}

.hero h2 {
    color: #667eea;
    margin-bottom: 1rem;
    font-size: 2.5rem;
}

button {
    background: #667eea;
    color: white;
    border: none;
    padding: 1rem 2rem;
    font-size: 1rem;
    border-radius: 50px;
    cursor: pointer;
    margin-top: 1.5rem;
    transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

button:active {
    transform: translateY(0);
}

footer {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    text-align: center;
    padding: 1rem;
}
`
      },
      {
        path: "script.js",
        content: `// Simple interactivity
const btn = document.getElementById('clickBtn');
let clickCount = 0;

btn.addEventListener('click', () => {
    clickCount++;
    btn.textContent = \`Clicked \${clickCount} time\${clickCount !== 1 ? 's' : ''}!\`;
    btn.style.transform = 'scale(1.1)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 200);
});

console.log('🎉 Website loaded successfully!');
`
      }
    ]
  },
  
  "react-vite": {
    id: "react-vite",
    name: "React + Vite",
    description: "Modern React app with Vite",
    icon: "⚛️",
    files: [
      {
        path: "package.json",
        content: JSON.stringify({
          name: "react-vite-app",
          private: true,
          version: "0.0.0",
          type: "module",
          scripts: {
            dev: "vite",
            build: "vite build",
            preview: "vite preview"
          },
          dependencies: {
            react: "^18.3.1",
            "react-dom": "^18.3.1"
          },
          devDependencies: {
            "@vitejs/plugin-react": "^4.3.4",
            vite: "^6.0.7"
          }
        }, null, 2)
      },
      {
        path: "index.html",
        content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React + Vite App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
      },
      {
        path: "src/main.jsx",
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
      },
      {
        path: "src/App.jsx",
        content: `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to React + Vite! ⚛️</h1>
        <p>Built with ops's Deployment Hub</p>
      </header>
      
      <main>
        <div className="card">
          <h2>Counter Demo</h2>
          <button onClick={() => setCount((count) => count + 1)}>
            Count is {count}
          </button>
        </div>
        
        <p className="read-the-docs">
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </main>
    </div>
  )
}

export default App`
      },
      {
        path: "src/App.css",
        content: `.App {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.App-header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
}

.App-header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.card {
  padding: 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  text-align: center;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #667eea;
  color: white;
  cursor: pointer;
  transition: all 0.25s;
  margin-top: 1rem;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.read-the-docs {
  color: rgba(255, 255, 255, 0.8);
  margin-top: 2rem;
}
`
      },
      {
        path: "src/index.css",
        content: `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#root {
  width: 100%;
}

code {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}
`
      },
      {
        path: "vite.config.js",
        content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`
      }
    ]
  },
  
  "nextjs": {
    id: "nextjs",
    name: "Next.js App",
    description: "Next.js with App Router",
    icon: "▲",
    files: [
      {
        path: "package.json",
        content: JSON.stringify({
          name: "nextjs-app",
          version: "0.1.0",
          private: true,
          scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start"
          },
          dependencies: {
            next: "15.1.5",
            react: "^19.0.0",
            "react-dom": "^19.0.0"
          }
        }, null, 2)
      },
      {
        path: "app/page.js",
        content: `export default function Home() {
  return (
    <main className="container">
      <header>
        <h1>Welcome to Next.js! ▲</h1>
        <p>Built with ops's Deployment Hub</p>
      </header>
      
      <section className="hero">
        <h2>Get Started</h2>
        <p>Edit <code>app/page.js</code> to customize this page.</p>
        <div className="links">
          <a href="https://nextjs.org/docs">Documentation →</a>
          <a href="https://nextjs.org/learn">Learn Next.js →</a>
        </div>
      </section>
    </main>
  )
}
`
      },
      {
        path: "app/layout.js",
        content: `import './globals.css'

export const metadata = {
  title: 'Next.js App',
  description: 'Created with ops Deployment Hub',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`
      },
      {
        path: "app/globals.css",
        content: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

header {
  text-align: center;
  margin-bottom: 3rem;
}

header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.hero {
  background: white;
  color: #333;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  text-align: center;
  max-width: 600px;
}

.hero h2 {
  color: #667eea;
  margin-bottom: 1rem;
}

code {
  background: #f4f4f4;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.links {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
}

.links a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.links a:hover {
  color: #764ba2;
}
`
      },
      {
        path: "next.config.js",
        content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static export for Cloudflare Pages
}

module.exports = nextConfig
`
      }
    ]
  },
  
  // ============================================
  // BACKEND TEMPLATES
  // ============================================
  
  "express": {
    id: "express",
    name: "Express.js",
    description: "Node.js REST API server with Express",
    icon: "🚀",
    type: "backend",
    files: [
      {
        path: "package.json",
        content: `{
  "name": "express-api",
  "version": "1.0.0",
  "description": "Express.js REST API",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "engines": {
    "node": ">=18"
  }
}
`
      },
      {
        path: "index.js",
        content: `const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Express API! 🚀',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({
    users: '/api/users',
    posts: '/api/posts'
  });
});

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]);
});

app.get('/api/posts', (req, res) => {
  res.json([
    { id: 1, title: 'Hello World', content: 'This is my first post!' },
    { id: 2, title: 'Getting Started', content: 'Learn how to build APIs.' }
  ]);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});
`
      },
      {
        path: "README.md",
        content: `# Express.js API

A simple REST API built with Express.js.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Endpoints

- \`GET /\` - API info
- \`GET /health\` - Health check
- \`GET /api/users\` - List users
- \`GET /api/posts\` - List posts

## Deployment

This project is configured for Railway/Render deployment.
`
      },
      {
        path: ".gitignore",
        content: `node_modules/
.env
.DS_Store
`
      }
    ]
  },
  
  "fastapi": {
    id: "fastapi",
    name: "FastAPI",
    description: "Python async web framework",
    icon: "⚡",
    type: "backend",
    files: [
      {
        path: "requirements.txt",
        content: `fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.2
`
      },
      {
        path: "main.py",
        content: `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import datetime

app = FastAPI(
    title="FastAPI Backend",
    description="A simple REST API built with FastAPI",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class User(BaseModel):
    id: int
    name: str
    email: str

class Post(BaseModel):
    id: int
    title: str
    content: str

# Sample data
users = [
    User(id=1, name="John Doe", email="john@example.com"),
    User(id=2, name="Jane Smith", email="jane@example.com"),
]

posts = [
    Post(id=1, title="Hello World", content="This is my first post!"),
    Post(id=2, title="Getting Started", content="Learn how to build APIs."),
]

@app.get("/")
async def root():
    return {
        "message": "Welcome to FastAPI! ⚡",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.get("/api/users", response_model=List[User])
async def get_users():
    return users

@app.get("/api/posts", response_model=List[Post])
async def get_posts():
    return posts

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`
      },
      {
        path: "README.md",
        content: `# FastAPI Backend

A simple REST API built with FastAPI.

## Getting Started

\`\`\`bash
pip install -r requirements.txt
uvicorn main:app --reload
\`\`\`

## Endpoints

- \`GET /\` - API info
- \`GET /docs\` - Swagger documentation
- \`GET /health\` - Health check
- \`GET /api/users\` - List users
- \`GET /api/posts\` - List posts

## Deployment

This project is configured for Railway/Render deployment.
`
      },
      {
        path: ".gitignore",
        content: `__pycache__/
*.py[cod]
*$py.class
.env
.venv/
venv/
`
      }
    ]
  },
  
  "hono": {
    id: "hono",
    name: "Hono",
    description: "Lightweight edge-first framework",
    icon: "🔥",
    type: "backend",
    files: [
      {
        path: "package.json",
        content: `{
  "name": "hono-api",
  "version": "1.0.0",
  "description": "Hono REST API",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "hono": "^3.11.7",
    "@hono/node-server": "^1.3.3"
  },
  "engines": {
    "node": ">=18"
  }
}
`
      },
      {
        path: "index.js",
        content: `import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';

const app = new Hono();

// Middleware
app.use('*', cors());

// Routes
app.get('/', (c) => {
  return c.json({
    message: 'Welcome to Hono API! 🔥',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/users', (c) => {
  return c.json([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]);
});

app.get('/api/posts', (c) => {
  return c.json([
    { id: 1, title: 'Hello World', content: 'This is my first post!' },
    { id: 2, title: 'Getting Started', content: 'Learn how to build APIs.' }
  ]);
});

// Error handling
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Something went wrong!' }, 500);
});

const port = process.env.PORT || 3000;
console.log(\`🔥 Server running on port \${port}\`);

serve({
  fetch: app.fetch,
  port
});
`
      },
      {
        path: "README.md",
        content: `# Hono API

A lightweight REST API built with Hono.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Endpoints

- \`GET /\` - API info
- \`GET /health\` - Health check
- \`GET /api/users\` - List users
- \`GET /api/posts\` - List posts

## Features

- 🔥 Ultra-fast and lightweight
- 🌐 Edge-ready (Cloudflare Workers, Deno, Bun)
- 📦 Zero dependencies core

## Deployment

This project is configured for Railway/Render deployment.
`
      },
      {
        path: ".gitignore",
        content: `node_modules/
.env
.DS_Store
`
      }
    ]
  }
};

/**
 * Get template by ID
 */
export function getTemplate(templateId) {
  return TEMPLATES[templateId] || null;
}

/**
 * Get all available templates
 */
export function getAllTemplates() {
  return Object.values(TEMPLATES);
}
