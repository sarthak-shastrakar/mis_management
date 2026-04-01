import React, { useState } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import { managersData } from './data/mockData';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'admin' or 'manager'
  const [currentUser, setCurrentUser] = useState(null);
  const [managersList, setManagersList] = useState(managersData);

  const handleLogin = (role, user) => {
    setUserRole(role);
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <div className="antialiased font-sans">
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} managersList={managersList} />
      ) : (
        <Layout 
          currentRole={userRole} 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          managersList={managersList} 
          setManagersList={setManagersList} 
        />
      )}
    </div>
  )
}

export default App
