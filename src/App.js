import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './controllers/auth';
import Sidebar from './views/components/Sidebar';
import Header from './views/components/Header';
import Login from './views/pages/Login';
import Dashboard from './views/pages/Dashboard';
import Properties from './views/pages/Properties';
import PropertyDetails from './views/pages/PropertyDetails';
import Users from './views/pages/Users';
import Leads from './views/pages/Leads';
import AuditLogs from './views/pages/AuditLogs';
import Settings from './views/pages/Settings';
import Chats from './views/pages/Chats';
import Reels from './views/pages/Reels';
import Careers from './views/pages/Careers';
import Blogs from './views/pages/Blogs';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 16px auto' }} />
          <p style={{ fontWeight: 600, fontSize: '13px' }}>Verifying security session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main layout wrapper if authenticated
const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar 
        isMobileOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <div className="main-content">
        <Header 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Administrative Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/properties" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Properties />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/properties/:id" element={
            <ProtectedRoute>
              <DashboardLayout>
                <PropertyDetails />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Users />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/leads" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Leads />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/chats" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Chats />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/reels" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Reels />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/careers" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Careers />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/blogs" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Blogs />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/logs" element={
            <ProtectedRoute>
              <DashboardLayout>
                <AuditLogs />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Default fallback redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
