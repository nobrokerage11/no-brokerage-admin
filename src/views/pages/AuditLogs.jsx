import React from 'react';
import { useAuditLogsController } from '../../controllers/useAuditLogsController';
import {
  Search,
  Download,
  User
} from 'lucide-react';

const AuditLogs = () => {
  const {
    loading,
    logs,
    filteredLogs,
    search,
    setSearch,
    actionFilter,
    setActionFilter,
    handleExportCSV
  } = useAuditLogsController();

  const getActionColor = (action) => {
    switch (action) {
      case 'Approve':
      case 'Restore':
        return 'var(--success)';
      case 'Reject':
      case 'Suspend':
        return 'var(--warning)';
      case 'Delete':
      case 'Delete User':
        return 'var(--danger)';
      case 'Login':
        return 'var(--primary)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const actions = [...new Set(logs.map(l => l.action))];

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Security & Audit Logs</h1>
          <p className="page-subtitle">Historical log of all administrative actions performed on the platform.</p>
        </div>
        <button onClick={handleExportCSV} className="btn btn-secondary" style={{ gap: '8px' }}>
          <Download size={16} /> Export to CSV
        </button>
      </div>

      {/* 1. Filters Dashboard */}
      <div className="filters-bar">
        <div className="search-input-wrapper" style={{ flex: 2 }}>
          <Search size={16} className="search-icon-fixed" />
          <input 
            type="text" 
            placeholder="Search logs by admin name, action, target or message details..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Action Type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Action:</span>
          <select 
            className="filter-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="all">All Actions</option>
            {actions.map((act, idx) => (
              <option key={idx} value={act}>{act}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Main Logs Table */}
      {loading ? (
        <div className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-md)' }} />
      ) : (
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Administrator</th>
                <th>Action</th>
                <th>Target Reference</th>
                <th style={{ width: '40%' }}>Log Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    No security events match the specified filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={14} color="var(--text-muted)" />
                        <span style={{ fontWeight: 600 }}>{log.admin_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderLeft: `3px solid ${getActionColor(log.action)}`,
                        borderRadius: '4px',
                        padding: '3px 8px',
                        color: 'var(--text-primary)',
                        fontSize: '11px'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {log.target || 'System'}
                      </span>
                    </td>
                    <td>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {log.details}
                      </p>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {log.ip_address || '127.0.0.1'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
