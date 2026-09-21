import React, { useState, useEffect } from 'react';
import { File, Download, Key, ShieldAlert } from 'lucide-react';
import api from '../services/api';

const SharedInbox = () => {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadToken, setDownloadToken] = useState('');
  const [activeShareId, setActiveShareId] = useState(null);

  useEffect(() => {
    fetchShares();
  }, []);

  const fetchShares = async () => {
    try {
      const res = await api.get('/shares/shared-with-me');
      setShares(res.data.shares);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadClick = (shareId) => {
    setActiveShareId(shareId);
  };

  const executeDownload = async (e) => {
    e.preventDefault();
    if (!downloadToken || !activeShareId) return;

    let parsedToken = downloadToken.trim();
    if (parsedToken.includes('/share/')) {
      parsedToken = parsedToken.split('/').pop();
    }

    try {
      const response = await api.get(`/shares/download/${activeShareId}/${parsedToken}`, {
        responseType: 'blob'
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = 'secure_decrypted_file';
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/["']/g, '');
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setActiveShareId(null);
      setDownloadToken('');
    } catch (error) {
      if (error.response && error.response.data instanceof Blob) {
        const errorText = await error.response.data.text();
        const errorJson = JSON.parse(errorText);
        alert(errorJson.message || errorJson.error || "Decryption failed. Invalid cryptographic token.");
      } else {
        alert(error.response?.data?.message || "An error occurred during verification.");
      }
    }
  };

  if (loading) return <div className="text-sm text-textMuted">Checking pending shares...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h2 className="text-sm font-display font-semibold text-textMain flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-primary" /> Shared With You
        </h2>
      </div>

      <div className="bg-surface rounded-md border border-border overflow-hidden text-sm">
        <table className="w-full text-left">
          <thead className="text-textMuted border-b border-border text-xs">
            <tr>
              <th className="px-4 py-2.5 font-medium">File</th>
              <th className="px-4 py-2.5 font-medium">From</th>
              <th className="px-4 py-2.5 font-medium">Expires</th>
              <th className="px-4 py-2.5 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shares.map((share) => (
              <tr key={share.id} className="hover:bg-surface-hover transition-colors">
                <td className="px-4 py-3 flex items-center gap-2 text-textMain">
                  <File className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="truncate">{share.File.original_name}</span>
                </td>
                <td className="px-4 py-3 text-textMuted truncate">
                  {share.sender?.email || 'Unknown sender'}
                </td>
                <td className="px-4 py-3 text-textMuted whitespace-nowrap">
                  {new Date(share.expires_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => handleDownloadClick(share.id)}
                    className="text-primary hover:text-primary-soft flex items-center gap-1 ml-auto transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Decrypt & view
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {shares.length === 0 && (
          <div className="p-6 text-center text-textMuted">No shares waiting for you.</div>
        )}
      </div>

      {/* Cryptographic Token Modal */}
      {activeShareId && (
        <div className="fixed inset-0 bg-background/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-md w-full max-w-md border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-background flex items-center justify-between">
              <h3 className="text-sm font-display font-semibold text-textMain flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" /> Enter Decryption Token
              </h3>
            </div>
            <form onSubmit={executeDownload} className="p-5">
              <p className="text-sm text-textMuted mb-3">
                Paste the one-time secret to unlock this file.
              </p>
              <input
                type="text"
                placeholder="Token or share URL..."
                className="w-full bg-background border border-border rounded px-3 py-2.5 text-textMain focus:outline-none focus:border-primary text-sm font-mono mb-4"
                value={downloadToken}
                onChange={(e) => setDownloadToken(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveShareId(null)}
                  className="w-full bg-background hover:bg-surface-hover border border-border text-textMuted text-sm py-2 rounded transition-colors"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primaryDark text-background font-semibold text-sm py-2 rounded transition-colors"
                >
                  Decrypt & Extract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedInbox;
