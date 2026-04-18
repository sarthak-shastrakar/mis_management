import React, { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import { managersData } from './data/mockData';
import { ModalProvider } from './context/ModalContext';
import UniversalModal from './components/UniversalModal';
import ForgotPassword from './pages/ForgotPassword';
import OneSignal from 'react-onesignal';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).role : null);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  const [userStatus, setUserStatus] = useState(localStorage.getItem('userStatus') || 'DASHBOARD');
  const [managersList, setManagersList] = useState(managersData);

  useEffect(() => {
    const initOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: "46f9de43-48d5-4edc-8914-c52c67181b6d",
          safari_web_id: "web.onesignal.auto.27841aa0-90c9-472e-b116-e68b5f82c9c6",
          notifyButton: {
            enable: true,
          },
          allowLocalhostAsSecureOrigin: true,
        });

        // If already logged in, sync with OneSignal
        if (isAuthenticated && currentUser?._id) {
          OneSignal.login(currentUser._id);
        }
      } catch (err) {
        console.error('OneSignal Init Error:', err);
      }
    };

    initOneSignal();
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentUser?._id) {
      OneSignal.login(currentUser._id);
    }
  }, [isAuthenticated, currentUser]);

  const handleLogin = (role, user, status = 'DASHBOARD') => {
    setUserRole(role);
    setCurrentUser(user);
    setUserStatus(status);
    setIsAuthenticated(true);
    if (user._id) {
      OneSignal.login(user._id);
    }
  };

  const handleLogout = () => {
    OneSignal.logout();
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
