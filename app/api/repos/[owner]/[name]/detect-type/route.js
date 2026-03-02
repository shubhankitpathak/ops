// src/app/api/repos/[owner]/[name]/detect-type/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getUserGitHubToken } from "@/lib/auth/token";
import { githubRequest } from "@/lib/github/client";

/**
 * Detect project type from package.json
 * Frontend: React, Next.js, Vue, Angular, Vite, static HTML/CSS
 * Backend: Express, Fastify, NestJS, Hono, FastAPI, Flask, Django
 */

// Frontend framework indicators
const FRONTEND_DEPENDENCIES = [
  'react', 'react-dom', 'next', 'vue', '@angular/core', 'svelte',
  'solid-js', 'preact', 'gatsby', 'nuxt', '@nuxt/kit',
  'vite', '@vitejs/plugin-react', 'parcel', 'webpack',
  'tailwindcss', 'styled-components', '@emotion/react',
  'create-react-app', 'react-scripts'
];

// Backend framework indicators
const BACKEND_DEPENDENCIES = [
  'express', 'fastify', '@nestjs/core', 'hono', 'koa',
  'fastapi', 'flask', 'django', 'uvicorn', 'gunicorn',
  'prisma', '@prisma/client', 'mongoose', 'typeorm', 'sequelize',
  'pg', 'mysql2', 'better-sqlite3', 'drizzle-orm',
  'nodemon', 'ts-node-dev', 'tsup', 'esbuild'
];

// Full-stack indicators (treat as frontend for deployment)
const FULLSTACK_DEPENDENCIES = [
  'next', '@remix-run/node', '@sveltejs/kit', 'nuxt', 'astro'
];

/**
 * GET /api/repos/[owner]/[name]/detect-type
 * Fetches package.json and detects if it's a frontend or backend project
 */
