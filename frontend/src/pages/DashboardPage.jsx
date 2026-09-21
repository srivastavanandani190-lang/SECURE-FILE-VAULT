import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Shield, Activity, Copy } from 'lucide-react';
import StudentDashboard from '../components/StudentDashboard';
import ProfessorDashboard from '../components/ProfessorDashboard';
import AuditLogs from '../components/AuditLogs';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col justify-between">
        <div className="p-5">
          <div className="pb-4 border-b border-border">
            <h2 className="text-sm font-display font-semibold text-textMain flex items-center gap-2 truncate" title={user.email}>
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </h2>
            <span className="inline-block mt-2 text-[11px] bg-background border border-border px-2 py-0.5 rounded text-textMuted">
              {user.role}
            </span>
          </div>

          <div className="mt-4 bg-background border border-border rounded p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-textMuted">Identity UUID</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(user.id);
                  alert('UUID copied to clipboard.');
                }}
                className="text-primary hover:text-primary-soft p-1 rounded transition-colors"
                title="Copy Database ID"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-textMain font-mono truncate mt-1">{user.id}</p>
          </div>

          <nav className="space-y-1 mt-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-primary/10 text-primary-soft border border-primary/20'
                  : 'text-textMuted hover:bg-surface-hover hover:text-textMain border border-transparent'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>

            {user.role === 'Professor' && (
              <button
                onClick={() => setActiveTab('audit')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
                  activeTab === 'audit'
                    ? 'bg-primary/10 text-primary-soft border border-primary/20'
                    : 'text-textMuted hover:bg-surface-hover hover:text-textMain border border-transparent'
                }`}
              >
                <Activity className="w-4 h-4" /> Audit Logs
              </button>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-sm text-danger-soft hover:bg-danger/10 border border-transparent hover:border-danger/20 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && user.role === 'Student' && <StudentDashboard user={user} />}
          {activeTab === 'dashboard' && user.role === 'Professor' && <ProfessorDashboard user={user} />}
          {activeTab === 'audit' && user.role === 'Professor' && <AuditLogs />}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
