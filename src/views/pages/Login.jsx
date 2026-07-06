import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../controllers/auth';
import { ShieldCheck, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Gradients for Visual Wow */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        right: '-10%',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
        filter: 'blur(50px)',
        zIndex: 1
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167, 139, 250, 0.08) 0%, transparent 70%)',
        filter: 'blur(50px)',
        zIndex: 1
      }} />

      {/* Card Content Container */}
      <div style={{
        maxWidth: '420px',
        width: '100%',
        zIndex: 2
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '28px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '52px',
            width: '52px',
            borderRadius: '14px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '16px',
            color: 'var(--primary)'
          }}>
            <ShieldCheck size={28} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-title)',
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            marginBottom: '6px',
            color: 'var(--text-primary)'
          }}>
            Admin Login
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '13px'
          }}>
            Access the No Brokerage Platform Control Center
          </p>
        </div>

        <div className="card card-glow" style={{
          padding: '32px'
        }}>
          {error && (
            <div style={{
              display: 'flex',
              gap: '8px',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 500,
              marginBottom: '20px',
              lineHeight: '1.4',
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '6px'
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  required
                  style={{
                    paddingLeft: '38px',
                    width: '100%',
                    height: '42px'
                  }}
                  className="search-input"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '6px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  style={{
                    paddingLeft: '38px',
                    width: '100%',
                    height: '42px'
                  }}
                  className="search-input"
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '42px',
                marginTop: '6px'
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
