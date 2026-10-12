import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatsController } from '../../controllers/useChatsController';
import {
  Search,
  MessageSquare,
  Building2,
  MapPin,
  ExternalLink,
  Clock,
  AlertCircle,
  Eye,
  ChevronRight
} from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=300&q=80';

const Chats = () => {
  const navigate = useNavigate();
  const {
    loading,
    filteredChats,
    selectedChat,
    setSelectedChat,
    messages,
    messagesLoading,
    search,
    setSearch
  } = useChatsController();

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages when new ones arrive or chat changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messagesLoading]);

  // Helper to format timestamp
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Helper to render message content with media support
  const renderMessageContent = (content) => {
    if (content && content.startsWith('[IMAGE]')) {
      const url = content.replace('[IMAGE]', '').trim();
      return (
        <div style={{ marginTop: '4px' }}>
          <img 
            src={url} 
            alt="Sent attachment" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '200px', 
              borderRadius: 'var(--radius-sm)', 
              cursor: 'pointer',
              objectFit: 'cover'
            }}
            onClick={() => window.open(url, '_blank')}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      );
    }
    return <p style={{ fontSize: '13px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{content}</p>;
  };

  return (
    <div className="page-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--header-height))', overflow: 'hidden' }}>
      {/* Top Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', shrink: 0 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Communication Audit
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Monitor and audit property enquiries and chat discussions between customers.
          </p>
        </div>
        <div style={{
          backgroundColor: 'var(--primary-glow)',
          color: 'var(--primary)',
          fontSize: '12px',
          fontWeight: 600,
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Eye size={14} />
          <span>Audit Mode (Read Only)</span>
        </div>
      </div>

      {/* Main Container */}
      <div style={{
        display: 'flex',
        flex: 1,
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-primary)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
        minHeight: 0
      }}>
        {/* Left Sidebar - Chat List */}
        <div style={{
          width: '320px',
          borderRight: '1px solid var(--border-primary)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          {/* Search bar */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-primary)', shrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search by buyer, seller, property..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  fontSize: '13px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              />
              <Search 
                size={16} 
                color="var(--text-muted)" 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} 
              />
            </div>
          </div>

          {/* Chat List Container */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }} className="custom-scroll">
            {loading ? (
              // Skeleton Loading
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} style={{ padding: '16px', display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-primary)', opacity: 0.6 }}>
                  <div className="skeleton" style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', shrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div className="skeleton" style={{ width: '60%', height: '14px', borderRadius: '4px' }} />
                    <div className="skeleton" style={{ width: '80%', height: '12px', borderRadius: '4px' }} />
                  </div>
                </div>
              ))
            ) : filteredChats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <AlertCircle size={28} style={{ margin: '0 auto 12px auto', display: 'block' }} />
                <p style={{ fontSize: '13px', fontWeight: 500 }}>No reported conversations</p>
                <p style={{ fontSize: '11px', marginTop: '2px' }}>Chats between owners and buyers are private. A conversation appears here only after one of them reports it.</p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isActive = selectedChat?.id === chat.id;
                const propImage = chat.property?.images && chat.property.images.length > 0 
                  ? chat.property.images[0] 
                  : FALLBACK_IMAGE;

                return (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      gap: '12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-primary)',
                      backgroundColor: isActive ? 'var(--primary-glow)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                      transition: 'all var(--transition-fast)'
                    }}
                    className="chat-list-item"
                  >
                    {/* Property Thumbnail */}
                    <img 
                      src={propImage} 
                      alt={chat.property?.title || 'Property'} 
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-sm)',
                        objectFit: 'cover',
                        border: '1px solid var(--border-primary)',
                        flexShrink: 0
                      }}
                      onError={(e) => {
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />

                    {/* Chat Text Details */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                        <h4 style={{ 
                          fontSize: '13px', 
                          fontWeight: 600, 
                          color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          margin: 0
                        }}>
                          {chat.property?.title || 'Property Listing'}
                        </h4>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', shrink: 0 }}>
                          {formatDate(chat.created_at)}
                        </span>
                      </div>
                      
                      {/* Buyer -> Seller Indicator */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {chat.buyer?.full_name || 'Anonymous'}
                        </span>
                        <ChevronRight size={10} color="var(--text-muted)" style={{ shrink: 0 }} />
                        <span style={{ fontWeight: 500, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {chat.seller?.full_name || 'Owner'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Message Pane */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-primary)',
          position: 'relative'
        }}>
          {selectedChat ? (
            <>
              {/* Selected Chat Header */}
              <div style={{
                padding: '16px 24px',
                backgroundColor: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'var(--shadow-sm)',
                shrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                  <Building2 size={20} color="var(--primary)" style={{ shrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedChat.property?.title || 'Property Listing'}
                      {(selectedChat.reports || []).map((report) => (
                        <span key={report.id} className="badge badge-rejected" style={{ marginLeft: '8px' }} title={new Date(report.created_at).toLocaleString()}>
                          Reported: {report.reason}
                        </span>
                      ))}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={10} />
                        {selectedChat.property?.city || 'N/A'}
                      </span>
                      <span>•</span>
                      <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                        ₹{selectedChat.property?.price ? selectedChat.property.price.toLocaleString('en-IN') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Header Action Button */}
                <button
                  onClick={() => navigate(`/properties/${selectedChat.property_id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    backgroundColor: 'var(--primary-glow)',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'all var(--transition-fast)'
                  }}
                  className="view-property-btn"
                >
                  <span>View Property</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              {/* Chat Parties Subheader Banner */}
              <div style={{
                padding: '10px 24px',
                backgroundColor: 'var(--bg-tertiary)',
                borderBottom: '1px solid var(--border-primary)',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                shrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                  <span>Buyer: <strong>{selectedChat.buyer?.full_name || 'Anonymous'}</strong> ({selectedChat.buyer?.phone_number || 'No Phone'})</span>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>➔</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                  <span>Seller: <strong>{selectedChat.seller?.full_name || 'Owner'}</strong> ({selectedChat.seller?.phone_number || 'No Phone'})</span>
                </div>
              </div>

              {/* Messages History List */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }} className="custom-scroll">
                {messagesLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', marginBottom: '12px' }} />
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Loading conversation audit...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    <MessageSquare size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
                    <p style={{ fontSize: '13px', fontWeight: 500 }}>No messages exchanged yet</p>
                    <p style={{ fontSize: '11px', marginTop: '2px' }}>This conversation has no dialogue records.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isBuyer = msg.sender_id === selectedChat.buyer_id;
                    const senderName = isBuyer 
                      ? selectedChat.buyer?.full_name || 'Buyer' 
                      : selectedChat.seller?.full_name || 'Seller';

                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignSelf: isBuyer ? 'flex-start' : 'flex-end',
                          maxWidth: '70%',
                          alignItems: isBuyer ? 'flex-start' : 'flex-end'
                        }}
                      >
                        {/* Name and role label */}
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 600, 
                          color: 'var(--text-secondary)',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {senderName}
                          <span style={{ 
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            backgroundColor: isBuyer ? 'rgba(99, 102, 241, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                            color: isBuyer ? 'var(--primary)' : 'var(--success)'
                          }}>
                            {isBuyer ? 'Buyer' : 'Seller'}
                          </span>
                        </span>

                        {/* Content bubble */}
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          borderTopLeftRadius: isBuyer ? '2px' : 'var(--radius-md)',
                          borderTopRightRadius: !isBuyer ? '2px' : 'var(--radius-md)',
                          backgroundColor: isBuyer ? 'var(--bg-secondary)' : 'var(--primary)',
                          color: isBuyer ? 'var(--text-primary)' : '#ffffff',
                          border: isBuyer ? '1px solid var(--border-primary)' : 'none',
                          boxShadow: 'var(--shadow-sm)'
                        }}>
                          {renderMessageContent(msg.content)}
                        </div>

                        {/* Time */}
                        <span style={{ 
                          fontSize: '10px', 
                          color: 'var(--text-muted)', 
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <Clock size={10} />
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Read only info footer */}
              <div style={{
                padding: '12px 24px',
                backgroundColor: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                fontWeight: 500,
                shrink: 0
              }}>
                <Eye size={14} />
                <span>Audit Console: Direct conversation viewing only. Direct messaging is disabled.</span>
              </div>
            </>
          ) : (
            // No chat selected state
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: '40px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-glow) 0%, rgba(167, 139, 250, 0.15) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                marginBottom: '16px',
                boxShadow: 'var(--shadow-glow)'
              }}>
                <MessageSquare size={28} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Select a Conversation
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '320px', marginTop: '6px', lineHeight: 1.5 }}>
                Choose a dialogue from the left sidebar to audit messages exchanged between property buyer and owner.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: var(--border-primary);
          border-radius: var(--radius-full);
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }
        .chat-list-item:hover {
          background-color: var(--bg-tertiary) !important;
        }
        .view-property-btn:hover {
          background-color: var(--primary);
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
};

export default Chats;
