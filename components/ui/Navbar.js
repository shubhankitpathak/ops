"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Input from './Input';
import Button from './Button';

export default function Navbar({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <header className="backdrop-blur bg-slate-900/60 border-b border-gray-800/20 shadow-sm mb-6 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              aria-label="Toggle menu"
              className="md:hidden p-2 rounded-md text-indigo-100 hover:bg-white/5"
              onClick={() => setOpen((v) => !v)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>

            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <span className="text-white font-extrabold">ED</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-white leading-tight">opsDevHub</h1>
                <div className="text-xs text-indigo-200">Developer tools & analytics</div>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4 flex-1 mx-6">
            <nav className="flex gap-2 items-center">
              <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm text-indigo-100 hover:bg-white/5 hover:text-white">Dashboard</Link>
              <Link href="/new-project" className="px-3 py-2 rounded-md text-sm text-indigo-100 hover:bg-white/5 hover:text-white">New Project</Link>
            </nav>

            <div className="w-full max-w-xs">
              <div className="flex items-center">
                <Input placeholder="Search projects..." />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3" ref={menuRef}>
                <button
                  className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-white/3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  onClick={() => setUserOpen((v) => !v)}
                  aria-expanded={userOpen}
                  aria-label="User menu"
                >
                  <img src={user.avatarUrl || '/avatar-placeholder.png'} alt={user.username} className="w-9 h-9 rounded-full ring-1 ring-indigo-400" />
                  <span className="hidden sm:block text-sm text-indigo-100">{user.username}</span>
                </button>

                <div className={`origin-top-right absolute right-4 mt-12 w-44 rounded-md bg-slate-800/90 backdrop-blur border border-gray-700 shadow-lg ${userOpen ? 'block' : 'hidden'}`}>
                  <div className="py-1">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-200 hover:bg-white/5">Profile</Link>
                    <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/5">Sign out</button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Link href="/auth/login">
                  <Button variant="default" className="px-3 py-1 text-sm">Sign in</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

              
      <div className={`md:hidden bg-slate-900/70 border-t border-gray-800/20 ${open ? 'block' : 'hidden'}`}>
        <div className="px-4 pt-2 pb-4 space-y-1">
          <Link href="/dashboard" className="block px-3 py-2 rounded-md text-sm text-indigo-100 hover:bg-white/5">Dashboard</Link>
          <Link href="/new-project" className="block px-3 py-2 rounded-md text-sm text-indigo-100 hover:bg-white/5">New Project</Link>
          <div className="pt-2">
            <Input placeholder="Search projects..." />
          </div>
        </div>
      </div>
    </header>
  );
}
