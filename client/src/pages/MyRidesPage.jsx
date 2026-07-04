import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { rideAPI } from '../services/api';

const MyRidesPage = () => {
  const navigate = useNavigate();

  // API states
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Feedback states
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch driver's offered rides
  const fetchRides = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await rideAPI.getMyOffered();
      setRides(res.data || []);
    } catch (err) {
      console.error('Error fetching offered rides:', err);
      setError(
        err.response?.data?.message || 'Could not retrieve your offered rides. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  // Handle Start Ride
  const handleStartRide = async (rideId) => {
    if (!rideId) return;
    const confirmStart = window.confirm(
      'Are you sure you want to start this ride pool? It will be marked as On The Road (ACTIVE) for all joined passengers.'
    );
    if (!confirmStart) return;

    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await rideAPI.start(rideId);
      setSuccessMsg(res.data.message || 'Ride started successfully!');
      
      // Refresh list
      const updatedRes = await rideAPI.getMyOffered();
      setRides(updatedRes.data || []);
    } catch (err) {
      console.error('Error starting ride:', err);
      setError(err.response?.data?.message || 'Failed to start ride.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Cancel Ride
  const handleCancelRide = async (rideId) => {
    if (!rideId) return;
    const confirmCancel = window.confirm(
      'Warning: Are you sure you want to cancel this ride pool? This will cancel all passenger bookings and notify them.'
    );
    if (!confirmCancel) return;

    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await rideAPI.cancel(rideId);
      setSuccessMsg(res.data.message || 'Ride cancelled successfully.');
      
      // Refresh list
      const updatedRes = await rideAPI.getMyOffered();
      setRides(updatedRes.data || []);
    } catch (err) {
      console.error('Error cancelling ride:', err);
      setError(err.response?.data?.message || 'Failed to cancel ride.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Complete Ride
  const handleCompleteRide = async (rideId) => {
    if (!rideId) return;
    const confirmComplete = window.confirm(
      'Are you sure you want to mark this ride pool as COMPLETED? This signifies you have successfully reached the destination.'
    );
    if (!confirmComplete) return;

    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await rideAPI.complete(rideId);
      setSuccessMsg(res.data.message || 'Ride completed successfully!');
      
      // Refresh list
      const updatedRes = await rideAPI.getMyOffered();
      setRides(updatedRes.data || []);
    } catch (err) {
      console.error('Error completing ride:', err);
      setError(err.response?.data?.message || 'Failed to complete ride.');
    } finally {
      setActionLoading(false);
    }
  };

  // Helpers
  const formatDepartureTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

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
        return { backgroundColor: '#f5f5f5', color: '#616161', label: status || 'Unknown' };
    }
  };

  // Skeleton Card Loader
  const SkeletonLoader = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', animation: 'pulse 1.5s infinite' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
      `}</style>
      {[1, 2, 3].map((n) => (
        <div key={n} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', height: '260px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ width: '50%', height: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}></div>
            <div style={{ width: '25%', height: '18px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px' }}></div>
          </div>
          <div style={{ width: '90%', height: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', marginBottom: '12px' }}></div>
          <div style={{ width: '80%', height: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', marginBottom: '24px' }}></div>
          <div style={{ borderTop: '1px solid var(--bg-tertiary)', paddingTop: '20px', display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, height: '36px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}></div>
            <div style={{ flex: 1.5, height: '36px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}></div>
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
          My Offered Rides
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Monitor, coordinate, and manage passenger pools you are hosting.
        </p>
      </div>

      {/* Alert Banners */}
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

      {/* Main Listing Viewport */}
      {loading ? (
        <SkeletonLoader />
      ) : rides.length === 0 ? (
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
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🚗</span>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
            No Offered Rides Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
            You haven't offered any ride pools yet. Share your commute journey and save money on fuel by hosting a pool.
          </p>
          <Link to="/offer-ride" className="btn btn-primary" style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '14px' }}>
            ➕ Offer a Ride
          </Link>
        </div>
      ) : (
        /* Cards Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {rides.map((ride) => {
            const statusStyle = getStatusBadgeStyle(ride.status);
            const totalSeatsNum = parseInt(ride.totalSeats || 0, 10);
            const availableSeatsNum = parseInt(ride.availableSeats || 0, 10);
            const occupiedSeatsNum = Math.max(0, totalSeatsNum - availableSeatsNum);
            
            // Calculate progress percent defensively
            const fillPercentage = totalSeatsNum > 0 ? (occupiedSeatsNum / totalSeatsNum) * 100 : 0;
            const bookingCountVal = ride.bookingCount || 0;

            return (
              <div
                key={ride._id}
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
                {/* Header: Title and Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Ride Host Pool
                    </span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: statusStyle.backgroundColor,
                    color: statusStyle.color
                  }}>
                    {statusStyle.label}
                  </span>
                </div>

                {/* Route Stations */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ position: 'absolute', left: '5px', top: '8px', bottom: '8px', width: '2px', backgroundColor: '#cbd5e1' }}></div>
                  
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', border: '2px solid #ffffff' }}></div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {ride.source?.name || 'Unknown source'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--text-primary)', border: '1px solid #ffffff' }}></div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {ride.destination?.name || 'Unknown destination'}
                    </span>
                  </div>
                </div>

                {/* Schedule and Active Bookings Counts */}
                <div style={{ borderTop: '1px solid var(--bg-tertiary)', borderBottom: '1px solid var(--bg-tertiary)', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <div>📅 Departure: <strong>{formatDepartureTime(ride.departureTime)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🎫 Active Bookings:</span>
                    <strong>{bookingCountVal} booking{bookingCountVal !== 1 ? 's' : ''}</strong>
                  </div>
                </div>

                {/* Seats Capacity Indicators */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>Seats status: <strong>{occupiedSeatsNum} occupied / {availableSeatsNum} free</strong></span>
                    <span style={{ fontWeight: '600' }}>Total: {totalSeatsNum}</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${fillPercentage}%`,
                      backgroundColor: 'var(--accent-primary)',
                      borderRadius: '10px',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>

                {/* Card Actions Layout */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  <button
                    onClick={() => ride._id && navigate(`/rides/${ride._id}`)}
                    disabled={!ride._id}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '13px', minWidth: '100px', opacity: ride._id ? 1 : 0.5 }}
                  >
                    Details
                  </button>

                  {ride.status === 'CREATED' ? (
                    <>
                      <button
                        onClick={() => handleCancelRide(ride._id)}
                        disabled={actionLoading}
                        className="btn btn-secondary"
                        style={{ 
                          flex: 1, 
                          padding: '8px 12px', 
                          fontSize: '13px', 
                          color: 'var(--danger)', 
                          borderColor: '#fecaca',
                          backgroundColor: '#fff5f5',
                          minWidth: '100px'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleStartRide(ride._id)}
                        disabled={actionLoading}
                        className="btn btn-primary"
                        style={{ flex: 1.5, padding: '8px 12px', fontSize: '13px', minWidth: '110px' }}
                      >
                        Start Ride
                      </button>
                    </>
                  ) : ride.status === 'ACTIVE' ? (
                    <button
                      onClick={() => handleCompleteRide(ride._id)}
                      disabled={actionLoading}
                      className="btn btn-primary"
                      style={{ flex: 2.5, padding: '8px 12px', fontSize: '13px', minWidth: '150px' }}
                    >
                      Complete Ride
                    </button>
                  ) : (
                    <div style={{ flex: 2.5, backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '8px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {ride.status === 'COMPLETED' ? 'Ride Completed' : 'Ride Cancelled'}
                    </div>
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

export default MyRidesPage;
