import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import NoticeBoard from './pages/NoticeBoard';
import CreatePost from './pages/CreatePost';
import PostDetails from './pages/PostDetails';
import AIMatches from './pages/AIMatches';
import CommunityMap from './pages/CommunityMap';
import BloodHelp from './pages/BloodHelp';
import Chat from './pages/Chat';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import MyPosts from './pages/MyPosts';
import Initiatives from './pages/Initiatives';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '12px', fontSize: '14px' },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected */}
            <Route path="/verify" element={
              <ProtectedRoute>
                <AppLayout><Verify /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/notice-board" element={
              <ProtectedRoute>
                <AppLayout><NoticeBoard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/create-post" element={
              <ProtectedRoute>
                <AppLayout><CreatePost /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/posts/:id" element={
              <ProtectedRoute>
                <AppLayout><PostDetails /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/ai-matches" element={
              <ProtectedRoute>
                <AppLayout><AIMatches /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/map" element={
              <ProtectedRoute>
                <AppLayout><CommunityMap /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/blood-help" element={
              <ProtectedRoute>
                <AppLayout><BloodHelp /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <AppLayout><Chat /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/chat/:threadId" element={
              <ProtectedRoute>
                <AppLayout><Chat /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/initiatives" element={
              <ProtectedRoute>
                <AppLayout><Initiatives /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/organizer" element={
              <ProtectedRoute roles={['organizer', 'admin']}>
                <AppLayout><OrganizerDashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AppLayout><AdminDashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout><Profile /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile/:id" element={
              <ProtectedRoute>
                <AppLayout><Profile /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/my-posts" element={
              <ProtectedRoute>
                <AppLayout><MyPosts /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
