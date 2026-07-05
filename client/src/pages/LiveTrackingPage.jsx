import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSocket } from '../context/SocketContext';
import { rideAPI } from '../services/api';

// ─── Fix Leaflet default marker icon broken by Vite asset bundling ───────────
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
// ─────────────────────────────────────────────────────────────────────────────

// Custom pulsing driver icon
const driverIcon = new L.DivIcon({
  className: '',
  html: `
    <div style="
      width: 20px; height: 20px;
      background: #f97316;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(249,115,22,0.6);
      animation: ripple 1.4s infinite;
    "></div>
    <style>
      @keyframes ripple {
        0%   { box-shadow: 0 0 0 0 rgba(249,115,22,0.6); }
        70%  { box-shadow: 0 0 0 12px rgba(249,115,22,0); }
        100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); }
      }
    </style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -14],
});

/**
 * Inner component: imperatively re-centres the map when driverPos changes.
 * Must be a child of <MapContainer> so it can call useMap().
 */
const MapController = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────

const LiveTrackingPage = () => {
  const { id: rideId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  // [lat, lng] | null
  const [driverPos, setDriverPos] = useState(null);
  const [rideStatus, setRideStatus] = useState(null); // 'COMPLETED' | 'CANCELLED' | null
  const [socketError, setSocketError] = useState('');

  // Track whether we have joined the room so we only do it once
  const joinedRef = useRef(false);

  // ── Seed initial position from persisted currentLocation ─────────────────
  useEffect(() => {
    if (!rideId) return;
    rideAPI.getDetails(rideId)
      .then((res) => {
        const loc = res.data?.currentLocation;
        if (loc?.latitude != null && loc?.longitude != null) {
          setDriverPos([loc.latitude, loc.longitude]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch initial driver location", err);
      });
  }, [rideId]);
  // ─────────────────────────────────────────────────────────────────────────

  // ── Socket setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !rideId) return;

    // Join the ride room once
    if (!joinedRef.current) {
      socket.emit('join-ride-room', { rideId });
      joinedRef.current = true;
    }

    const onLocationUpdated = ({ latitude, longitude }) => {
      setDriverPos([latitude, longitude]);
    };

    const onStatusChanged = ({ status }) => {
      setRideStatus(status);
    };

    const onRideError = ({ message }) => {
      setSocketError(message || 'A socket error occurred.');
    };

    socket.on('location-updated', onLocationUpdated);
    socket.on('ride-status-changed', onStatusChanged);
    socket.on('ride-error', onRideError);

    return () => {
      // Leave room and remove listeners on unmount
      socket.emit('leave-ride-room', { rideId });
      socket.off('location-updated', onLocationUpdated);
      socket.off('ride-status-changed', onStatusChanged);
      socket.off('ride-error', onRideError);
      joinedRef.current = false;
    };
  }, [socket, rideId]);
  // ─────────────────────────────────────────────────────────────────────────

  // Default map centre (India) until first location arrives
  const DEFAULT_CENTER = [20.5937, 78.9629];
  const mapCenter = driverPos || DEFAULT_CENTER;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'calc(100vh - 64px)' }}>

      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <div style={{
        padding: '12px 20px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0,
        zIndex: 20,
      }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          style={{ padding: '6px 14px', fontSize: '13px' }}
        >
          ← Back
        </button>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
            Live Tracking
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
            Room: <code style={{ fontSize: '11px' }}>ride:{rideId}</code>
          </p>
        </div>

        {/* Live indicator dot */}
        {driverPos && !rideStatus && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#059669', fontWeight: '600' }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: '#10b981', display: 'inline-block',
              animation: 'pulse 1.5s infinite',
            }} />
            Live
          </div>
        )}
      </div>

      {/* ── Status banners (above map) ──────────────────────────────────── */}
      {socketError && (
        <div style={{
          padding: '10px 20px', backgroundColor: '#fef2f2',
          borderBottom: '1px solid #fca5a5', color: '#991b1b',
          fontSize: '13px', fontWeight: '500', flexShrink: 0,
        }}>
          ⚠️ {socketError}
        </div>
      )}

      {rideStatus === 'COMPLETED' && (
        <div style={{
          padding: '12px 20px', backgroundColor: '#ecfdf5',
          borderBottom: '1px solid #a7f3d0', color: '#065f46',
          fontSize: '14px', fontWeight: '600', flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          🎉 The driver has completed the ride. You have arrived!
        </div>
      )}

      {rideStatus === 'CANCELLED' && (
        <div style={{
          padding: '12px 20px', backgroundColor: '#fef2f2',
          borderBottom: '1px solid #fca5a5', color: '#991b1b',
          fontSize: '14px', fontWeight: '600', flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          ❌ This ride has been cancelled.
        </div>
      )}

      {/* ── Map area ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', minHeight: '400px' }}>

        {/* Waiting overlay — shown until first location arrives */}
        {!driverPos && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#111827',
            color: 'var(--text-secondary)',
            gap: '12px',
          }}>
            {/* Spinner */}
            <div style={{
              width: '36px', height: '36px',
              border: '4px solid rgba(255,255,255,0.1)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 0.9s linear infinite',
            }} />
            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
              }
            `}</style>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>
              Waiting for driver's location…
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
              The map will appear once the driver starts sharing GPS.
            </p>
          </div>
        )}

        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ width: '100%', height: '100%', minHeight: '400px' }}
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Re-centre the map whenever driver position changes */}
          {driverPos && <MapController position={driverPos} />}

          {/* Driver marker */}
          {driverPos && (
            <Marker position={driverPos} icon={driverIcon}>
              <Popup>Driver is here</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveTrackingPage;
