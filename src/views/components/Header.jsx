import React, { useState, useEffect } from 'react';
import { useAuth } from '../../controllers/auth';
import { notificationService } from '../../services/notificationService';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Search,
  CheckCircle,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

const Header = ({ onMenuToggle }) => {
  const { adminProfile, theme, toggleTheme } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // 1. Fetch recent unread notifications
    const fetchNotifications = async () => {
      try {
        const { data, error } = await notificationService.getNotifications(5);

        if (error) throw error;
        setNotifications(data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();

    // 2. Set up realtime subscription to new notifications
    const channel = notificationService.subscribeToNotifications(payload => {
      setNotifications(prev => [payload.new, ...prev.slice(0, 4)]);
    });

    return () => {
      notificationService.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length > 0) {
        await notificationService.markAsRead(unreadIds);

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'property_approval':
      case 'new_property':
        return <CheckCircle size={16} color="var(--primary)" />;
      case 'new_lead':
      case 'lead':
        return <MessageSquare size={16} color="var(--success)" />;
      default:
        return <AlertCircle size={16} color="var(--warning)" />;
    }
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-primary)',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      width: '100%',
      maxWidth: '100%'
    }}>
      {/* Left side: Hamburger (mobile) + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
        <button 
          onClick={onMenuToggle}
          style={{ display: 'none', color: 'var(--text-secondary)' }}
          className="menu-button"
        >
          <Menu size={24} />
        </button>

        <div className="search-input-wrapper" style={{ maxWidth: '360px', width: '100%', minWidth: 0 }}>
          <Search size={16} className="search-icon-fixed" />
          <input 
            type="text" 
            placeholder="Search properties, sellers, leads..." 
            className="search-input" 
          />
        </div>
      </div>

      {/* Right side: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Light/Dark Toggle */}
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Notifications Icon with Popover */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications && unreadCount > 0) markAllAsRead();
            }} 
            className="theme-toggle-btn"
            style={{ position: 'relative' }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                backgroundColor: 'var(--danger)',
                borderRadius: '50%'
              }} />
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {showNotifications && (
            <>
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 9 }} 
                onClick={() => setShowNotifications(false)} 
              />
              <div style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '320px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '12px 0',
                zIndex: 10
              }}>
                <div style={{
                  padding: '4px 16px 10px 16px',
                  borderBottom: '1px solid var(--border-primary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 600 }}>Notifications</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {unreadCount} unread
                  </span>
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif, idx) => (
                      <div 
                        key={idx} 
                        style={{
                          padding: '12px 16px',
                          borderBottom: idx === notifications.length - 1 ? 'none' : '1px solid var(--border-primary)',
                          display: 'flex',
                          gap: '10px',
                          backgroundColor: notif.is_read ? 'transparent' : 'var(--bg-tertiary)',
                          transition: 'background-color var(--transition-fast)'
                        }}
                      >
                        <div style={{ marginTop: '2px' }}>
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '12px', fontWeight: notif.is_read ? 500 : 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                            {notif.title}
                          </p>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                            {notif.body}
                          </p>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-primary)' }} />

        {/* Admin profile detail summary */}
        {adminProfile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
              {adminProfile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="hide-on-mobile">
              <p style={{ fontSize: '12px', fontWeight: 600 }}>{adminProfile.full_name}</p>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>{adminProfile.role}</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .menu-button {
            display: block !important;
          }
          .hide-on-mobile {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          header {
            padding: 0 16px !important;
          }
          .search-input {
            font-size: 12px !important;
            padding-left: 32px !important;
          }
          .search-icon-fixed {
            left: 10px !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
