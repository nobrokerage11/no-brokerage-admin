import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePropertyDetailsController } from '../../controllers/usePropertyDetailsController';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  ChevronLeft,
  Calendar,
  Eye,
  Heart,
  MessageSquare,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Phone,
  Trash2,
  AlertCircle,
  Star,
  Send,
  X
} from 'lucide-react';

const PropertyDetails = () => {
  const {
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
    handleSendContactMessage
  } = usePropertyDetailsController();

  const [selectedImage, setSelectedImage] = useState(0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-approved" style={{ fontSize: '12px' }}>Approved</span>;
      case 'pending':
        return <span className="badge badge-pending" style={{ fontSize: '12px' }}>Pending Approval</span>;
      case 'rejected':
        return <span className="badge badge-rejected" style={{ fontSize: '12px' }}>Rejected</span>;
      default:
        return <span className="badge badge-disabled" style={{ fontSize: '12px' }}>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="page-body">
        <div className="skeleton skeleton-title" style={{ width: '150px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '20px' }}>
          <div className="skeleton" style={{ height: '360px' }} />
          <div className="skeleton" style={{ height: '360px' }} />
        </div>
      </div>
    );
  }

  const propImages = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'];

  return (
    <div className="page-body">
      {/* Back Button */}
      <Link to="/properties" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '20px' }}>
        <ChevronLeft size={16} /> Back to Catalog
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 className="page-title">{property.title}</h1>
            {getStatusBadge(property.status)}
            {property.is_featured && (
              <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Star size={11} fill="var(--primary)" /> Featured
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <MapPin size={14} color="var(--text-muted)" /> {property.location}
          </p>
        </div>

        {/* Moderation Controls Panel */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={toggleFeatured}
            disabled={actionLoading}
            className="btn btn-secondary"
          >
            <Star size={16} fill={property.is_featured ? 'var(--primary)' : 'none'} color={property.is_featured ? 'var(--primary)' : 'currentColor'} />
            {property.is_featured ? 'Unfeature' : 'Mark Featured'}
          </button>
          
          {property.status !== 'approved' && (
            <button 
              onClick={handleApprove}
              disabled={actionLoading}
              className="btn btn-primary"
              style={{ backgroundColor: 'var(--success)', hover: { backgroundColor: 'var(--success-hover)' } }}
            >
              <CheckCircle size={16} /> Approve
            </button>
          )}

          {property.status !== 'rejected' && (
            <button 
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
              className="btn btn-secondary"
              style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
            >
              <XCircle size={16} /> Reject
            </button>
          )}

          {property.status === 'approved' && (
            <button 
              onClick={handleSuspend}
              disabled={actionLoading}
              className="btn btn-secondary"
            >
              <AlertTriangle size={16} /> Suspend
            </button>
          )}

          <button 
            onClick={handleDelete}
            disabled={actionLoading}
            className="btn btn-danger"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px', alignItems: 'flex-start' }} className="details-grid">
        {/* Left Side: Images & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Image Gallery */}
          <div className="card" style={{ padding: '16px' }}>
            <img 
              src={propImages[selectedImage]} 
              alt="Main property view" 
              style={{
                width: '100%',
                height: '320px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '12px'
              }}
            />
            {propImages.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {propImages.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img} 
                    alt={`View thumbnail ${idx + 1}`}
                    onClick={() => setSelectedImage(idx)}
                    style={{
                      width: '72px',
                      height: '54px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: selectedImage === idx ? '2px solid var(--primary)' : '1px solid var(--border-primary)',
                      opacity: selectedImage === idx ? 1 : 0.7,
                      transition: 'opacity var(--transition-fast)'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Walkthrough Video Reel */}
          {property.property_reels && property.property_reels.length > 0 && (
            <div className="card" style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px', borderBottom: '1px solid var(--border-primary)', paddingBottom: '10px' }}>
                Walkthrough Video Reel
              </h3>
              <div style={{ position: 'relative', width: '100%', maxWidth: '360px', margin: '0 auto', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                <video 
                  src={property.property_reels[0].video_url} 
                  poster={property.property_reels[0].thumbnail_url}
                  controls 
                  style={{ width: '100%', display: 'block', maxHeight: '500px', backgroundColor: '#000' }}
                />
                {property.property_reels[0].caption && (
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', fontSize: '13px', borderTop: '1px solid var(--border-primary)', fontStyle: 'italic' }}>
                    "{property.property_reels[0].caption}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description & Specifications */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px', borderBottom: '1px solid var(--border-primary)', paddingBottom: '10px' }}>
              Listing Specifications
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Price</span>
                <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>${property.price.toLocaleString()}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Property Type</span>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>{property.property_type}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Purpose</span>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>{property.is_for_sale ? 'For Sale' : 'For Rent'}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Area</span>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>{property.area_sq_ft} Sq Ft</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Bedrooms</span>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>{property.bedrooms} BHK</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Bathrooms</span>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>{property.bathrooms} Baths</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Furnishing</span>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>{property.furnishing || 'Not Specified'}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Parking</span>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>{property.parking || 'None'}</p>
              </div>
            </div>

            <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Description</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
              {property.description || 'No description provided by the seller.'}
            </p>

            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Amenities</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {property.amenities.map((amenity, idx) => (
                    <span key={idx} style={{
                      fontSize: '12px',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Seller details, stats & timeline logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Rejection Details alert box */}
          {property.status === 'rejected' && property.rejection_reason && (
            <div style={{
              backgroundColor: 'var(--danger-light)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              color: 'var(--danger)',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Rejection Audit Notice</h4>
                <p style={{ fontSize: '12px', fontWeight: 500 }}><strong>Reason:</strong> {property.rejection_reason}</p>
                <p style={{ fontSize: '11px', color: 'rgba(239, 68, 68, 0.85)', marginTop: '2px' }}>
                  <strong>Remarks:</strong> {property.rejection_remarks || 'None'}
                </p>
              </div>
            </div>
          )}

          {/* Seller profile card */}
          {property.owner ? (
            <div className="card" style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px', borderBottom: '1px solid var(--border-primary)', paddingBottom: '8px' }}>
                Owner Information
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div className="avatar" style={{ width: '40px', height: '40px' }}>
                  {property.owner.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600 }}>{property.owner.full_name}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Profile Type: {property.owner.user_type}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} color="var(--text-muted)" /> {property.owner.phone_number || 'No phone number'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="var(--text-muted)" /> Joined {new Date(property.owner.created_at).toLocaleDateString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setContactTitle(`Notice regarding "${property.title}"`);
                  setContactOpen(true);
                }}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', marginTop: '12px', gap: '6px', justifyContent: 'center' }}
              >
                <Send size={12} /> Contact Owner
              </button>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Owner information not available
            </div>
          )}

          {/* Listing views likes leads counter metrics */}
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Views</span>
                <p style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                  <Eye size={14} color="var(--primary)" /> {property.views || 0}
                </p>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-primary)', height: '36px' }} />
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Likes</span>
                <p style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                  <Heart size={14} color="var(--danger)" /> {property.favorites_count || 0}
                </p>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-primary)', height: '36px' }} />
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Leads</span>
                <p style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                  <MessageSquare size={14} color="var(--success)" /> {leads.length}
                </p>
              </div>
            </div>
          </div>

          {/* Audit trail status history list */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px', borderBottom: '1px solid var(--border-primary)', paddingBottom: '8px' }}>
              Moderation History Trail
            </h3>
            {history.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '16px 0' }}>
                No state modifications recorded yet.
              </div>
            ) : (
              <div className="timeline" style={{ fontSize: '12px' }}>
                {history.map((item) => (
                  <div key={item.id} className="timeline-item">
                    <div className="timeline-marker" style={{ height: '24px', width: '24px' }}>
                      {item.new_status === 'approved' ? (
                        <CheckCircle size={12} color="var(--success)" />
                      ) : (
                        <XCircle size={12} color="var(--danger)" />
                      )}
                    </div>
                    <div className="timeline-content" style={{ padding: '8px 10px' }}>
                      <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {item.new_status} by {item.admin_name}
                      </p>
                      {item.reason && <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}><strong>Reason:</strong> {item.reason}</p>}
                      {item.remarks && <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px' }}>{item.remarks}</p>}
                      <div className="timeline-time" style={{ fontSize: '10px' }}>
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal Box */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', fontWeight: 700 }}>Reject Listing</h3>
              <button onClick={() => setShowRejectModal(false)} style={{ color: 'var(--text-secondary)' }}>
                <XCircle size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Rejection Reason
                </label>
                <select 
                  className="filter-select"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Select Reason">Select Reason</option>
                  <option value="Incomplete details or documentation">Incomplete Details</option>
                  <option value="Inaccurate pricing">Inaccurate Pricing</option>
                  <option value="Inappropriate images or thumbnails">Inappropriate Images</option>
                  <option value="Duplicate property listing">Duplicate Listing</option>
                  <option value="Terms of Service Violation">TOS Violation</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Specific Remarks / Revisions Required
                </label>
                <textarea
                  rows="4"
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  placeholder="Tell the seller what changes they need to make to get approved..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none',
                    resize: 'none',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowRejectModal(false)} 
                disabled={actionLoading}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject} 
                disabled={actionLoading}
                className="btn btn-danger btn-sm"
              >
                Reject Listing
              </button>
            </div>
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

      {/* Contact Owner Custom Modal */}
      {contactOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} color="var(--primary)" /> Send Alert to Seller
              </h3>
              <button 
                type="button"
                onClick={() => setContactOpen(false)} 
                disabled={actionLoading} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSendContactMessage}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Notification Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={contactTitle}
                    onChange={(e) => setContactTitle(e.target.value)}
                    className="filter-select"
                    style={{ width: '100%' }}
                    placeholder="e.g. Action Required: Add interior photos"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Message Body
                  </label>
                  <textarea
                    required
                    value={contactBody}
                    onChange={(e) => setContactBody(e.target.value)}
                    rows={4}
                    placeholder="Type details to alert the property seller about..."
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      resize: 'none',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setContactOpen(false)}
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
                  Send Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PropertyDetails;
