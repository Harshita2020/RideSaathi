import React, { useState, useEffect } from 'react';
import { rideAPI } from '../services/api';
import RideCard from '../components/RideCard';

/**
 * HomePage handles ride search, filtering, and listing.
 * Aligns with RideWhat action do you want to perform on localhost?
Which URL will you access?
What are you trying to verify?Saathi UI Design System guidelines.
 */
const HomePage = () => {
  // Filter Inputs (draft states)
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');

  // Active Query Parameters
  const [activeSource, setActiveSource] = useState('');
  const [activeDestination, setActiveDestination] = useState('');

  // API states
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch function
  const fetchRides = async (searchParams = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = await rideAPI.getAll(searchParams);
      // Backend returns a JSON array of rides
      setRides(response.data || []);
    } catch (err) {
      console.error('Error fetching rides:', err);
      setError(
        err.response?.data?.message || 
        'Could not connect to the server. Please check your network connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch rides on mount and when active query filters change
  useEffect(() => {
    const params = {};
    if (activeSource.trim()) params.source = activeSource.trim();
    if (activeDestination.trim()) params.destination = activeDestination.trim();
    
    fetchRides(params);
  }, [activeSource, activeDestination]);

  // Handle Search Submission
  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSource(source);
    setActiveDestination(destination);
  };

  // Handle Reset Filters
  const handleReset = () => {
    setSource('');
    setDestination('');
    setActiveSource('');
    setActiveDestination('');
  };

  // Shimmer Skeleton for loading state
  const SkeletonCard = () => (
    <div 
      className="skeleton-card"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        opacity: 0.7,
        animation: 'pulse 1.5s infinite ease-in-out'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)' }}></div>
          <div>
            <div style={{ width: '100px', height: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', marginBottom: '6px' }}></div>
            <div style={{ width: '60px', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}></div>
          </div>
        </div>
        <div style={{ width: '60px', height: '18px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px' }}></div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '8px 0' }}>
        <div style={{ width: '90%', height: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}></div>
        <div style={{ width: '75%', height: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}></div>
      </div>

      <div style={{ borderTop: '1px solid var(--bg-tertiary)', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ width: '60%', height: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}></div>
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}></div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1, height: '36px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}></div>
        <div style={{ flex: 1.5, height: '36px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}></div>
      </div>
    </div>
  );

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '24px',
      minHeight: '100%',
      overflowY: 'auto'
    }}>
      {/* Pulse Keyframe Animation Inject */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Header and Description */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px', color: 'var(--text-primary)' }}>
          Discover Rides
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Find active and upcoming commute pools heading to your destination.
        </p>
      </div>

      {/* Search and Filters Form */}
      <form 
        onSubmit={handleSearch}
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
          gap: '16px' 
        }}>
          {/* Source Input */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="source-filter" style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              📍 Starting Point (Source)
            </label>
            <input
              id="source-filter"
              type="text"
              placeholder="e.g. Bathinda Bus Stand..."
              className="form-input"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              style={{ padding: '10px 14px', fontSize: '14px' }}
            />
          </div>

          {/* Destination Input */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="dest-filter" style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              🏁 Ending Point (Destination)
            </label>
            <input
              id="dest-filter"
              type="text"
              placeholder="e.g. Chandigarh Sector 17..."
              className="form-input"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              style={{ padding: '10px 14px', fontSize: '14px' }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--bg-tertiary)', paddingTop: '16px' }}>
          {(source || destination || activeSource || activeDestination) && (
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Clear Filters
            </button>
          )}
          <button 
            type="submit"
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: '14px', gap: '6px' }}
          >
            <span>🔍</span> Search Rides
          </button>
        </div>
      </form>

      {/* Main Listing Viewport */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Active Filters Summary Badge */}
        {(activeSource || activeDestination) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <span>Filtered results for:</span>
            {activeSource && (
              <span style={{ backgroundColor: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '12px', fontWeight: '600', color: 'var(--text-primary)', fontSize: '12px' }}>
                From: {activeSource}
              </span>
            )}
            {activeDestination && (
              <span style={{ backgroundColor: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '12px', fontWeight: '600', color: 'var(--text-primary)', fontSize: '12px' }}>
                To: {activeDestination}
              </span>
            )}
          </div>
        )}

        {/* State Conditional Render */}
        {loading ? (
          /* 1. Loading Shimmer Grid */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          /* 2. Error View Block */
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            backgroundColor: '#fff5f5',
            border: '1px solid #fed7d7',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger)',
            maxWidth: '600px',
            margin: '20px auto'
          }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>⚠️</span>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Failed to Load Rides</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
              {error}
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => fetchRides({ source: activeSource, destination: activeDestination })}
              style={{ backgroundColor: 'var(--danger)', color: '#ffffff' }}
            >
              Try Again
            </button>
          </div>
        ) : rides.length === 0 ? (
          /* 3. Empty State View Block */
          <div style={{
            textAlign: 'center',
            padding: '60px 24px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px dashed var(--border-color)',
            borderRadius: 'var(--radius-md)',
            maxWidth: '600px',
            margin: '20px auto'
          }}>
            <span style={{ fontSize: '50px', display: 'block', marginBottom: '16px' }}>🚗</span>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
              No Available Rides
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
              {(activeSource || activeDestination) 
                ? "No rides match your current filters. Try relaxing your search criteria or reset the filters."
                : "No rides have been registered yet. Be the first to publish a ride offer!"}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {(activeSource || activeDestination) && (
                <button className="btn btn-secondary" onClick={handleReset} style={{ fontSize: '14px', padding: '10px 18px' }}>
                  Reset Filters
                </button>
              )}
              <a 
                href="/offer-ride" 
                className="btn btn-primary"
                style={{ fontSize: '14px', padding: '10px 18px', textDecoration: 'none', display: 'inline-flex' }}
              >
                Offer a Ride
              </a>
            </div>
          </div>
        ) : (
          /* 4. Loaded Grid of Ride Cards */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {rides.map((ride) => (
              <RideCard key={ride._id} ride={ride} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
