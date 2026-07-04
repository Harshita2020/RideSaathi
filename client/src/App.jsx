import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import OfferRidePage from './pages/OfferRidePage';
import RideDetailsPage from './pages/RideDetailsPage';
import MyRidesPage from './pages/MyRidesPage';
import MyBookingsPage from './pages/MyBookingsPage';
import LiveTrackingPage from './pages/LiveTrackingPage';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Dashboard/App Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Index search page */}
          <Route index element={<HomePage />} />
          
          <Route path="offer-ride" element={<OfferRidePage />} />
          <Route path="rides/:id" element={<RideDetailsPage />} />
          <Route path="my-rides" element={<MyRidesPage />} />
          <Route path="my-bookings" element={<MyBookingsPage />} />
          <Route path="tracking/:id" element={<LiveTrackingPage />} />
        </Route>

        {/* Catch-all redirect to index */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
