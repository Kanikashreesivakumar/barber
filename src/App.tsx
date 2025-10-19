import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { NotificationContainer } from './components/Notification';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { AuthPage } from './components/AuthPage';
import { BookingPage } from './components/BookingPage';
import { PaymentPage } from './components/PaymentPage';
import { CustomerDashboard } from './components/CustomerDashboard';
import { BarberDashboard } from './components/BarberDashboard';
import { AdminDashboard } from './components/AdminDashboard';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    if (!user && currentPage !== 'home') {
       return <AuthPage onSuccess={() => setCurrentPage('dashboard')} />;
    }

    switch (currentPage) {
      case 'home':
        // If the user is a barber, don't show Home (which has booking CTA). Route to dashboard instead.
        if (user && profile?.role === 'barber') {
          return <BarberDashboard />;
        }
        return <HomePage onNavigate={setCurrentPage} />;
      case 'auth':
  return <AuthPage onSuccess={() => setCurrentPage('dashboard')} />;
      case 'booking':
        return <BookingPage onNavigate={setCurrentPage} />;
      case 'payment':
        return <PaymentPage onNavigate={setCurrentPage} />;
      case 'dashboard':
        // if auth/profile is still loading, show spinner so the user doesn't stay on Home
        if (loading) {
          return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
              </div>
            </div>
          );
        }

        console.log('App dashboard routing - user:', user?.email, 'profile:', profile);
        
        if (profile?.role === 'customer') {
          console.log('✅ Routing to CustomerDashboard for customer role');
          return <CustomerDashboard onNavigate={setCurrentPage} />;
        } else if (profile?.role === 'barber') {
          console.log('✅ Routing to BarberDashboard for barber role');
          return <BarberDashboard />;
        } else if (profile?.role === 'admin') {
          console.log('✅ Routing to AdminDashboard for admin role');
          return <AdminDashboard />;
        }
        
        console.log('❌ No matching role found for dashboard routing. Profile:', profile);

        // profile is loaded but role not set or profile missing - show helpful fallback
        return (
          <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
              <h3 className="text-lg font-bold mb-2">Unable to load dashboard</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Your profile is not yet available. Try refreshing or signing out and signing in again.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-amber-600 text-white rounded-lg">Refresh</button>
                <button onClick={() => setCurrentPage('home')} className="px-4 py-2 border rounded-lg">Go Home</button>
              </div>
            </div>
          </div>
        );
      default:
        if (user && profile?.role === 'barber') {
          return <BarberDashboard />;
        }
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <NotificationContainer />
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
