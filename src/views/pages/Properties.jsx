import React from 'react';
import { Link } from 'react-router-dom';
import { usePropertiesController } from '../../controllers/usePropertiesController';
import { getReviewStatus } from '../../services/propertyService';
import {
  Search,
  Eye,
  Heart,
  MessageSquare,
  Download,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';

const Properties = () => {
  const {
    loading,
    filteredProps,
    paginatedProps,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    cityFilter,
    setCityFilter,
    purposeFilter,
    setPurposeFilter,
    featuredFilter,
    setFeaturedFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    totalPages,
    startIndex,
    itemsPerPage,
    handlePageChange,
    handleExportCSV,
    cities,
    types
  } = usePropertiesController();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-approved">Approved</span>;
      case 'pending':
        return <span className="badge badge-pending">Pending</span>;
      case 'rejected':
        return <span className="badge badge-rejected">Rejected</span>;
      default:
        return <span className="badge badge-disabled">{status || 'inactive'}</span>;
    }
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Property Catalog</h1>
          <p className="page-subtitle">Inspect and moderate listings on the real estate marketplace.</p>
        </div>
        <button onClick={handleExportCSV} className="btn btn-secondary" style={{ gap: '8px' }}>
          <Download size={16} /> Export to CSV
        </button>
      </div>

      {/* 1. Interactive Filters Block */}
      <div className="filters-bar">
        {/* Search */}
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon-fixed" />
          <input 
            type="text" 
            placeholder="Search by Title, City or Seller..." 
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
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        {/* Type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Type:</span>
          <select 
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {types.map((t, idx) => (
              <option key={idx} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* City */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>City:</span>
          <select 
            className="filter-select"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="all">All Cities</option>
            {cities.map((c, idx) => (
              <option key={idx} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Purpose */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Listing:</span>
          <select 
            className="filter-select"
            value={purposeFilter}
            onChange={(e) => setPurposeFilter(e.target.value)}
          >
            <option value="all">Rent & Sale</option>
            <option value="rent">For Rent</option>
            <option value="sale">For Sale</option>
          </select>
        </div>

        {/* Featured */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Featured:</span>
          <select 
            className="filter-select"
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
          >
            <option value="all">All Listings</option>
            <option value="yes">Featured Only</option>
            <option value="no">Non-Featured</option>
          </select>
        </div>
      </div>

      {/* Sorting configuration bar */}
      <div className="sort-bar">
        <div>
          Showing {filteredProps.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredProps.length)} of {filteredProps.length} listings
        </div>
        <div className="sort-options">
          <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
          <span>Sort by:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="created_at">Date Created</option>
            <option value="price">Price</option>
            <option value="views">Views</option>
            <option value="favorites_count">Likes</option>
          </select>
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            className="sort-select"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* 2. Main Properties Table */}
      {loading ? (
        <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-md)' }} />
      ) : (
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Image</th>
                <th>Property Details</th>
                <th>Seller Info</th>
                <th>Listing Info</th>
                <th>Status</th>
                <th>Interactions</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProps.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    No properties match your filter selection.
                  </td>
                </tr>
              ) : (
                paginatedProps.map((prop) => (
                  <tr key={prop.id}>
                    <td>
                      <img 
                        src={prop.images?.[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=80&h=60&q=60'} 
                        alt="Property thumbnail" 
                        style={{
                          width: '56px',
                          height: '42px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid var(--border-primary)'
                        }}
                      />
                    </td>
                    <td>
                      <div>
                        <Link to={`/properties/${prop.id}`} style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '14px' }}>
                          {prop.title}
                        </Link>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          ID: {prop.id.substring(0, 8)}... | {prop.locality}, {prop.city}
                        </p>
                      </div>
                    </td>
                    <td>
                      {prop.owner ? (
                        <div>
                          <p style={{ fontWeight: 500 }}>{prop.owner.full_name}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{prop.owner.phone_number}</p>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600 }}>${prop.price.toLocaleString()}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {prop.property_type} | {prop.is_for_sale ? 'For Sale' : 'For Rent'}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        {getStatusBadge(getReviewStatus(prop))}
                        {prop.is_featured && (
                          <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '9px', padding: '1px 6px' }}>
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Eye size={14} /> {prop.views || 0}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Heart size={14} /> {prop.favorites_count || 0}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MessageSquare size={14} /> {prop.enquiries_count || 0}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/properties/${prop.id}`} className="btn btn-secondary btn-sm">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginTop: '24px' }}>
          <button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            className="btn btn-secondary"
            style={{ padding: '8px 12px' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
            style={{ padding: '8px 12px' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Properties;
