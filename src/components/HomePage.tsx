import { Calendar, Clock, Star, Award, Scissors, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CustomerDashboard } from './CustomerDashboard';
import { BarberDashboard } from './BarberDashboard';


type HomePageProps = {
  onNavigate: (page: string) => void;
};

export function HomePage({ onNavigate }: HomePageProps) {
  const { user } = useAuth();
  // ...existing code...

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-white via-amber-50/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-transparent dark:from-amber-600/5"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center mb-16">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 rounded-full text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              <span>Premium Barbershop Experience..!</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Your Style,
              <br />
              <span className="bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600 bg-clip-text text-transparent">
                Our Expertise
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Book appointments with top barbers in seconds. No more waiting in line.
              Experience modern grooming with BarberSlot.
            </p>

            {user ? (
              <button
                onClick={() => onNavigate('booking')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 text-white rounded-lg text-lg font-semibold hover:bg-amber-700 transition-all hover:scale-105 shadow-lg"
              >
                <Calendar className="w-5 h-5" />
                Book Appointment Now
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 text-white rounded-lg text-lg font-semibold hover:bg-amber-700 transition-all hover:scale-105 shadow-lg"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Easy Booking</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Book your slot in just a few clicks. Choose your preferred barber, date, and time.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Save Time</h3>
              <p className="text-gray-600 dark:text-gray-400">
                No more waiting in queues. Arrive at your scheduled time and get serviced immediately.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                <Star className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Top Barbers</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose from our selection of experienced, highly-rated professionals.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-900 to-amber-900 dark:from-gray-800 dark:to-amber-800 rounded-3xl p-12 text-center text-white">
            <Scissors className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready for Your Next Cut?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust BarberSlot for their grooming needs.
            </p>
            {!user && (
              <button
                onClick={() => onNavigate('auth')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all hover:scale-105"
              >
                Sign Up Now
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
