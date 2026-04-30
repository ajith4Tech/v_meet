import { Link, useLocation } from 'react-router-dom';
import './Navbar.css'; // Let's define specific navbar styles here

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <span className="logo-text">V-Meet</span>
          </Link>
        </div>
        <ul className="navbar-menu">
          <li>
            <Link to="/" className={isActive('/')}>Dashboard</Link>
          </li>
          <li>
            <Link to="/book" className={isActive('/book')}>Book a Room</Link>
          </li>
          <li>
            <Link to="/my-bookings" className={isActive('/my-bookings')}>My Bookings</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
