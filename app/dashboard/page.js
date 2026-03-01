// src/app/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Loading from "@/components/ui/Loading";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeDeployments: 0,
    successfulDeployments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Bulk invite state
  const [showBulkInvite, setShowBulkInvite] = useState(false);
  const [bulkUsername, setBulkUsername] = useState("");
  const [bulkRole, setBulkRole] = useState("viewer");
  const [bulkInviting, setBulkInviting] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  
  useEffect(() => {
    loadDashboard();
  }, []);
  
  async function loadDashboard() {
    try {
      // Check auth
      const userRes = await fetch("/api/auth/me");
      if (!userRes.ok) {
        router.push("/");
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);
      
      // Load projects
      const projectsRes = await fetch("/api/projects");
      const projectsData = await projectsRes.json();
      setProjects(projectsData.projects || []);
      
      // Load stats
      const statsRes = await fetch("/api/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || {
          totalProjects: 0,
          activeDeployments: 0,
          successfulDeployments: 0,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleLogout() {
    await fetch("/api/auth/logout");
    router.push("/");
  }
  
  // ✅ Add delete handler
  const handleProjectDelete = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId));
    loadDashboard(); // Refresh status here 
  };
  
  // Bulk invite handler
  async function handleBulkInvite(e) {
    e.preventDefault();
    
    if (!bulkUsername.trim()) {
      alert("Please enter a username");
      return;
    }
    
    setBulkInviting(true);
    setBulkResult(null);
    
    try {
      const res = await fetch("/api/projects/bulk-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: bulkUsername.trim(),
          role: bulkRole,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to invite user");
      }
      
      setBulkResult(data);
      setBulkUsername("");
      
      // Refresh dashboard after successful invite
      setTimeout(() => {
        loadDashboard();
      }, 1000);
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setBulkInviting(false);
    }
  }
  
  if (loading) {
    return <Loading full message="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="dashboard-hero mb-6">
          <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Workspace Dashboard</h1>
            <div className="dashboard-subtitle">Overview of your projects, deployments, and recent activity</div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="text-sm flex items-center gap-2"
              onClick={() => setShowBulkInvite(!showBulkInvite)}
            >
              <span>👥</span>
              <span>{showBulkInvite ? "Hide" : "Bulk Invite"}</span>
            </Button>
            <Link href="/new-project">
              <Button variant="accent" className="px-4 py-2">+ New Project</Button>
            </Link>
          </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="stat-card">
            <div className="stat-row">
              <div className="stat-icon">📁</div>
              <div>
                <div className="stat-label">Total Projects</div>
                <div className="text-xs text-gray-400">All-time</div>
              </div>
            </div>
            <div className="stat-value">{stats.totalProjects}</div>
            <div className="stat-meta">Active repos, recent activity and more</div>
          </Card>

          <Card className="stat-card">
            <div className="stat-row">
              <div className="stat-icon">⚡️</div>
              <div>
                <div className="stat-label">Active Deployments</div>
                <div className="text-xs text-gray-400">Now</div>
              </div>
            </div>
            <div className="stat-value text-blue-400">{stats.activeDeployments}</div>
            <div className="stat-meta">Number of currently running deployments</div>
          </Card>

          <Card className="stat-card">
            <div className="stat-row">
              <div className="stat-icon">✅</div>
              <div>
                <div className="stat-label">Successful Deploys</div>
                <div className="text-xs text-gray-400">30d</div>
              </div>
            </div>
            <div className="stat-value text-green-400">{stats.successfulDeployments}</div>
            <div className="stat-meta">Completed deployments in the last 30 days</div>
          </Card>
        </div>
        
        {/* Bulk Invite Section */}
        {projects.some(p => p.isOwner) && (
          <div className="mb-8">
            {showBulkInvite && (
              <div className="mt-4 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/50 border border-gray-700/50 rounded-2xl p-8 shadow-xl">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Invite Collaborator to All Projects
                    </h3>
                    <p className="text-sm text-gray-400">
                      Add a team member to all projects you own at once. They'll receive access based on the role you select.
                    </p>
                  </div>
                </div>
                
                <form onSubmit={handleBulkInvite} className="space-y-5">
                  <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/30">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-3">
                      <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      GitHub Username
                    </label>
                    <Input
                      type="text"
                      value={bulkUsername}
                      onChange={(e) => setBulkUsername(e.target.value)}
                      placeholder="Enter GitHub username"
                      disabled={bulkInviting}
                      className="bg-gray-900/50 border-gray-600/50 focus:border-blue-500 text-white placeholder-gray-500"
                    />
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/30">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-3">
                      <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      Access Role
                    </label>
                    <select
                      value={bulkRole}
                      onChange={(e) => setBulkRole(e.target.value)}
                      disabled={bulkInviting}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="viewer">👁️ Viewer - View only access</option>
                      <option value="maintainer">🔧 Maintainer - Can deploy & manage projects</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="submit"
                      variant="default"
                      disabled={bulkInviting || !bulkUsername.trim()}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bulkInviting ? (
                        <span className="flex items-center gap-2 justify-center">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending Invites...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          Invite to All Projects
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
                
                {bulkResult && (
                  <div className="mt-6 space-y-4 animate-fadeIn">
                    <div className="p-5 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-xl backdrop-blur-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-green-300 font-semibold mb-3">
                            {bulkResult.message}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                              <div className="text-gray-400 text-xs mb-1">Total Projects</div>
                              <div className="text-white font-bold text-lg">{bulkResult.results.total}</div>
                            </div>
                            <div className="bg-green-900/20 rounded-lg p-3 border border-green-600/30">
                              <div className="text-green-400 text-xs mb-1">✅ Succeeded</div>
                              <div className="text-green-300 font-bold text-lg">{bulkResult.results.succeeded}</div>
                            </div>
                            {bulkResult.results.skipped > 0 && (
                              <div className="bg-yellow-900/20 rounded-lg p-3 border border-yellow-600/30">
                                <div className="text-yellow-400 text-xs mb-1">⏭️ Skipped</div>
                                <div className="text-yellow-300 font-bold text-lg">{bulkResult.results.skipped}</div>
                              </div>
                            )}
                            {bulkResult.results.failed > 0 && (
                              <div className="bg-red-900/20 rounded-lg p-3 border border-red-600/30">
                                <div className="text-red-400 text-xs mb-1">❌ Failed</div>
                                <div className="text-red-300 font-bold text-lg">{bulkResult.results.failed}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Show successful invites */}
                    {bulkResult.details.succeeded.length > 0 && (
                      <details className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50">
                        <summary className="cursor-pointer text-sm text-green-400 font-medium p-4 hover:bg-gray-800/70 transition-colors flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Successfully Invited ({bulkResult.details.succeeded.length})
                        </summary>
                        <ul className="p-4 pt-2 space-y-2 text-sm text-gray-300">
                          {bulkResult.details.succeeded.map((item) => (
                            <li key={item.projectId} className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-lg">
                              <span className="text-green-400">✓</span>
                              <span className="font-medium">{item.projectName}</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                    
                    {/* Show skipped projects */}
                    {bulkResult.details.skipped.length > 0 && (
                      <details className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50">
                        <summary className="cursor-pointer text-sm text-yellow-400 font-medium p-4 hover:bg-gray-800/70 transition-colors flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Skipped Projects ({bulkResult.details.skipped.length})
                        </summary>
                        <ul className="p-4 pt-2 space-y-2 text-sm text-gray-300">
                          {bulkResult.details.skipped.map((item) => (
                            <li key={item.projectId} className="flex items-start gap-2 p-2 bg-gray-900/50 rounded-lg">
                              <span className="text-yellow-400 mt-0.5">⏭</span>
                              <div className="flex-1">
                                <div className="font-medium">{item.projectName}</div>
                                <div className="text-xs text-gray-500">{item.reason}</div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                    
                    {/* Show failed invites */}
                    {bulkResult.details.failed.length > 0 && (
                      <details open className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                        <summary className="cursor-pointer text-sm text-red-400 font-medium">
                          ❌ Failed ({bulkResult.details.failed.length})
                        </summary>
                        <ul className="mt-2 space-y-2 text-xs text-gray-300 ml-4">
                          {bulkResult.details.failed.map((item) => (
                            <li key={item.projectId}>
                              <div className="font-medium text-white">• {item.projectName}</div>
                              <div className="text-red-400 ml-3">Error: {item.error}</div>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Projects Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <Link href="/new-project">
            <Button className="px-6 py-2">+ New Project</Button>
          </Link>
        </div>
        
        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <div className="text-gray-400 mb-4">No projects yet</div>
            <Link href="/new-project">
              <Button className="px-6 py-3">Deploy Your First Project</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ✅ Pass onDelete handler */}
            {projects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  onDelete={handleProjectDelete}
                />
              ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ✅ Updated ProjectCard with delete functionality
function ProjectCard({ project, onDelete }) {
  const router = useRouter();
  
  const handleCardClick = (e) => {
    // Don't navigate if clicking delete button
    if (e.target.closest('.delete-button')) {
      return;
    }
    router.push(`/projects/${project.id}`);
  };
  
  const handleDelete = async (e) => {
    e.stopPropagation();
    
    if (!confirm(`Delete "${project.name}"?`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete");
      }
      
      onDelete(project.id);
      alert("✅ Project deleted!");
    } catch (err) {
      alert(`❌ Failed to delete: ${err.message}`);
    }
  };
  
  return (
    <div 
      onClick={handleCardClick}
      className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white">
              {project.name}
            </h3>
            {!project.isOwner && (
              <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-xs rounded border border-purple-600/30">
                Shared
              </span>
            )}
          </div>
          <div className="text-sm text-gray-400">
            {project.repoOwner}/{project.repoName}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={project.status === 'success' ? 'success' : 'default'}>
            {project.status || 'active'}
          </Badge>
          {project.isOwner && (
            <Button
              onClick={handleDelete}
              className="delete-button text-sm"
              variant="ghost"
              title="Delete project"
            >
              <span className="text-red-400">🗑️</span>
            </Button>
          )}
        </div>
      </div>
      
      <div className="text-sm text-gray-400 mb-4">
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-400 transition"
          onClick={(e) => e.stopPropagation()}
        >
          {project.cfSubdomain}
        </a>
      </div>
      
      <div className="text-xs text-gray-500">
        Created {new Date(project.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
