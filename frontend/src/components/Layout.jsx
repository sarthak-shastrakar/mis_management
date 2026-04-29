import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import AdminDashboard from '../pages/AdminDashboard';
import ManagerDashboard from '../pages/ManagerDashboard';
import ProjectManagement from '../pages/ProjectManagement';
import TrainerManagement from '../pages/TrainerManagement';
import TraineeManagement from '../pages/TraineeManagement';
import AttendanceManagement from '../pages/AttendanceManagement';
import ProjectDetail from '../pages/ProjectDetail';
import TrainerDetail from '../pages/TrainerDetail';
import ManagerManagement from '../pages/ManagerManagement';
import TrainerOnboarding from '../pages/TrainerOnboarding';
import TrainerProfile from '../pages/TrainerProfile';
import TrainerDashboard from '../pages/TrainerDashboard';
import MarkAttendance from '../pages/MarkAttendance';
import TrainerHistory from '../pages/TrainerHistory';
import AdminReports from '../pages/AdminReports';
import EvidenceUpload from '../pages/EvidenceUpload';
import AdminEvidence from '../pages/AdminEvidence';
import ManagerProfile from '../pages/ManagerProfile';
import ExpenseManagement from '../pages/ExpenseManagement';
import UserManagement from '../pages/UserManagement';
import ViewerProfile from '../pages/ViewerProfile';
import Approvals from '../pages/Approvals';
import BeneficiaryManagement from '../pages/BeneficiaryManagement';
import BeneficiaryRequests from '../pages/BeneficiaryRequests';

// Sidebar is w-[260px] = 260px
const SIDEBAR_OFFSET = 'lg:pl-[260px]';

const Layout = ({ currentRole, currentUser, userStatus, setUserStatus, onLogout, managersList, setManagersList }) => {
  const [activePage, setActivePage]   = useState('dashboard');
  const [pageProps, setPageProps]     = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigate = (page, props = {}) => {
    setActivePage(page);
    setPageProps(props);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Trainer onboarding gate
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

      {/* Sidebar */}
      <Sidebar
        currentRole={currentRole}
        activePage={activePage}
        setActivePage={(page) => handleNavigate(page)}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content — shifts right by sidebar width on lg+ */}
      <div className={`flex-1 flex flex-col min-h-screen ${SIDEBAR_OFFSET} w-full`}>

        <Header
          currentRole={currentRole}
          activePage={activePage}
          currentUser={currentUser}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1 w-full p-3 sm:p-5 md:p-6 lg:p-8">
          <div className="w-full max-w-[1400px] mx-auto">

            {/* Dashboard */}
            {activePage === 'dashboard' && (
              (currentRole === 'admin' || currentRole === 'viewer')
                ? <AdminDashboard onAddManager={(mgr) => setManagersList(prev => [mgr, ...prev])} onNavigate={handleNavigate} />
                : currentRole === 'manager'
                  ? <ManagerDashboard onNavigate={handleNavigate} />
                  : <TrainerDashboard />
            )}

            {activePage === 'projects'          && <ProjectManagement currentRole={currentRole} onNavigate={handleNavigate} />}
            {activePage === 'managers'          && (currentRole === 'admin' || currentRole === 'viewer') && <ManagerManagement currentRole={currentRole} managersList={managersList} setManagersList={setManagersList} />}
            {activePage === 'trainers'          && <TrainerManagement currentRole={currentRole} onNavigate={handleNavigate} />}
            {activePage === 'trainees'          && (currentRole === 'manager' || currentRole === 'trainer') && <TraineeManagement currentRole={currentRole} />}
            {activePage === 'attendance'        && <AttendanceManagement currentRole={currentRole} currentUser={currentUser} />}
            {activePage === 'expenses'          && currentRole === 'admin' && <ExpenseManagement />}
            {activePage === 'reports'           && (currentRole === 'admin' || currentRole === 'viewer') && <AdminReports />}
            {activePage === 'evidence'          && (currentRole === 'trainer' ? <EvidenceUpload /> : <AdminEvidence />)}
            {activePage === 'mark-attendance'   && <MarkAttendance currentRole={currentRole} currentUser={currentUser} />}
            {activePage === 'my-history'        && <TrainerHistory currentRole={currentRole} currentUser={currentUser} />}
            {activePage === 'profile'           && (
              currentRole === 'manager' 
                ? <ManagerProfile /> 
                : currentRole === 'viewer'
                  ? <ViewerProfile />
                  : <TrainerProfile />
            )}
            {activePage === 'users'             && currentRole === 'admin' && <UserManagement />}
            {activePage === 'approvals'         && currentRole === 'admin' && <Approvals />}
            {activePage === 'beneficiaries'     && currentRole === 'admin' && <BeneficiaryManagement />}
            {activePage === 'beneficiary-requests' && currentRole === 'manager' && <BeneficiaryRequests />}

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

            {/* 404 fallback */}
            {!['dashboard','projects','managers','trainers','trainees','beneficiaries','beneficiary-requests','attendance','project-detail','trainer-detail','profile','mark-attendance','my-history', 'expenses', 'reports', 'evidence', 'approvals', 'users'].includes(activePage) && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white shadow-sm p-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center text-3xl sm:text-4xl mb-4">📁</div>
                <h3 className="text-lg sm:text-xl font-black mb-2 text-slate-900">Coming Soon</h3>
                <p className="text-sm text-slate-500">This module is under development.</p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
