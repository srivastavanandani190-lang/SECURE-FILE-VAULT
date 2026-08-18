import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ShieldAlert, AlertTriangle, FileCheck } from 'lucide-react';
import api from '../services/api';

const DownloadLandingPage = () => {
  const { shareId, token } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Optionally we could fetch share metadata here before download.
  // For simplicity, we just have a button to trigger download.

  const handleDownload = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Must check if we are logged in, otherwise redirect to login
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        navigate('/login');
        return;
      }

      const res = await api.get(`/shares/download/${shareId}/${token}`, {
        responseType: 'blob', // Important for file download
      });

      // Get filename from Content-Disposition if possible, or fallback
      const contentDisposition = res.headers['content-disposition'];
      let filename = 'secure_download';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }

      // Create blob link and trigger download
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
        // Parse Blob error response
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
      <div className="bg-surface p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-800 text-center">
        <div className="bg-primary/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6">
          <FileCheck className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Secure Shared File</h1>
        <p className="text-textMuted text-sm mb-8">This file is encrypted and access is strictly controlled.</p>
        
        {error ? (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-lg mb-6 flex flex-col items-center gap-3 text-center">
            <AlertTriangle className="w-10 h-10 mb-2" />
            <h3 className="text-lg font-bold">
              {error.includes('expired') ? 'Link Expired' : 
               error.includes('Integrity') ? 'Tampered File Detected' : 
               'Access Denied'}
            </h3>
            <span className="text-sm">
              {error.includes('Integrity') 
                ? 'CRITICAL ALERT: The ciphertext integrity check failed. The file may have been tampered with or corrupted.' 
                : error}
            </span>
          </div>
        ) : (
          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full bg-primary hover:bg-primaryDark text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Decrypting & Downloading...' : (
              <>
                <Download className="w-5 h-5" /> Access Secure File
              </>
            )}
          </button>
        )}
        
        <div className="mt-6 text-xs text-textMuted flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4" /> All access attempts are logged.
        </div>
      </div>
    </div>
  );
};

export default DownloadLandingPage;
