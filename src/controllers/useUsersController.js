import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { adminService } from '../services/adminService';
import { propertyService } from '../services/propertyService';
import { useAuth } from './auth';

export const useUsersController = () => {
  const { user, adminProfile, logAction } = useAuth();
  const [activeTab, setActiveTab] = useState('buyers'); // buyers, owners, admins
  const [loading, setLoading] = useState(true);

  // Data lists
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [properties, setProperties] = useState([]);

  const [search, setSearch] = useState('');

  // Modal states
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('Admin');

  const [selectedUser, setSelectedUser] = useState(null); // Seller profile inspect modal
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      // 1. Fetch public.users
      const { data: usersData, error: usersErr } = await userService.getUsers();
      if (usersErr) throw usersErr;
      setUsers(usersData || []);

      // 2. Fetch public.admin_users
      const { data: adminsData, error: adminsErr } = await adminService.getAdminUsers();
      if (adminsErr) throw adminsErr;
      setAdmins(adminsData || []);

      // 3. Fetch properties (to calculate counts)
      const { data: propsData, error: propsErr } = await propertyService.getProperties();
      if (propsErr) throw propsErr;
      setProperties(propsData || []);

    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  // Custom confirmation modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState('info');
  const [pendingAction, setPendingAction] = useState(null);

  const handleToggleUserStatus = (userId, currentStatus, fullName) => {
    const nextStatus = currentStatus === 'disabled' ? 'active' : 'disabled';
    setConfirmTitle(`${nextStatus === 'disabled' ? 'Disable' : 'Enable'} Platform User`);
    setConfirmMessage(`Are you sure you want to ${nextStatus === 'disabled' ? 'DISABLE' : 'ENABLE'} platform user "${fullName}"? ${nextStatus === 'disabled' ? 'Disabled users cannot sign in or interact with listings.' : 'Enabled users will regain full platform access.'}`);
    setConfirmType(nextStatus === 'disabled' ? 'warning' : 'success');
    setPendingAction(() => async () => {
      const { error } = await userService.toggleUserStatus(userId, nextStatus);
      if (error) throw error;

      await logAction(
        user?.id,
        adminProfile?.full_name || 'System',
        nextStatus === 'disabled' ? 'Disable User' : 'Enable User',
        userId,
        `${nextStatus === 'disabled' ? 'Disabled' : 'Enabled'} platform user "${fullName}"`
      );

      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => ({ ...prev, status: nextStatus }));
      }
    });
    setConfirmOpen(true);
  };

  const handleToggleAdminStatus = (adminId, currentStatus, fullName) => {
    const nextStatus = currentStatus === 'Disabled' ? 'Active' : 'Disabled';
    if (adminId === user?.id) {
      alert("Self-lock Warning: You cannot disable your own admin account.");
      return;
    }
    setConfirmTitle(`${nextStatus === 'Disabled' ? 'Disable' : 'Enable'} Administrator`);
    setConfirmMessage(`Are you sure you want to ${nextStatus === 'Disabled' ? 'DISABLE' : 'ENABLE'} administrator "${fullName}"?`);
    setConfirmType(nextStatus === 'Disabled' ? 'warning' : 'success');
    setPendingAction(() => async () => {
      const { error } = await adminService.toggleAdminStatus(adminId, nextStatus);
      if (error) throw error;

      await logAction(
        user?.id,
        adminProfile?.full_name || 'System',
        nextStatus === 'Disabled' ? 'Disable Admin' : 'Enable Admin',
        adminId,
        `${nextStatus === 'Disabled' ? 'Disabled' : 'Enabled'} admin profile "${fullName}"`
      );
    });
    setConfirmOpen(true);
  };

  const handleDeleteUser = (userId, fullName) => {
    setConfirmTitle('Permanently Delete User');
    setConfirmMessage(`CRITICAL WARNING: Are you sure you want to permanently delete user "${fullName}" and all associated property listings, reels, and enquiries? This action is permanent and cannot be undone.`);
    setConfirmType('danger');
    setPendingAction(() => async () => {
      const { error } = await userService.deleteUser(userId);
      if (error) throw error;

      await logAction(
        user?.id,
        adminProfile?.full_name || 'System',
        'Delete User',
        userId,
        `Permanently deleted platform user "${fullName}"`
      );
      setSelectedUser(null);
    });
    setConfirmOpen(true);
  };

  const executeConfirmAction = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    try {
      await pendingAction();
      setConfirmOpen(false);
      setPendingAction(null);
      await fetchUsersData();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminPassword || !newAdminName) return;
    setActionLoading(true);
    try {
      // Call standard rpc to create admin user
      const { data, error } = await adminService.createAdminUser(
        newAdminEmail.trim().toLowerCase(),
        newAdminPassword,
        newAdminName,
        newAdminRole
      );

      if (error) throw error;

      await logAction(
        user?.id,
        adminProfile?.full_name || 'System',
        'Create Admin',
        data,
        `Created new admin user "${newAdminName}" with role "${newAdminRole}"`
      );

      setShowAddAdminModal(false);
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminName('');
      setNewAdminRole('Admin');
      fetchUsersData();
      alert(`Admin user "${newAdminName}" created successfully!`);
    } catch (err) {
      alert(err.message || 'Error creating admin user. Ensure you created the database function.');
    } finally {
      setActionLoading(false);
    }
  };

  const getUserStats = (userId) => {
    const userProps = properties.filter(p => p.owner_id === userId);
    const approved = userProps.filter(p => p.status === 'approved').length;
    const pending = userProps.filter(p => p.status === 'pending').length;
    const views = userProps.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const likes = userProps.reduce((acc, curr) => acc + (curr.favorites_count || 0), 0);
    return {
      total: userProps.length,
      approved,
      pending,
      views,
      likes
    };
  };

  // Client side search and filtering
  const getFilteredData = () => {
    const q = search.toLowerCase().trim();

    if (activeTab === 'admins') {
      let list = [...admins];
      if (q) {
        list = list.filter(a =>
          (a.full_name || '').toLowerCase().includes(q) ||
          (a.email || '').toLowerCase().includes(q)
        );
      }
      return list;
    } else {
      let list = users.filter(u =>
        activeTab === 'buyers' ? u.user_type === 'buyer' : u.user_type === 'seller'
      );
      if (q) {
        list = list.filter(u =>
          (u.full_name || '').toLowerCase().includes(q) ||
          (u.phone_number || '').includes(q) ||
          (u.location_text || '').toLowerCase().includes(q)
        );
      }
      return list;
    }
  };

  const filteredData = getFilteredData();

  return {
    activeTab,
    setActiveTab,
    loading,
    users,
    admins,
    properties,
    search,
    setSearch,
    showAddAdminModal,
    setShowAddAdminModal,
    newAdminEmail,
    setNewAdminEmail,
    newAdminPassword,
    setNewAdminPassword,
    newAdminName,
    setNewAdminName,
    newAdminRole,
    setNewAdminRole,
    selectedUser,
    setSelectedUser,
    actionLoading,
    confirmOpen,
    setConfirmOpen,
    confirmTitle,
    confirmMessage,
    confirmType,
    handleToggleUserStatus,
    handleToggleAdminStatus,
    handleDeleteUser,
    handleAddAdmin,
    executeConfirmAction,
    getUserStats,
    filteredData,
    fetchUsersData
  };
};
