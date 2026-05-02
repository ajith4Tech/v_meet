import React, { useState, useEffect } from 'react';
import { getBookings, getRooms } from '../api';

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Occupied', 'Free To Use'];

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'timeline'
  const [selectedTimelineDate, setSelectedTimelineDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  useEffect(() => {
    Promise.all([getBookings(), getRooms()])
      .then(([bookingsData, roomsData]) => {
        setBookings(bookingsData || []);
        setRooms(roomsData || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load dashboard data", err);
        setLoading(false);
      });
  }, []);

  const totalBookings = bookings.length;
  const pendingApproval = bookings.filter(b => b.status === 'Pending').length;
  
  const now = new Date();
  const activeNow = bookings.filter(b => {
    if (!b.from_time || !b.to_time) return false;
    const start = new Date(b.from_time);
    const end = new Date(b.to_time);
    return start <= now && end >= now;
  }).length;

  const totalRooms = rooms.length;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDateStr = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '';
    const diffMs = new Date(end) - new Date(start);
    const diffHrs = diffMs / (1000 * 60 * 60);
    return `${diffHrs.toFixed(1)}h`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':    return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
      case 'Pending':     return { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' };
      case 'Cancelled':   return { bg: 'bg-red-100',   text: 'text-red-800',   dot: 'bg-red-500'   };
      case 'Occupied':    return { bg: 'bg-red-100',   text: 'text-red-800',   dot: 'bg-red-500'   };
      case 'Free To Use': return { bg: 'bg-indigo-100',text: 'text-indigo-800',dot: 'bg-indigo-500'};
      default:            return { bg: 'bg-slate-100', text: 'text-slate-800', dot: 'bg-slate-500' };
    }
  };

  const getAmenitiesForRoom = (capacity) => {
    const defaultAmenities = ['Wi-Fi 6'];
    if (capacity >= 10) {
      return [...defaultAmenities, 'AV Center', 'Smart Projector'];
    }
    return [...defaultAmenities, 'Whiteboard', '4K TV'];
  };

  // Apply search + status filter
  const filtered = bookings.filter(b => {
    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (b.room_name || b.room || '').toLowerCase().includes(q) ||
      (b.user || '').toLowerCase().includes(q) ||
      (b.room_location || '').toLowerCase().includes(q) ||
      formatDateStr(b.from_time).toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  if (loading) {
    return <div className="p-8 text-center">Loading Dashboard...</div>;
  }

  // Hours for the daily timeline view (9 AM to 7 PM)
  const timelineHours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  const checkIsOccupiedHour = (roomName, hour) => {
    const hourStart = new Date(`${selectedTimelineDate}T${hour.toString().padStart(2, '0')}:00:00`);
    const hourEnd = new Date(`${selectedTimelineDate}T${hour.toString().padStart(2, '0')}:59:59`);

    return bookings.find(b => {
      // Check room name OR ID
      if (b.room !== roomName && b.room_name !== roomName) return false;
      if (b.status === 'Cancelled' || b.status === 'Rejected') return false;

      if (!b.from_time || !b.to_time) return false;

      // Match the date (handle both ' ' and 'T' format)
      const bDateStr = b.from_time.split(' ')[0].split('T')[0];
      if (bDateStr !== selectedTimelineDate) return false;

      const bFrom = new Date(b.from_time);
      const bTo = new Date(b.to_time);
      return hourStart < bTo && hourEnd > bFrom;
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full flex-1 min-h-screen pt-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Room Bookings</h2>
          <p className="font-body-md text-body-sm text-on-surface-variant mt-1">Manage and monitor all active meeting space reservations.</p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined text-[16px]">list</span> List View
          </button>
          <button onClick={() => setViewMode('timeline')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'timeline' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined text-[16px]">calendar_view_day</span> Day Timeline
          </button>
        </div>
      </div>

      {/* Dashboard Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl card-shadow border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <span className="material-symbols-outlined">calendar_today</span>
            </div>
          </div>
          <p className="text-body-sm text-on-surface-variant font-medium">Total Bookings</p>
          <h3 className="text-h3 font-h3 text-on-surface">{totalBookings}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-xl card-shadow border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
              <span className="material-symbols-outlined">update</span>
            </div>
          </div>
          <p className="text-body-sm text-on-surface-variant font-medium">Pending Approval</p>
          <h3 className="text-h3 font-h3 text-on-surface">{pendingApproval}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-xl card-shadow border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <p className="text-body-sm text-on-surface-variant font-medium">Active Now</p>
          <h3 className="text-h3 font-h3 text-on-surface">{activeNow}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-xl card-shadow border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined">meeting_room</span>
            </div>
          </div>
          <p className="text-body-sm text-on-surface-variant font-medium">Total Rooms</p>
          <h3 className="text-h3 font-h3 text-on-surface">{totalRooms}</h3>
        </div>
      </div>

      {viewMode === 'list' ? (
        /* Bookings Table Container */
        <div className="bg-white rounded-xl card-shadow border border-slate-100 overflow-hidden">
          {/* Table Header */}
          <div className="p-5 border-b border-slate-100">
            {/* Row 1: title + count */}
            <div className="flex items-center gap-4 mb-4">
              <h4 className="text-body-lg font-bold">Recent Reservations</h4>
              <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg px-2 py-1">
                <span className="material-symbols-outlined text-xs text-slate-400 mr-1">history</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Showing {filtered.length} of {bookings.length}</span>
              </div>
            </div>
            {/* Row 2: search bar */}
            <div className="relative mb-3">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search by room, user, location, or date..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-9 h-[40px] border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
            {/* Row 3: filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {STATUS_FILTERS.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    statusFilter === s
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Room Name</th>
                  <th className="px-6 py-4">Booked By</th>
                  <th className="px-6 py-4">Time Slot</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-body-sm">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <span className="material-symbols-outlined text-slate-300 text-4xl block mb-2">search_off</span>
                      <p className="text-slate-500 font-medium">No bookings match your search.</p>
                      <button onClick={() => { setSearch(''); setStatusFilter('All'); }} className="mt-2 text-indigo-600 text-sm hover:underline">Clear filters</button>
                    </td>
                  </tr>
                )}
                {filtered.map(booking => {
                  const colors = getStatusColor(booking.status);
                  return (
                    <tr key={booking.name} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center">
                             <span className="material-symbols-outlined text-slate-400">meeting_room</span>
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">{booking.room_name || booking.room}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {getAmenitiesForRoom(booking.capacity || 8).map(amenity => (
                                <span key={amenity} className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100 font-medium">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                            {getInitials(booking.user || booking.owner)}
                          </div>
                          <div>
                            <p className="font-medium text-on-surface">{booking.user || booking.owner}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div>
                          <p className="font-medium text-on-surface">{formatTime(booking.from_time)} - {formatTime(booking.to_time)}</p>
                          <p className="text-xs text-slate-500">{formatDateStr(booking.from_time)} ({calculateDuration(booking.from_time, booking.to_time)})</p>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} mr-1.5`}></span>
                          {booking.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Dynamic Hourly Timeline Day View */
        <div className="bg-white rounded-xl card-shadow border border-slate-100 p-6">
          <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-lg text-slate-800">Room Timeline</h4>
              <p className="text-xs text-slate-500 font-medium mt-1">Instant view of hourly reservations per room.</p>
            </div>
            
            {/* Date selector + Legends */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                <label htmlFor="timelineDate" className="text-slate-500 font-medium whitespace-nowrap">View Date:</label>
                <input 
                  id="timelineDate"
                  type="date" 
                  value={selectedTimelineDate} 
                  onChange={(e) => setSelectedTimelineDate(e.target.value)}
                  className="bg-transparent border-none text-slate-700 focus:outline-none cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-300"></span> Free
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-100 border border-amber-300"></span> Booked
                </div>
              </div>
            </div>
          </header>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="px-4 py-4 w-[220px]">Room</th>
                  {timelineHours.map(hour => (
                    <th key={hour} className="px-2 py-4 text-center min-w-[60px] border-l border-slate-200/50">
                      {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-body-sm">
                {rooms.map(room => (
                  <tr key={room.name} className="hover:bg-slate-50/20 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-sm">{room.room_name}</span>
                        <span className="text-xs text-slate-400 font-medium mt-0.5">Cap: {room.capacity}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getAmenitiesForRoom(room.capacity).map(amenity => (
                            <span key={amenity} className="text-[9px] bg-indigo-50/50 text-indigo-600 px-1 py-0.5 rounded font-bold border border-indigo-100/50">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    {timelineHours.map(hour => {
                      const conflict = checkIsOccupiedHour(room.name, hour);
                      return (
                        <td key={hour} className={`px-1 py-4 text-center border-l border-slate-100 relative group transition-all ${conflict ? 'bg-amber-100/40' : 'bg-emerald-50/20'}`}>
                          {conflict ? (
                            <div className="w-5 h-5 rounded-full bg-amber-500 mx-auto flex items-center justify-center text-[10px] text-white shadow-sm font-bold" title={`Booked by ${conflict.user || 'User'}`}>
                              B
                            </div>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto opacity-40"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
