import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';

/**
 * MyBookingsPage lists all rides booked by the current user as a passenger.
 * Allows filtering by Active vs Past/Cancelled states, cancellation actions, and redirection.
 */
const MyBookingsPage = () => {
  const navigate = useNavigate();

  // API states
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Feedback states
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Active tab state: 'active' or 'history'
  const [activeTab, setActiveTab] = useState('active');

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await bookingAPI.getMyBookings();
      // res.data is a list of bookings sorted by creation date
      setBookings(res.data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(
        err.response?.data?.message || 'Could not fetch your bookings. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Handle Cancellation
  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this ride booking?');
    if (!confirmCancel) return;

    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await bookingAPI.cancel(bookingId);
      setSuccessMsg(res.data.message || 'Booking cancelled successfully.');
      
      // Refresh list
      const bookingsRes = await bookingAPI.getMyBookings();
      setBookings(bookingsRes.data || []);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.response?.data?.message || 'Failed to cancel this booking.');
    } finally {
      setActionLoading(false);
    }
  };

  // Date/Time formatting helpers
  const formatDepartureTime = (timeString) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return timeString;
    }
  };

  // Helper: Check if departure has passed
  const isPastDeparture = (timeString) => {
    try {
      return new Date(timeString) < new Date();
    } catch (e) {
      return false;
    }
  };

  // Filter bookings based on activeTab
  const filteredBookings = bookings.filter((b) => {
    const isCancelled = b.status === 'CANCELLED';
    const isRideFinished = b.rideId?.status === 'COMPLETED' || b.rideId?.status === 'CANCELLED';
    const isTimePassed = isPastDeparture(b.rideId?.departureTime);

    if (activeTab === 'active') {
      // Active booking = booked status, ride is open or active, and departure is in the future
      return !isCancelled && !isRideFinished && !isTimePassed;
    } else {
      // History/Cancelled = cancelled status, or ride completed/cancelled, or departure passed
      return isCancelled || isRideFinished || isTimePassed;
    }
  });

  // Render Status Badge
  const renderBookingStatus = (booking) => {
    const isCancelled = booking.status === 'CANCELLED';
    const rideStatus = booking.rideId?.status;

    if (isCancelled) {
      return (
        <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '20px', backgroundColor: '#ffebee', color: '#c62828' }}>
          Cancelled
        </span>
      );
    }

    switch (rideStatus) {
      case 'ACTIVE':
        return (
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '20px', backgroundColor: '#fff3e0', color: '#ef6c00' }}>
            On Road
          </span>
        );
      case 'COMPLETED':
        return (
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '20px', backgroundColor: '#e0f2f1', color: '#00695c' }}>
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '20px', backgroundColor: '#ffebee', color: '#c62828' }}>
            Ride Cancelled
          </span>
        );
      default:
        return (
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '20px', backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
            Confirmed
          </span>
        );
    }
  };

  // Skeleton Loader elements
  const SkeletonLoader = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', animation: 'pulse 1.5s infinite' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
      `}</style>
      {[1, 2, 3].map((n) => (
        <div key={n} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', height: '220px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ width: '40%', height: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}></div>
            <div style={{ width: '25%', height: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px' }}></div>
          </div>
          <div style={{ width: '90%', height: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', marginBottom: '12px' }}></div>
          <div style={{ width: '80%', height: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', marginBottom: '20px' }}></div>
          <div style={{ borderTop: '1px solid var(--bg-tertiary)', paddingTop: '16px', display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, height: '36px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}></div>
            <div style={{ flex: 1, height: '36px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Info */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px', color: 'var(--text-primary)' }}>
          My Bookings
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Track and manage commute pools you have joined as a passenger.
        </p>
      </div>

      {/* Alert Messaging */}
      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-sm)', color: '#065f46', fontSize: '14px', fontWeight: '500' }}>
          ✓ {successMsg}
        </div>
      )}
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', color: '#991b1b', fontSize: '14px', fontWeight: '500' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Tabs Layout */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            border: 'none',
            borderBottom: activeTab === 'active' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'active' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'color 0.2s, border-color 0.2s'
          }}
        >
          Active Bookings ({bookings.filter(b => b.status === 'BOOKED' && !isPastDeparture(b.rideId?.departureTime) && b.rideId?.status !== 'COMPLETED' && b.rideId?.status !== 'CANCELLED').length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            border: 'none',
            borderBottom: activeTab === 'history' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'history' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'color 0.2s, border-color 0.2s'
          }}
        >
          Past & Cancelled
        </button>
      </div>

      {/* Content area */}
      {loading ? (
        <SkeletonLoader />
      ) : filteredBookings.length === 0 ? (
        /* Empty State */
        <div 
          style={{ 
            textAlign: 'center', 
            padding: '64px 24px', 
            backgroundColor: 'var(--bg-secondary)', 
            border: '1px dashed var(--border-color)', 
            borderRadius: 'var(--radius-md)',
            maxWidth: '600px',
            margin: '20px auto'
          }}
        >
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🎫</span>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
            No Bookings Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
            {activeTab === 'active' 
              ? "You do not have any active ride bookings. Discover upcoming rides and join them."
              : "No historical or cancelled booking records found."}
          </p>
          {activeTab === 'active' && (
            <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '14px' }}>
              🔍 Find Rides
            </Link>
          )}
        </div>
      ) : (
        /* Cards Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredBookings.map((b) => {
            const ride = b.rideId || {};
            const driver = ride.driverId || {};
            const isCancelled = b.status === 'CANCELLED';

            return (
              <div
                key={b._id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                {/* Header: Driver Info and Booking Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: '11px',
                      border: '1px solid var(--border-color)'
                    }}>
                      {(driver.name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: 'var(--text-primary)' }}>
                        {driver.name || 'Anonymous Driver'}
                      </h4>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Driver Host</span>
                    </div>
                  </div>
                  {renderBookingStatus(b)}
                </div>

                {/* Route Segment */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ position: 'absolute', left: '5px', top: '8px', bottom: '8px', width: '2px', backgroundColor: '#cbd5e1' }}></div>
                  
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', border: '2px solid #ffffff' }}></div>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {ride.source?.name || 'Unknown source'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--text-primary)', border: '1px solid #ffffff' }}></div>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {ride.destination?.name || 'Unknown destination'}
                    </span>
                  </div>
                </div>

                {/* Date & Contact Info */}
                <div style={{ borderTop: '1px solid var(--bg-tertiary)', borderBottom: '1px solid var(--bg-tertiary)', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <div>📅 Departure: <strong>{formatDepartureTime(ride.departureTime)}</strong></div>
                  {driver.email && <div>✉ Contact: <span style={{ color: 'var(--text-muted)' }}>{driver.email}</span></div>}
                </div>

                {/* Footer buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button
                    onClick={() => navigate(`/rides/${ride._id}`)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                  >
                    View Details
                  </button>

                  {/* Cancel Booking only if status is BOOKED */}
                  {!isCancelled && (
                    <button
                      onClick={() => handleCancelBooking(b._id)}
                      disabled={actionLoading}
                      className="btn btn-secondary"
                      style={{ 
                        flex: 1.2, 
                        padding: '8px 12px', 
                        fontSize: '13px', 
                        color: 'var(--danger)', 
                        borderColor: '#fecaca',
                        backgroundColor: '#fff5f5' 
                      }}
                    >
                      Cancel Ride
                    </button>
                  )}

                  {/* Track Live button helper if ride is ACTIVE */}
                  {ride.status === 'ACTIVE' && !isCancelled && (
                    <button
                      onClick={() => navigate(`/tracking/${ride._id}`)}
                      className="btn btn-primary"
                      style={{ flex: 1.2, padding: '8px 12px', fontSize: '13px' }}
                    >
                      Track Live 📡
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
