import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../controllers/auth';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  Video,
  Trash2,
  Eye,
  Heart,
  Bookmark,
  Play,
  X
} from 'lucide-react';

const Reels = () => {
  const { user, adminProfile, logAction } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reels, setReels] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Confirmation Modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState('info');
  const [pendingAction, setPendingAction] = useState(null);

  const fetchReels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('property_reels')
        .select(`
          *,
          property:properties(id, title, city, price),
          owner:users(id, full_name, phone_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReels(data || []);
    } catch (err) {
      console.error('Error fetching reels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const handleDeleteReel = (reelId, title) => {
    setConfirmTitle('Delete Walkthrough Reel');
    setConfirmMessage(`Are you sure you want to permanently delete the walkthrough reel for "${title || 'this property'}"? This action cannot be undone.`);
    setConfirmType('danger');
    setPendingAction(() => async () => {
      const { error } = await supabase
        .from('property_reels')
        .delete()
        .eq('id', reelId);

      if (error) throw error;

      await logAction(
        user?.id,
        adminProfile?.full_name || 'System',
        'Delete Reel',
        reelId,
        `Permanently deleted walkthrough reel for property "${title}"`
      );
    });
    setConfirmOpen(true);
  };

  const executeConfirmAction = async () => {
    if (!pendingAction) return;
    setLoading(true);
    try {
      await pendingAction();
      setConfirmOpen(false);
      setPendingAction(null);
      await fetchReels();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 className="page-title">Reels Moderation</h1>
        <p className="page-subtitle">Monitor and manage video walkthrough reels uploaded by property owners.</p>
      </div>

      {loading && reels.length === 0 ? (
        <div className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-md)' }} />
      ) : reels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', color: 'var(--text-muted)' }}>
          <Video size={48} style={{ margin: '0 auto 16px auto', opacity: 0.3 }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No Walkthrough Reels</h3>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>No property video reels have been uploaded yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {reels.map((reel) => (
            <div 
              key={reel.id} 
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Thumbnail Container */}
              <div style={{ position: 'relative', height: '320px', backgroundColor: '#000', cursor: 'pointer' }} onClick={() => setSelectedVideo(reel)}>
                <img 
                  src={reel.thumbnail_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=80'} 
                  alt="Reel thumbnail" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                  }}>
                    <Play size={20} fill="#fff" />
                  </div>
                </div>
                <span style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontWeight: 600
                }}>
                  {reel.views_count || 0} views
                </span>
              </div>

              {/* Reel Info */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {reel.property?.title || 'Property Walkthrough'}
                  </h3>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>{reel.property?.city || 'N/A'}</span>
                    <span>•</span>
                    <span>₹{reel.property?.price ? reel.property.price.toLocaleString('en-IN') : 'N/A'}</span>
                  </div>
                  {reel.caption && (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      "{reel.caption}"
                    </p>
                  )}
                </div>

                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-primary)', paddingTop: '12px' }}>
                  {/* Owner info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>By: <strong>{reel.owner?.full_name || 'Owner'}</strong></span>
                    <span>{new Date(reel.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* Reel Stats Row */}
                  <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Heart size={12} /> {reel.likes_count || 0}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Bookmark size={12} /> {reel.saves_count || 0}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={12} /> {reel.views_count || 0}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <button 
                      onClick={() => setSelectedVideo(reel)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, padding: '6px', fontSize: '12px' }}
                    >
                      Watch Video
                    </button>
                    <button 
                      onClick={() => handleDeleteReel(reel.id, reel.property?.title)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '6px 10px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeConfirmAction}
        title={confirmTitle}
        message={confirmMessage}
        type={confirmType}
        isLoading={loading}
        confirmText="Delete Reel"
      />

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '400px', padding: 0, overflow: 'hidden', borderRadius: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-primary)'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{selectedVideo.property?.title || 'Reel Review'}</h3>
              <button 
                type="button" 
                onClick={() => setSelectedVideo(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>
            <video 
              src={selectedVideo.video_url} 
              poster={selectedVideo.thumbnail_url}
              controls 
              autoPlay
              style={{ width: '100%', maxHeight: '550px', display: 'block', backgroundColor: '#000' }}
            />
            {selectedVideo.caption && (
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', fontSize: '13px', fontStyle: 'italic', borderTop: '1px solid var(--border-primary)' }}>
                "{selectedVideo.caption}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reels;
