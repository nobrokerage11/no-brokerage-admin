import { useState, useEffect } from 'react';
import { leadService } from '../services/leadService';
import { useAuth } from './auth';

export const useLeadsController = () => {
  const { user, adminProfile, logAction } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await leadService.getLeads();

      if (error) throw error;
      setLeads(data || []);
      setFilteredLeads(data || []);

    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = [...leads];

    // Search query
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(l => 
        (l.message || '').toLowerCase().includes(q) ||
        (l.property?.title || '').toLowerCase().includes(q) ||
        (l.buyer?.full_name || '').toLowerCase().includes(q) ||
        (l.seller?.full_name || '').toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(l => l.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();

      if (dateFilter === 'today') {
        cutoffDate.setHours(0,0,0,0);
      } else if (dateFilter === 'week') {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (dateFilter === 'month') {
        cutoffDate.setMonth(now.getMonth() - 1);
      }

      result = result.filter(l => new Date(l.created_at) >= cutoffDate);
    }

    setFilteredLeads(result);
  }, [search, statusFilter, dateFilter, leads]);

  // Custom confirmation modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState('info');
  const [pendingAction, setPendingAction] = useState(null);

  const handleUpdateStatus = (leadId, nextStatus) => {
    setConfirmTitle('Update Lead Status');
    setConfirmMessage(`Are you sure you want to update the status of this enquiry/lead to "${nextStatus}"?`);
    setConfirmType(nextStatus === 'rejected' ? 'danger' : nextStatus === 'accepted' ? 'success' : 'warning');
    setPendingAction(() => async () => {
      const { error } = await leadService.updateLeadStatus(leadId, nextStatus);
      if (error) throw error;

      await logAction(
        user?.id,
        adminProfile?.full_name || 'System',
        'Update Lead',
        leadId,
        `Updated enquiry/lead status to "${nextStatus}"`
      );
    });
    setConfirmOpen(true);
  };

  const executeConfirmAction = async () => {
    if (!pendingAction) return;
    setLoading(true);
    try {
      await pendingAction();
      setConfirmOpen(false);
      setPendingAction(null);
      await fetchLeads();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;

    const headers = [
      'Lead ID', 'Property Title', 'Buyer Name', 'Buyer Phone', 
      'Seller Name', 'Seller Phone', 'Message', 'Status', 'Date Created'
    ];

    const rows = filteredLeads.map(l => [
      l.id,
      `"${(l.property?.title || '').replace(/"/g, '""')}"`,
      l.buyer?.full_name || 'N/A',
      l.buyer?.phone_number || 'N/A',
      l.seller?.full_name || 'N/A',
      l.seller?.phone_number || 'N/A',
      `"${(l.message || '').replace(/"/g, '""')}"`,
      l.status || 'pending',
      new Date(l.created_at).toLocaleString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    loading,
    leads,
    filteredLeads,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    confirmOpen,
    setConfirmOpen,
    confirmTitle,
    confirmMessage,
    confirmType,
    handleUpdateStatus,
    executeConfirmAction,
    handleExportCSV,
    fetchLeads
  };
};
