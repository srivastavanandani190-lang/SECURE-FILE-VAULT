import React from 'react';
import UploadCard from './UploadCard';
import FileList from './FileList';
import SharedInbox from './SharedInbox';
import { Shield, Lock } from 'lucide-react';

const ProfessorDashboard = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-lg font-display font-semibold text-textMain flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> {user?.email || 'Professor'}
          </h1>
          <p className="text-sm text-textMuted mt-0.5">Professor access</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-primary-soft bg-surface px-3 py-1.5 rounded border border-border">
          <Lock className="w-3.5 h-3.5" /> End-to-end encrypted
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <UploadCard onUploadComplete={() => window.dispatchEvent(new Event('refreshFiles'))} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <FileList />
          <SharedInbox />
        </div>
      </div>
    </div>
  );
};

export default ProfessorDashboard;
