import React, { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, Loader2, Copy } from 'lucide-react';
import api from '../services/api';

const UploadCard = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState('idle'); // idle, config, validation, encrypting, storing, complete, error
  const [statusMsg, setStatusMsg] = useState('');
  const [users, setUsers] = useState([]);
  const [recipientId, setRecipientId] = useState('');
  const [duration, setDuration] = useState('24');
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    // Fetch users for sharing
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
    if (file) {
      setStep('config');
    }
  };

  const handleConfirmAndSend = async () => {
    if (!file) return;
    
    setStep('validation');
    setStatusMsg('Validating file constraints...');
    
    // Simulate slight delay for visual stepper
    await new Promise(r => setTimeout(r, 600));

    if (file.size > 25 * 1024 * 1024) {
      setStep('error');
      setStatusMsg('File exceeds 25MB limit.');
      return;
    }

    setStep('encrypting');
    setStatusMsg('AES-256-GCM Encryption in progress...');
    
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
      setStatusMsg('Writing ciphertext to isolated vault...');
      
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
      setStatusMsg(err.response?.data?.message || 'Upload failed due to a security policy violation.');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Secure link copied to clipboard!');
  };

  const resetComponent = () => {
    setStep('idle');
    setFile(null);
    setShareLink('');
    setRecipientId('');
  };

  return (
    <div className="bg-surface rounded-xl border border-gray-800 p-6">
      <h2 className="text-xl font-bold mb-4">Secure File Upload</h2>
      
      {step === 'idle' || step === 'error' ? (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed bg-background p-12 rounded-xl flex flex-col items-center justify-center text-center transition-colors mb-4 ${step === 'error' ? 'border-red-500/50 hover:border-red-500' : 'border-gray-700 hover:border-primary'}`}
        >
          <UploadCloud className={`w-12 h-12 mb-4 ${step === 'error' ? 'text-red-500' : 'text-primary'}`} />
          <p className="text-lg mb-2">Drag & Drop file to encrypt and store</p>
          <p className="text-sm text-textMuted mb-6">Supported: PDF, PNG, JPG, DOCX, ZIP (Max 25MB)</p>
          
          <input 
            type="file" 
            id="fileInput" 
            className="hidden" 
            onChange={(e) => setFile(e.target.files[0])} 
          />
          <label 
            htmlFor="fileInput" 
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded cursor-pointer transition-colors"
          >
            Browse Files
          </label>
        </div>
      ) : step === 'config' ? (
        <div className="bg-background p-6 rounded-xl border border-gray-700 mb-4">
          <h3 className="text-lg font-medium mb-4">Configure Sharing Options</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-textMuted mb-1">Recipient Email (Optional)</label>
              <select
                className="w-full bg-surface border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary text-textMain text-sm"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
              >
                <option value="">-- Do Not Share (Store Only) --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {recipientId && (
              <div>
                <label className="block text-sm text-textMuted mb-1">Duration</label>
                <select
                  className="w-full bg-surface border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary text-textMain text-sm"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="12">12 Hours</option>
                  <option value="24">24 Hours</option>
                  <option value="72">3 Days</option>
                  <option value="168">1 Week</option>
                </select>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setStep('idle')}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 rounded transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmAndSend}
                className="w-full bg-primary hover:bg-primaryDark text-white font-medium py-2 rounded transition-colors"
              >
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-primary/50 bg-background p-12 rounded-xl flex flex-col items-center justify-center text-center mb-4">
          {step === 'complete' ? (
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          ) : (
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
          )}
          <h3 className="text-xl font-bold mb-2 capitalize">{step}</h3>
          <p className="text-textMuted mb-4">{statusMsg}</p>
          
          {shareLink && (
            <div className="w-full">
              <p className="text-sm text-textMuted mb-2">Share Link Generated:</p>
              <div className="flex items-center gap-2 bg-surface p-2 rounded border border-gray-700 mb-4">
                <input 
                  type="text" 
                  readOnly 
                  value={shareLink}
                  className="bg-transparent w-full outline-none text-xs text-textMuted"
                />
                <button onClick={copyLink} className="text-primary hover:text-primaryDark p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={resetComponent}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 text-sm rounded transition-colors"
              >
                Upload Another
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'error' && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded flex items-start gap-2 mb-4 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {file && step === 'idle' && (
        <div className="bg-background border border-gray-700 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded text-primary">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-textMuted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button 
            onClick={handleInitialUploadClick}
            className="bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded font-medium transition-colors"
          >
            Encrypt & Upload
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadCard;
