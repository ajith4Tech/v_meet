import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRooms, postBooking } from '../api';

export default function BookingForm() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract room from query params if available
  const queryParams = new URLSearchParams(location.search);
  const initialRoom = queryParams.get('room') || '';

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    room: initialRoom,
    from_time: '',
    to_time: '',
    status: 'Pending'
  });

  useEffect(() => {
    getRooms().then(data => setRooms(data || [])).catch(err => console.error("Error loading rooms", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get logged in user
      const userRes = await fetch('/api/method/frappe.auth.get_logged_user');
      const userData = await userRes.json();
      const currentUser = userData.message || 'Administrator';

      // Format datetime from YYYY-MM-DDTHH:MM to YYYY-MM-DD HH:MM:SS
      const formatDateTime = (dt) => {
        if (!dt) return '';
        const replaced = dt.replace('T', ' ');
        return replaced.split(':').length === 2 ? `${replaced}:00` : replaced;
      };

      const payload = {
        ...formData,
        user: currentUser,
        from_time: formatDateTime(formData.from_time),
        to_time: formatDateTime(formData.to_time)
      };

      console.log("Sending booking payload:", payload);
      await postBooking(payload);
      navigate('/my-bookings');
    } catch (err) {
      console.error("Full Error Object:", err);
      console.error("Error Status:", err.response?.status);
      console.error("Error Response:", err.response?.data);
      
      let errMsg = 'Failed to create booking. Please check your inputs and try again.';
      
      if (err.response && err.response.data) {
        console.error("Response Data Keys:", Object.keys(err.response.data));
        
        if (err.response.data._server_messages) {
          try {
            const messages = JSON.parse(err.response.data._server_messages);
            if (Array.isArray(messages) && messages.length > 0) {
              const firstMsg = JSON.parse(messages[0]);
              errMsg = firstMsg.message || JSON.stringify(firstMsg);
            } else {
              errMsg = err.response.data._server_messages;
            }
          } catch(e) {
            errMsg = err.response.data._server_messages;
          }
        } else if (err.response.data.message) {
          errMsg = err.response.data.message;
        } else if (err.response.data.exc_type) {
          errMsg = err.response.data.exc_type;
        } else if (err.response.data.exc) {
          errMsg = err.response.data.exc;
        } else {
          // Fallback: show entire response for debugging
          errMsg = JSON.stringify(err.response.data);
        }
      }

      setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Book a Room</h1>

      <div className="glass-panel">
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="room">Select Room</label>
            <select 
              id="room" 
              name="room" 
              className="input-field" 
              value={formData.room} 
              onChange={handleChange}
              required
            >
              <option value="" disabled>-- Select a room --</option>
              {rooms.map(r => (
                <option key={r.name} value={r.name}>{r.room_name} ({r.capacity} pax)</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="from_time">From Time</label>
            <input 
              type="datetime-local" 
              id="from_time" 
              name="from_time" 
              className="input-field" 
              value={formData.from_time} 
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label htmlFor="to_time">To Time</label>
            <input 
              type="datetime-local" 
              id="to_time" 
              name="to_time" 
              className="input-field" 
              value={formData.to_time} 
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
