// src/app/test-deploy/page.js
"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function TestDeploy() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleDeploy = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoOwner: "puse2504",  // Your GitHub username
          repoName: "test-repo",   // Your repo name
          defaultBranch: "main",
        }),
      });
      
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Test Deployment</h1>
      
      <Button
        onClick={handleDeploy}
        disabled={loading}
        className="px-6 py-3"
      >
        {loading ? "Deploying..." : "Deploy Test Repo"}
      </Button>
      
      {result && (
        <pre className="mt-4 bg-gray-800 p-4 rounded-lg overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
