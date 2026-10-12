import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';
import { auditService } from '../services/auditService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Apply theme class to HTML root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const logAction = async (adminId, adminName, action, target, details) => {
    await auditService.logAction(adminId, adminName, action, target, details);
  };

  const fetchAdminProfile = async (sessionUser) => {
    try {
      const { data, error: profileError } = await adminService.getAdminProfile(sessionUser.id);

      if (profileError) throw profileError;

      if (!data) {
        // Not a registered admin
        await authService.signOut();
        setUser(null);
        setAdminProfile(null);
        setError('Access denied: You do not have administrator privileges.');
        return null;
      }

      if (data.status !== 'Active') {
        // Admin user is disabled
        await authService.signOut();
        setUser(null);
        setAdminProfile(null);
        setError('Access denied: Your account has been disabled.');
        return null;
      }

      // Update last login
      await adminService.updateAdminLastLogin(sessionUser.id);

      setAdminProfile(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Error fetching admin profile:', err);
      setError(err.message || 'Authentication error.');
      return null;
    }
  };

  // The admin whose profile has already been checked in this tab.
  const verifiedUserId = useRef(null);

  useEffect(() => {
    // 1. Get initial session
    authService.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const profile = await fetchAdminProfile(session.user);
        if (profile) verifiedUserId.current = session.user.id;
      }
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        verifiedUserId.current = null;
        setUser(null);
        setAdminProfile(null);
        setLoading(false);
        return;
      }

      // Supabase repeats SIGNED_IN every time the tab regains focus and on
      // each token refresh. For the admin already verified here that is not
      // a login: do not blank the page, re-check the profile or log it.
      if (verifiedUserId.current === session.user.id) {
        setUser(session.user);
        return;
      }

      setLoading(true);
      setUser(session.user);
      const profile = await fetchAdminProfile(session.user);
      if (profile) {
        verifiedUserId.current = session.user.id;
        if (event === 'SIGNED_IN') {
          await logAction(session.user.id, profile.full_name, 'Login', 'Admin Portal', `Login successful`);
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: loginError } = await authService.signIn(email, password);
      if (loginError) throw loginError;

      if (data.user) {
        setUser(data.user);
        const profile = await fetchAdminProfile(data.user);
        if (!profile) {
          // If profile check failed, fetchAdminProfile signs out internally
          setLoading(false);
          return false;
        }
      }
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Invalid login credentials.');
      return false;
    }
  };

  const logout = async () => {
    if (user && adminProfile) {
      await logAction(user.id, adminProfile.full_name, 'Logout', 'Admin Portal', 'Logout successful');
    }
    await authService.signOut();
    setUser(null);
    setAdminProfile(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, adminProfile, loading, error, theme, toggleTheme, login, logout, logAction }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
