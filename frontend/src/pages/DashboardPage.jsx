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
      <aside className="w-64 bg-surface border-r border-gray-800 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-primary truncate" title={user.email}>
            <Shield className="w-5 h-5 flex-shrink-0" /> <span className="truncate">{user.email}</span>
          </h2>
          <p className="text-sm text-textMuted mt-1 uppercase tracking-wider font-semibold">Role: {user.role}</p>
          
          <div className="mt-4 bg-background/50 border border-gray-700 rounded p-3 flex items-center justify-between group">
            <div className="overflow-hidden mr-2">
              <p className="text-[10px] text-textMuted uppercase tracking-wider font-bold mb-1">Database ID</p>
              <p className="text-xs text-textMain font-mono truncate">{user.id}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(user.id);
                alert('Database UUID copied to clipboard!');
              }}
              className="text-primary hover:text-primaryDark p-1.5 bg-primary/10 rounded transition-colors opacity-80 group-hover:opacity-100 flex-shrink-0"
              title="Copy Database ID"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded text-left transition-colors ${activeTab === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-textMuted hover:bg-gray-800'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          
          {user.role === 'Professor' && (
            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded text-left transition-colors ${activeTab === 'audit' ? 'bg-primary/10 text-primary' : 'text-textMuted hover:bg-gray-800'}`}
            >
              <Activity className="w-5 h-5" /> Audit Trail
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded text-left text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && user.role === 'Student' && <StudentDashboard user={user} />}
          {activeTab === 'dashboard' && user.role === 'Professor' && <ProfessorDashboard />}
          {activeTab === 'audit' && user.role === 'Professor' && <AuditLogs />}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
