import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRooms } from '../api';

export default function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRooms()
      .then(data => {
        setRooms(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load rooms", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Loading rooms...</h2>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Available Rooms</h1>
        <Link to="/book" className="btn btn-primary">Book a Room</Link>
      </div>

      {rooms.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>No rooms found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Please add rooms from the Frappe backend.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3">
          {rooms.map(room => (
            <div key={room.name} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: 'var(--accent-color)' }}>{room.room_name}</h3>
                <span className={`badge badge-info`}>{room.room_type || 'Standard'}</span>
              </div>
              
              <div style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>
                <p><strong>Capacity:</strong> {room.capacity} people</p>
                <p><strong>Location:</strong> {room.location || `${room.block || 'Main'} Block, Floor ${room.floor || 1}`}</p>
              </div>

              <Link to={`/book?room=${room.name}`} className="btn btn-primary" style={{ width: '100%' }}>
                Select Room
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
