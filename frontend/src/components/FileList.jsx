import React, { useState, useEffect } from 'react';
import { File as FileIcon, Share2, Clock, Shield } from 'lucide-react';
import api from '../services/api';
import ShareModal from './ShareModal';

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareFileId, setShareFileId] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await api.get('/files');
      setFiles(res.data.files);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-sm text-textMuted">Reading storage index...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <h2 className="text-sm font-display font-semibold text-textMain flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Stored Files
        </h2>
        <span className="text-xs text-textMuted">{files.length} object{files.length === 1 ? '' : 's'} encrypted</span>
      </div>

      {files.length === 0 ? (
        <div className="bg-surface p-6 rounded-md border border-border text-center text-sm text-textMuted">
          No files stored in your vault yet.
        </div>
      ) : (
        <div className="bg-surface rounded-md border border-border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="text-textMuted border-b border-border text-xs">
              <tr>
                <th className="px-4 py-2.5 font-medium">File</th>
                <th className="px-4 py-2.5 font-medium">Size</th>
                <th className="px-4 py-2.5 font-medium">Encrypted at</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {files.map((f) => (
                <tr key={f.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 flex items-center gap-2 text-textMain">
                    <FileIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="truncate">{f.originalName}</span>
                  </td>
                  <td className="px-4 py-3 text-textMuted whitespace-nowrap">
                    {(f.size / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="px-4 py-3 text-textMuted whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(f.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setShareFileId(f.id)}
                      className="text-primary hover:text-primary-soft flex items-center gap-1 ml-auto text-sm transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Grant access
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {shareFileId && (
        <ShareModal
          fileId={shareFileId}
          onClose={() => setShareFileId(null)}
        />
      )}
    </div>
  );
};

export default FileList;
