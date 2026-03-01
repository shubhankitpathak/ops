// src/app/new-project/configure/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ConfigureProject() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const owner = searchParams.get("owner");
  const name = searchParams.get("name");
  const projectType = searchParams.get("projectType") || "frontend";
  const framework = searchParams.get("framework") || "";
  
  const [loading, setLoading] = useState(false);
  const [branch, setBranch] = useState("main");
  const [customSubdomain, setCustomSubdomain] = useState("");
  const [envVars, setEnvVars] = useState([]);
  
  if (!owner || !name) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Invalid repository</div>
      </div>
    );
  }
  
  async function handleDeploy() {
    setLoading(true);
    
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoOwner: owner,
          repoName: name,
          defaultBranch: branch,
          customSubdomain: customSubdomain || undefined,
          envVars: envVars.filter(v => v.key && v.value),
          projectType,
          framework,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || "Deployment failed");
        return;
      }
      
      // Redirect to project detail page
      router.push(`/projects/${data.project.id}`);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }
  
  function addEnvVar() {
    setEnvVars([...envVars, { key: "", value: "" }]);
  }
  
  function removeEnvVar(index) {
    setEnvVars(envVars.filter((_, i) => i !== index));
  }
  
  function updateEnvVar(index, field, value) {
    const updated = [...envVars];
    updated[index][field] = value;
    setEnvVars(updated);
  }
  
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Configure Deployment</h1>
            <Link
              href="/new-project"
              className="text-gray-400 hover:text-white transition"
            >
              ← Back
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          {/* Repository Info */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Repository
            </label>
            <div className="text-lg text-white font-mono">
              {owner}/{name}
            </div>
          </div>
          
          {/* Project Type Info */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Project Type
            </label>
            <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg ${
              projectType === 'frontend' 
                ? 'bg-blue-500/10 border border-blue-500/30' 
                : 'bg-purple-500/10 border border-purple-500/30'
            }`}>
              <span className="text-2xl">
                {projectType === 'frontend' ? '🌐' : '⚙️'}
              </span>
              <div>
                <span className={`font-semibold ${
                  projectType === 'frontend' ? 'text-blue-400' : 'text-purple-400'
                }`}>
                  {projectType === 'frontend' ? 'Frontend' : 'Backend'}
                </span>
                {framework && (
                  <span className="text-gray-400 ml-2">• {framework}</span>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {projectType === 'frontend' 
                ? 'Will be deployed to Cloudflare Pages' 
                : 'Will be deployed to Railway/Render'}
            </p>
          </div>
          
          {/* Branch Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Production Branch
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="main">main</option>
              <option value="master">master</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Deployments will trigger on pushes to this branch
            </p>
          </div>
          
          {/* Custom Subdomain (Optional) - Only for Frontend */}
          {projectType === 'frontend' && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Custom Subdomain (Optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customSubdomain}
                  onChange={(e) => setCustomSubdomain(e.target.value.toLowerCase())}
                  placeholder="my-custom-name"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <span className="text-gray-400">.pages.dev</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Leave empty for auto-generated subdomain
              </p>
            </div>
          )}
          
          {/* Environment Variables */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Environment Variables (Optional)
            </label>
            <div className="space-y-3">
              {envVars.map((envVar, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={envVar.key}
                    onChange={(e) => updateEnvVar(index, "key", e.target.value)}
                    placeholder="KEY"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <input
                    type="password"
                    value={envVar.value}
                    onChange={(e) => updateEnvVar(index, "value", e.target.value)}
                    placeholder="value"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => removeEnvVar(index)}
                    className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addEnvVar}
              className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition"
            >
              + Add Environment Variable
            </button>
            <p className="text-xs text-gray-500 mt-2">
              These will be securely stored as GitHub Secrets
            </p>
          </div>
          
          {/* Deploy Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleDeploy}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              {loading ? "Deploying..." : "Deploy Now"}
            </button>
            <Link
              href="/new-project"
              className="px-6 py-3 text-gray-400 hover:text-white transition"
            >
              Cancel
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
