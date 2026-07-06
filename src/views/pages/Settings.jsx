import React, { useState } from 'react';
import { useAuth } from '../../controllers/auth';
import { authService } from '../../services/authService';
import { adminService } from '../../services/adminService';
import {
  User,
  Lock,
  Building,
  Save,
  Key
} from 'lucide-react';

const Settings = () => {
  const { user, adminProfile, logAction } = useAuth();
  
  // Profile settings
  const [fullName, setFullName] = useState(adminProfile?.full_name || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password reset settings
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Company settings
  const [companyName, setCompanyName] = useState('No Brokerage Real Estate Inc.');
  const [companyEmail, setCompanyEmail] = useState('support@nobrokerage.com');
  const [companyPhone, setCompanyPhone] = useState('+1 (555) 019-2834');
  const [companyLoading, setCompanyLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setProfileLoading(true);
    try {
      const { error } = await adminService.updateAdminProfile(user?.id, fullName.trim());

      if (error) throw error;

      await logAction(
        user?.id,
        fullName.trim(),
        'Edit Profile',
        user?.id,
        'Updated administrator display name'
      );

      alert('Profile updated successfully! Refresh to apply name changes in the header.');
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

      await logAction(
        user?.id,
        adminProfile?.full_name,
        'Reset Password',
        user?.id,
        'Updated account password securely'
      );

      setNewPassword('');
      setConfirmPassword('');
      alert('Password updated successfully!');
    } catch (err) {
      alert(err.message || 'Error updating password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveCompanySettings = async (e) => {
    e.preventDefault();
    setCompanyLoading(true);
    try {
      // Simulate save
      await new Promise(r => setTimeout(r, 1000));
      alert('Company profile configuration saved successfully!');
    } catch (err) {
      alert('Error saving company configurations');
    } finally {
      setCompanyLoading(false);
    }
  };

  return (
    <div className="page-body" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 className="page-title">Console Settings</h1>
      <p className="page-subtitle">Configure administrator profile details, console keys, security policies, and SMTP settings.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Left column: Admin Info & Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Profile Card */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} color="var(--primary)" /> Administrator Profile
            </h3>
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Email Address (Auth Identity)
                </label>
                <input 
                  type="text" 
                  value={adminProfile?.email || ''} 
                  disabled
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    cursor: 'not-allowed',
                    width: '100%',
                    padding: '8px 12px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Administrator Role
                </label>
                <input 
                  type="text" 
                  value={adminProfile?.role || ''} 
                  disabled
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    cursor: 'not-allowed',
                    width: '100%',
                    padding: '8px 12px'
                  }}
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
                  style={{
                    width: '100%',
                    padding: '8px 12px'
                  }}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={profileLoading}
                className="btn btn-primary btn-sm"
                style={{ alignSelf: 'flex-start', gap: '6px', marginTop: '6px' }}
              >
                <Save size={14} /> {profileLoading ? 'Saving...' : 'Update Name'}
              </button>
            </form>
          </div>

          {/* Change Password Card */}
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
                style={{ alignSelf: 'flex-start', gap: '6px', marginTop: '6px' }}
              >
                <Key size={14} /> {passwordLoading ? 'Resetting...' : 'Change Password'}
              </button>
            </form>
          </div>

        </div>

        {/* Right column: Company Metadata & SMTP */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Company configurations */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={16} color="var(--primary)" /> Platform Company Profile
            </h3>
            <form onSubmit={handleSaveCompanySettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Company Brand Name
                </label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Support Email
                </label>
                <input 
                  type="email" 
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Support Contact Number
                </label>
                <input 
                  type="text" 
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px' }}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={companyLoading}
                className="btn btn-primary btn-sm"
                style={{ alignSelf: 'flex-start', gap: '6px', marginTop: '6px' }}
              >
                <Save size={14} /> {companyLoading ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
