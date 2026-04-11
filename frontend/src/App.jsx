import React, { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import { managersData } from './data/mockData';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).role : null);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  const [userStatus, setUserStatus] = useState(localStorage.getItem('userStatus') || 'DASHBOARD');
  const [managersList, setManagersList] = useState(managersData);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (role, user, status = 'DASHBOARD') => {
    setUserRole(role);
    setCurrentUser(user);
    setUserStatus(status);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentUser(null);
    setUserStatus('DASHBOARD');
  };

  if (isMobile) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem', textAlign: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '2rem', padding: '3rem 2rem',
          maxWidth: '360px', backdropFilter: 'blur(20px)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🖥️</div>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '900', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Desktop Only
          </h1>
          <div style={{ width: '40px', height: '3px', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '99px', margin: '0 auto 1.25rem' }} />
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', fontWeight: '600' }}>
            This is an Admin Panel designed for desktop and laptop use only.
          </p>
          <p style={{ color: '#60a5fa', fontSize: '0.8rem', fontWeight: '700', marginTop: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Please open on a Desktop or Laptop
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="antialiased font-sans transition-all duration-500">
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} managersList={managersList} />
      ) : (
        <Layout
          currentRole={userRole}
          currentUser={currentUser}
          userStatus={userStatus}
          setUserStatus={setUserStatus}
          onLogout={handleLogout}
          managersList={managersList}
          setManagersList={setManagersList}
        />
      )}
    </div>
  )
}

export default App

