import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ShieldAlert, AlertTriangle, FileCheck } from 'lucide-react';
import api from '../services/api';

const DownloadLandingPage = () => {
  const { shareId, token } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDownload = async () => {
    setLoading(true);
    setError('');

    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        navigate('/login');
        return;
      }

      const res = await api.get(`/shares/download/${shareId}/${token}`, {
        responseType: 'blob',
      });

      const contentDisposition = res.headers['content-disposition'];
      let filename = 'secure_download';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      if (err.response && err.response.data && err.response.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          setError(json.message || 'Download failed');
        } catch (e) {
          setError('Download failed');
        }
      } else {
        setError('Download failed or Access Denied.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="bg-surface p-8 rounded-md border border-border w-full max-w-md text-center">
        <div className="bg-primary/10 border border-primary/25 p-3 rounded-full w-14 h-14 mx-auto flex items-center justify-center mb-4">
          <FileCheck className="w-6 h-6 text-primary" />
        </div>

        <h1 className="text-lg font-display font-semibold text-textMain mb-1">Encrypted Shared Payload</h1>
        <p className="text-sm text-textMuted mb-6">Cryptographic link verification required.</p>

        {error ? (
          <div className="bg-danger/10 border border-danger/30 text-danger-soft p-4 rounded mb-6 text-left">
            <div className="flex items-center gap-2 mb-2 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> Access Error
            </div>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full bg-primary hover:bg-primaryDark text-background font-semibold py-2.5 rounded flex items-center justify-center gap-2 transition-colors uppercase text-xs tracking-wide disabled:opacity-50"
          >
            {loading ? 'Decrypting Payload...' : (
              <>
                <Download className="w-4 h-4" /> Extract & Decrypt File
              </>
            )}
          </button>
        )}

        <div className="mt-6 pt-4 border-t border-border text-xs text-textMuted flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-primary" /> Audit trail enforced
        </div>
      </div>
    </div>
  );
};

export default DownloadLandingPage;
