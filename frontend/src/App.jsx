import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import PHQ9Form from './components/PHQ9Form';
import Onboarding from './pages/Onboarding';
import AdminDashboard from './pages/AdminDashboard';
import { TextShimmerColor } from './components/ui/demo';
import { UserButton, SignedIn } from '@clerk/clerk-react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isAdmin = userData && ['ifeadeniyi8@gmail.com', 'hifeadeniyi@gmail.com'].includes(userData.email);

  return (
    <>
      <nav style={{ padding: '1rem', background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(10px)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="text-secondary" style={{ fontSize: '1.25rem', margin: 0 }}>AI Therapist</h1>

          {/* Desktop Navigation */}
          {currentUser && (
            <div className="desktop-only" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
              {isAdmin && (
                <button
                  onClick={() => window.location.href = '/admin'}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'var(--primary)', color: '#fff', fontWeight: 'bold' }}
                >
                  Admin Portal
                </button>
              )}
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          {currentUser && (
            <div className="mobile-only">
              <button onClick={toggleMenu} className="btn-ghost" style={{ padding: '0.5rem', borderRadius: '8px' }}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          )}

          {!currentUser && (
            <button
              className="btn-primary"
              onClick={() => window.location.href = '/auth'}
              style={{ padding: '0.5rem 1.5rem', borderRadius: '8px' }}
            >
              Log In
            </button>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', background: 'rgba(10, 2, 2, 0.95)', borderTop: '1px solid var(--glass-border)' }}
            >
              <div className="container" style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>Account</span>
                  <SignedIn>
                    <UserButton showName />
                  </SignedIn>
                </div>
                <button
                  className="btn-secondary"
                  onClick={() => { window.location.href = '/chat'; setIsMenuOpen(false); }}
                  style={{ textAlign: 'left', padding: '1rem' }}
                >
                  Chatbot
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => { window.location.href = '/'; setIsMenuOpen(false); }}
                  style={{ textAlign: 'left', padding: '1rem' }}
                >
                  Your Dashboard
                </button>
                {isAdmin && (
                  <button
                    onClick={() => { window.location.href = '/admin'; setIsMenuOpen(false); }}
                    style={{ padding: '1rem', borderRadius: '8px', background: 'var(--primary)', color: '#fff', fontWeight: 'bold', textAlign: 'left' }}
                  >
                    Admin Portal
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
          <Route path="/assessment" element={<AssessmentRoute><PHQ9Form /></AssessmentRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/shimmer-demo" element={<div className="container" style={{ padding: '4rem' }}><TextShimmerColor /></div>} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/chat" element={<ChatRoute><Chat /></ChatRoute>} />
        </Routes>
      </main>
    </>
  );
}
