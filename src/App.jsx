import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth } from './config/firebase';
import { useAuthStore } from './store/authStore';

/* ── Pages ── */
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ScannerPage from './pages/ScannerPage';
import WorkoutsPage from './pages/WorkoutsPage';
import ProfilePage from './pages/ProfilePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import MealHistoryPage from './pages/MealHistoryPage';
import ChatPage from './pages/ChatPage';
import ReportPreviewPage from './pages/ReportPreviewPage';
import SocialPage from './pages/SocialPage';

/* ── Components ── */
import BottomNav from './components/ui/BottomNav';
import Loader from './components/ui/Loader';
import ToastContainer from './components/ui/ToastContainer';

function ProtectedRoute({ children }) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return <Loader fullScreen />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppLayout({ children }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}

export default function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    // Check if returning from a redirect
    getRedirectResult(auth).catch((err) => {
      console.warn('Redirect auth result info:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <HomePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/scanner"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ScannerPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MealHistoryPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/workouts"
          element={
            <ProtectedRoute>
              <AppLayout>
                <WorkoutsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ChatPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ReportPreviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/social"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SocialPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/strava/callback"
          element={
            <ProtectedRoute>
              <AppLayout>
                <WorkoutsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
