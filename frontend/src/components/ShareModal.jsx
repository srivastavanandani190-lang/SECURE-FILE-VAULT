import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, CheckCircle, Copy, Mail } from 'lucide-react';
import api from '../services/api';

const ShareModal = ({ fileId, onClose }) => {
  const [recipientId, setRecipientId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [shareResult, setShareResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [professors, setProfessors] = useState([]);
  const [loadingProfs, setLoadingProfs] = useState(true);
  const [manualRecipientId, setManualRecipientId] = useState('');

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const res = await api.get('/users/professors');
        setProfessors(res.data);
        if (res.data.length > 0) {
          setRecipientId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch professors', err);
      } finally {
        setLoadingProfs(false);
      }
    };
    fetchProfessors();
  }, []);

  const handleShare = async (e) => {
    e.preventDefault();
    const finalRecipientId = manualRecipientId || recipientId;
    if (!finalRecipientId) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/shares/create', {
        file_id: fileId,
        recipientId: finalRecipientId,
        duration_hours: parseInt(durationMinutes) / 60
      });
      setShareResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize secure link session');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!shareResult) return;
    const url = `${window.location.origin}/share/${shareResult.shareId}/${shareResult.token}`;
    navigator.clipboard.writeText(url);
    alert('Encrypted token URL copied to clipboard.');
  };

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-sm">
      <div className="bg-surface rounded-md w-full max-w-md border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-background flex justify-between items-center">
          <h3 className="text-sm font-display font-semibold text-textMain flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-primary" /> Issue Shared Access Token
          </h3>
          <button onClick={onClose} className="text-textMuted hover:text-textMain transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {shareResult ? (
            <div className="text-center">
              <div className="bg-safe/10 text-safe w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-safe/30">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-display font-semibold text-textMain mb-1">Access Granted</h4>
              <p className="text-xs text-textMuted mb-3">Token expires automatically in {durationMinutes} minute(s).</p>

              {shareResult.emailSent ? (
                <div className="bg-safe/10 border border-safe/30 text-safe p-2 rounded mb-4 flex items-center justify-center gap-2 text-xs">
                  <Mail className="w-3.5 h-3.5" /> Token automatically dispatched to recipient email.
                </div>
              ) : (
                <div className="bg-primary/10 border border-primary/30 text-primary-soft p-2 rounded mb-4 text-xs">
                  Share record created, but email dispatch failed. Copy link manually below.
                </div>
              )}

              <div className="flex items-center gap-2 bg-background p-2 rounded border border-border mb-4">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/share/${shareResult.shareId}/${shareResult.token}`}
                  className="bg-transparent w-full outline-none text-xs text-textMuted truncate font-mono"
                />
                <button onClick={copyLink} className="text-primary hover:text-primary-soft p-1 transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-background hover:bg-surface-hover text-textMain border border-border py-2 rounded transition-colors"
              >
                Dismiss
              </button>
            </div>
          ) : (
            <form onSubmit={handleShare} className="space-y-3">
              {error && (
                <div className="bg-danger/10 border border-danger/30 text-danger-soft p-2.5 rounded text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-textMuted text-xs mb-1">Recipient</label>
                {loadingProfs ? (
                  <div className="w-full bg-background border border-border rounded px-3 py-2 text-textMuted text-xs">
                    Looking up professors...
                  </div>
                ) : professors.length === 0 ? (
                  <div className="w-full bg-danger/10 border border-danger/30 rounded px-3 py-2 text-danger-soft text-xs">
                    No authorized recipients found.
                  </div>
                ) : (
                  <select
                    className="w-full bg-background border border-border rounded px-3 py-2 text-textMain focus:outline-none focus:border-primary text-sm"
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                  >
                    {professors.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.email}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-textMuted text-xs mb-1">Explicit recipient UUID (optional)</label>
                <input
                  type="text"
                  placeholder="Paste UUID directly..."
                  className="w-full bg-background border border-border rounded px-3 py-2 text-textMain focus:outline-none focus:border-primary font-mono text-xs"
                  value={manualRecipientId}
                  onChange={(e) => setManualRecipientId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-textMuted text-xs mb-1">Expires after (minutes)</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full bg-background border border-border rounded px-3 py-2 text-textMain focus:outline-none focus:border-primary text-sm"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading || (!recipientId && !manualRecipientId)}
                className="w-full bg-primary hover:bg-primaryDark text-background font-semibold py-2 rounded transition-colors disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                {loading ? 'Dispatching...' : 'Generate & Dispatch Token'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
