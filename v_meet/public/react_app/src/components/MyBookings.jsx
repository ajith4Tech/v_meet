import { useState, useEffect } from 'react';
import { getBookings } from '../api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookings()
      .then(data => {
        setBookings(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load bookings", err);
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return 'badge-success';
      case 'Pending': return 'badge-warning';
      case 'Occupied': return 'badge-danger';
      case 'Free To Use': return 'badge-info';
      default: return 'badge-info';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Loading your bookings...</h2>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: '2rem' }}>My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>No bookings found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't made any room bookings yet.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                <th style={{ padding: '1rem' }}>Booking ID</th>
                <th style={{ padding: '1rem' }}>Room</th>
                <th style={{ padding: '1rem' }}>From</th>
                <th style={{ padding: '1rem' }}>To</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{booking.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--accent-color)' }}>{booking.room}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{formatDate(booking.from_time)}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{formatDate(booking.to_time)}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${getStatusBadge(booking.status)}`}>
                      {booking.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
