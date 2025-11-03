** contirbute** : k4niz

# BarberSlot - Modern Barbershop Booking Platform

A full-stack web application that enables customers to book barber appointments online, barbers to manage their schedules, and admins to oversee operations efficiently.

## Features

### Customer Features
- **Easy Registration & Login**: Create an account as a customer or barber
- **Interactive Booking**: Step-by-step booking process with calendar and time slot selection
- **View Barber Profiles**: Browse available barbers with ratings and experience
- **Service Selection**: Choose from various grooming services
- **Payment Integration**: Simulated secure payment processing
- **Appointment Management**: View upcoming and past appointments
- **Reviews & Ratings**: Rate barbers and leave feedback after appointments
- **Dark Mode**: Toggle between light and dark themes

### Barber Features
- **Personal Dashboard**: Manage appointments and view schedule
- **Appointment Control**: Accept, reject, or complete appointments
- **Availability Toggle**: Set availability status
- **Performance Metrics**: View ratings and total reviews
- **Customer Management**: See customer details and appointment history

### Admin Features
- **Analytics Dashboard**: Overview of business metrics
- **Service Management**: Add, edit, and toggle services
- **Barber Overview**: Monitor all barbers and their performance
- **Revenue Tracking**: Track total bookings and revenue
- **Real-time Stats**: Daily appointments and customer count

### General Features
- **Real-time Notifications**: Toast notifications for all actions
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Modern UI/UX**: Clean, professional interface with smooth animations
- **Role-based Access**: Different dashboards for customers, barbers, and admins
- **Secure Authentication**: JWT-based authentication with Supabase

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. The database schema and sample services are already set up via migrations

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage Guide

### For Customers

1. **Sign Up**: Create an account by selecting "Customer" role
2. **Browse Services**: View available services and barbers
3. **Book Appointment**:
   - Select a barber
   - Choose a service
   - Pick a date
   - Select a time slot
   - Complete payment
4. **Manage Bookings**: View and cancel upcoming appointments
5. **Leave Reviews**: Rate your barber after completed appointments

### For Barbers

1. **Sign Up**: Create an account by selecting "Barber" role
2. **Manage Appointments**: View all appointments on your dashboard
3. **Accept/Reject**: Approve or decline booking requests
4. **Complete Service**: Mark appointments as completed
5. **Toggle Availability**: Set yourself as available or unavailable
6. **View Reviews**: See customer feedback and ratings

### For Admins

1. **Login**: Use admin credentials
2. **Monitor Dashboard**: View real-time business metrics
3. **Manage Services**: Add, edit, or deactivate services
4. **Oversee Barbers**: Monitor barber performance and availability
5. **Track Revenue**: View total bookings and revenue

## Database Schema

### Tables

- **profiles**: User profiles with role information
- **barbers**: Barber-specific data including ratings
- **services**: Available grooming services
- **barber_availability**: Barber schedule (not fully implemented)
- **appointments**: Booking records
- **reviews**: Customer reviews for barbers

### Security

- Row Level Security (RLS) enabled on all tables
- Role-based policies for data access
- JWT authentication
- Password hashing with bcrypt

## Demo Credentials

You can create your own accounts using the sign-up flow:

- **Customer Account**: Sign up with "Customer" role
- **Barber Account**: Sign up with "Barber" role
- **Admin Account**: Create a profile manually in the database with role "admin"

## Features Not Implemented

The following features were planned but not implemented:

- Email notifications for booking confirmations
- QR code generation for appointments
- Report export (PDF/Excel)
- Full barber availability scheduling
- AI-based time slot suggestions
- Multiple barber availability time blocks per day

## Project Structure

```
src/
├── components/          # React components
│   ├── AdminDashboard.tsx
│   ├── AuthPage.tsx
│   ├── BarberDashboard.tsx
│   ├── BookingPage.tsx
│   ├── CustomerDashboard.tsx
│   ├── HomePage.tsx
│   ├── Navbar.tsx
│   ├── Notification.tsx
│   └── PaymentPage.tsx
├── contexts/           # React contexts
│   ├── AuthContext.tsx
│   ├── NotificationContext.tsx
│   └── ThemeContext.tsx
├── lib/               # Utilities and configurations
│   └── supabase.ts
├── App.tsx            # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles
```

## Contributing

This is a demo project. Feel free to fork and customize for your needs.

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Acknowledgments

- Built with React and Supabase
- Icons by Lucide React
- Styled with Tailwind CSS
