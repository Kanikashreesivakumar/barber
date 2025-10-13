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
      return <AuthPage onSuccess={() => setCurrentPage('home')} />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'auth':
        return <AuthPage onSuccess={() => setCurrentPage('home')} />;
      case 'booking':
        return <BookingPage onNavigate={setCurrentPage} />;
      case 'payment':
        return <PaymentPage onNavigate={setCurrentPage} />;
      case 'dashboard':
        if (profile?.role === 'customer') {
          return <CustomerDashboard onNavigate={setCurrentPage} />;
        } else if (profile?.role === 'barber') {
          return <BarberDashboard />;
        } else if (profile?.role === 'admin') {
          return <AdminDashboard />;
        }
        return <HomePage onNavigate={setCurrentPage} />;
      default:
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