export async function GET(request, { params }) {
  try {
    const { owner, name } = await params;
    
    const env = await getEnv();
    const db = getDB(env);
    
    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const token = await getUserGitHubToken(db, user.id, env.ENCRYPTION_SECRET);
    
    // Try to fetch package.json from the repository
    let packageJson = null;
    let requirementsTxt = null;
    let detectedFramework = null;
    let projectType = 'unknown';
    let confidence = 'low';
    
    // Try to get package.json (for Node.js projects)
    try {
      const { data } = await githubRequest(
        `/repos/${owner}/${name}/contents/package.json`,
        token
      );
      
      if (data && data.content) {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        packageJson = JSON.parse(content);
      }
    } catch (error) {
      // package.json not found, try other detection methods
      console.log('No package.json found, trying other methods...');
    }
    
    // Try to get requirements.txt (for Python projects)
    if (!packageJson) {
      try {
        const { data } = await githubRequest(
          `/repos/${owner}/${name}/contents/requirements.txt`,
          token
        );
        
        if (data && data.content) {
          requirementsTxt = Buffer.from(data.content, 'base64').toString('utf-8');
        }
      } catch (error) {
        // requirements.txt not found
        console.log('No requirements.txt found');
      }
    }
    
    // Analyze package.json for Node.js projects
    if (packageJson) {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      const depNames = Object.keys(allDeps || {});
      
      // Check for full-stack frameworks first
      const fullstackMatches = depNames.filter(dep => 
        FULLSTACK_DEPENDENCIES.some(fd => dep === fd || dep.startsWith(fd))
      );
      
      if (fullstackMatches.length > 0) {
        projectType = 'frontend';
        detectedFramework = fullstackMatches[0];
        confidence = 'high';
        
        // Map to display name
        if (detectedFramework === 'next') detectedFramework = 'Next.js';
        else if (detectedFramework.includes('remix')) detectedFramework = 'Remix';
        else if (detectedFramework.includes('svelte')) detectedFramework = 'SvelteKit';
        else if (detectedFramework === 'nuxt') detectedFramework = 'Nuxt';
        else if (detectedFramework === 'astro') detectedFramework = 'Astro';
      }
      
      // Check for frontend indicators
      if (projectType === 'unknown') {
        const frontendMatches = depNames.filter(dep => 
          FRONTEND_DEPENDENCIES.some(fd => dep === fd || dep.startsWith(fd))
        );
        
        const backendMatches = depNames.filter(dep => 
          BACKEND_DEPENDENCIES.some(bd => dep === bd || dep.startsWith(bd))
        );
        
        if (frontendMatches.length > backendMatches.length) {
          projectType = 'frontend';
          confidence = frontendMatches.length >= 2 ? 'high' : 'medium';
          
          // Detect specific framework
          if (depNames.includes('react') || depNames.includes('react-dom')) {
            detectedFramework = 'React';
          } else if (depNames.includes('vue')) {
            detectedFramework = 'Vue';
          } else if (depNames.includes('@angular/core')) {
            detectedFramework = 'Angular';
          } else if (depNames.includes('svelte')) {
            detectedFramework = 'Svelte';
          } else if (depNames.includes('vite')) {
            detectedFramework = 'Vite';
          } else {
            detectedFramework = 'JavaScript';
          }
        } else if (backendMatches.length > frontendMatches.length) {
          projectType = 'backend';
          confidence = backendMatches.length >= 2 ? 'high' : 'medium';
          
          // Detect specific framework
          if (depNames.includes('express')) {
            detectedFramework = 'Express';
          } else if (depNames.includes('fastify')) {
            detectedFramework = 'Fastify';
          } else if (depNames.includes('@nestjs/core')) {
            detectedFramework = 'NestJS';
          } else if (depNames.includes('hono')) {
            detectedFramework = 'Hono';
          } else if (depNames.includes('koa')) {
            detectedFramework = 'Koa';
          } else {
            detectedFramework = 'Node.js';
          }
        } else if (frontendMatches.length > 0 && backendMatches.length > 0) {
          // Mixed - default to frontend but note it's mixed
          projectType = 'frontend';
          confidence = 'medium';
          detectedFramework = 'Mixed (Frontend/Backend)';
        }
      }
      
      // Check for static site by looking at scripts
      if (projectType === 'unknown' && packageJson.scripts) {
        const scripts = Object.values(packageJson.scripts).join(' ');
        if (scripts.includes('build') || scripts.includes('vite') || scripts.includes('webpack')) {
          projectType = 'frontend';
          detectedFramework = 'Static Site';
          confidence = 'medium';
        }
      }
    }
    
    // Analyze requirements.txt for Python projects
    if (requirementsTxt && projectType === 'unknown') {
      const deps = requirementsTxt.toLowerCase();
      
      if (deps.includes('fastapi') || deps.includes('flask') || deps.includes('django')) {
        projectType = 'backend';
        confidence = 'high';
        
        if (deps.includes('fastapi')) detectedFramework = 'FastAPI';
        else if (deps.includes('flask')) detectedFramework = 'Flask';
        else if (deps.includes('django')) detectedFramework = 'Django';
      }
    }
    
    // Try to detect from file structure if still unknown
    if (projectType === 'unknown') {
      try {
        const { data: files } = await githubRequest(
          `/repos/${owner}/${name}/contents`,
          token
        );
        
        const fileNames = files.map(f => f.name.toLowerCase());
        
        // Check for common frontend files
        if (fileNames.includes('index.html') || fileNames.includes('public')) {
          projectType = 'frontend';
          detectedFramework = 'Static HTML/CSS';
          confidence = 'medium';
        }
        
        // Check for backend indicators
        if (fileNames.includes('server.js') || fileNames.includes('app.py') || fileNames.includes('main.py')) {
          projectType = 'backend';
          detectedFramework = fileNames.includes('app.py') || fileNames.includes('main.py') ? 'Python' : 'Node.js';
          confidence = 'medium';
        }
      } catch (error) {
        console.log('Could not fetch repo contents');
      }
    }
    
    return Response.json({
      success: true,
      projectType,
      detectedFramework,
      confidence,
      hasPackageJson: !!packageJson,
      hasRequirementsTxt: !!requirementsTxt,
    });
  } catch (error) {
    console.error("Detect type error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
