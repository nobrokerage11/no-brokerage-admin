import { useState, useEffect } from 'react';
import { leadService, getLeadStatusLabel, isStaleLead } from '../services/leadService';
import { notificationService } from '../services/notificationService';
import { useAuth } from './auth';

export const useLeadsController = () => {
  const { user, adminProfile, logAction } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);

  // Service Leads state
  const [leadsTab, setLeadsTab] = useState('enquiries'); // 'enquiries' or 'serviceLeads'
  const [serviceLeads, setServiceLeads] = useState([]);
  const [filteredServiceLeads, setFilteredServiceLeads] = useState([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [assignFilter, setAssignFilter] = useState('all'); // all, mine, unassigned, followup
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    leadService.getAdmins().then(({ data }) => setAdmins(data || []));
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const [enqsRes, serviceLeadsRes] = await Promise.all([
        leadService.getLeads(),
        leadService.getServiceLeads(),
      ]);

      if (enqsRes.error) throw enqsRes.error;
      if (serviceLeadsRes.error) throw serviceLeadsRes.error;

      setLeads(enqsRes.data || []);
      setServiceLeads(serviceLeadsRes.data || []);

    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Filter logic for enquiries
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
      result = result.filter(l => getLeadStatusLabel(l.status) === getLeadStatusLabel(statusFilter));
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

  // Filter logic for service leads
  useEffect(() => {
    let result = [...serviceLeads];

    // Search query
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(l => 
        (l.name || '').toLowerCase().includes(q) ||
        (l.mobile || '').toLowerCase().includes(q) ||
        (l.city || '').toLowerCase().includes(q) ||
        (l.requirement || '').toLowerCase().includes(q) ||
        (l.type || '').toLowerCase().includes(q) ||
        (l.source || '').toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(l => getLeadStatusLabel(l.status) === getLeadStatusLabel(statusFilter));
    }

    // Assignment / follow-up filter
    if (assignFilter === 'mine') {
      result = result.filter(l => l.assigned_to === user?.id);
    } else if (assignFilter === 'unassigned') {
      result = result.filter(l => !l.assigned_to);
    } else if (assignFilter === 'followup') {
      result = result.filter(isStaleLead);
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

    setFilteredServiceLeads(result);
  }, [search, statusFilter, dateFilter, assignFilter, serviceLeads, user]);

  // Custom confirmation modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState('info');
  const [pendingAction, setPendingAction] = useState(null);

  const handleUpdateStatus = (leadId, nextStatus) => {
    setConfirmTitle('Update Lead Status');
    setConfirmMessage(`Are you sure you want to update the status of this enquiry to "${nextStatus}"?`);
    setConfirmType('warning');
    setPendingAction(() => async () => {
      const { error } = await leadService.updateLeadStatus(leadId, nextStatus);
      if (error) throw error;

      await logAction(
        user?.id,
        adminProfile?.full_name || 'System',
        'Update Lead',
        leadId,
        `Updated enquiry status to "${nextStatus}"`
      );
    });
    setConfirmOpen(true);
  };

  const handleUpdateServiceLeadStatus = (leadId, nextStatus) => {
    setConfirmTitle('Update Service Lead Status');
    setConfirmMessage(`Are you sure you want to update the status of this service lead to "${nextStatus}"?`);
    setConfirmType('warning');
    setPendingAction(() => async () => {
      const { error } = await leadService.updateServiceLeadStatus(leadId, nextStatus);
      if (error) throw error;

      await logAction(
        user?.id,
        adminProfile?.full_name || 'System',
        'Update Service Lead',
        leadId,
        `Updated service lead status to "${nextStatus}"`
      );
    });
    setConfirmOpen(true);
  };

  // Assigning needs no confirmation: it is easy to change back.
  const handleAssignServiceLead = async (leadId, adminId) => {
    const { error } = await leadService.assignServiceLead(leadId, adminId);
    if (error) {
      alert(error.message || 'Could not assign the lead.');
      return;
    }
    setServiceLeads(prev => prev.map(l => (l.id === leadId ? { ...l, assigned_to: adminId || null } : l)));
    const adminName = admins.find(a => a.id === adminId)?.full_name;
    await logAction(
      user?.id,
      adminProfile?.full_name || 'System',
      'Assign Lead',
      leadId,
      adminId ? `Assigned service lead to ${adminName || 'an admin'}` : 'Unassigned service lead'
    );
  };

  // Sends the customer an in-app notification about their lead.
  const handleMessageCustomer = async (userId, subject) => {
    if (!userId) return;
    const body = window.prompt(`Message to the customer about: ${subject}`);
    if (!body || !body.trim()) return;
    const { error } = await notificationService.sendNotification(
      userId,
      'Message from NoBrokerage',
      body.trim()
    );
    if (error) {
      alert(error.message || 'The message could not be sent.');
      return;
    }
    await logAction(
      user?.id,
      adminProfile?.full_name || 'System',
      'Message Customer',
      userId,
      `Sent a message about: ${subject}`
    );
    alert('Message sent.');
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
    if (leadsTab === 'enquiries') {
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
      link.setAttribute("download", `property_enquiries_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      if (filteredServiceLeads.length === 0) return;

      const headers = [
        'Lead ID', 'Customer Name', 'Mobile', 'City', 
        'Requirement', 'Source', 'Lead Type', 'Status', 'Date Created'
      ];

      const rows = filteredServiceLeads.map(l => [
        l.id,
        l.name || 'N/A',
        l.mobile || 'N/A',
        l.city || 'N/A',
        `"${(l.requirement || '').replace(/"/g, '""')}"`,
        l.source || 'N/A',
        l.type || 'N/A',
        l.status || 'New',
        new Date(l.created_at).toLocaleString()
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `service_leads_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return {
    loading,
    leads,
    filteredLeads,
    leadsTab,
    setLeadsTab,
    filteredServiceLeads,
    handleUpdateServiceLeadStatus,
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
    fetchLeads,
    admins,
    assignFilter,
    setAssignFilter,
    handleAssignServiceLead,
    handleMessageCustomer,
    currentAdminId: user?.id
  };
};
