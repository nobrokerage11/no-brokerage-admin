import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService, getReviewStatus } from '../services/propertyService';
import { notificationService } from '../services/notificationService';
import { useAuth } from './auth';

export const usePropertyDetailsController = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, adminProfile, logAction } = useAuth();

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [history, setHistory] = useState([]);
  const [leads, setLeads] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Select Reason');
  const [rejectRemarks, setRejectRemarks] = useState('');

  // Contact Owner modal state
  const [contactOpen, setContactOpen] = useState(false);
  const [contactTitle, setContactTitle] = useState('');
  const [contactBody, setContactBody] = useState('');

  // Custom confirmation modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState('info');
  const [pendingAction, setPendingAction] = useState(null);

  const fetchPropertyData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch property and seller details
      const { data: propData, error: propErr } = await propertyService.getPropertyById(id);

      if (propErr) throw propErr;
      if (!propData) {
        alert('Property not found');
        navigate('/properties');
        return;
      }
      setProperty(propData);

      // 2. Fetch moderation history
      const { data: histData, error: histErr } = await propertyService.getPropertyStatusHistory(id);
      if (histErr) throw histErr;
      setHistory(histData || []);

      // 3. Fetch related leads
      const { data: leadsData, error: leadsErr } = await propertyService.getPropertyLeads(id);
      if (leadsErr) throw leadsErr;
      setLeads(leadsData || []);

    } catch (err) {
      console.error('Error loading property details:', err);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchPropertyData();
  }, [fetchPropertyData]);

  const handleApprove = () => {
    setConfirmTitle('Approve Property Listing');
    setConfirmMessage(`Are you sure you want to approve "${property?.title}"? This listing will immediately go live on the public marketplace.`);
    setConfirmType('success');
    setPendingAction(() => async () => {
      const { error } = await propertyService.updatePropertyStatus(id, 'approved', null, null, property.status);
      if (error) throw error;

      await propertyService.insertStatusHistory(
        id,
        user?.id,
        adminProfile?.full_name || 'Admin',
        getReviewStatus(property),
        'approved',
        null,
        'Approved listing'
      );

      // The seller's "approved" notification is created by the database
      // trigger on this status change; sending another here duplicated it.

      await logAction(
        user?.id,
        adminProfile?.full_name,
        'Approve',
        id,
        `Approved property listing "${property.title}"`
      );
    });
    setConfirmOpen(true);
  };

  const handleReject = async () => {
    if (rejectReason === 'Select Reason') {
      alert('Please select a rejection reason');
      return;
    }
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const { error } = await propertyService.updatePropertyStatus(id, 'pending', rejectReason, rejectRemarks, property.status);

      if (error) throw error;

      // Add to status history
      await propertyService.insertStatusHistory(
        id,
        user?.id,
        adminProfile?.full_name || 'Admin',
        getReviewStatus(property),
        'rejected',
        rejectReason,
        rejectRemarks
      );

      // Insert notification for seller
      await notificationService.sendNotification(
        property.owner_id,
        'Listing Review Required ⚠️',
        `Your property listing "${property.title}" requires revisions. Reason: ${rejectReason}.${rejectRemarks.trim() ? ` Remarks: ${rejectRemarks.trim()}` : ''}`
      );

      // Audit log
      await logAction(
        user?.id,
        adminProfile?.full_name,
        'Reject',
        id,
        `Rejected property listing "${property.title}". Reason: ${rejectReason}`
      );

      setShowRejectModal(false);
      setRejectReason('Select Reason');
      setRejectRemarks('');
      fetchPropertyData();
    } catch (err) {
      alert(err.message || 'Error rejecting property');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = () => {
    setConfirmTitle('Suspend Property Listing');
    setConfirmMessage(`Suspend the property listing "${property?.title}"? Suspended listings are hidden from public view.`);
    setConfirmType('warning');
    setPendingAction(() => async () => {
      const { error } = await propertyService.updatePropertyStatus(id, 'pending', null, null, property.status);
      if (error) throw error;

      await propertyService.insertStatusHistory(
        id,
        user?.id,
        adminProfile?.full_name || 'Admin',
        property.status,
        'pending',
        null,
        'Suspended by Administrator'
      );

      await notificationService.sendNotification(
        property.owner_id,
        'Listing Suspended ⛔',
        `Your property listing "${property.title}" has been suspended by the platform administrator.`
      );

      await logAction(
        user?.id,
        adminProfile?.full_name,
        'Suspend',
        id,
        `Suspended property listing "${property.title}"`
      );
    });
    setConfirmOpen(true);
  };

  const toggleFeatured = async () => {
    const nextFeatured = !property.is_featured;
    setActionLoading(true);
    try {
      const { error } = await propertyService.togglePropertyFeatured(id, nextFeatured);

      if (error) throw error;

      await logAction(
        user?.id,
        adminProfile?.full_name,
        nextFeatured ? 'Feature' : 'Unfeature',
        id,
        `${nextFeatured ? 'Featured' : 'Unfeatured'} property listing "${property.title}"`
      );

      fetchPropertyData();
    } catch (err) {
      alert(err.message || 'Error updating featured status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = () => {
    setConfirmTitle('Delete Property Listing');
    setConfirmMessage(`CRITICAL ACTION: Are you sure you want to permanently delete "${property?.title}"? This action is permanent and cannot be undone.`);
    setConfirmType('danger');
    setPendingAction(() => async () => {
      const { error } = await propertyService.deleteProperty(id);
      if (error) throw error;

      await logAction(
        user?.id,
        adminProfile?.full_name,
        'Delete',
        id,
        `Permanently deleted property listing "${property.title}"`
      );
      navigate('/properties');
    });
    setConfirmOpen(true);
  };

  const executeConfirmAction = async () => {
    if (!pendingAction || actionLoading) return;
    setActionLoading(true);
    try {
      await pendingAction();
      setConfirmOpen(false);
      setPendingAction(null);
      // For delete, we navigate away, so check if we are still on the page
      if (window.location.pathname.includes(id)) {
        fetchPropertyData();
      }
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendContactMessage = async (e) => {
    e.preventDefault();
    if (!contactTitle.trim() || !contactBody.trim()) {
      alert('Please enter both subject and message body');
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await notificationService.sendNotification(
        property.owner_id,
        contactTitle.trim(),
        contactBody.trim()
      );

      if (error) throw error;

      await logAction(
        user?.id,
        adminProfile?.full_name || 'System',
        'Contact Seller',
        id,
        `Sent platform notification alert to seller "${property?.owner?.full_name}" for listing "${property?.title}". Subject: "${contactTitle}"`
      );

      setContactOpen(false);
      setContactTitle('');
      setContactBody('');
      alert('Message sent successfully!');
    } catch (err) {
      alert(err.message || 'Error sending message');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    id,
    loading,
    property,
    history,
    leads,
    actionLoading,
    showRejectModal,
    setShowRejectModal,
    rejectReason,
    setRejectReason,
    rejectRemarks,
    setRejectRemarks,
    contactOpen,
    setContactOpen,
    contactTitle,
    setContactTitle,
    contactBody,
    setContactBody,
    confirmOpen,
    setConfirmOpen,
    confirmTitle,
    confirmMessage,
    confirmType,
    handleApprove,
    handleReject,
    handleSuspend,
    toggleFeatured,
    handleDelete,
    executeConfirmAction,
    handleSendContactMessage,
    fetchPropertyData
  };
};
