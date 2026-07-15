import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../App.jsx';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e, customUser = null, customPass = null) => {
    if (e) e.preventDefault();
    setError('');
    setSubmitting(true);

    const userVal = customUser || username;
    const passVal = customPass || password;

    if (!userVal || !passVal) {
      setError('Vui lòng điền tên đăng nhập và mật khẩu.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: userVal,
          password: passVal,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        login(userData);
        navigate(from, { replace: true });
      } else {
        const text = await response.text();
        setError(text || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (role) => {
    let u = '';
    let p = 'password123';
    if (role === 'ADMIN') u = 'admin';
    else if (role === 'RESELLER') u = 'reseller1';
    else if (role === 'TENANT') u = 'tenant1';

    setUsername(u);
    setPassword(p);
    handleLogin(null, u, p);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '1rem',
    }}>
      <div className="glass-panel glow-primary" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem 2rem',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--color-primary), #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.5rem',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
          }}>
            <svg style={{ width: '32px', height: '32px', fill: '#fff' }} viewBox="0 0 24 24">
              <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-2.76 0-5 2.24-5 5h10c0-2.76-2.24-5-5-5z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>MALL SYSTEM</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Đăng nhập để quản lý sạp hàng của bạn</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              id="username"
              type="text"
              placeholder="Nhập tên đăng nhập..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', marginTop: '0.5rem' }}>
            {submitting ? 'Đang xác thực...' : 'Đăng Nhập'}
          </button>
        </form>

        <div style={{ position: 'relative', textAlign: 'center', margin: '0.5rem 0' }}>
          <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '1px', background: 'var(--border-color)' }} />
          <span style={{ position: 'relative', background: '#111827', padding: '0 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            ĐĂNG NHẬP NHANH (DEMO)
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <button type="button" onClick={() => handleQuickLogin('ADMIN')} className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <span className="role-tag admin" style={{ fontSize: '0.7rem' }}>Admin</span> (Tạo Shop, Users)
          </button>
          <button type="button" onClick={() => handleQuickLogin('RESELLER')} className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <span className="role-tag reseller" style={{ fontSize: '0.7rem' }}>Reseller</span> (Nhận quản lý Shop)
          </button>
          <button type="button" onClick={() => handleQuickLogin('TENANT')} className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <span className="role-tag tenant" style={{ fontSize: '0.7rem' }}>Tenant</span> (Thiết kế Web)
          </button>
        </div>
      </div>
    </div>
  );
}
