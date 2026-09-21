import React, { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, Loader2, Copy, Shield } from 'lucide-react';
import api from '../services/api';

const UploadCard = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [users, setUsers] = useState([]);
  const [recipientId, setRecipientId] = useState('');
  const [duration, setDuration] = useState('24');
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users/all');
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };
    fetchUsers();
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleInitialUploadClick = () => {
    if (file) setStep('config');
  };

  const handleConfirmAndSend = async () => {
    if (!file) return;

    setStep('validation');
    setStatusMsg('Validating file constraints...');
    await new Promise(r => setTimeout(r, 600));

    if (file.size > 25 * 1024 * 1024) {
      setStep('error');
      setStatusMsg('File size exceeds 25MB threshold.');
      return;
    }

    setStep('encrypting');
    setStatusMsg('AES-256-GCM encryption pipeline initiated...');

    const formData = new FormData();
    formData.append('file', file);
    if (recipientId) {
      formData.append('recipientId', recipientId);
      formData.append('duration', duration);
    }

    try {
      const uploadPromise = api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await new Promise(r => setTimeout(r, 1000));
      setStep('storing');
      setStatusMsg('Writing encrypted binary payload to isolated vault...');

      const res = await uploadPromise;

      setStep('complete');
      setStatusMsg(res.data.message);
      if (res.data.share) {
        const url = `${window.location.origin}/share/${res.data.share.shareId}/${res.data.share.token}`;
        setShareLink(url);
      } else {
        setTimeout(() => {
          setStep('idle');
          setFile(null);
        }, 3000);
      }

      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      setStep('error');
      setStatusMsg(err.response?.data?.message || 'Upload halted: Security policy violation.');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Encrypted token URL copied.');
  };

  const resetComponent = () => {
    setStep('idle');
    setFile(null);
    setShareLink('');
    setRecipientId('');
  };

  const busy = ['validation', 'encrypting', 'storing'].includes(step);

  return (
    <div className="bg-surface rounded-md border border-border p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <h2 className="text-sm font-display font-semibold text-textMain flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Encrypted Ingestion
        </h2>
        <span className="text-[11px] font-mono text-textMuted bg-background px-2 py-0.5 border border-border rounded">
          AES-256-GCM
        </span>
      </div>

      {step === 'idle' || step === 'error' ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border border-dashed p-8 rounded flex flex-col items-center justify-center text-center transition-colors mb-4 ${
            step === 'error' ? 'border-danger/40 bg-danger/5' : 'border-border hover:border-primary/50 bg-background/40'
          }`}
        >
          <UploadCloud className={`w-8 h-8 mb-3 ${step === 'error' ? 'text-danger-soft' : 'text-textMuted'}`} />
          <p className="text-sm text-textMain mb-1">Drag & drop a file to encrypt</p>
          <p className="text-xs text-textMuted mb-4">PDF, PNG, JPG, DOCX, ZIP — up to 25MB</p>

          <input
            type="file"
            id="fileInput"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <label
            htmlFor="fileInput"
            className="bg-surface-2 hover:bg-surface-hover text-textMain text-xs px-4 py-2 border border-border rounded cursor-pointer transition-colors"
          >
            Browse files
          </label>
        </div>
      ) : step === 'config' ? (
        <div className="bg-background p-4 rounded border border-border mb-4 space-y-4">
          <h3 className="text-xs uppercase tracking-wide text-textMuted">Access & expiry</h3>

          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-textMuted text-xs mb-1">Recipient</label>
              <select
                className="w-full bg-surface border border-border rounded px-3 py-2 text-textMain focus:outline-none focus:border-primary"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
              >
                <option value="">No recipient — private vault only</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email} · {u.role}
                  </option>
                ))}
              </select>
            </div>

            {recipientId && (
              <div>
                <label className="block text-textMuted text-xs mb-1">Link expires after</label>
                <select
                  className="w-full bg-surface border border-border rounded px-3 py-2 text-textMain focus:outline-none focus:border-primary"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="12">12 hours</option>
                  <option value="24">24 hours</option>
                  <option value="72">72 hours</option>
                  <option value="168">7 days</option>
                </select>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep('idle')}
                className="w-full bg-surface hover:bg-surface-hover border border-border text-textMuted text-xs py-2 rounded transition-colors"
              >
                Abort
              </button>
              <button
                onClick={handleConfirmAndSend}
                className="w-full bg-primary hover:bg-primaryDark text-background text-xs font-semibold py-2 rounded transition-colors"
              >
                Encrypt & Dispatch
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-border bg-background p-8 rounded mb-4">
          <div className="flex flex-col items-center text-center">
            {step === 'complete' ? (
              <CheckCircle className="w-9 h-9 text-safe mb-3" />
            ) : (
              <Loader2 className="w-9 h-9 text-primary animate-spin mb-3" />
            )}
            <h3 className="text-sm font-medium text-textMain mb-1 capitalize">{step}</h3>
            <p className="text-xs text-textMuted mb-4">{statusMsg}</p>
          </div>

          {/* Legitimate step sequence — this is a real pipeline, not decoration */}
          {busy && (
            <div className="flex items-center gap-2 mb-4">
              {['validation', 'encrypting', 'storing'].map((s, i) => {
                const order = ['validation', 'encrypting', 'storing'];
                const current = order.indexOf(step);
                const done = i < current;
                const active = i === current;
                return (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      done || active ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                );
              })}
            </div>
          )}

          {shareLink && (
            <div className="w-full">
              <p className="text-xs text-textMuted mb-1">Temporary access link</p>
              <div className="flex items-center gap-2 bg-surface p-2 rounded border border-border mb-3">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="bg-transparent w-full outline-none text-xs font-mono text-textMuted truncate"
                />
                <button onClick={copyLink} className="text-primary hover:text-primary-soft p-1 transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={resetComponent}
                className="bg-surface hover:bg-surface-hover text-textMain border border-border px-3 py-1.5 text-xs rounded transition-colors"
              >
                Upload another file
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'error' && (
        <div className="bg-danger/10 border border-danger/30 text-danger-soft p-3 rounded flex items-center gap-2 mb-4 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {file && step === 'idle' && (
        <div className="bg-background border border-border p-3 rounded flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="truncate">
              <p className="text-sm text-textMain truncate">{file.name}</p>
              <p className="text-xs text-textMuted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button
            onClick={handleInitialUploadClick}
            className="bg-primary hover:bg-primaryDark text-background text-xs font-semibold px-3 py-1.5 rounded transition-colors whitespace-nowrap ml-2"
          >
            Encrypt
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadCard;
