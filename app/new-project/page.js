// src/app/new-project/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import JSZip from "jszip";
import Loading from "@/components/ui/Loading";

export default function NewProject() {
  const router = useRouter();
  const [mode, setMode] = useState(null); // null, 'existing', 'create'
  
  if (!mode) {
    return <ProjectTypeSelector onSelect={setMode} />;
  }
  
  if (mode === 'create') {
    return <CreateNewProject onBack={() => setMode(null)} />;
  }
  
  return <SelectExistingRepo onBack={() => setMode(null)} />;
}

function ProjectTypeSelector({ onSelect }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <header className="border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">New Project</h1>
            </div>
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Choose How to Start</h2>
          <p className="text-lg text-gray-400">Deploy an existing repository or create a new project from scratch</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deploy Existing Repo */}
          <button
            onClick={() => onSelect('existing')}
            className="group relative bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700/50 rounded-2xl p-10 hover:border-blue-500/50 transition-all duration-300 text-left overflow-hidden hover:shadow-[0_0_40px_rgba(59,130,246,0.1)]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition">
                Deploy Existing Repo
              </h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Connect a repository from your GitHub account and deploy it instantly with automatic CI/CD
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Instant deployment pipeline
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Work with existing code
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Auto-deploy on every push
                </li>
              </ul>
            </div>
          </button>
          
          {/* Create New Project */}
          <button
            onClick={() => onSelect('create')}
            className="group relative bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700/50 rounded-2xl p-10 hover:border-purple-500/50 transition-all duration-300 text-left overflow-hidden hover:shadow-[0_0_40px_rgba(168,85,247,0.1)]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition">
                Create New Project
              </h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Start fresh with professional templates or upload your own files to bootstrap a new repository
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Production-ready templates
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Drag & drop file upload
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  No Git experience needed
                </li>
              </ul>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}

