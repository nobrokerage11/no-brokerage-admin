import React from 'react';
import { useAuth } from '../../controllers/auth';
import { useUsersController } from '../../controllers/useUsersController';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  Search,
  Building,
  Trash2,
  Calendar,
  X,
  UserPlus,
  Phone
} from 'lucide-react';

const Users = () => {
  const { user, adminProfile } = useAuth();
  const {
    activeTab,
    setActiveTab,
    loading,
    users,
    admins,
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
    filteredData
  } = useUsersController();

  const filteredItems = filteredData;

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Users & Administrators</h1>
          <p className="page-subtitle">Manage platform permissions, buyers, property owners, and admin accounts.</p>
        </div>
        {activeTab === 'admins' && adminProfile?.role === 'Super Admin' && (
          <button onClick={() => setShowAddAdminModal(true)} className="btn btn-primary" style={{ gap: '8px' }}>
            <UserPlus size={16} /> Add Admin User
          </button>
        )}
      </div>

      {/* 1. Tab Menu Bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-primary)',
        marginBottom: '20px',
        gap: '24px'
      }}>
        <button 
          onClick={() => { setActiveTab('buyers'); setSelectedUser(null); }}
          style={{
            padding: '12px 4px',
            fontSize: '14px',
            fontWeight: activeTab === 'buyers' ? 600 : 500,
            color: activeTab === 'buyers' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'buyers' ? '2px solid var(--primary)' : 'none',
            marginBottom: '-1px'
          }}
        >
          Buyers ({users.filter(u => u.user_type === 'buyer').length})
        </button>
        <button 
          onClick={() => { setActiveTab('owners'); setSelectedUser(null); }}
          style={{
            padding: '12px 4px',
            fontSize: '14px',
            fontWeight: activeTab === 'owners' ? 600 : 500,
            color: activeTab === 'owners' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'owners' ? '2px solid var(--primary)' : 'none',
            marginBottom: '-1px'
          }}
        >
          Property Owners ({users.filter(u => u.user_type === 'seller').length})
        </button>
        <button 
          onClick={() => { setActiveTab('admins'); setSelectedUser(null); }}
          style={{
            padding: '12px 4px',
            fontSize: '14px',
            fontWeight: activeTab === 'admins' ? 600 : 500,
            color: activeTab === 'admins' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'admins' ? '2px solid var(--primary)' : 'none',
            marginBottom: '-1px'
          }}
        >
          Administrators ({admins.length})
        </button>
      </div>

      {/* Search Input bar */}
      <div className="filters-bar" style={{ marginBottom: '20px' }}>
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon-fixed" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Main Grid View (split screen if detail selected) */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '3fr 2fr' : '1fr', gap: '20px', alignItems: 'flex-start' }}>
        {/* List Card table */}
        {loading ? (
          <div className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-md)' }} />
        ) : (
          <div className="table-container">
            <table className="premium-table">
              <thead>
                {activeTab === 'admins' ? (
                  <tr>
                    <th>Admin Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Active</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                ) : (
                  <tr>
                    <th>User Details</th>
                    <th>Location</th>
                    <th>{activeTab === 'owners' ? 'Properties' : 'Leads'}</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      No records found matching search.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const stats = activeTab === 'owners' ? getUserStats(item.id) : null;
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="user-info-cell">
                            <div className="avatar">
                              {item.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="user-name">{item.full_name}</p>
                              <p className="user-email">{item.phone_number || 'No phone'}</p>
                            </div>
                          </div>
                        </td>
                        
                        {activeTab === 'admins' ? (
                          <>
                            <td>
                              <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                                {item.role}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${item.status === 'Active' ? 'badge-active' : 'badge-disabled'}`}>
                                {item.status}
                              </span>
                            </td>
                            <td>{item.last_login ? new Date(item.last_login).toLocaleString() : 'Never'}</td>
                            <td style={{ textAlign: 'right' }}>
                              {adminProfile?.role === 'Super Admin' && item.id !== user?.id && (
                                <button
                                  onClick={() => handleToggleAdminStatus(item.id, item.status, item.full_name)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ color: item.status === 'Active' ? 'var(--danger)' : 'var(--success)' }}
                                >
                                  {item.status === 'Active' ? 'Disable' : 'Enable'}
                                </button>
                              )}
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{item.location_text || <span style={{ color: 'var(--text-muted)' }}>N/A</span>}</td>
                            <td>
                              {activeTab === 'owners' ? (
                                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Building size={14} color="var(--primary)" /> {stats?.total || 0}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>Interactive Leads</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${item.status === 'disabled' ? 'badge-disabled' : 'badge-active'}`}>
                                {item.status || 'active'}
                              </span>
                            </td>
                            <td>{new Date(item.created_at).toLocaleDateString()}</td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                {activeTab === 'owners' && (
                                  <button 
                                    onClick={() => setSelectedUser({ ...item, stats })}
                                    className="btn btn-secondary btn-sm"
                                  >
                                    Inspect
                                  </button>
                                )}
                                <button
                                  onClick={() => handleToggleUserStatus(item.id, item.status, item.full_name)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ color: item.status === 'disabled' ? 'var(--success)' : 'var(--danger)' }}
                                >
                                  {item.status === 'disabled' ? 'Enable' : 'Disable'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(item.id, item.full_name)}
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: '6px' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Selected Seller Profile Side Panel Info */}
        {selectedUser && activeTab === 'owners' && (
          <div className="card" style={{ position: 'sticky', top: '90px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-primary)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Owner Activity Summary</h3>
              <button onClick={() => setSelectedUser(null)} style={{ color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div className="avatar" style={{ height: '56px', width: '56px', fontSize: '20px', margin: '0 auto 10px auto' }}>
                {selectedUser.full_name.charAt(0).toUpperCase()}
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{selectedUser.full_name}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '2px' }}>
                <Calendar size={13} /> Registered {new Date(selectedUser.created_at).toLocaleDateString()}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Uploaded</span>
                <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>{selectedUser.stats?.total}</p>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Approved</span>
                <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--success)', marginTop: '2px' }}>{selectedUser.stats?.approved}</p>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Views</span>
                <p style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>{selectedUser.stats?.views}</p>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Likes</span>
                <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--danger)', marginTop: '2px' }}>{selectedUser.stats?.likes}</p>
              </div>
            </div>

            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="var(--text-muted)" /> {selectedUser.phone_number || 'N/A'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="var(--text-muted)" /> Phone: {selectedUser.phone_number || 'N/A'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button
                onClick={() => handleToggleUserStatus(selectedUser.id, selectedUser.status, selectedUser.full_name)}
                className="btn btn-secondary"
                style={{ flex: 1, color: selectedUser.status === 'disabled' ? 'var(--success)' : 'var(--danger)' }}
              >
                {selectedUser.status === 'disabled' ? 'Enable Account' : 'Disable Account'}
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser.id, selectedUser.full_name)}
                className="btn btn-danger"
                style={{ padding: '10px' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Admin Modal Box */}
      {showAddAdminModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', fontWeight: 700 }}>Add Administrator Account</h3>
              <button onClick={() => setShowAddAdminModal(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddAdmin}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="John Doe"
                    className="search-input"
                    style={{ paddingLeft: '12px', width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@nobrokerage.com"
                    className="search-input"
                    style={{ paddingLeft: '12px', width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Initial Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Set secure password"
                    className="search-input"
                    style={{ paddingLeft: '12px', width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Administrator Role
                  </label>
                  <select 
                    className="filter-select"
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Moderator">Moderator</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button"
                  onClick={() => setShowAddAdminModal(false)} 
                  disabled={actionLoading}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary btn-sm"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeConfirmAction}
        title={confirmTitle}
        message={confirmMessage}
        type={confirmType}
        isLoading={actionLoading}
        confirmText="Proceed"
      />
    </div>
  );
};

export default Users;
