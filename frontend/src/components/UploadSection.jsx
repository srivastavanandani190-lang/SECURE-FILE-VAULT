import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const UploadSection = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', msg: string }

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus({ type: 'success', msg: res.data.message });
      setFile(null);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-display font-semibold text-textMain mb-6">Secure File Upload</h2>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border border-dashed border-border hover:border-primary/50 bg-surface p-12 rounded-md flex flex-col items-center justify-center text-center transition-colors mb-6"
      >
        <UploadCloud className="w-12 h-12 text-primary mb-4" />
        <p className="text-base text-textMain mb-2">Drag & drop a file to encrypt and store</p>
        <p className="text-sm text-textMuted mb-6">PDF, PNG, JPG, DOCX, ZIP — up to 25MB</p>

        <input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <label
          htmlFor="fileInput"
          className="bg-surface-2 hover:bg-surface-hover text-textMain px-6 py-2 rounded cursor-pointer transition-colors border border-border"
        >
          Browse files
        </label>
      </div>

      {file && (
        <div className="bg-surface border border-border p-4 rounded-md flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded text-primary">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-textMain">{file.name}</p>
              <p className="text-xs text-textMuted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-primary hover:bg-primaryDark text-background px-6 py-2 rounded font-medium disabled:opacity-50 transition-colors"
          >
            {uploading ? 'Encrypting & Storing...' : 'Secure Upload'}
          </button>
        </div>
      )}

      {status && (
        <div className={`p-4 rounded-md flex items-center gap-3 border ${
          status.type === 'success'
            ? 'bg-safe/10 text-safe border-safe/30'
            : 'bg-danger/10 text-danger-soft border-danger/30'
        }`}>
          {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {status.msg}
        </div>
      )}
    </div>
  );
};

export default UploadSection;
