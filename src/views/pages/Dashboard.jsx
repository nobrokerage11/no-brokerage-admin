import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboardController } from '../../controllers/useDashboardController';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  Building2,
  Users,
  MessageSquare,
  Eye,
  Heart,
  CheckCircle,
  Clock,
  Star,
  Activity,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        padding: '10px 14px',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-lg)',
        fontSize: '12px',
        zIndex: 50
      }}>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>{label}</p>
        {payload.map((pld, idx) => (
          <p key={idx} style={{ color: pld.color || 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', margin: '2px 0' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: pld.color || 'var(--primary)', display: 'inline-block' }} />
            {pld.name}: {pld.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const {
    loading,
    stats,
    pendingProperties,
    recentLogs,
    chartsData,
    confirmOpen,
    setConfirmOpen,
    confirmTitle,
    confirmMessage,
    confirmType,
    handleQuickApprove,
    executeConfirmAction,
    fetchDashboardData
  } = useDashboardController();


  if (loading) {
    return (
      <div className="page-body">
        <div className="skeleton skeleton-title" style={{ width: '200px' }} />
        <div className="skeleton skeleton-text" style={{ width: '350px', marginBottom: '32px' }} />
        <div className="stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '24px' }}>
          <div className="skeleton" style={{ height: '300px' }} />
          <div className="skeleton" style={{ height: '300px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Overview Dashboard</h1>
          <p className="page-subtitle">Real-time statistics and administrative insights.</p>
        </div>
        <button onClick={fetchDashboardData} className="btn btn-secondary">
          Refresh Data
        </button>
      </div>

      {/* 1. Stat Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Properties</span>
            <div className="stat-icon"><Building2 size={18} /></div>
          </div>
          <span className="stat-value">{stats.totalProperties}</span>
          <div className="stat-footer">
            <span className="trend-badge trend-up"><TrendingUp size={12} /> +12%</span>
            <span style={{ color: 'var(--text-muted)' }}>all time</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Pending Approval</span>
            <div className="stat-icon" style={{ color: 'var(--warning)' }}><Clock size={18} /></div>
          </div>
          <span className="stat-value" style={{ color: 'var(--warning)' }}>{stats.pendingPropertiesCount}</span>
          <div className="stat-footer">
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Requires attention</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Approved List</span>
            <div className="stat-icon" style={{ color: 'var(--success)' }}><CheckCircle size={18} /></div>
          </div>
          <span className="stat-value" style={{ color: 'var(--success)' }}>{stats.approvedProperties}</span>
          <div className="stat-footer">
            <span style={{ color: 'var(--text-muted)' }}>publicly listed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Leads / Enquiries</span>
            <div className="stat-icon"><MessageSquare size={18} /></div>
          </div>
          <span className="stat-value">{stats.totalLeads}</span>
          <div className="stat-footer">
            <span className="trend-badge trend-up"><TrendingUp size={12} /> {stats.todayLeads} new</span>
            <span style={{ color: 'var(--text-muted)' }}>created today</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Platform Users</span>
            <div className="stat-icon"><Users size={18} /></div>
          </div>
          <span className="stat-value">{stats.totalUsers}</span>
          <div className="stat-footer">
            <span className="trend-badge trend-up"><TrendingUp size={12} /> {stats.todayNewUsers} new</span>
            <span style={{ color: 'var(--text-muted)' }}>today</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Views / Interactions</span>
            <div className="stat-icon" style={{ color: '#818cf8' }}><Eye size={18} /></div>
          </div>
          <span className="stat-value">{stats.totalViews}</span>
          <div className="stat-footer">
            <span style={{ color: 'var(--text-muted)' }}>cumulative page views</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Favorites / Likes</span>
            <div className="stat-icon" style={{ color: 'var(--danger)' }}><Heart size={18} /></div>
          </div>
          <span className="stat-value" style={{ color: 'var(--danger)' }}>{stats.totalLikes}</span>
          <div className="stat-footer">
            <span style={{ color: 'var(--text-muted)' }}>saved by buyers</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Brokerage Fees Saved</span>
            <div className="stat-icon" style={{ color: '#10b981' }}><Star size={18} /></div>
          </div>
          <span className="stat-value" style={{ fontFamily: 'var(--font-sans)' }}>{stats.brokerageSaved}</span>
          <div className="stat-footer">
            <span style={{ color: 'var(--text-muted)' }}>estimated 2% platform fee saved</span>
          </div>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Uploads Trend */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Property Upload Trend</h3>
          <div style={{ height: '240px' }}>
            {chartsData.uploadTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartsData.uploadTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} dy={8} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} dx={-4} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Properties" stroke="var(--primary)" fillOpacity={1} fill="url(#colorProp)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data available</div>
            )}
          </div>
        </div>

        {/* City Wise Properties */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Top Performing Cities</h3>
          <div style={{ height: '240px' }}>
            {chartsData.cityData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData.cityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)"/>
                      <stop offset="100%" stopColor="#818cf8"/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} dy={8} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} dx={-4} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="properties" name="Properties" fill="url(#colorBar)" barSize={24} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data available</div>
            )}
          </div>
        </div>

        {/* Approval Ratio (Pie) */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Approval Ratio</h3>
          <div style={{ height: '240px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {chartsData.approvalData?.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartsData.approvalData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartsData.approvalData.map((entry, index) => {
                      let color = 'var(--primary)';
                      if (entry.name === 'Approved') color = 'var(--success)';
                      else if (entry.name === 'Pending') color = 'var(--warning)';
                      else if (entry.name === 'Needs Revision') color = 'var(--danger)';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '20px', fontWeight: 700, fill: 'var(--text-primary)' }}>
                    {stats.totalProperties}
                  </text>
                  <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '11px', fill: 'var(--text-secondary)', fontWeight: 500 }}>
                    Total Listings
                  </text>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle" 
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>No properties in database</div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Lower Grid: Pending Properties + Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '20px' }}>
        {/* Pending approvals */}
        <div className="card" style={{ flex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Properties Pending Approval</h3>
            <Link to="/properties?filter=pending" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {pendingProperties.length === 0 ? (
              <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                All clear! No properties pending moderation.
              </div>
            ) : (
              <table className="premium-table" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>City</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingProperties.map((prop) => (
                    <tr key={prop.id}>
                      <td style={{ fontWeight: 600 }}>
                        <Link to={`/properties/${prop.id}`} style={{ color: 'var(--primary)', hover: { textDecoration: 'underline' } }}>
                          {prop.title}
                        </Link>
                      </td>
                      <td>{prop.city}</td>
                      <td>${prop.price.toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleQuickApprove(prop.id, prop.title)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 8px', borderRadius: '4px' }}
                          >
                            Approve
                          </button>
                          <Link
                            to={`/properties/${prop.id}`}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', borderRadius: '4px' }}
                          >
                            Review
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Audit Logs Timeline */}
        <div className="card" style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Recent Activities</h3>
            <Link to="/logs" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
              View Logs <ChevronRight size={14} />
            </Link>
          </div>

          <div className="timeline">
            {recentLogs.length === 0 ? (
              <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No recent actions recorded.
              </div>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="timeline-item">
                  <div className="timeline-marker">
                    <Activity size={14} color="var(--primary)" />
                  </div>
                  <div className="timeline-content">
                    <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>
                      <strong style={{ fontWeight: 600 }}>{log.admin_name}</strong>: {log.action} ({log.target || 'System'})
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {log.details}
                    </p>
                    <div className="timeline-time">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
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
    </div>
  );
};

export default Dashboard;
