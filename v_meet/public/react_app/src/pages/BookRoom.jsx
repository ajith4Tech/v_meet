import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRooms, getBookings, postBooking, getCurrentUser } from '../api';

const BookRoom = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    room: '',
    from_time: '',
    to_time: '',
    status: 'Pending'
  });

  useEffect(() => {
    Promise.all([getRooms(), getBookings()])
      .then(([roomsData, bookingsData]) => {
        setRooms(roomsData || []);
        setAllBookings(bookingsData || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load data", err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const user = await getCurrentUser();
      const currentUser = user?.name || 'Administrator';

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

      await postBooking(payload);
      setShowSuccess(true);
    } catch (err) {
      let msg = 'Failed to create booking. Please check your inputs and try again.';
      if (err.response?.data?._server_messages) {
        try {
          const messages = JSON.parse(err.response.data._server_messages);
          if (Array.isArray(messages) && messages.length > 0) {
            msg = JSON.parse(messages[0]).message || msg;
          }
        } catch(e) {}
      } else if (err.response?.data?.exc) {
          msg = "Server error occurred during validation. Check if time overlaps.";
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for Time Gaps
  const getSelectedDateBookings = () => {
    if (!formData.room || !formData.from_time) return [];
    const selectedDate = formData.from_time.split('T')[0];
    
    return allBookings.filter(b => {
      if (b.room !== formData.room || b.status === 'Cancelled') return false;
      const bDate = b.from_time.split(' ')[0];
      return bDate === selectedDate;
    }).sort((a, b) => new Date(a.from_time) - new Date(b.from_time));
  };

  const selectedDateBookings = getSelectedDateBookings();
  const hasSelectedRoomAndDate = formData.room && formData.from_time;

  const formatTimeOnly = (dtString) => {
    if (!dtString) return '';
    return new Date(dtString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <main className="pt-8 pb-12 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      {/* Left Side: Informational Context/Bento Section */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <header className="mb-4">
          <h1 className="font-h1 text-h1 text-primary mb-2">Secure your space.</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">VMeet streamlines your office logistics so you can focus on collaboration.</p>
        </header>

        {hasSelectedRoomAndDate ? (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm transition-all">
            <h3 className="font-h3 text-h3 text-on-surface mb-4">Schedule for {formData.from_time.split('T')[0]}</h3>
            {selectedDateBookings.length === 0 ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined">check_circle</span>
                <p className="text-sm font-medium">Room is completely free for this date!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Occupied Slots</p>
                {selectedDateBookings.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700">{formatTimeOnly(b.from_time)} - {formatTimeOnly(b.to_time)}</p>
                    </div>
                    <span className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded">Booked</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl level-1-card border border-slate-100">
              <div className="text-secondary mb-2">
                <span className="material-symbols-outlined">hub</span>
              </div>
              <h3 className="font-h3 text-h3 text-on-surface text-lg">{rooms.length} Rooms</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Available for your meetings</p>
            </div>
            <div className="bg-white p-6 rounded-xl level-1-card border border-slate-100">
              <div className="text-tertiary mb-2">
                <span className="material-symbols-outlined">speed</span>
              </div>
              <h3 className="font-h3 text-h3 text-on-surface text-lg">Fast Track</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Instant confirmation for members</p>
            </div>
          </div>
        )}

        <div className="bg-primary-container/10 p-6 rounded-xl border border-primary-container/20 relative overflow-hidden group">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 bg-primary-container text-white px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              Pro Tip
            </span>
            <p className="text-on-primary-container font-body-md font-semibold">Select a room and a start date to immediately see when it's occupied!</p>
          </div>
          <div className="absolute -right-12 -bottom-12 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <span className="material-symbols-outlined text-[160px]">meeting_room</span>
          </div>
        </div>
      </div>

      {/* Right Side: The Booking Form Card */}
      <div className="lg:col-span-7">
        <div className="bg-white rounded-xl level-1-card p-8 flex flex-col gap-6 border border-slate-100">
          <div className="border-b border-slate-100 pb-6">
            <h2 className="font-h2 text-h2 text-on-surface">Book Room</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Fill in the details below to reserve your workspace.</p>
          </div>

          <form id="bookingForm" className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Room Selection */}
            <div className="flex flex-col gap-1">
              <label htmlFor="room" className="font-body-sm text-on-surface-variant font-medium">Select Room</label>
              <div className="relative">
                <select 
                  id="room" 
                  name="room" 
                  className="w-full h-[44px] px-4 py-2 border border-outline-variant rounded-xl bg-white focus:ring-md focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer" 
                  value={formData.room}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Choose a meeting space...</option>
                  {rooms.map(r => (
                    <option key={r.name} value={r.name}>{r.room_name} (Capacity {r.capacity})</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* From Time */}
              <div className="flex flex-col gap-1">
                <label htmlFor="from_time" className="font-body-sm text-on-surface-variant font-medium">From Time</label>
                <input 
                  type="datetime-local" 
                  id="from_time" 
                  name="from_time" 
                  className="w-full h-[44px] px-4 py-2 border border-outline-variant rounded-xl bg-white focus:ring-md focus:ring-primary/10 focus:border-primary transition-all" 
                  value={formData.from_time}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* To Time */}
              <div className="flex flex-col gap-1">
                <label htmlFor="to_time" className="font-body-sm text-on-surface-variant font-medium">To Time</label>
                <input 
                  type="datetime-local" 
                  id="to_time" 
                  name="to_time" 
                  className="w-full h-[44px] px-4 py-2 border border-outline-variant rounded-xl bg-white focus:ring-md focus:ring-primary/10 focus:border-primary transition-all" 
                  value={formData.to_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Inline Feedback Examples */}
            {errorMsg && (
              <div id="error-message">
                <div className="bg-error-container/50 border border-error/20 p-4 rounded-xl flex items-center gap-4">
                  <span className="material-symbols-outlined text-error">error</span>
                  <p className="text-on-error-container text-body-sm font-medium">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-4">
              <button type="button" className="px-6 h-[44px] rounded-xl font-button text-button text-secondary hover:bg-secondary/5 transition-all" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" disabled={submitting} className="bg-primary-container text-white px-8 h-[44px] rounded-xl font-button text-button hover:bg-primary transition-all flex items-center gap-2 disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Confirm Booking'}
                {!submitting && <span className="material-symbols-outlined text-[18px]">calendar_today</span>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Feedback Overlay Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setShowSuccess(false); navigate('/my-bookings'); }}></div>
          <div className="relative bg-white p-8 rounded-xl level-2-dropdown w-full max-w-[400px] min-w-[300px] text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
              <span className="material-symbols-outlined text-4xl">task_alt</span>
            </div>
            <h3 className="font-h3 text-h3 text-on-surface">Booking Finalized</h3>
            <p className="font-body-md text-on-surface-variant">Your reservation has been saved.</p>
            <button className="mt-4 w-full py-3 bg-primary text-white rounded-xl font-button" onClick={() => { setShowSuccess(false); navigate('/my-bookings'); }}>View My Bookings</button>
          </div>
        </div>
      )}
    </main>
  );
};

export default BookRoom;
