import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Responsive shell wrapper providing desktop sidebar, header, and mobile bottom navigation bars.
 */
const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Find Rides', icon: '🔍' },
    { path: '/offer-ride', label: 'Offer Ride', icon: '🚗' },
    { path: '/my-rides', label: 'My Offered Rides', icon: '📋' },
    { path: '/my-bookings', label: 'My Bookings', icon: '🎫' }
  ];

  return (
    <div className="app-shell">
      {/* 1. Header Navigation Bar */}
      <header className="nav-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🤝</span>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>RideSaathi</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Hi, <strong>{user?.name || 'User'}</strong>
          </span>
          <button 
            className="btn btn-secondary" 
            onClick={handleLogout}
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* 2. Page Content & Sidebar / Map View Areas */}
      <div className="main-content">
        {/* Desktop Sidebar Navigation */}
        <aside className="app-sidebar" style={{ display: 'block' }}>
          <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', paddingLeft: '12px' }}>
              Navigation
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                  textDecoration: 'none',
                  fontWeight: isActive ? '600' : '400',
                  transition: 'background-color 0.2s'
                })}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Dynamic page routes render here */}
        <main style={{ flex: 1, height: '100%', position: 'relative', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      {/* 3. Mobile Navigation Bar */}
      <nav className="mobile-nav-bar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              height: '100%',
              fontSize: '10px',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              textDecoration: 'none',
              fontWeight: isActive ? '600' : '400',
              gap: '4px'
            })}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
