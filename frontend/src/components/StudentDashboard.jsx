import React from 'react';
import UploadCard from './UploadCard';
import FileList from './FileList';
import SharedInbox from './SharedInbox';
import { User, ShieldAlert } from 'lucide-react';

const StudentDashboard = ({ user }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-8 h-8 text-primary" /> Welcome, {user?.email || 'Student'}
        </h2>
        <div className="flex items-center gap-2 text-sm text-textMuted bg-surface px-3 py-1 rounded-full border border-gray-800">
          <ShieldAlert className="w-4 h-4 text-green-500" /> End-to-End Encrypted
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <UploadCard onUploadComplete={() => window.dispatchEvent(new Event('refreshFiles'))} />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <FileList />
          <SharedInbox />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
