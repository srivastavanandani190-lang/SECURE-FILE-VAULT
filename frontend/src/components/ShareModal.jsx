import React, { useState } from 'react';
import { X, Link as LinkIcon, CheckCircle, Copy } from 'lucide-react';
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

  React.useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const res = await api.get('/users/professors');
        console.log('[FRONTEND DEBUG] Fetched professors response:', res.data);
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
      setError(err.response?.data?.message || 'Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!shareResult) return;
    const url = `${window.location.origin}/share/${shareResult.shareId}/${shareResult.token}`;
    navigator.clipboard.writeText(url);
    alert('Secure link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-primary" /> Secure Share
          </h3>
          <button onClick={onClose} className="text-textMuted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {shareResult ? (
            <div className="text-center">
              <div className="bg-green-500/10 text-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-2">Share Link Created</h4>
              <p className="text-sm text-textMuted mb-6">Link expires in {durationMinutes} minutes.</p>
              
              <div className="flex items-center gap-2 bg-background p-3 rounded border border-gray-700 mb-6">
                <input 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}/share/${shareResult.shareId}/${shareResult.token}`}
                  className="bg-transparent w-full outline-none text-sm text-textMuted"
                />
                <button onClick={copyLink} className="text-primary hover:text-primaryDark p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <button 
                onClick={onClose}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 rounded transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleShare} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm text-textMuted mb-1">Select Professor</label>
                {loadingProfs ? (
                  <div className="w-full bg-background border border-gray-700 rounded px-4 py-2 text-textMuted text-sm">
                    Loading professors...
                  </div>
                ) : professors.length === 0 ? (
                  <div className="w-full bg-red-500/10 border border-red-500/50 rounded px-4 py-2 text-red-500 text-sm">
                    No registered professors found. Please create a professor account first.
                  </div>
                ) : (
                  <select
                    className="w-full bg-background border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary text-textMain text-sm"
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
                <label className="block text-sm text-textMuted mb-1">[DEV ONLY] Manual Recipient UUID</label>
                <input
                  type="text"
                  placeholder="Paste UUID here..."
                  className="w-full bg-background border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary text-textMain text-sm"
                  value={manualRecipientId}
                  onChange={(e) => setManualRecipientId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-textMuted mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full bg-background border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary text-textMain"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading || (!recipientId && !manualRecipientId)}
                className="w-full bg-primary hover:bg-primaryDark text-white font-medium py-2 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Generating Secure Link...' : 'Generate Secure Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
