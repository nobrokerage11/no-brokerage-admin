import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLeadsController } from '../../controllers/useLeadsController';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  Search,
  Download,
  X
} from 'lucide-react';

const Leads = () => {
  const {
    loading,
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
    handleExportCSV
  } = useLeadsController();

  const [activeMessageModal, setActiveMessageModal] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <span className="badge badge-approved">Accepted</span>;
      case 'pending':
        return <span className="badge badge-pending">Pending</span>;
      case 'rejected':
        return <span className="badge badge-rejected">Rejected</span>;
      default:
        return <span className="badge badge-disabled">{status || 'unknown'}</span>;
    }
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Enquiries & Leads</h1>
          <p className="page-subtitle">Monitor inquiries made by buyers to property sellers.</p>
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
            placeholder="Search leads by message, buyer, seller or property..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status:</span>
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Date Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Date:</span>
          <select 
            className="filter-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
          </select>
        </div>
      </div>

      {/* 2. Main Leads Table */}
      {loading ? (
        <div className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-md)' }} />
      ) : (
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Buyer Info</th>
                <th>Seller Info</th>
                <th style={{ width: '30%' }}>Message</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    No leads or inquiries match the specified filter.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      {lead.property ? (
                        <div>
                          <Link to={`/properties/${lead.property.id}`} style={{ fontWeight: 600, color: 'var(--primary)' }}>
                            {lead.property.title}
                          </Link>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lead.property.city}</p>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Deleted Property</span>
                      )}
                    </td>
                    <td>
                      {lead.buyer ? (
                        <div>
                          <p style={{ fontWeight: 500 }}>{lead.buyer.full_name}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lead.buyer.phone_number}</p>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Anonymous</span>
                      )}
                    </td>
                    <td>
                      {lead.seller ? (
                        <div>
                          <p style={{ fontWeight: 500 }}>{lead.seller.full_name}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lead.seller.phone_number}</p>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', fontStyle: 'italic' }}>
                        {lead.message && lead.message.length > 80 ? (
                          <>
                            "{lead.message.substring(0, 80)}..."
                            <button
                              type="button"
                              onClick={() => setActiveMessageModal(lead)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                paddingLeft: '4px',
                                textDecoration: 'underline',
                                fontSize: '11px'
                              }}
                            >
                              view full
                            </button>
                          </>
                        ) : (
                          `"${lead.message || 'No text message'}"`
                        )}
                      </p>
                    </td>
                    <td>{getStatusBadge(lead.status)}</td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {new Date(lead.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <select
                        value={lead.status || 'pending'}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '4px',
                          fontSize: '11px',
                          background: 'var(--bg-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeConfirmAction}
        title={confirmTitle}
        message={confirmMessage}
        type={confirmType}
        isLoading={loading}
        confirmText="Proceed"
      />

      {/* View Lead Message Details Modal */}
      {activeMessageModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Buyer Inquiry Message</h3>
              <button 
                type="button"
                onClick={() => setActiveMessageModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-primary)', paddingBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Buyer</span>
                  <p style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{activeMessageModal.buyer?.full_name || 'Anonymous'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Seller</span>
                  <p style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{activeMessageModal.seller?.full_name || 'N/A'}</p>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Message Body</span>
                <div style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  fontStyle: 'italic'
                }}>
                  "{activeMessageModal.message}"
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button"
                onClick={() => setActiveMessageModal(null)} 
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
