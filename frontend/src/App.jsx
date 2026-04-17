import React, { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import { managersData } from './data/mockData';
import { ModalProvider } from './context/ModalContext';
import UniversalModal from './components/UniversalModal';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).role : null);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  const [userStatus, setUserStatus] = useState(localStorage.getItem('userStatus') || 'DASHBOARD');
  const [managersList, setManagersList] = useState(managersData);

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

  // Basic routing for Forgot Password
  const isForgotPassword = window.location.pathname === '/forgot-password';

  if (isForgotPassword) {
    return <ForgotPassword />;
  }

  return (
    <ModalProvider>
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
      <UniversalModal />
    </ModalProvider>
  )
}

export default App
