import { useState, useEffect } from 'react';
import { auditService } from '../services/auditService';

export const useAuditLogsController = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await auditService.getAuditLogs();

      if (error) throw error;
      setLogs(data || []);
      setFilteredLogs(data || []);

    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs
  useEffect(() => {
    let result = [...logs];

    // Search query
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(l => 
        (l.admin_name || '').toLowerCase().includes(q) ||
        (l.action || '').toLowerCase().includes(q) ||
        (l.target || '').toLowerCase().includes(q) ||
        (l.details || '').toLowerCase().includes(q)
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      result = result.filter(l => l.action === actionFilter);
    }

    setFilteredLogs(result);
  }, [search, actionFilter, logs]);

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['Log ID', 'Admin Name', 'Action', 'Target Reference', 'Details', 'IP Address', 'Timestamp'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.admin_name,
      l.action,
      l.target || 'System',
      `"${(l.details || '').replace(/"/g, '""')}"`,
      l.ip_address || 'N/A',
      new Date(l.created_at).toLocaleString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_logs_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    loading,
    logs,
    filteredLogs,
    search,
    setSearch,
    actionFilter,
    setActionFilter,
    handleExportCSV,
    fetchLogs
  };
};
