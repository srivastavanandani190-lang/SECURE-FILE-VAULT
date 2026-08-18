import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, User, File } from 'lucide-react';
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

  const getActionColor = (action) => {
    if (action.includes('FAILED') || action.includes('DENIED')) return 'text-red-400 bg-red-400/10 border-red-400/20';
    if (action.includes('UPLOAD') || action.includes('CREATED')) return 'text-green-400 bg-green-400/10 border-green-400/20';
    return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
  };

  if (loading) return <div className="text-textMuted">Loading audit logs...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-primary" /> System Audit Trail
        </h2>
      </div>

      <div className="bg-surface rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800 text-textMuted">
            <tr>
              <th className="px-6 py-3 font-medium">Timestamp</th>
              <th className="px-6 py-3 font-medium">Action</th>
              <th className="px-6 py-3 font-medium">User ID</th>
              <th className="px-6 py-3 font-medium">IP Address</th>
              <th className="px-6 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-textMuted">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {log.userId ? (
                    <span className="flex items-center gap-1 text-textMuted">
                      <User className="w-3 h-3" /> {log.userId.substring(0, 8)}...
                    </span>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-textMuted">
                  {log.ipAddress || '-'}
                </td>
                <td className="px-6 py-4 max-w-xs truncate text-textMuted">
                  {log.details || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {logs.length === 0 && (
          <div className="p-8 text-center text-textMuted">No audit logs found.</div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
