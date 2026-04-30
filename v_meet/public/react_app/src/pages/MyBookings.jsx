import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBookings, getRooms, getCurrentUser } from '../api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBookings(), getRooms(), getCurrentUser()])
      .then(([bookingsData, roomsData, userData]) => {
        setRooms(roomsData || []);
        setUser(userData);
        
        // Filter for current user's bookings
        const userName = userData?.name || 'Administrator';
        const myBookings = (bookingsData || []).filter(b => b.user === userName || b.owner === userName);
        
        // Sort by from_time descending (newest first)
        myBookings.sort((a, b) => new Date(b.from_time) - new Date(a.from_time));
        
        setBookings(myBookings);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load my bookings", err);
        setLoading(false);
      });
  }, []);

  const getRoomDetails = (roomName) => {
    return rooms.find(r => r.name === roomName) || { room_name: roomName, location: 'Unknown Location' };
  };

  const calculateDurationHours = (start, end) => {
    if (!start || !end) return 0;
    const diffMs = new Date(end) - new Date(start);
    return diffMs / (1000 * 60 * 60);
  };

  // Calculate stats
  let totalHours = 0;
  let roomCounts = {};
  
  bookings.forEach(b => {
    totalHours += calculateDurationHours(b.from_time, b.to_time);
    roomCounts[b.room] = (roomCounts[b.room] || 0) + 1;
  });

  let topRoom = 'None';
  let maxCount = 0;
  Object.entries(roomCounts).forEach(([room, count]) => {
    if (count > maxCount) {
      topRoom = room;
      maxCount = count;
    }
  });

  const topRoomDetails = getRoomDetails(topRoom);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDateStr = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-600' };
      case 'Pending': return { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-600' };
      case 'Cancelled': return { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-600' };
      default: return { bg: 'bg-slate-100', text: 'text-slate-800', dot: 'bg-slate-600' };
    }
  };

  if (loading) {
    return <div className="p-8 text-center pt-24 min-h-screen">Loading your bookings...</div>;
  }

  const todayStr = new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="pt-24 pb-12 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-h2 text-h2 text-on-surface mb-2">My Bookings</h2>
            <p className="text-on-surface-variant font-body-md">Manage your upcoming and past room reservations.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/book-room" className="px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-button text-button shadow-sm hover:opacity-90 transition-all">
              Book a Room
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {bookings.length === 0 ? (
             <div className="bg-white rounded-xl p-6 text-center text-slate-500 shadow-sm border border-slate-100">
               You don't have any bookings yet.
             </div>
          ) : (
            bookings.map(booking => {
              const colors = getStatusColor(booking.status);
              
              return (
                <div key={booking.name} className="bg-white rounded-xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] flex flex-col md:flex-row items-center gap-6 border border-transparent hover:border-primary-container/20 transition-all group">
                  <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-4xl">meeting_room</span>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                    <div className="md:col-span-1">
                      <p className="text-xs font-label-caps text-on-surface-variant mb-1">ROOM NAME</p>
                      <h3 className="text-lg font-bold text-on-surface">{booking.room_name || booking.room}</h3>
                      <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        {booking.room_location || 'Location not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-label-caps text-on-surface-variant mb-1">DATE &amp; TIME</p>
                      <p className="text-on-surface font-semibold">{formatDateStr(booking.from_time)}</p>
                      <p className="text-sm text-on-surface-variant">{formatTime(booking.from_time)} - {formatTime(booking.to_time)}</p>
                    </div>
                    <div className="flex items-center">
                      <div>
                        <p className="text-xs font-label-caps text-on-surface-variant mb-1">STATUS</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} mr-1.5`}></span>
                          {booking.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center md:justify-end gap-3">
                      <button className="bg-primary/5 text-primary px-4 py-2 rounded-lg font-button text-sm hover:bg-primary/10 transition-colors">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <h4 className="font-bold text-lg text-indigo-900 mb-1">{totalHours.toFixed(1)} Hours</h4>
            <p className="text-sm text-indigo-700/70">Meeting room usage total</p>
          </div>
          
          <div className="bg-cyan-50 p-6 rounded-2xl border border-cyan-100">
            <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center text-cyan-600 mb-4">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <h4 className="font-bold text-lg text-cyan-900 mb-1">{bookings.length} Bookings</h4>
            <p className="text-sm text-cyan-700/70">Total sessions booked</p>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 mb-4">
              <span className="material-symbols-outlined">star</span>
            </div>
            <h4 className="font-bold text-lg text-slate-900 mb-1">{topRoomDetails.room_name || topRoom}</h4>
            <p className="text-sm text-slate-700/70">Your most frequently booked space</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
