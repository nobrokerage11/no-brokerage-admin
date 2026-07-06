import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../controllers/auth';
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  ShieldCheck,
  CheckCircle,
  Clock,
  XCircle,
  Star
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, onClose }) => {
  const { adminProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const currentFilter = searchParams.get('filter');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isItemActive = (item) => {
    if (item.to.includes('?')) {
      const parts = item.to.split('?');
      const itemPath = parts[0];
      const itemQuery = new URLSearchParams(parts[1]);
      const itemFilter = itemQuery.get('filter');
      return location.pathname === itemPath && currentFilter === itemFilter;
    }
    // If no query parameters, matches only if path matches and current filter is empty
    if (location.pathname === item.to) {
      return !currentFilter;
    }
    return false;
  };

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    {
      label: 'Property Catalog',
      isHeader: true
    },
    { to: '/properties', icon: <Building2 size={18} />, label: 'All Properties' },
    { to: '/properties?filter=pending', icon: <Clock size={18} />, label: 'Pending Approval' },
    { to: '/properties?filter=approved', icon: <CheckCircle size={18} />, label: 'Approved List' },
    { to: '/properties?filter=rejected', icon: <XCircle size={18} />, label: 'Rejected List' },
    { to: '/properties?filter=featured', icon: <Star size={18} />, label: 'Featured Properties' },
    {
      label: 'Management',
      isHeader: true
    },
    { to: '/users', icon: <Users size={18} />, label: 'Users & Admins' },
    { to: '/leads', icon: <MessageSquare size={18} />, label: 'Enquiries / Leads' },
    {
      label: 'System & Reports',
      isHeader: true
    },
    { to: '/logs', icon: <FileText size={18} />, label: 'Audit Logs' },
    { to: '/settings', icon: <Settings size={18} />, label: 'Settings' }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 49,
            backdropFilter: 'blur(2px)'
          }} 
          onClick={onClose} 
        />
      )}

      <aside 
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-primary)',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transform: isMobileOpen ? 'translateX(0)' : undefined,
          transition: 'transform var(--transition-normal)'
        }}
        className={isMobileOpen ? '' : 'hide-on-mobile'}
      >
        {/* Top Branding Section */}
        <div>
          <div style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            borderBottom: '1px solid var(--border-primary)',
            gap: '10px'
          }}>
            <ShieldCheck size={26} color="var(--primary)" />
            <div>
              <h2 style={{
                fontFamily: 'var(--font-title)',
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, var(--primary), #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                No Brokerage
              </h2>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Admin Console
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav style={{
            padding: '20px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxHeight: 'calc(100vh - 180px)',
            overflowY: 'auto'
          }}>
            {navItems.map((item, idx) => {
              if (item.isHeader) {
                return (
                  <div key={idx} style={{
                    padding: '12px 10px 4px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.05em'
                  }}>
                    {item.label}
                  </div>
                );
              }

              return (
                <NavLink
                  key={idx}
                  to={item.to}
                  style={() => {
                    const active = isItemActive(item);
                    return {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      fontWeight: active ? 600 : 500,
                      color: active ? 'var(--primary)' : 'var(--text-secondary)',
                      backgroundColor: active ? 'var(--primary-glow)' : 'transparent',
                      transition: 'all var(--transition-fast)'
                    };
                  }}
                  className="sidebar-link"
                  onClick={onClose}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Info & Logout */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-primary)'
        }}>
          {adminProfile && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '14px'
            }}>
              <div className="avatar">
                {adminProfile.full_name.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {adminProfile.full_name}
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {adminProfile.role}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'background-color var(--transition-fast)'
            }}
            className="sidebar-logout-btn"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          .hide-on-mobile {
            transform: translateX(-100%);
          }
        }
        .sidebar-link:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary) !important;
        }
        .sidebar-logout-btn:hover {
          background-color: var(--danger-light);
        }
      `}</style>
    </>
  );
};

export default Sidebar;
