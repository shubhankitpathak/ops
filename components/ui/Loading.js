"use client";

import React from 'react';

export default function Loading({ message = 'Loading...', full = false, compact = false, variant }) {
  if (variant === 'repos') {
    return (
      <div role="status" aria-busy="true" className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="max-w-4xl w-full px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-6 w-48 bg-gray-800 rounded animate-pulse mb-2" />
                <div className="h-3 w-72 bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="w-12 h-12 rounded bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-800 rounded w-3/5 animate-pulse mb-2" />
                  <div className="h-3 bg-gray-800 rounded w-2/5 animate-pulse" />
                </div>
                <div className="h-8 w-20 bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (full) {
    return (
      <div role="status" aria-busy="true" className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl animate-pulse">
            <svg className="w-12 h-12 text-white" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g" x1="0%" x2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <circle cx="25" cy="25" r="20" stroke="url(#g)" strokeWidth="4" strokeDasharray="31.4 31.4" fill="none">
                <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
          <div className="mt-4 text-white text-lg font-semibold">{message}</div>
          <div className="mt-2 text-sm text-gray-400">Please wait a moment — this usually takes a few seconds.</div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div role="status" aria-busy="true" className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm animate-spin">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 18v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div className="text-sm text-white font-medium">{message}</div>
        </div>
      </div>
    );
  }

  // Default inline skeleton
  return (
    <div role="status" aria-busy="true" className="p-4 bg-gray-900/40 border border-gray-800 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-700 rounded w-3/4 animate-pulse" />
          <div className="h-2 bg-gray-700 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
