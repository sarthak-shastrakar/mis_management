import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import AdminDashboard from '../pages/AdminDashboard';
import ManagerDashboard from '../pages/ManagerDashboard';
import ProjectManagement from '../pages/ProjectManagement';
import TrainerManagement from '../pages/TrainerManagement';
import AttendanceManagement from '../pages/AttendanceManagement';
import ProjectDetail from '../pages/ProjectDetail';
import TrainerDetail from '../pages/TrainerDetail';
import ManagerManagement from '../pages/ManagerManagement';

const Layout = ({ currentRole, currentUser, onLogout, managersList, setManagersList }) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [pageProps, setPageProps] = useState({});

  const handleNavigate = (page, props = {}) => {
    setActivePage(page);
    setPageProps(props);
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Sidebar - Fixed */}
      <Sidebar
        currentRole={currentRole}
        activePage={activePage}
        setActivePage={(page) => handleNavigate(page)}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 min-h-screen">
        <Header
          currentRole={currentRole}
          activePage={activePage}
        />

        <main className="p-10">
          <div className="max-w-[1400px] mx-auto">
            {activePage === 'dashboard' && (currentRole === 'admin' ? <AdminDashboard onAddManager={(mgr) => setManagersList(prev => [mgr, ...prev])} onNavigate={handleNavigate} /> : <ManagerDashboard onNavigate={handleNavigate} />)}
            {activePage === 'projects' && <ProjectManagement onNavigate={handleNavigate} />}
            {activePage === 'managers' && currentRole === 'admin' && <ManagerManagement managersList={managersList} setManagersList={setManagersList} />}
            {activePage === 'trainers' && <TrainerManagement onNavigate={handleNavigate} />}
            {activePage === 'attendance' && <AttendanceManagement />}
            {activePage === 'project-detail' && (
              <ProjectDetail
                projectId={pageProps.projectId}
                initialEditMode={pageProps.editMode}
                onBack={() => handleNavigate('projects')}
              />
            )}
            {activePage === 'trainer-detail' && (
              <TrainerDetail
                trainerId={pageProps.trainerId}
                initialEditMode={pageProps.editMode}
                onBack={() => handleNavigate('trainers')}
              />
            )}
            {!['dashboard', 'projects', 'managers', 'trainers', 'attendance', 'project-detail', 'trainer-detail'].includes(activePage) && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-sm">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-3xl mb-4">📁</div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Coming Soon</h3>
                <p className="text-slate-500 dark:text-slate-400">This module is under development.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
