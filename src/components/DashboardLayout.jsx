import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sparkles, MessageCircle, FileText, Briefcase, GraduationCap,
  LogOut, Menu, X, Home, ChevronLeft, Heart, Calendar, Database,
  Sun, Moon
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/dashboard/chat', label: 'AI Chat', icon: MessageCircle },
  { path: '/dashboard/wellness', label: 'Wellness Hub', icon: Heart },
  { path: '/dashboard/timetable', label: 'Study Planner', icon: Calendar },
  { path: '/dashboard/notes', label: 'Smart Notes', icon: Database },
  { path: '/dashboard/resume', label: 'Resume Builder', icon: FileText },
  { path: '/dashboard/career', label: 'Career Guide', icon: Briefcase },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-primary-gradient p-[1px] flex items-center justify-center flex-shrink-0">
          <div className="w-full h-full bg-darkBg rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-sarthiPink" />
          </div>
        </div>
        {sidebarOpen && (
          <span className="font-headline font-bold text-lg text-white">Vividya</span>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-gradient text-white shadow-lg shadow-sarthiPrimary/30'
                  : 'text-sarthiMuted hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-white/10">
        {sidebarOpen && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-white truncate">{user?.profile?.fullName || 'Student'}</p>
            <p className="text-xs text-sarthiMuted truncate">{user?.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sarthiMuted hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-darkBg flex">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-darkSurface border-r border-white/10 transition-all duration-300 ${
        sidebarOpen ? 'w-60' : 'w-16'
      }`}>
        <NavContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-darkSurface border-r border-white/10">
            <NavContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-14 bg-darkSurface/80 backdrop-blur-xl border-b border-white/10 flex items-center px-4 gap-4 sticky top-0 z-30">
          <button
            onClick={() => {
              if (window.innerWidth < 1024) setMobileOpen(!mobileOpen);
              else setSidebarOpen(!sidebarOpen);
            }}
            className="p-2 rounded-lg text-sarthiMuted hover:text-white hover:bg-white/5 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h2 className="font-headline font-semibold text-white text-sm">
            {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggleTheme}
              className="p-2 rounded-lg text-sarthiMuted hover:text-white hover:bg-white/5 transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