function CreateNewProject({ onBack }) {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: repo details, 2: project type, 3: template/upload, 4: files
  const [loading, setLoading] = useState(false);
  
  // Step 1: Repository details
  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  
  // Step 2: Project type selection
  const [projectType, setProjectType] = useState(null); // 'frontend' or 'backend'
  
  // Step 3: Template or upload mode
  const [mode, setMode] = useState(null); // 'template' or 'upload'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // Step 4: File uploads
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  
  const frontendTemplates = [
    { id: "static-html", name: "Static HTML Site", icon: "🌐", description: "Simple HTML, CSS, JS", type: "frontend" },
    { id: "react-vite", name: "React + Vite", icon: "⚛️", description: "Modern React with Vite", type: "frontend" },
    { id: "nextjs", name: "Next.js App", icon: "▲", description: "Next.js with App Router", type: "frontend" },
  ];
  
  const backendTemplates = [
    { id: "express", name: "Express.js", icon: "🚀", description: "Node.js REST API server", type: "backend" },
    { id: "fastapi", name: "FastAPI", icon: "⚡", description: "Python async web framework", type: "backend" },
    { id: "hono", name: "Hono", icon: "🔥", description: "Lightweight edge-first framework", type: "backend" },
  ];
  
  const templates = projectType === 'backend' ? backendTemplates : frontendTemplates;
  
  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }
  
  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }
  
  function handleFileInput(e) {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }
  
  function handleFolderInput(e) {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }
  
  async function handleZipInput(e) {
    if (e.target.files && e.target.files.length > 0) {
      const zipFile = e.target.files[0];
      try {
        const zip = new JSZip();
        const contents = await zip.loadAsync(zipFile);
        
        const extractedFiles = [];
        for (const [path, file] of Object.entries(contents.files)) {
          if (!file.dir) {
            const content = await file.async('text');
            extractedFiles.push({
              name: path.split('/').pop(),
              path: path,
              content: content,
              size: content.length,
            });
          }
        }
        
        setUploadedFiles(prev => [...prev, ...extractedFiles]);
      } catch (error) {
        console.error('Error extracting zip:', error);
        alert('Failed to extract zip file. Please make sure it\'s a valid zip archive.');
      }
    }
  }
  
  async function handleFiles(files) {
    const fileArray = Array.from(files);
    const filePromises = fileArray.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            name: file.name,
            path: file.webkitRelativePath || file.name,
            content: e.target.result,
            size: file.size,
          });
        };
        reader.readAsText(file);
      });
    });
    
    const readFiles = await Promise.all(filePromises);
    setUploadedFiles(prev => [...prev, ...readFiles]);
  }
  
  function removeFile(index) {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }
  
  async function handleCreateRepo() {
    if (!repoName.trim()) {
      alert("Please enter a repository name");
      return;
    }
    
    if (mode === 'template' && !selectedTemplate) {
      alert("Please select a template");
      return;
    }
    
    if (mode === 'upload' && uploadedFiles.length === 0) {
      alert("Please upload at least one file");
      return;
    }
    
    setLoading(true);
    
    try {
      const body = {
        name: repoName,
        description,
        isPrivate,
      };
      
      if (mode === 'template') {
        body.templateId = selectedTemplate;
      } else if (mode === 'upload') {
        body.files = uploadedFiles.map(f => ({
          path: f.path,
          content: f.content,
        }));
      }
      
      const res = await fetch("/api/repos/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || "Failed to create repository");
        return;
      }
      
      // Redirect to configure page with project type
      const templateInfo = templates.find(t => t.id === selectedTemplate);
      const framework = templateInfo ? templateInfo.name : '';
      router.push(`/new-project/configure?owner=${data.repository.owner}&name=${data.repository.name}&projectType=${projectType}&framework=${encodeURIComponent(framework)}`);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <header className="border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Create New Project</h1>
            </div>
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className={`flex items-center transition-all ${step >= 1 ? 'text-blue-400' : 'text-gray-600'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 1 ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50' : 'bg-gray-800 text-gray-500'}`}>
              {step > 1 ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : '1'}
            </div>
            <span className="ml-3 hidden sm:inline font-medium">Repository</span>
          </div>
          <div className={`h-0.5 w-12 mx-2 transition-all ${step >= 2 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gray-800'}`}></div>
          <div className={`flex items-center transition-all ${step >= 2 ? 'text-cyan-400' : 'text-gray-600'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 2 ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50' : 'bg-gray-800 text-gray-500'}`}>
              {step > 2 ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : '2'}
            </div>
            <span className="ml-3 hidden sm:inline font-medium">Project Type</span>
          </div>
          <div className={`h-0.5 w-12 mx-2 transition-all ${step >= 3 ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-gray-800'}`}></div>
          <div className={`flex items-center transition-all ${step >= 3 ? 'text-purple-400' : 'text-gray-600'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 3 ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50' : 'bg-gray-800 text-gray-500'}`}>
              {step > 3 ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : '3'}
            </div>
            <span className="ml-3 hidden sm:inline font-medium">Mode</span>
          </div>
          <div className={`h-0.5 w-12 mx-2 transition-all ${step >= 4 ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-gray-800'}`}></div>
          <div className={`flex items-center transition-all ${step >= 4 ? 'text-green-400' : 'text-gray-600'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 4 ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50' : 'bg-gray-800 text-gray-500'}`}>
              4
            </div>
            <span className="ml-3 hidden sm:inline font-medium">Content</span>
          </div>
        </div>
        
        {step === 1 && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700/50 rounded-2xl p-10 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Repository Details</h2>
                <p className="text-sm text-gray-400">Set up your repository information</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  Repository Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="my-awesome-project"
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Only lowercase letters, numbers, and hyphens
                </p>
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of your project"
                  rows={3}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition resize-none"
                />
              </div>
              
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="w-5 h-5 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-sm text-gray-300 font-medium">Make this repository private</span>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!repoName.trim()}
                className="group bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-700 disabled:to-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next: Select Project Type
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700/50 rounded-2xl p-10 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Project Type</h2>
                <p className="text-sm text-gray-400">Choose what you're building</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <button
                onClick={() => setProjectType('frontend')}
                className={`group relative p-10 border-2 rounded-2xl transition-all text-left overflow-hidden ${
                  projectType === 'frontend'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-lg shadow-blue-500/20'
                    : 'border-gray-700/50 bg-gray-800/30 hover:border-blue-500/50 hover:bg-gray-800/50'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <h3 className={`text-2xl font-bold mb-3 transition ${
                    projectType === 'frontend' ? 'text-blue-300' : 'text-white group-hover:text-blue-400'
                  }`}>
                    Frontend
                  </h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    User interfaces and client-side applications
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-300">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      React, Next.js, Vue, Angular
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Static HTML/CSS/JavaScript
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Deploy to Cloudflare Pages
                    </li>
                  </ul>
                </div>
              </button>
              
              <button
                onClick={() => setProjectType('backend')}
                className={`group relative p-10 border-2 rounded-2xl transition-all text-left overflow-hidden ${
                  projectType === 'backend'
                    ? 'border-slate-500 bg-gradient-to-br from-slate-500/20 to-slate-600/10 shadow-lg shadow-slate-500/20'
                    : 'border-gray-700/50 bg-gray-800/30 hover:border-slate-500/50 hover:bg-gray-800/50'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                  </div>
                  <h3 className={`text-2xl font-bold mb-3 transition ${
                    projectType === 'backend' ? 'text-slate-300' : 'text-white group-hover:text-slate-400'
                  }`}>
                    Backend
                  </h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    APIs, servers, and backend services
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-300">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Express, FastAPI, NestJS
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      REST APIs, GraphQL
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Deploy to Railway/Render
                    </li>
                  </ul>
                </div>
              </button>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-gray-400 hover:text-white transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!projectType}
                className="group bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-700 disabled:to-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next: Choose Mode
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700/50 rounded-2xl p-10 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Choose Mode</h2>
                <p className="text-sm text-gray-400">How would you like to add files?</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <button
                onClick={() => { setMode('template'); setStep(4); }}
                className="group relative p-10 border-2 border-gray-700/50 rounded-2xl hover:border-blue-500/50 bg-gray-800/30 hover:bg-gray-800/50 transition-all text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition">
                    Use Template
                  </h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    Start with a pre-configured {projectType} template
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-300">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Quick setup
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Best practices
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Working examples
                    </li>
                  </ul>
                </div>
              </button>
              
              <button
                onClick={() => { setMode('upload'); setStep(4); }}
                className="group relative p-10 border-2 border-gray-700/50 rounded-2xl hover:border-slate-500/50 bg-gray-800/30 hover:bg-gray-800/50 transition-all text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-slate-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-slate-400 transition">
                    Upload Files
                  </h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    Upload your own project files
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-300">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Drag & drop
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Multiple files
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Full control
                    </li>
                  </ul>
                </div>
              </button>
            </div>
            
            <div className="flex justify-start">
              <button
                onClick={() => setStep(2)}
                className="text-gray-400 hover:text-white transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            </div>
          </div>
        )}
        
        {step === 4 && mode === 'template' && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700/50 rounded-2xl p-10 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Choose a Template</h2>
                <p className="text-sm text-gray-400">Select a starter template for your {projectType} project</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`group relative p-6 border-2 rounded-xl text-left transition-all overflow-hidden ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-lg shadow-blue-500/20'
                      : 'border-gray-700/50 bg-gray-800/30 hover:border-blue-500/50 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="text-5xl mb-4">{template.icon}</div>
                    <h3 className={`font-bold text-lg mb-2 transition ${
                      selectedTemplate === template.id ? 'text-blue-300' : 'text-white group-hover:text-blue-400'
                    }`}>
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{template.description}</p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="text-gray-400 hover:text-white transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <button
                onClick={handleCreateRepo}
                disabled={loading || !selectedTemplate}
                className="group bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-700 disabled:to-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    Create & Deploy
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {step === 4 && mode === 'upload' && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700/50 rounded-2xl p-10 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Upload Your Files</h2>
                <p className="text-sm text-gray-400">Add files to your project repository</p>
              </div>
            </div>
            
            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all overflow-hidden ${
                dragActive 
                  ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-lg shadow-blue-500/20' 
                  : 'border-gray-600/50 bg-gray-800/20 hover:border-blue-500/50 hover:bg-gray-800/30'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-transform ${
                  dragActive ? 'scale-110 bg-blue-500/30' : 'bg-blue-500/20'
                }`}>
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {dragActive ? 'Drop files here!' : 'Drag & Drop Files or Folders'}
                </h3>
                <p className="text-gray-400 mb-6">
                  or click to browse
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    id="fileInput"
                  />
                  <label
                    htmlFor="fileInput"
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer transition shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Choose Files
                  </label>
                  
                  <input
                    type="file"
                    webkitdirectory=""
                    directory=""
                    multiple
                    onChange={handleFolderInput}
                    className="hidden"
                    id="folderInput"
                  />
                  <label
                    htmlFor="folderInput"
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-700 hover:to-slate-600 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer transition shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    Choose Folder
                  </label>
                  
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleZipInput}
                    className="hidden"
                    id="zipInput"
                  />
                  <label
                    htmlFor="zipInput"
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer transition shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Upload ZIP
                  </label>
                </div>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Supports: Individual files, folders, or ZIP archives
                </div>
              </div>
            </div>
            
            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-8 bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Uploaded Files ({uploadedFiles.length})
                  </h3>
                  <div className="text-sm text-gray-400">
                    Total: {(uploadedFiles.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(2)} KB
                  </div>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="group flex items-center justify-between bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/30 rounded-xl px-4 py-3 transition"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg p-2 transition ml-4"
                        title="Remove file"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="text-gray-400 hover:text-white transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <button
                onClick={handleCreateRepo}
                disabled={loading || uploadedFiles.length === 0}
                className="group bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-700 disabled:to-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    Create & Deploy ({uploadedFiles.length} files)
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SelectExistingRepo({ onBack }) {
  const router = useRouter();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [search, setSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  
  // Detection state
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [overrideType, setOverrideType] = useState(null);
  
  useEffect(() => {
    loadRepos();
  }, []);
  
  async function loadRepos(forceRefresh = false) {
    try {
      setLoading(true);
      const url = forceRefresh 
        ? "/api/repos?refresh=true" 
        : "/api/repos";
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load repos");
      
      const data = await res.json();
      setRepos(data.repos || []);
      setFromCache(data.fromCache);
    } catch (error) {
      console.error("Load repos error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }
  
  async function handleRefresh() {
    setRefreshing(true);
    await loadRepos(true);
  }
  
  async function handleRepoSelect(repo) {
    setSelectedRepo(repo);
    setDetecting(true);
    setDetectionResult(null);
    setOverrideType(null);
    
    try {
      const res = await fetch(`/api/repos/${repo.owner}/${repo.name}/detect-type`);
      const data = await res.json();
      
      if (res.ok) {
        setDetectionResult(data);
        // Auto-set override to detected type
        if (data.projectType !== 'unknown') {
          setOverrideType(data.projectType);
        }
      } else {
        setDetectionResult({ error: data.error, projectType: 'unknown' });
      }
    } catch (error) {
      console.error("Detection error:", error);
      setDetectionResult({ error: error.message, projectType: 'unknown' });
    } finally {
      setDetecting(false);
    }
  }
  
  function handleContinue() {
    if (!selectedRepo || !overrideType) return;
    router.push(`/new-project/configure?owner=${selectedRepo.owner}&name=${selectedRepo.name}&projectType=${overrideType}&framework=${encodeURIComponent(detectionResult?.detectedFramework || '')}`);
  }
  
  function handleBack() {
    if (selectedRepo) {
      setSelectedRepo(null);
      setDetectionResult(null);
      setOverrideType(null);
    } else {
      onBack();
    }
  }
  
  // Get unique languages
  const languages = ["all", ...new Set(repos.map(r => r.language).filter(Boolean))];
  
  // Filter repos
  const filteredRepos = repos.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(search.toLowerCase()) ||
                         repo.description?.toLowerCase().includes(search.toLowerCase());
    const matchesLanguage = languageFilter === "all" || repo.language === languageFilter;
    return matchesSearch && matchesLanguage;
  });
  
  if (loading) {
    return <Loading full variant="repos" message="Loading repositories..." />;
  }
  
  // Show detection/confirmation step
  if (selectedRepo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <header className="border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">Detect Project Type</h1>
              </div>
              <button
                onClick={handleBack}
                className="text-gray-400 hover:text-white transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            </div>
          </div>
        </header>
        
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700/50 rounded-2xl p-8 shadow-xl">
            {/* Selected Repo Info */}
            <div className="mb-8 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">{selectedRepo.name}</h2>
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {selectedRepo.owner}/{selectedRepo.name}
                  </p>
                </div>
              </div>
              {selectedRepo.description && (
                <p className="text-gray-300 text-sm leading-relaxed pl-[72px]">{selectedRepo.description}</p>
              )}
            </div>
            
            {/* Detection Status */}
            {detecting ? (
              <div className="text-center py-12">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="absolute w-20 h-20 bg-blue-500/20 rounded-full animate-ping"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-white text-xl font-semibold mb-2">Analyzing project structure...</p>
                <p className="text-gray-400">Checking package.json and project files</p>
              </div>
            ) : detectionResult ? (
              <div className="space-y-6">
                {/* Detection Result */}
                <div className={`relative p-8 rounded-xl border-2 overflow-hidden ${
                  detectionResult.projectType === 'frontend' 
                    ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/40' 
                    : detectionResult.projectType === 'backend'
                    ? 'bg-gradient-to-br from-slate-500/20 to-slate-600/10 border-slate-500/40'
                    : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border-yellow-500/40'
                }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
                  <div className="relative flex items-start gap-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      detectionResult.projectType === 'frontend' ? 'bg-gradient-to-br from-blue-600 to-blue-500' :
                      detectionResult.projectType === 'backend' ? 'bg-gradient-to-br from-slate-600 to-slate-500' :
                      'bg-gradient-to-br from-yellow-500 to-orange-500'
                    }`}>
                      {detectionResult.projectType === 'frontend' ? (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      ) : detectionResult.projectType === 'backend' ? (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 ${
                        detectionResult.projectType === 'frontend' ? 'text-blue-300' :
                        detectionResult.projectType === 'backend' ? 'text-purple-300' :
                        'text-yellow-300'
                      }`}>
                        {detectionResult.projectType === 'frontend' ? 'Frontend Project Detected' :
                         detectionResult.projectType === 'backend' ? 'Backend Project Detected' :
                         'Could Not Detect Project Type'}
                      </h3>
                      {detectionResult.detectedFramework && (
                        <p className="text-white mb-1 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                          <span>Framework: <span className="font-semibold">{detectionResult.detectedFramework}</span></span>
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Confidence: <span className="font-semibold capitalize">{detectionResult.confidence || 'low'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Project Type Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Confirm or change project type:
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                      onClick={() => setOverrideType('frontend')}
                      className={`group relative p-8 rounded-xl border-2 text-left transition-all overflow-hidden ${
                        overrideType === 'frontend'
                          ? 'bg-gradient-to-br from-blue-500/30 to-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                          : 'bg-gray-800/50 border-gray-700 hover:border-blue-500/50 hover:bg-gray-800'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                      <div className="relative">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </div>
                        <h4 className={`font-bold text-lg mb-2 transition ${overrideType === 'frontend' ? 'text-blue-300' : 'text-white group-hover:text-blue-400'}`}>Frontend</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          React, Next.js, Vue, Angular, Static HTML/CSS
                        </p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setOverrideType('backend')}
                      className={`group relative p-8 rounded-xl border-2 text-left transition-all overflow-hidden ${
                        overrideType === 'backend'
                          ? 'bg-gradient-to-br from-slate-500/30 to-slate-600/20 border-slate-500 shadow-lg shadow-slate-500/20'
                          : 'bg-gray-800/50 border-gray-700 hover:border-slate-500/50 hover:bg-gray-800'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/10 rounded-full blur-2xl"></div>
                      <div className="relative">
                        <div className="w-12 h-12 bg-slate-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                          </svg>
                        </div>
                        <h4 className={`font-bold text-lg mb-2 transition ${overrideType === 'backend' ? 'text-purple-300' : 'text-white group-hover:text-purple-400'}`}>Backend</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          Express, FastAPI, Flask, NestJS, Hono
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
                
                {/* Continue Button */}
                <div className="flex justify-end pt-6">
                  <button
                    onClick={handleContinue}
                    disabled={!overrideType}
                    className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    Continue to Configuration
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Select Repository</h1>
            </div>
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cache Status & Refresh */}
        {fromCache && (
          <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl px-5 py-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
              <span className="text-sm text-blue-300 font-medium">Showing cached repositories</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50 transition flex items-center gap-2 font-medium"
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        )}
        
        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {lang === "all" ? "All Languages" : lang}
              </option>
            ))}
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 border border-gray-600/50 text-white px-6 py-3 rounded-xl font-medium transition disabled:opacity-50 flex items-center gap-2 shadow-lg"
          >
            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? "Refreshing..." : "Refresh List"}
          </button>
        </div>
        
        {/* Repos List */}
        <div className="space-y-4">
          {filteredRepos.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700/50 rounded-2xl p-16 text-center">
              <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg">No repositories found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredRepos.map(repo => (
              <RepoCard key={repo.fullName} repo={repo} onSelect={handleRepoSelect} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function RepoCard({ repo, onSelect }) {
  function handleSelect() {
    onSelect(repo);
  }
  
  return (
    <div
      onClick={handleSelect}
      className="group relative bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden hover:shadow-lg hover:shadow-blue-500/10"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all"></div>
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-800/50 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                {repo.name}
              </h3>
            </div>
            {repo.description && (
              <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-2">{repo.description}</p>
            )}
          </div>
          {repo.language && (
            <LanguageBadge language={repo.language} color={repo.languageColor} />
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {repo.stars > 0 && (
            <span className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-lg">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {repo.stars}
            </span>
          )}
          {repo.forks > 0 && (
            <span className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-lg">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {repo.forks}
            </span>
          )}
          <span className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-lg">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Updated {formatDate(repo.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function LanguageBadge({ language, color }) {
  return (
    <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
      <span
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color || "#888" }}
      />
      {language}
    </span>
  );
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}
