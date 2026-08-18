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
    
    // Auto-extract token if the user pasted the entire URL instead of just the token
    let parsedToken = downloadToken.trim();
    if (parsedToken.includes('/share/')) {
      parsedToken = parsedToken.split('/').pop();
    }

    try {
      const response = await api.get(`/shares/download/${activeShareId}/${parsedToken}`, {
        responseType: 'blob' // CRITICAL for file downloads
      });

      // Extract filename from headers if backend provides it, otherwise use a fallback
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'secure_decrypted_file';
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/["']/g, '');
      }

      // Force browser download
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
      // If response is a blob, we must read it as text to parse the JSON error
      if (error.response && error.response.data instanceof Blob) {
        const errorText = await error.response.data.text();
        const errorJson = JSON.parse(errorText);
        alert(errorJson.message || errorJson.error || "Decryption failed. Invalid token.");
      } else {
        alert(error.response?.data?.message || "An error occurred during download.");
      }
    }
  };


  if (loading) return <div className="text-textMuted">Loading received shares...</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold">Files Shared With You</h2>
      </div>

      <div className="bg-surface rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800 text-textMuted">
            <tr>
              <th className="px-6 py-3 font-medium">File Name</th>
              <th className="px-6 py-3 font-medium">Sender Email</th>
              <th className="px-6 py-3 font-medium">Expires At</th>
              <th className="px-6 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {shares.map((share) => (
              <tr key={share.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 font-medium flex items-center gap-2">
                  <File className="w-4 h-4 text-primary" />
                  {share.File.original_name}
                </td>
                <td className="px-6 py-4 text-textMuted">
                  {share.sender?.email || 'Unknown Sender'}
                </td>
                <td className="px-6 py-4 text-textMuted">
                  {new Date(share.expires_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDownloadClick(share.id)}
                    className="text-primary hover:text-primaryDark flex items-center gap-1 ml-auto font-medium"
                  >
                    <Download className="w-4 h-4" /> Decrypt & View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {shares.length === 0 && (
          <div className="p-8 text-center text-textMuted">No files have been shared with you.</div>
        )}
      </div>

      {/* Token Modal */}
      {activeShareId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/50">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" /> Enter Secure Token
              </h3>
            </div>
            <form onSubmit={executeDownload} className="p-6">
              <p className="text-sm text-textMuted mb-4">
                To download this file, please enter the cryptographic token provided by the sender.
              </p>
              <input
                type="text"
                placeholder="Paste token here..."
                className="w-full bg-background border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary text-textMain text-sm mb-4"
                value={downloadToken}
                onChange={(e) => setDownloadToken(e.target.value)}
                required
              />
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setActiveShareId(null)}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 rounded transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primaryDark text-white font-medium py-2 rounded transition-colors"
                >
                  Decrypt & Download
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
