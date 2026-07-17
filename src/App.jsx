import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/pages/auth/Login.jsx';
import Dashboard from './components/pages/dashboard/Dashboard.jsx';
import TenantEditor from './components/pages/tenant/TenantEditor.jsx';
import ShopViewer from './components/pages/public/ShopViewer.jsx';
import TenantChat from './components/pages/tenant/TenantChat.jsx';

// Create Authentication Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>
        <div className="spinner">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  const { user, login, logout, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/shop/:shopId" element={<ShopViewer />} />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/tenant/editor/:shopId" 
        element={
          <ProtectedRoute allowedRoles={['TENANT', 'ADMIN']}>
            <TenantEditor />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/tenant/chat/:shopId" 
        element={
          <ProtectedRoute allowedRoles={['TENANT', 'ADMIN']}>
            <TenantChat />
          </ProtectedRoute>
        } 
      />

      {/* Redirects */}
      <Route 
        path="/" 
        element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session on load
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Unauthenticated');
      })
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
