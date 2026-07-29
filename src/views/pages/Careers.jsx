import React, { useState, useEffect } from 'react';
import { careerService } from '../../services/careerService';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  MapPin,
  DollarSign,
  X,
  Search
} from 'lucide-react';

const CareersAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [careers, setCareers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    location: 'Lucknow',
    salary_range: '',
    job_type: 'Full-time',
    department: 'Sales',
    description: '',
    requirements: '',
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  // Confirmation Modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  const fetchCareers = async () => {
    setLoading(true);
    try {
      const { data, error } = await careerService.getCareers();
      if (error) throw error;
      setCareers(data || []);
    } catch (err) {
      console.error('Error fetching careers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  const handleOpenModal = (career = null) => {
    if (career) {
      setEditingCareer(career);
      setFormData({
        title: career.title || '',
        location: career.location || 'Lucknow',
        salary_range: career.salary_range || '',
        job_type: career.job_type || 'Full-time',
        department: career.department || 'Sales',
        description: career.description || '',
        requirements: Array.isArray(career.requirements) ? career.requirements.join('\n') : (career.requirements || ''),
        is_active: career.is_active ?? true
      });
    } else {
      setEditingCareer(null);
      setFormData({
        title: '',
        location: 'Lucknow',
        salary_range: '',
        job_type: 'Full-time',
        department: 'Sales',
        description: '',
        requirements: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveCareer = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.location || !formData.salary_range) {
      alert('Please fill in title, location, and salary range.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        location: formData.location,
        salary_range: formData.salary_range,
        job_type: formData.job_type,
        department: formData.department,
        description: formData.description,
        requirements: formData.requirements ? formData.requirements.split('\n').filter(r => r.trim()) : [],
        is_active: formData.is_active
      };

      if (editingCareer) {
        const { error } = await careerService.updateCareer(editingCareer.id, payload);
        if (error) throw error;
      } else {
        const { error } = await careerService.createCareer(payload);
        if (error) throw error;
      }

      setIsModalOpen(false);
      await fetchCareers();
    } catch (err) {
      alert(err.message || 'Failed to save career opening.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (career) => {
    try {
      await careerService.toggleCareerStatus(career.id, !career.is_active);
      await fetchCareers();
    } catch (err) {
      alert(err.message || 'Failed to toggle status.');
    }
  };

  const handleDeleteCareer = (career) => {
    setConfirmTitle('Delete Job Opening');
    setConfirmMessage(`Are you sure you want to permanently delete "${career.title}"?`);
    setPendingAction(() => async () => {
      const { error } = await careerService.deleteCareer(career.id);
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
      await fetchCareers();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredCareers = careers.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-body" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Careers Management</h1>
          <p className="page-subtitle">Manage job openings and recruitment listings displayed on the web platform.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Post New Job
        </button>
      </div>

      {/* Search filter bar */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by job title, location, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
        </div>
      </div>

      {loading && careers.length === 0 ? (
        <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-md)' }} />
      ) : filteredCareers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', color: 'var(--text-muted)' }}>
          <Briefcase size={48} style={{ margin: '0 auto 16px auto', opacity: 0.3 }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No Job Openings Found</h3>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Click "Post New Job" to create your first recruitment listing.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredCareers.map((career) => (
            <div
              key={career.id}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                    {career.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(career)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: career.is_active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: career.is_active ? '#22c55e' : '#ef4444'
                    }}
                  >
                    {career.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {career.is_active ? 'Active' : 'Draft'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="var(--primary)" /> {career.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <DollarSign size={14} color="#22c55e" /> {career.salary_range}
                  </span>
                  <span style={{ backgroundColor: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                    {career.department} • {career.job_type}
                  </span>
                </div>

                {career.description && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '14px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {career.description}
                  </p>
                )}

                {career.requirements && career.requirements.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Key Requirements:</span>
                    <ul style={{ margin: '6px 0 0 16px', padding: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {career.requirements.slice(0, 3).map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '20px', borderTop: '1px solid var(--border-primary)', paddingTop: '14px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleOpenModal(career)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Edit size={14} /> Edit Job
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteCareer(career)}
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
          <div className="modal-content" style={{ maxWidth: '520px', padding: 0, borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-primary)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                {editingCareer ? 'Edit Job Opening' : 'Post New Job Opening'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCareer} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Job Title *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Tele-Caller Real Estate ( Female Only )"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>City / Location *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Lucknow"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Salary Range *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 18000 - 25000"
                    value={formData.salary_range}
                    onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Department</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Sales / Tele-Sales"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Job Type</label>
                  <select
                    className="input-field"
                    value={formData.job_type}
                    onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Job Description</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Detailed description of responsibilities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Key Requirements (One per line)</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="0-2 years experience&#10;Excellent Hindi & English communication"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="is_active_cb"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active_cb" style={{ fontSize: '13px', cursor: 'pointer' }}>Publish Immediately (Active)</label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingCareer ? 'Update Job' : 'Create Job'}
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

export default CareersAdmin;
