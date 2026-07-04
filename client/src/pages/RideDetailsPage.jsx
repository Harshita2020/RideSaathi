import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { rideAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * RideDetailsPage displays comprehensive info about a selected ride.
 * Enables booking creation, cancellation, and seat capacity status tracking.
 */
const RideDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // API States
  const [ride, setRide] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Feedback States
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch Ride details and user booking status
  const loadData = async () => {
    try {
      setError('');
      const rideRes = await rideAPI.getDetails(id);
      setRide(rideRes.data);

      if (user) {
        const bookingsRes = await bookingAPI.getMyBookings();
        // Look for any active BOOKED booking for this specific ride
        const activeBooking = bookingsRes.data.find(
          (b) => b.rideId?._id === id && b.status === 'BOOKED'
        );
        setBooking(activeBooking || null);
      }
    } catch (err) {
      console.error('Error loading ride details:', err);
      setError(
        err.response?.data?.message || 'Failed to retrieve ride details. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, user]);

  // Handle Book Ride
  const handleBookRide = async () => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await bookingAPI.create(id);
      setSuccessMsg(res.data.message || 'Ride booked successfully!');
      // Reload updated ride details & bookings
      await loadData();
    } catch (err) {
      console.error('Error booking ride:', err);
      setError(err.response?.data?.message || 'Failed to complete booking.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Cancel Booking
  const handleCancelBooking = async () => {
    if (!booking) return;
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel your booking for this ride?'
    );
    if (!confirmCancel) return;

    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await bookingAPI.cancel(booking._id);
      setSuccessMsg(res.data.message || 'Booking cancelled successfully.');
      setBooking(null);
      // Reload updated ride details
      await loadData();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper: Format Dates Nicely
  const formatDateString = (timeString) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return timeString;
    }
  };

  const formatTimeString = (timeString) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  // Helper: Get Badge styles
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'CREATED':
        return { backgroundColor: '#e8f5e9', color: '#2e7d32', label: 'Booking Open' };
      case 'ACTIVE':
        return { backgroundColor: '#fff3e0', color: '#ef6c00', label: 'On The Road' };
      case 'COMPLETED':
        return { backgroundColor: '#e0f2f1', color: '#00695c', label: 'Completed' };
      case 'CANCELLED':
        return { backgroundColor: '#ffebee', color: '#c62828', label: 'Cancelled' };
      default:
        return { backgroundColor: '#f5f5f5', color: '#616161', label: status };
    }
  };

  // Shimmer Loader for the details page
  if (loading) {
    return (
      <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', animation: 'pulse 1.5s infinite' }}>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 0.4; }
          }
        `}</style>
        <div style={{ height: '20px', width: '150px', backgroundColor: 'var(--border-color)', borderRadius: '4px', marginBottom: '24px' }}></div>
        <div style={{ height: '40px', width: '60%', backgroundColor: 'var(--border-color)', borderRadius: '6px', marginBottom: '32px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', height: '240px', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px solid var(--border-color)' }}></div>
          <div style={{ backgroundColor: 'var(--bg-secondary)', height: '200px', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px solid var(--border-color)' }}></div>
        </div>
      </div>
    );
  }

  // Error block if ride failed to load
  if (error && !ride) {
    return (
      <div style={{ padding: '48px 24px', maxWidth: '600px', margin: '40px auto', textAlign: 'center', backgroundColor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 'var(--radius-md)' }}>
        <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>⚠️</span>
        <h3 style={{ color: 'var(--danger)', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Details Failed to Load</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px' }}>{error}</p>
        <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Back to Discovery
        </Link>
      </div>
    );
  }

  if (!ride) return null;

  const currentUserId = user?.id || user?._id;
  const driverIdStr = ride.driverId?._id || ride.driverId?.id || ride.driverId;
  const isDriver = currentUserId && driverIdStr && currentUserId.toString() === driverIdStr.toString();
  
  const statusBadge = getStatusBadgeStyle(ride.status);
  const seatsBooked = ride.totalSeats - ride.availableSeats;
  const seatsFillPercentage = (seatsBooked / ride.totalSeats) * 100;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Back link */}
      <div>
        <Link 
          to="/" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: 'var(--text-muted)', 
            textDecoration: 'none', 
            fontSize: '14px',
            fontWeight: '600',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
        >
          <span>←</span> Back to Discovery
        </Link>
      </div>

      {/* 2. Success/Error notifications */}
      {successMsg && (
        <div style={{ padding: '16px 20px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-sm)', color: '#065f46', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '500' }}>
          <span style={{ fontSize: '18px' }}>✓</span>
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div style={{ padding: '16px 20px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '500' }}>
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* 3. Title Header Card */}
      <div 
        style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-md)', 
          padding: '24px', 
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>
              Ride Route Details
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.5px' }}>
              {ride.source.name} ➔ {ride.destination.name}
            </h2>
          </div>
          <span style={{
            fontSize: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            padding: '6px 14px',
            borderRadius: '20px',
            backgroundColor: statusBadge.backgroundColor,
            color: statusBadge.color,
            border: `1px solid ${statusBadge.color}20`
          }}>
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* 4. Split Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Route Details, Schedule & Driver */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card: Route Segment List */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>📍 Route Stations</h3>
            
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Vertical line indicator */}
              <div style={{ position: 'absolute', left: '7px', top: '16px', bottom: '16px', width: '2px', backgroundColor: 'var(--border-color)' }}></div>

              <div style={{ display: 'flex', gap: '16px', zIndex: 1 }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#ffffff', border: '4px solid var(--accent-primary)', marginTop: '4px' }}></div>
                <div>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pickup Location</span>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px' }}>{ride.source.name}</p>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Coords: {ride.source.coordinates.latitude.toFixed(4)}, {ride.source.coordinates.longitude.toFixed(4)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', zIndex: 1 }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '2px', backgroundColor: 'var(--text-primary)', marginTop: '4px' }}></div>
                <div>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dropoff Location</span>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px' }}>{ride.destination.name}</p>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Coords: {ride.destination.coordinates.latitude.toFixed(4)}, {ride.destination.coordinates.longitude.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Driver Profile */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>👤 Driver Information</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: '700',
                color: 'var(--text-primary)'
              }}>
                {(ride.driverId?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                  {ride.driverId?.name || 'Anonymous Driver'}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  ✉ {ride.driverId?.email || 'N/A'}
                </p>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Verified Ride Pool Host
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Schedule & Booking CTA Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card: Schedule Calendar */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>📅 Departure Schedule</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>🗓</span>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>DATE</span>
                  <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{formatDateString(ride.departureTime)}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>🕒</span>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>DEPARTURE TIME</span>
                  <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{formatTimeString(ride.departureTime)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Booking Actions Box */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>🚗 Seat Capacity</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Available Seats:</span>
                <strong style={{ color: ride.availableSeats > 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {ride.availableSeats} of {ride.totalSeats} seats left
                </strong>
              </div>

              {/* Progress bar */}
              <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${100 - seatsFillPercentage}%`,
                  backgroundColor: ride.availableSeats > 0 ? 'var(--accent-primary)' : 'var(--danger)',
                  borderRadius: '10px',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isDriver ? (
                <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', margin: 0 }}>
                    🚗 You are offering this ride.
                  </p>
                </div>
              ) : booking ? (
                /* Booked State */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b98130', borderRadius: 'var(--radius-sm)', padding: '12px 16px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#047857', fontWeight: '700', margin: 0 }}>
                      {ride.status === 'COMPLETED' ? '🎫 You completed this ride!' : ride.status === 'ACTIVE' ? '🎫 You are on this ride!' : '🎫 You are booked on this ride!'}
                    </p>
                  </div>
                  {ride.status === 'CREATED' && (
                    <button
                      onClick={handleCancelBooking}
                      className="btn btn-secondary"
                      disabled={actionLoading}
                      style={{ 
                        width: '100%', 
                        color: 'var(--danger)', 
                        borderColor: '#fca5a5', 
                        backgroundColor: '#fff5f5',
                        padding: '12px'
                      }}
                    >
                      {actionLoading ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}
                </div>
              ) : (
                /* Unbooked State */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {ride.status !== 'CREATED' ? (
                    <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', textAlign: 'center' }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', margin: 0 }}>
                        Cannot join. Ride is no longer open.
                      </p>
                    </div>
                  ) : ride.availableSeats <= 0 ? (
                    <div style={{ backgroundColor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 'var(--radius-sm)', padding: '12px 16px', textAlign: 'center' }}>
                      <p style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: '600', margin: 0 }}>
                        No seats available.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleBookRide}
                      className="btn btn-primary"
                      disabled={actionLoading}
                      style={{ 
                        width: '100%', 
                        padding: '12px',
                        fontWeight: '700',
                        fontSize: '15px',
                        boxShadow: '0 4px 10px rgba(34, 197, 94, 0.2)'
                      }}
                    >
                      {actionLoading ? 'Joining...' : 'Join Ride Pool'}
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default RideDetailsPage;
