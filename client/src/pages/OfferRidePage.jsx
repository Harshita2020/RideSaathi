import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rideAPI } from '../services/api';

// TODO: Replace with real user-selected coordinates when Maps/Places Autocomplete is integrated.
const MOCK_COORDINATES = {
  latitude: 30.7333,
  longitude: 76.7794
};

const OfferRidePage = () => {
  const navigate = useNavigate();

  // Form Fields
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0]);
  const [departureTime, setDepartureTime] = useState('');
  const [totalSeats, setTotalSeats] = useState(4);

  // States for UX Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Validation checks
    if (!source.trim()) {
      setError('Pickup location is required.');
      return;
    }
    if (!destination.trim()) {
      setError('Destination is required.');
      return;
    }
    if (!departureDate) {
      setError('Departure date is required.');
      return;
    }
    if (!departureTime) {
      setError('Departure time is required.');
      return;
    }
    if (!totalSeats || totalSeats < 1) {
      setError('Total seats must be at least 1.');
      return;
    }

    // Combine date and time in local format
    const departureDateTime = new Date(`${departureDate}T${departureTime}`);
    if (isNaN(departureDateTime.getTime())) {
      setError('Please select a valid date and time.');
      return;
    }

    if (departureDateTime <= new Date()) {
      setError('Departure date and time must be in the future.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        source: {
          name: source.trim(),
          coordinates: MOCK_COORDINATES
        },
        destination: {
          name: destination.trim(),
          coordinates: MOCK_COORDINATES
        },
        departureTime: departureDateTime.toISOString(),
        totalSeats: parseInt(totalSeats, 10)
      };

      await rideAPI.create(payload);
      setSuccessMsg('Ride offered successfully!');
      
      // Navigate immediately to My Offered Rides
      navigate('/my-rides');
    } catch (err) {
      console.error('Error creating ride pool:', err);
      setError(
        err.response?.data?.message || 'Failed to create ride pool. Please check your network connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 24px', maxWidth: '650px', margin: '0 auto' }}>
      
      {/* Form Card */}
      <div 
        style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-md)', 
          padding: '32px', 
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Header Title */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '8px', color: 'var(--text-primary)' }}>
            Offer a Ride Pool
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
            Publish a new commute pool and share your journey with other passengers.
          </p>
        </div>

        {/* Success/Error Alerts */}
        {successMsg && (
          <div style={{ padding: '12px 16px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-sm)', color: '#065f46', fontSize: '14px', fontWeight: '500', marginBottom: '20px' }}>
            ✓ {successMsg}
          </div>
        )}
        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', color: '#991b1b', fontSize: '14px', fontWeight: '500', marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Pickup location */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="source-input" style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              📍 Pickup Location
            </label>
            <input
              id="source-input"
              type="text"
              className="form-input"
              placeholder="Enter pickup point (e.g. Bathinda Bus Stand)"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Destination */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="destination-input" style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              🏁 Destination
            </label>
            <input
              id="destination-input"
              type="text"
              className="form-input"
              placeholder="Enter ending point (e.g. Chandigarh Sector 17)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Date & Time Row (side-by-side on desktop, stack on mobile) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {/* Date */}
            <div className="form-group" style={{ flex: 1, minWidth: '240px', margin: 0 }}>
              <label htmlFor="date-input" style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                📅 Departure Date
              </label>
              <input
                id="date-input"
                type="date"
                className="form-input"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                disabled={loading}
                required
              />
            </div>

            {/* Time */}
            <div className="form-group" style={{ flex: 1, minWidth: '240px', margin: 0 }}>
              <label htmlFor="time-input" style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                🕒 Departure Time
              </label>
              <input
                id="time-input"
                type="time"
                className="form-input"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Seats (in its own compact row) */}
          <div className="form-group" style={{ maxWidth: '280px', margin: 0 }}>
            <label htmlFor="seats-input" style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              🚗 Available Seats
            </label>
            <input
              id="seats-input"
              type="number"
              className="form-input"
              value={totalSeats}
              onChange={(e) => setTotalSeats(e.target.value)}
              min="1"
              max="10"
              disabled={loading}
              required
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--bg-tertiary)', paddingTop: '24px', marginTop: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              disabled={loading}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1.5, boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)' }}
            >
              {loading ? 'Creating...' : 'Publish Ride Pool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferRidePage;
