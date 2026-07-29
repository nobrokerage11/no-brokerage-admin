import React, { useState, useEffect } from 'react';
import { blogService } from '../../services/blogService';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  User,
  X,
  Search,
  Image as ImageIcon
} from 'lucide-react';

const BlogsAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    author: 'NoBrokerage Team',
    category: 'Market Insights',
    read_time: '4 min read',
    cover_image_url: '',
    excerpt: '',
    content: '',
    is_published: true
  });
  const [saving, setSaving] = useState(false);

  // Confirmation Modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await blogService.getBlogs();
      if (error) throw error;
      setBlogs(data || []);
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title || '',
        slug: blog.slug || '',
        author: blog.author || 'NoBrokerage Team',
        category: blog.category || 'Market Insights',
        read_time: blog.read_time || '4 min read',
        cover_image_url: blog.cover_image_url || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        is_published: blog.is_published ?? true
      });
    } else {
      setEditingBlog(null);
      setFormData({
        title: '',
        slug: '',
        author: 'NoBrokerage Team',
        category: 'Market Insights',
        read_time: '4 min read',
        cover_image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
        excerpt: '',
        content: '',
        is_published: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Please fill in title and content.');
      return;
    }

    setSaving(true);
    try {
      if (editingBlog) {
        const { error } = await blogService.updateBlog(editingBlog.id, formData);
        if (error) throw error;
      } else {
        const { error } = await blogService.createBlog(formData);
        if (error) throw error;
      }

      setIsModalOpen(false);
      await fetchBlogs();
    } catch (err) {
      alert(err.message || 'Failed to save blog post.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (blog) => {
    try {
      await blogService.toggleBlogStatus(blog.id, !blog.is_published);
      await fetchBlogs();
    } catch (err) {
      alert(err.message || 'Failed to toggle status.');
    }
  };

  const handleDeleteBlog = (blog) => {
    setConfirmTitle('Delete Blog Article');
    setConfirmMessage(`Are you sure you want to permanently delete "${blog.title}"?`);
    setPendingAction(() => async () => {
      const { error } = await blogService.deleteBlog(blog.id);
      if (error) throw error;
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
      await fetchBlogs();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs = blogs.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-body" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Blog Articles</h1>
          <p className="page-subtitle">Publish and edit property guides, market updates, and investment articles.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Write New Article
        </button>
      </div>

      {/* Search filter bar */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search blogs by title, category, author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
        </div>
      </div>

      {loading && blogs.length === 0 ? (
        <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-md)' }} />
      ) : filteredBlogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', color: 'var(--text-muted)' }}>
          <FileText size={48} style={{ margin: '0 auto 16px auto', opacity: 0.3 }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No Blog Articles Found</h3>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Click "Write New Article" to publish real estate blogs.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredBlogs.map((blog) => (
            <div
              key={blog.id}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div>
                <div style={{ height: '160px', backgroundColor: 'var(--bg-tertiary)', position: 'relative', overflow: 'hidden' }}>
                  {blog.cover_image_url ? (
                    <img src={blog.cover_image_url} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600
                  }}>
                    {blog.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(blog)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: blog.is_published ? '#22c55e' : '#ef4444',
                      color: '#fff'
                    }}
                  >
                    {blog.is_published ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {blog.is_published ? 'Published' : 'Draft'}
                  </button>
                </div>

                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {blog.title}
                  </h3>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={12} /> {blog.author}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {blog.read_time}
                    </span>
                  </div>

                  {blog.excerpt && (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '10px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {blog.excerpt}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', borderTop: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-primary)' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleOpenModal(blog)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Edit size={14} /> Edit Article
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteBlog(blog)}
                  style={{ padding: '6px 10px' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '640px', padding: 0, borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-primary)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                {editingBlog ? 'Edit Blog Article' : 'Write New Blog Article'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '80vh', overflowY: 'auto' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Article Title *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Top 5 Property Investment Hotspots in Lucknow 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Category</label>
                  <select
                    className="input-field"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Market Insights">Market Insights</option>
                    <option value="Selling Guide">Selling Guide</option>
                    <option value="Home Buying">Home Buying</option>
                    <option value="Legal & Finance">Legal & Finance</option>
                    <option value="Infrastructure">Infrastructure</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Author Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Real Estate Expert"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Read Time</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 5 min read"
                    value={formData.read_time}
                    onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Cover Image URL</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.cover_image_url}
                    onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Short Excerpt</label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Brief summary displayed on article preview cards..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Full Article Content *</label>
                <textarea
                  className="input-field"
                  rows={6}
                  placeholder="Write full article body text..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="is_published_cb"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                />
                <label htmlFor="is_published_cb" style={{ fontSize: '13px', cursor: 'pointer' }}>Publish Immediately</label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingBlog ? 'Update Article' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeConfirmAction}
        title={confirmTitle}
        message={confirmMessage}
        type="danger"
        isLoading={loading}
        confirmText="Delete"
      />
    </div>
  );
};

export default BlogsAdmin;
