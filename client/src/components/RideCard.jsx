import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RideCard renders individual ride listings with modern dashboard aesthetics.
 * 
 * @param {Object} props
 * @param {Object} props.ride - The ride object from backend
 */
const RideCard = ({ ride }) => {
  const navigate = useNavigate();
  
  const {
    _id,
    driverId,
    source,
    destination,
    departureTime,
    totalSeats,
    availableSeats,
    status
  } = ride;

  // Format departure date and time nicely
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

  // Get status badge colors
  const getStatusStyle = (rideStatus) => {
    switch (rideStatus) {
      case 'CREATED':
        return { backgroundColor: '#e8f5e9', color: '#2e7d32', label: 'Open' };
      case 'ACTIVE':
        return { backgroundColor: '#fff3e0', color: '#ef6c00', label: 'On Road' };
      case 'COMPLETED':
        return { backgroundColor: '#e0f2f1', color: '#00695c', label: 'Finished' };
      case 'CANCELLED':
        return { backgroundColor: '#ffebee', color: '#c62828', label: 'Cancelled' };
      default:
        return { backgroundColor: '#f5f5f5', color: '#616161', label: rideStatus };
    }
  };

  const { user } = useAuth();
  const statusStyle = getStatusStyle(status);
  const driverName = driverId?.name || 'Anonymous Driver';
  const driverInitial = driverName.charAt(0).toUpperCase();
  const seatsBooked = totalSeats - availableSeats;
  const fillPercentage = (seatsBooked / totalSeats) * 100;

  const currentUserId = user?.id || user?._id;
  const driverIdStr = driverId?._id || driverId?.id || driverId;
  const isDriver = currentUserId && driverIdStr && (currentUserId.toString() === driverIdStr.toString());

  const handleBookClick = () => {
    navigate(`/rides/${_id}`);
  };

  const handleViewDetails = () => {
    navigate(`/rides/${_id}`);
  };

  return (
    <div 
      className="ride-card"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        cursor: 'default'
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
      {/* Card Header: Driver Info & Ride Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Driver Avatar Circle */}
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '14px',
            border: '1px solid var(--border-color)'
          }}>
            {driverInitial}
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: 'var(--text-primary)' }}>{driverName}</h4>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Driver Offer</span>
          </div>
        </div>
        
        {/* Status Badge */}
        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          padding: '4px 10px',
          borderRadius: '20px',
          letterSpacing: '0.5px',
          backgroundColor: statusStyle.backgroundColor,
          color: statusStyle.color
        }}>
          {statusStyle.label}
        </span>
      </div>

      {/* Card Body: Route visual representation */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Connecting Line */}
        <div style={{
          position: 'absolute',
          left: '5px',
          top: '12px',
          bottom: '12px',
          width: '2px',
          backgroundColor: '#e2e8f0',
          zIndex: 0
        }}></div>

        {/* Source point */}
        <div style={{ display: 'flex', gap: '14px', zIndex: 1 }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: '3px solid var(--accent-primary)',
            marginTop: '4px'
          }}></div>
          <div style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Pickup</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', wordBreak: 'break-word' }}>{source.name}</span>
          </div>
        </div>

        {/* Destination point */}
        <div style={{ display: 'flex', gap: '14px', zIndex: 1 }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: 'var(--text-primary)',
            borderRadius: '2px',
            marginTop: '4px'
          }}></div>
          <div style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Dropoff</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', wordBreak: 'break-word' }}>{destination.name}</span>
          </div>
        </div>
      </div>

      {/* Card Metadata: Schedule and Seats */}
      <div style={{ 
        borderTop: '1px solid var(--bg-tertiary)',
        borderBottom: '1px solid var(--bg-tertiary)',
        padding: '12px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Departure Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <span style={{ fontSize: '14px' }}>📅</span>
          <span>Departure: <strong>{formatDepartureTime(departureTime)}</strong></span>
        </div>

        {/* Seats Progress Visual */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px' }}>🚗</span>
              <span>Available Seats:</span>
            </div>
            <strong style={{ color: availableSeats > 0 ? 'var(--success)' : 'var(--danger)' }}>
              {availableSeats} of {totalSeats} left
            </strong>
          </div>
          {/* Seats bar */}
          <div style={{
            height: '6px',
            width: '100%',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${100 - fillPercentage}%`,
              backgroundColor: availableSeats > 0 ? 'var(--accent-primary)' : 'var(--danger)',
              borderRadius: '10px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>
      </div>

      {/* Card Actions: Book and Details */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <button 
          onClick={handleViewDetails}
          className="btn btn-secondary" 
          style={{ flex: 1, padding: '10px', fontSize: '13px' }}
        >
          View Details
        </button>
        <button 
          onClick={handleBookClick}
          className="btn btn-primary" 
          disabled={availableSeats === 0 || status !== 'CREATED' || isDriver}
          style={{ 
            flex: 1.5, 
            padding: '10px', 
            fontSize: '13px',
            opacity: (availableSeats === 0 || status !== 'CREATED' || isDriver) ? 0.5 : 1,
            cursor: (availableSeats === 0 || status !== 'CREATED' || isDriver) ? 'not-allowed' : 'pointer'
          }}
        >
          {isDriver ? 'Your Ride' : 'Book Ride'}
        </button>
      </div>
    </div>
  );
};

export default RideCard;
