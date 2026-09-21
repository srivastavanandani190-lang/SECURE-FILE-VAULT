import React, { useState, useEffect } from 'react';
import { ShieldAlert, User } from 'lucide-react';
import api from '../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit/logs');
      setLogs(res.data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionStyle = (action) => {
    if (action.includes('FAILED') || action.includes('DENIED'))
      return 'text-danger-soft border-danger/30 bg-danger/10';
    if (action.includes('UPLOAD') || action.includes('CREATED'))
      return 'text-safe border-safe/30 bg-safe/10';
    return 'text-primary-soft border-primary/30 bg-primary/10';
  };

  if (loading) return <div className="text-sm text-textMuted">Querying security records...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <h2 className="text-sm font-display font-semibold text-textMain flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-primary" /> System Audit Trail
        </h2>
        <span className="text-xs text-textMuted">{logs.length} event{logs.length === 1 ? '' : 's'}</span>
      </div>

      <div className="bg-surface rounded-md border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="text-textMuted border-b border-border text-xs">
            <tr>
              <th className="px-4 py-2.5 font-medium">Timestamp</th>
              <th className="px-4 py-2.5 font-medium">Event</th>
              <th className="px-4 py-2.5 font-medium">Subject</th>
              <th className="px-4 py-2.5 font-medium">IP Address</th>
              <th className="px-4 py-2.5 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-surface-hover transition-colors">
                <td className="px-4 py-3 text-textMuted whitespace-nowrap font-mono text-xs">
                  {new Date(log.createdAt).toISOString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getActionStyle(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-textMain">
                  {log.userId ? (
                    <span className="flex items-center gap-1 text-textMuted font-mono text-xs">
                      <User className="w-3 h-3 text-primary" /> {log.userId.substring(0, 8)}...
                    </span>
                  ) : (
                    <span className="text-textMuted">—</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-textMuted font-mono text-xs">
                  {log.ipAddress || '0.0.0.0'}
                </td>
                <td className="px-4 py-3 max-w-xs truncate text-textMuted">
                  {log.details || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="p-6 text-center text-textMuted">No security log records retrieved.</div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
