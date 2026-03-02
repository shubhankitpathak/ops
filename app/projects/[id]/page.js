// src/app/projects/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDeploymentPolling } from "@/hooks/useDeploymentPolling";
import LogViewer from "@/components/LogViewer";
import AIAnalysis from "@/components/AIAnalysis";
import Loading from '@/components/ui/Loading';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false); // ✅ Add this
  
  const {
    deployments,
    loading: deploymentsLoading,
    error: deploymentsError,
    fromCache,
    refresh,
  } = useDeploymentPolling(params.id);
  
  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  async function loadProject() {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Project not found");
          return;
        }
        throw new Error("Failed to load project");
      }
      
      const data = await res.json();
      setProject(data.project);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  
  // ✅ Add delete handler
  async function handleDeleteProject() {
    if (!confirm(`⚠️ Delete project "${project?.name}"?\n\nThis will remove the project from ops.\nGitHub repo and Cloudflare Pages will remain.`)) {
      return;
    }
    
    setDeleting(true);
    
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete project");
      }
      
      alert("✅ Project deleted successfully!");
      router.push("/dashboard");
    } catch (err) {
      alert(`❌ Failed to delete: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  }
  
  if (loading) {
    return <Loading full message="Loading project..." />;
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  const latestDeployment = deployments[0];
  const liveDeployment = deployments.find(d => d.isLive) || latestDeployment;
  
  return (
    <div className="min-h-screen bg-gray-950">

      {/* Hero */}
      <header className="bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/60 border-b border-gray-800/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-gray-400 hover:text-white">
                  ← Back
                </Button>
              </Link>
              
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">ED</span>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-white leading-tight">{project.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <a href={project.url || `https://${project.cfSubdomain}`} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-200 hover:underline flex items-center gap-2">
                    {project.cfSubdomain}
                    <span className="external-arrow">↗</span>
                  </a>
                  <span className="text-sm muted">{project.repoOwner}/{project.repoName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 mr-2">
                <div className="text-sm muted">Last deploy</div>
                <div className="text-sm text-white">{liveDeployment ? formatTimestamp(liveDeployment.createdAt) : '—'}</div>
                {liveDeployment && (
                  <div className="px-2 py-0.5 rounded-md text-xs font-medium bg-green-800/30 text-green-300 border border-green-700/20">LIVE</div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/projects/${project.id}/analytics`}>
                  <Button variant="default">📊 Analytics</Button>
                </Link>
                <Link href={`/projects/${project.id}/team`}>
                  <Button variant="subtle">👥 Team</Button>
                </Link>
                <Button variant="ghost" className="text-red-400" onClick={handleDeleteProject} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
        
        {/* Latest Deployment */}
        {latestDeployment && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Latest Deployment</h2>
              {fromCache && (
                <button
                  onClick={refresh}
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  🔄 Refresh
                </button>
              )}
            </div>
            
            <DeploymentCard 
              deployment={latestDeployment} 
              isLatest 
              projectId={project.id}
            />
          </div>
        )}
        
        {/* Deployment History */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              Recent Deployments ({deployments.length})
            </h2>
          </div>
          
          {deploymentsLoading && deployments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Loading compact message="Loading deployments..." />
            </div>
          ) : deploymentsError ? (
            <div className="text-center py-12 text-red-500">
              {deploymentsError}
            </div>
          ) : deployments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No deployments yet
            </div>
          ) : (
            <div className="space-y-3">
              {deployments.map((deployment) => (
                <DeploymentCard
                  key={deployment.id}
                  deployment={deployment}
                  isLive={deployment.isLive}
                  projectId={project.id}
                />
              ))}
            </div>
          )}
        </div>

          {/* end left column */}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <Card>
              <div className="mb-3">
                <div className="text-sm text-gray-400">Repository</div>
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition font-mono text-sm">
                  {project.repoOwner}/{project.repoName}
                </a>
              </div>

              <div className="mb-3">
                <div className="text-sm text-gray-400">Branch</div>
                <div className="text-white text-sm">{project.productionBranch}</div>
              </div>

              <div className="flex items-center gap-2">
                <a href={project.workflowUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300">View on GitHub →</a>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm text-gray-400">Deployments</div>
                  <div className="text-lg font-semibold text-white">{deployments.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Last</div>
                  <div className="text-sm text-white">{deployments[0] ? formatTimestamp(deployments[0].createdAt) : '—'}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/projects/${project.id}/analytics`}>
                  <Button variant="subtle" className="px-3 py-1">View Analytics</Button>
                </Link>
                <Link href={`/projects/${project.id}/team`}>
                  <Button variant="subtle" className="px-3 py-1">Manage Team</Button>
                </Link>
              </div>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

function DeploymentCard({ deployment, isLive, projectId }) {
  const [rolling, setRolling] = useState(false);
  
  async function handleRollback() {
    if (!confirm(`🔄 Rollback to this deployment?\n\n"${deployment.commit.message.split("\n")[0]}"\n\nThis will make it your live production deployment.`)) {
      return;
    }
    
    setRolling(true);
    
    try {
      const res = await fetch(`/api/projects/${projectId}/deployments/${deployment.id}/rollback`, {
        method: "POST",
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to rollback");
      }
      
      alert("✅ Rollback successful! Page will refresh...");
      window.location.reload();
    } catch (err) {
      alert(`❌ Rollback failed: ${err.message}`);
    } finally {
      setRolling(false);
    }
  }
  
  const statusConfig = {
    queued: {
      color: "yellow",
      icon: "⏳",
      label: "Queued",
      bg: "bg-yellow-500/10",
      text: "text-yellow-500",
      border: "border-yellow-500/20",
    },
    in_progress: {
      color: "blue",
      icon: "🔄",
      label: "Building",
      bg: "bg-blue-500/10",
      text: "text-blue-500",
      border: "border-blue-500/20",
    },
    completed: {
      success: {
        color: "green",
        icon: "✅",
        label: "Success",
        bg: "bg-green-500/10",
        text: "text-green-500",
        border: "border-green-500/20",
      },
      failure: {
        color: "red",
        icon: "❌",
        label: "Failed",
        bg: "bg-red-500/10",
        text: "text-red-500",
        border: "border-red-500/20",
      },
      cancelled: {
        color: "gray",
        icon: "🚫",
        label: "Cancelled",
        bg: "bg-gray-500/10",
        text: "text-gray-500",
        border: "border-gray-500/20",
      },
    },
  };
  
  const getStatusConfig = () => {
    if (deployment.status === "completed") {
      return (
        statusConfig.completed[deployment.conclusion] ||
        statusConfig.completed.success
      );
    }
    return statusConfig[deployment.status] || statusConfig.queued;
  };
  
  const config = getStatusConfig();
  
  return (
    <div
      className={`border ${config.border} ${config.bg} rounded-lg p-4 ${
        isLive ? "ring-2 ring-blue-500/20" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${config.border} ${config.bg} ${config.text}`}
          >
            {config.icon} {config.label}
          </span>
          {isLive && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
              🟢 LIVE
            </span>
          )}
          <span className="text-sm text-gray-400">
            {formatTimestamp(deployment.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={deployment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-blue-400 transition"
          >
            View →
          </a>
          {!isLive && deployment.status === "completed" && deployment.conclusion === "success" && (
            <button
              onClick={handleRollback}
              disabled={rolling}
              className="px-3 py-1 text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rolling ? "Rolling back..." : "🔄 Rollback"}
            </button>
          )}
        </div>
      </div>
      
      <div className="mb-2">
        <div className="text-white font-medium mb-1">
          {deployment.commit.message.split("\n")[0]}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>by {deployment.commit.author}</span>
          <span>•</span>
          <a
            href={deployment.commit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono hover:text-blue-400 transition"
          >
            {deployment.commit.sha}
          </a>
        </div>
      </div>
      
      {deployment.status === "in_progress" && (
        <div className="mt-3">
          <div className="flex items-center gap-2 text-sm text-blue-400 mb-2">
            <div className="animate-spin">🔄</div>
            <span>Building...</span>
          </div>
        </div>
      )}

      {/* Logs */}
      <LogViewer 
        projectId={projectId} 
        runId={deployment.id} 
        status={deployment.status}
      />

      {/* AI Analysis (only for failed deployments) */}
      {deployment.status === "completed" && deployment.conclusion === "failure" && (
        <AIAnalysis
          projectId={projectId}
          runId={deployment.id}
          deploymentStatus={deployment.status}
        />
      )}
    </div>
  );
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
}
