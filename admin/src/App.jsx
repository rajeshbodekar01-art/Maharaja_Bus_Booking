import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import BusManagement from './pages/BusManagement';
import RouteManagement from './pages/RouteManagement';
import BookingsView from './pages/BookingsView';
import UserManagement from './pages/UserManagement';
import Sidebar from './components/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-100"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-75 transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar - Desktop & Mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="md:hidden absolute top-0 right-0 -mr-12 pt-2">
          <button onClick={() => setIsSidebarOpen(false)} className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:bg-gray-600 text-white">
            <FaTimes size={24} />
          </button>
        </div>
        <Sidebar onLinkClick={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-gray-900 text-white p-4 flex items-center justify-between shadow-md z-30">
          <span className="font-bold text-lg tracking-wide">Admin Panel</span>
          <button onClick={() => setIsSidebarOpen(true)} className="focus:outline-none text-gray-300 hover:text-white transition duration-200">
            <FaBars size={24} />
          </button>
        </div>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/buses" element={
        <ProtectedRoute>
          <Layout>
            <BusManagement />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/routes" element={
        <ProtectedRoute>
          <Layout>
            <RouteManagement />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/bookings" element={
        <ProtectedRoute>
          <Layout>
            <BookingsView />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute>
          <Layout>
            <UserManagement />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
