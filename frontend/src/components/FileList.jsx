import React, { useState, useEffect } from 'react';
import { File as FileIcon, Share2, Clock } from 'lucide-react';
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

  if (loading) return <div className="text-textMuted">Loading vault...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Encrypted Vault</h2>
      </div>

      {files.length === 0 ? (
        <div className="bg-surface p-8 rounded-xl border border-gray-800 text-center text-textMuted">
          No files stored securely yet.
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-800 text-textMuted text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">File Name</th>
                <th className="px-6 py-4 font-medium">Size</th>
                <th className="px-6 py-4 font-medium">Uploaded</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {files.map((f) => (
                <tr key={f.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <FileIcon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{f.originalName}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-textMuted">
                    {(f.size / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="px-6 py-4 text-sm text-textMuted flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {new Date(f.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setShareFileId(f.id)}
                      className="text-primary hover:text-primaryDark flex items-center gap-1 ml-auto text-sm font-medium"
                    >
                      <Share2 className="w-4 h-4" /> Share
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
