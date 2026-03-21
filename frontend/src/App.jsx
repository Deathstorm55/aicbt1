import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import PHQ9Form from './components/PHQ9Form';
import Onboarding from './pages/Onboarding';
import AdminDashboard from './pages/AdminDashboard';
import { UserButton, SignedIn } from '@clerk/clerk-react';

function PrivateRoute({ children }) {
  const { currentUser, userData } = useAuth();
  if (!currentUser) return <Navigate to="/auth" />;
  if (!userData) return <Navigate to="/onboarding" />;
  // Redirect to assessment if PHQ9 not completed
  if (userData.phq9_score === undefined || userData.phq9_score === null) {
    return <Navigate to="/assessment" />;
  }
  return children;
}

function ChatRoute({ children }) {
  const { currentUser, userData } = useAuth();
  if (!currentUser) return <Navigate to="/auth" />;
  if (!userData) return <Navigate to="/onboarding" />;
  if (userData.phq9_score === undefined || userData.phq9_score === null) {
    return <Navigate to="/assessment" />;
  }
  if (!userData.eligible_for_chatbot) {
    return <Navigate to="/" />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { currentUser, userData } = useAuth();
  if (currentUser) {
    if (!userData) return <Navigate to="/onboarding" />;
    if (userData && !userData.phq9_score && userData.phq9_score !== 0) {
      return <Navigate to="/assessment" />;
    }
    return <Navigate to="/" />;
  }
  return children;
}

function AssessmentRoute({ children }) {
  const { currentUser, userData } = useAuth();
  if (!currentUser) return <Navigate to="/auth" />;
  if (!userData) return <Navigate to="/onboarding" />;
  if (userData?.phq9_score !== undefined && userData?.phq9_score !== null) return <Navigate to="/" />;
  return children;
}

function OnboardingRoute({ children }) {
  const { currentUser, userData } = useAuth();
  if (!currentUser) return <Navigate to="/auth" />;
  if (userData) return <Navigate to="/" />;
  return children;
}

function AdminRoute({ children }) {
  const { currentUser, userData } = useAuth();
  if (!currentUser) return <Navigate to="/auth" />;
  if (!userData) return <Navigate to="/onboarding" />;

  const ADMIN_EMAILS = ['ifeadeniyi8@gmail.com', 'hifeadeniyi@gmail.com'];
  if (!ADMIN_EMAILS.includes(userData.email)) {
    return <Navigate to="/" />;
  }

  return children;
}

export default function App() {
  const { currentUser, userData } = useAuth();

  return (
    <>
      <nav style={{ padding: '1rem', background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="text-secondary" style={{ fontSize: '1.25rem' }}>AI Therapist</h1>
          {currentUser && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                className="btn-ghost"
                onClick={() => window.location.href = '/chat'}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}
              >
                Chat
              </button>
              <button
                className="btn-ghost"
                onClick={() => window.location.href = '/'}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}
              >
                Dashboard
              </button>
              {userData && ['ifeadeniyi8@gmail.com', 'hifeadeniyi@gmail.com'].includes(userData.email) && (
                <button
                  onClick={() => window.location.href = '/admin'}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'var(--primary)', color: '#000', fontWeight: 'bold' }}
                >
                  Admin Portal
                </button>
              )}
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          )}
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
          <Route path="/assessment" element={<AssessmentRoute><PHQ9Form /></AssessmentRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/chat" element={<ChatRoute><Chat /></ChatRoute>} />
        </Routes>
      </main>
    </>
  );
}
