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
import TrainerOnboarding from '../pages/TrainerOnboarding';
import TrainerProfile from '../pages/TrainerProfile';
import TrainerDashboard from '../pages/TrainerDashboard';
import MarkAttendance from '../pages/MarkAttendance';
import TrainerHistory from '../pages/TrainerHistory';
import ManagerProfile from '../pages/ManagerProfile';

const Layout = ({ currentRole, currentUser, userStatus, setUserStatus, onLogout, managersList, setManagersList }) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [pageProps, setPageProps] = useState({});

  const handleNavigate = (page, props = {}) => {
    setActivePage(page);
    setPageProps(props);
  };

  // If trainer and not in dashboard status, force onboarding
  if (currentRole === 'trainer' && userStatus !== 'DASHBOARD') {
    return (
      <TrainerOnboarding 
        userStatus={userStatus} 
        onComplete={(newStatus) => setUserStatus(newStatus)} 
        onLogout={onLogout} 
      />
    );
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
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
          currentUser={currentUser}
        />

        <main className="p-10">
          <div className="max-w-[1400px] mx-auto">
            {activePage === 'dashboard' && (
              currentRole === 'admin' ? <AdminDashboard onAddManager={(mgr) => setManagersList(prev => [mgr, ...prev])} onNavigate={handleNavigate} /> : 
              currentRole === 'manager' ? <ManagerDashboard onNavigate={handleNavigate} /> :
              <TrainerDashboard />
            )}
            {activePage === 'projects' && <ProjectManagement currentRole={currentRole} onNavigate={handleNavigate} />}
            {activePage === 'managers' && currentRole === 'admin' && <ManagerManagement managersList={managersList} setManagersList={setManagersList} />}
            {activePage === 'trainers' && <TrainerManagement currentRole={currentRole} onNavigate={handleNavigate} />}
            {activePage === 'attendance' && <AttendanceManagement currentRole={currentRole} currentUser={currentUser} />}
            {activePage === 'mark-attendance' && <MarkAttendance currentRole={currentRole} currentUser={currentUser} />}
            {activePage === 'my-history' && <TrainerHistory currentRole={currentRole} currentUser={currentUser} />}
            {activePage === 'profile' && (
              currentRole === 'manager' ? <ManagerProfile /> : <TrainerProfile />
            )}
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
                currentRole={currentRole}
                initialEditMode={pageProps.editMode}
                onBack={() => handleNavigate('trainers')}
              />
            )}
            {!['dashboard', 'projects', 'managers', 'trainers', 'attendance', 'project-detail', 'trainer-detail', 'profile', 'mark-attendance', 'my-history'].includes(activePage) && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white shadow-sm">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl mb-4">📁</div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">Coming Soon</h3>
                <p className="text-slate-500">This module is under development.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};


export default Layout;
