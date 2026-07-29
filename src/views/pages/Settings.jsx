import React, { useState, useEffect } from 'react';
import { useAuth } from '../../controllers/auth';
import { authService } from '../../services/authService';
import { adminService } from '../../services/adminService';
import { systemSettingsService } from '../../services/systemSettingsService';
import { neighborhoodService } from '../../services/neighborhoodService';
import { projectService } from '../../services/projectService';
import {
  User,
  Lock,
  Save,
  Key,
  BarChart3,
  MapPin,
  Plus,
  Trash2,
  Tag,
  FileText,
  Building,
  Compass,
  Image,
  Layers
} from 'lucide-react';

const defaultPropertyTypes = [
  'Apartment',
  'House / Villa',
  'Plot / Land',
  'Commercial',
  'PG / Co-living',
  'Warehouse / Godown',
  'Penthouse',
  'Shop / Showroom',
  'Office Space'
];

const Settings = () => {
  const { user, adminProfile, logAction } = useAuth();
  
  // Profile settings
  const [fullName, setFullName] = useState(adminProfile?.full_name || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password reset settings
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Site Stats settings (Dynamic)
  const [siteStats, setSiteStats] = useState({
    cities_count: 'Serving 3 Cities',
    consultants_count: '100+ Property Consultants',
    sellers_count: '100+ Trusted Sellers',
    buyers_count: '1000+ Active Buyers'
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Office Branches settings (Dynamic)
  const [branches, setBranches] = useState([
    { id: 1, city: 'Ghazipur', title: 'Corporate Branch 1', address: 'Baxupur Ghazipur Uttar Pradesh Near Allahabad Bank' },
    { id: 2, city: 'Varanasi', title: 'Corporate Branch 2', address: 'Paharia Varanasi Uttarpradesh' },
    { id: 3, city: 'Lucknow', title: 'Corporate Branch 3', address: 'Gomtinagar Extension Lucknow' }
  ]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  // Property Types settings (Dynamic)
  const [propertyTypes, setPropertyTypes] = useState(defaultPropertyTypes);
  const [typesLoading, setTypesLoading] = useState(false);
  const [newTypeInput, setNewTypeInput] = useState('');

  // Legal & Content Documents
  const [aboutUsText, setAboutUsText] = useState('');
  const [termsText, setTermsText] = useState('');
  const [privacyText, setPrivacyText] = useState('');
  const [legalLoading, setLegalLoading] = useState(false);

  // Trending Neighborhoods
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [newNeighName, setNewNeighName] = useState('');
  const [newNeighCity, setNewNeighCity] = useState('Varanasi');
  const [newNeighGrowth, setNewNeighGrowth] = useState('+12.5%');

  // New Projects
  const [projects, setProjects] = useState([]);
  const [newProjName, setNewProjName] = useState('');
  const [newProjBuilder, setNewProjBuilder] = useState('');
  const [newProjCity, setNewProjCity] = useState('Lucknow');
  const [newProjPrice, setNewProjPrice] = useState('₹45 Lakhs Onwards');

  useEffect(() => {
    fetchSystemSettings();
  }, []);

  const fetchSystemSettings = async () => {
    try {
      const { data: statsData } = await systemSettingsService.getSetting('site_stats');
      if (statsData?.value) setSiteStats(statsData.value);

      const { data: branchData } = await systemSettingsService.getSetting('office_branches');
      if (branchData?.value && Array.isArray(branchData.value)) setBranches(branchData.value);

      const { data: typeData } = await systemSettingsService.getSetting('property_types');
      if (typeData?.value && Array.isArray(typeData.value)) setPropertyTypes(typeData.value);

      const { data: aboutData } = await systemSettingsService.getSetting('about_us');
      if (aboutData?.value) setAboutUsText(aboutData.value);

      const { data: termsData } = await systemSettingsService.getSetting('terms_conditions');
      if (termsData?.value) setTermsText(termsData.value);

      const { data: privacyData } = await systemSettingsService.getSetting('privacy_policy');
      if (privacyData?.value) setPrivacyText(privacyData.value);

      const { data: neighData } = await neighborhoodService.getNeighborhoods();
      if (neighData) setNeighborhoods(neighData);

      const { data: projData } = await projectService.getProjects();
      if (projData) setProjects(projData);
    } catch (err) {
      console.error('Error fetching system settings:', err);
    }
  };

  const handleAddNeighborhood = async (e) => {
    e.preventDefault();
    if (!newNeighName.trim()) return;
    const { data, error } = await neighborhoodService.createNeighborhood({
      name: newNeighName.trim(),
      city: newNeighCity,
      price_growth: newNeighGrowth,
      image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80'
    });
    if (!error && data) {
      setNeighborhoods([...neighborhoods, ...data]);
      setNewNeighName('');
      alert('Neighborhood added!');
    }
  };

  const handleDeleteNeighborhood = async (id) => {
    const { error } = await neighborhoodService.deleteNeighborhood(id);
    if (!error) {
      setNeighborhoods(neighborhoods.filter(n => n.id !== id));
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProjName.trim() || !newProjBuilder.trim()) return;
    const { data, error } = await projectService.createProject({
      project_name: newProjName.trim(),
      builder_name: newProjBuilder.trim(),
      city: newProjCity,
      starting_price: newProjPrice,
      image_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80'
    });
    if (!error && data) {
      setProjects([...projects, ...data]);
      setNewProjName('');
      setNewProjBuilder('');
      alert('New Project added!');
    }
  };

  const handleDeleteProject = async (id) => {
    const { error } = await projectService.deleteProject(id);
    if (!error) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setProfileLoading(true);
    try {
      const { error } = await adminService.updateAdminProfile(user?.id, fullName.trim());
      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.message || 'Error updating profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await authService.updatePassword(newPassword);
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      alert('Password updated successfully!');
    } catch (err) {
      alert(err.message || 'Error updating password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveLegalSettings = async (e) => {
    e.preventDefault();
    setLegalLoading(true);
    try {
      await systemSettingsService.updateSetting('about_us', aboutUsText);
      await systemSettingsService.updateSetting('terms_conditions', termsText);
      await systemSettingsService.updateSetting('privacy_policy', privacyText);
      alert('Legal & About Us content updated live!');
    } catch (err) {
      alert(err.message || 'Error saving legal content');
    } finally {
      setLegalLoading(false);
    }
  };

  return (
    <div className="page-body" style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
      <h1 className="page-title">Console & Platform Settings</h1>
      <p className="page-subtitle">Manage platform metrics, property categories, trending localities, new projects, legal documents, and security.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Trending Neighborhoods, New Projects, Legal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Trending Neighborhoods Manager */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <Compass size={18} /> Trending Neighborhoods & Localities
            </h3>
            <form onSubmit={handleAddNeighborhood} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Locality (e.g. Assi Ghat)"
                value={newNeighName}
                onChange={(e) => setNewNeighName(e.target.value)}
                style={{ padding: '8px 10px', fontSize: '12px' }}
                required
              />
              <select 
                value={newNeighCity} 
                onChange={(e) => setNewNeighCity(e.target.value)}
                style={{ padding: '8px 10px', fontSize: '12px' }}
              >
                <option value="Ghazipur">Ghazipur</option>
                <option value="Varanasi">Varanasi</option>
                <option value="Lucknow">Lucknow</option>
              </select>
              <input
                type="text"
                placeholder="Growth (e.g. +15.1%)"
                value={newNeighGrowth}
                onChange={(e) => setNewNeighGrowth(e.target.value)}
                style={{ padding: '8px 10px', fontSize: '12px' }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={14} /> Add
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {neighborhoods.map((n) => (
                <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-primary)' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{n.name}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>({n.city} • {n.price_growth || '+12.5%'})</span>
                  </div>
                  <button type="button" onClick={() => handleDeleteNeighborhood(n.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* New Projects Manager */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <Building size={18} /> Builder New Projects
            </h3>
            <form onSubmit={handleAddProject} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Project Name (e.g. Skyline Towers)"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '12px' }}
                  required
                />
                <input
                  type="text"
                  placeholder="Builder Name (e.g. Apex Group)"
                  value={newProjBuilder}
                  onChange={(e) => setNewProjBuilder(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '12px' }}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px' }}>
                <select 
                  value={newProjCity} 
                  onChange={(e) => setNewProjCity(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '12px' }}
                >
                  <option value="Ghazipur">Ghazipur</option>
                  <option value="Varanasi">Varanasi</option>
                  <option value="Lucknow">Lucknow</option>
                </select>
                <input
                  type="text"
                  placeholder="Price (e.g. ₹45L Onwards)"
                  value={newProjPrice}
                  onChange={(e) => setNewProjPrice(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '12px' }}
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Add Project
                </button>
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {projects.map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-primary)' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{p.project_name}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>by {p.builder_name} ({p.city} • {p.starting_price})</span>
                  </div>
                  <button type="button" onClick={() => handleDeleteProject(p.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Documents & About Us Editor Card */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <FileText size={18} /> Legal Pages & About Us (Mobile App & Web)
            </h3>
            <form onSubmit={handleSaveLegalSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  About Us Overview Text
                </label>
                <textarea 
                  rows={3} 
                  value={aboutUsText} 
                  onChange={(e) => setAboutUsText(e.target.value)}
                  placeholder="Company overview, vision, and mission..."
                  style={{ width: '100%', padding: '8px 12px', resize: 'vertical' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Terms & Conditions Text
                </label>
                <textarea 
                  rows={4} 
                  value={termsText} 
                  onChange={(e) => setTermsText(e.target.value)}
                  placeholder="Full terms and conditions policy content..."
                  style={{ width: '100%', padding: '8px 12px', resize: 'vertical' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Privacy Policy Text
                </label>
                <textarea 
                  rows={4} 
                  value={privacyText} 
                  onChange={(e) => setPrivacyText(e.target.value)}
                  placeholder="Full privacy policy document content..."
                  style={{ width: '100%', padding: '8px 12px', resize: 'vertical' }}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={legalLoading}
                className="btn btn-primary btn-sm"
                style={{ alignSelf: 'flex-start', gap: '6px', marginTop: '6px' }}
              >
                <Save size={14} /> {legalLoading ? 'Saving...' : 'Save Legal & About Content'}
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Profile & Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Admin Profile Card */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} color="var(--primary)" /> Administrator Profile
            </h3>
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input 
                  type="text" 
                  value={adminProfile?.email || ''} 
                  disabled
                  style={{ backgroundColor: 'var(--bg-tertiary)', cursor: 'not-allowed', width: '100%', padding: '8px 12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Full Name / Display Name
                </label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px' }}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={profileLoading}
                className="btn btn-primary btn-sm"
                style={{ alignSelf: 'flex-start', gap: '6px' }}
              >
                <Save size={14} /> {profileLoading ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Password Card */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} color="var(--primary)" /> Change Password
            </h3>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  New Password
                </label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  style={{ width: '100%', padding: '8px 12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Confirm New Password
                </label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  required
                  style={{ width: '100%', padding: '8px 12px' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={passwordLoading}
                className="btn btn-primary btn-sm"
                style={{ alignSelf: 'flex-start', gap: '6px' }}
              >
                <Key size={14} /> {passwordLoading ? 'Resetting...' : 'Change Password'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Settings;
