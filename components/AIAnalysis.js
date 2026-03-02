// src/components/AIAnalysis.js
"use client";

import { useState } from "react";
import Loading from './ui/Loading';

export default function AIAnalysis({ projectId, runId, deploymentStatus }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Only show for failed deployments
  if (deploymentStatus !== "completed" || !runId) {
    return null;
  }
  
  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(
        `/api/projects/${projectId}/deployments/${runId}/analyze`,
        { method: "POST" }
      );
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }
      
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="mt-4">
      {!analysis && !loading && (
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition disabled:opacity-50"
        >
          <span>🤖</span>
          <span>Analyze with AI</span>
        </button>
      )}
      
      {loading && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <Loading compact message="Analyzing failure..." />
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">❌</span>
            <div>
              <div className="text-red-400 font-medium">Analysis Failed</div>
              <div className="text-red-300/60 text-sm mt-1">{error}</div>
            </div>
          </div>
        </div>
      )}
      
      {analysis && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-purple-500/20 px-4 py-3 border-b border-purple-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <div>
                  <div className="text-purple-300 font-semibold">AI Analysis</div>
                  <div className="text-purple-300/60 text-xs">
                    {getCategoryLabel(analysis.category)} • {analysis.confidence} confidence
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAnalysis(null)}
                className="text-purple-300/60 hover:text-purple-300 transition"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Summary */}
            <div>
              <div className="text-purple-300 font-medium mb-2">📋 Summary</div>
              <div className="text-gray-300 text-sm leading-relaxed">
                {analysis.summary}
              </div>
            </div>
            
            {/* Root Cause */}
            <div>
              <div className="text-purple-300 font-medium mb-2">🎯 Root Cause</div>
              <div className="bg-gray-900 border border-gray-700 rounded p-3">
                <code className="text-red-400 text-xs font-mono">
                  {analysis.rootCause}
                </code>
              </div>
            </div>
            
            {/* Suggested Fixes */}
            <div>
              <div className="text-purple-300 font-medium mb-2">💡 Suggested Fixes</div>
              <div className="space-y-2">
                {analysis.fixes.map((fix, index) => (
                  <div
                    key={index}
                    className="bg-gray-900 border border-gray-700 rounded p-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold shrink-0">
                        {index + 1}.
                      </span>
                      <div className="text-gray-300 text-sm leading-relaxed">
                        {fix}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getCategoryLabel(category) {
  const labels = {
    dependency: "📦 Dependency Issue",
    build: "🔨 Build Error",
    configuration: "⚙️ Configuration",
    deployment: "🚀 Deployment",
    runtime: "⚡ Runtime Error",
    other: "🔍 Other Issue",
  };
  return labels[category] || "🔍 Unknown";
}
