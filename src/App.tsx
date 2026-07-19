import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import MemberPanel from './components/MemberPanel';
import InstallPrompt from './components/InstallPrompt';
import { ToastProvider } from './components/Toast';
import { Member } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('mphone_theme') as 'dark' | 'light') || 'dark';
  });

  // Apply theme class to HTML element
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('mphone_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Auto-login from sessionStorage if already authenticated
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('mphone_session_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Session loading failed', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLoginSuccess = (user: Member) => {
    setCurrentUser(user);
    try {
      sessionStorage.setItem('mphone_session_user', JSON.stringify(user));
    } catch {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      sessionStorage.removeItem('mphone_session_user');
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center space-y-4">
        {/* Loading Spinner Skeleton */}
        <div className="w-12 h-12 rounded-full border-4 border-[#00B140]/20 border-t-[#00B140] animate-spin"></div>
        <p className="text-gray-400 text-sm font-medium animate-pulse">กำลังตั้งค่าความปลอดภัยของระบบ...</p>
      </div>
    );
  }

  return (
    <ToastProvider>
      {!currentUser ? (
        <>
          <Login onLoginSuccess={handleLoginSuccess} />
          <InstallPrompt theme={theme} />
        </>
      ) : currentUser.role === 'admin' ? (
        <>
          <AdminPanel 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            theme={theme}
            toggleTheme={toggleTheme}
          />
          <InstallPrompt theme={theme} />
        </>
      ) : (
        <>
          <MemberPanel 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            theme={theme}
            toggleTheme={toggleTheme}
          />
          <InstallPrompt theme={theme} />
        </>
      )}
    </ToastProvider>
  );
}
