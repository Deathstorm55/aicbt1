import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Auth from './pages/Auth';
import PHQ9Form from './components/PHQ9Form';
import Onboarding from './pages/Onboarding';
import { TextShimmerColor } from './components/ui/demo';
import { UserButton, SignedIn } from '@clerk/clerk-react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PopupProvider } from './contexts/PopupContext';
import GlobalPopup from './components/ui/GlobalPopup';
import { LoadingProvider } from './contexts/LoadingContext';
import GlobalLoader15 from './components/ui/loader-15';
import PageSkeleton from './components/ui/PageSkeleton';

// Prefetch logic for heavy pages to begin downloading chunk on hover
const loadDashboard = () => import('./pages/Dashboard');
const loadChat = () => import('./pages/Chat');
const loadAdmin = () => import('./pages/AdminDashboard');
const loadLanding = () => import('./pages/Landing');
const loadDocs = () => import('./pages/Docs');
const loadPrivacy = () => import('./pages/PrivacyPolicy');
const loadTerms = () => import('./pages/TermsOfService');

const Dashboard = React.lazy(loadDashboard);
const Chat = React.lazy(loadChat);
const AdminDashboard = React.lazy(loadAdmin);
const Landing = React.lazy(loadLanding);
const Docs = React.lazy(loadDocs);
const PrivacyPolicy = React.lazy(loadPrivacy);
const TermsOfService = React.lazy(loadTerms);

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
    return <Navigate to="/" state={{ showEligibilityNotice: true, type: userData.has_suicidal_ideation || userData.phq9_score > 20 ? 'crisis' : 'low' }} />;
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
  // Allow retakes via query param, otherwise block users who already have a score
  const searchParams = new URLSearchParams(window.location.search);
  const isRetake = searchParams.get('retake') === 'true';
  if (!isRetake && userData?.phq9_score !== undefined && userData?.phq9_score !== null) return <Navigate to="/" />;
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

function IndexRoute() {
  const { currentUser } = useAuth();
  if (currentUser) {
    return <PrivateRoute><Dashboard /></PrivateRoute>;
  }
  return <Landing />;
}


export default function App() {
  const { currentUser, userData } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isAdmin = userData && ['ifeadeniyi8@gmail.com', 'hifeadeniyi@gmail.com'].includes(userData.email);

  return (
    <LoadingProvider>
      <PopupProvider>
        <GlobalLoader15 />
        <GlobalPopup />
        <nav style={{ padding: '1rem', background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(10px)' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="text-secondary" style={{ fontSize: '1.25rem', margin: 0 }}>AwakeSoul</h1>

            {/* Desktop Navigation */}
            {currentUser && (
              <div className="desktop-only" style={{ gap: '1rem', alignItems: 'center' }}>
                <button
                  className="btn-ghost"
                  onClick={() => window.location.href = '/chat'}
                  onMouseEnter={loadChat}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}
                >
                  Chat
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => window.location.href = '/'}
                  onMouseEnter={loadDashboard}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}
                >
                  Dashboard
                </button>
                {isAdmin && (
                  <button
                    onClick={() => window.location.href = '/admin'}
                    onMouseEnter={loadAdmin}
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
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  className="btn-ghost"
                  onClick={() => window.location.href = '/docs'}
                  onMouseEnter={loadDocs}
                  style={{ padding: '0.5rem 1.5rem', borderRadius: '8px' }}
                >
                  Docs
                </button>
                <button
                  className="btn-primary"
                  onClick={() => window.location.href = '/auth'}
                  style={{ padding: '0.5rem 1.5rem', borderRadius: '8px' }}
                >
                  Log In
                </button>
              </div>
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
                    onMouseEnter={loadChat}
                    style={{ textAlign: 'left', padding: '1rem' }}
                  >
                    Chatbot
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => { window.location.href = '/'; setIsMenuOpen(false); }}
                    onMouseEnter={loadDashboard}
                    style={{ textAlign: 'left', padding: '1rem' }}
                  >
                    Your Dashboard
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => { window.location.href = '/admin'; setIsMenuOpen(false); }}
                      onMouseEnter={loadAdmin}
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
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
              <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
              <Route path="/assessment" element={<AssessmentRoute><PHQ9Form /></AssessmentRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/shimmer-demo" element={<div className="container" style={{ padding: '4rem' }}><TextShimmerColor /></div>} />
              <Route path="/" element={<IndexRoute />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/chat" element={<ChatRoute><Chat /></ChatRoute>} />
            </Routes>
          </Suspense>
        </main>
      </PopupProvider>
    </LoadingProvider>
  );
}
