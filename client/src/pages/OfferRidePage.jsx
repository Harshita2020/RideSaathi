import React from 'react';

/**
 * Skeleton placeholder for OfferRidePage.
 * Will render ride parameters fields (sources, destinations, schedules, seats).
 */
const OfferRidePage = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '16px' }}>Offer a Ride</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        This page allows drivers to publish new ride options by entering source coordinates, destination coordinates, seat availability, and departure schedule.
      </p>
      <div style={{ border: '1px dashed var(--border-color)', padding: '40px', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)' }}>
        [Create Ride Offer Form Pending]
      </div>
    </div>
  );
};

export default OfferRidePage;
