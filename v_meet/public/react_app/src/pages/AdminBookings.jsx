import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookings, updateBookingStatus, getCurrentUser } from '../api';

const STATUS_OPTIONS = ['Pending', 'Approved', 'Occupied', 'Free To Use'];

const STATUS_STYLES = {
  Pending:      { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',  dot: 'bg-amber-500'  },
  Approved:     { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',  dot: 'bg-green-500'  },
  Occupied:     { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',    dot: 'bg-red-500'    },
  'Free To Use':{ bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200', dot: 'bg-indigo-500' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
      {status || 'Pending'}
    </span>
  );
};

const AdminBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({}); // { [bookingName]: true }
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    getCurrentUser().then(user => {
      if (user?.name !== 'Administrator') {
        navigate('/');
      } else {
        setIsAdmin(true);
      }
    });
  }, [navigate]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBookings();
      setBookings(data || []);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchBookings();
  }, [isAdmin, fetchBookings]);

  const handleStatusChange = async (bookingName, newStatus) => {
    setUpdating(prev => ({ ...prev, [bookingName]: true }));
    try {
      await updateBookingStatus(bookingName, newStatus);
      setBookings(prev =>
        prev.map(b => b.name === bookingName ? { ...b, status: newStatus } : b)
      );
      showToast(`Status updated to "${newStatus}"`);
    } catch (err) {
      showToast('Failed to update status. Please try again.', 'error');
    } finally {
      setUpdating(prev => ({ ...prev, [bookingName]: false }));
    }
  };

  const formatDateTime = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  };

  const filtered = bookings.filter(b => {
    const matchStatus = filterStatus === 'All' || b.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      b.name?.toLowerCase().includes(q) ||
      b.user?.toLowerCase().includes(q) ||
      b.room?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = bookings.filter(b => b.status === s).length;
    return acc;
  }, { All: bookings.length });

  if (!isAdmin) return null;

  return (
    <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg text-sm font-semibold transition-all animate-bounce-in
            ${toast.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-green-600 text-white'
            }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
            Admin Panel
          </div>
          <h1 className="font-h1 text-h1 text-on-surface">Manage Bookings</h1>
          <p className="font-body-md text-on-surface-variant mt-1">Review and update the status of all booking requests across all users.</p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Refresh
        </button>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[{ label: 'All', count: counts.All, icon: 'list_alt', color: 'indigo' },
          { label: 'Pending', count: counts.Pending || 0, icon: 'hourglass_empty', color: 'amber' },
          { label: 'Approved', count: counts.Approved || 0, icon: 'check_circle', color: 'green' },
          { label: 'Occupied', count: counts.Occupied || 0, icon: 'do_not_disturb_on', color: 'red' },
          { label: 'Free To Use', count: counts['Free To Use'] || 0, icon: 'event_available', color: 'sky' },
        ].map(stat => (
          <button
            key={stat.label}
            onClick={() => setFilterStatus(stat.label)}
            className={`p-4 rounded-xl border text-left transition-all hover:shadow-md ${
              filterStatus === stat.label
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-[1.02]'
                : 'bg-white border-slate-100 text-on-surface hover:border-indigo-200'
            }`}
          >
            <p className={`text-2xl font-black ${filterStatus === stat.label ? 'text-white' : 'text-on-surface'}`}>{stat.count}</p>
            <p className={`text-xs font-semibold mt-1 ${filterStatus === stat.label ? 'text-indigo-100' : 'text-on-surface-variant'}`}>{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
        <input
          type="text"
          placeholder="Search by booking ID, user, or room..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 h-[44px] border border-outline-variant rounded-xl bg-white text-sm focus:outline-none focus:border-indigo-400 transition-all"
        />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-100 level-1-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
            <span className="material-symbols-outlined animate-spin text-[32px]">progress_activity</span>
            <span className="font-medium">Loading bookings...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <span className="material-symbols-outlined text-[48px]">inbox</span>
            <p className="font-medium">No bookings found</p>
            <p className="text-xs">Try adjusting the filter or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Booking ID', 'User', 'Room', 'From', 'To', 'Current Status', 'Change Status'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking, idx) => (
                  <tr
                    key={booking.name}
                    className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-bold">{booking.name}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {(booking.user || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-on-surface font-medium truncate max-w-[140px]" title={booking.user}>{booking.user}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-on-surface">{booking.room_name || booking.room || '—'}</td>
                    <td className="px-5 py-4 text-on-surface-variant whitespace-nowrap">{formatDateTime(booking.from_time)}</td>
                    <td className="px-5 py-4 text-on-surface-variant whitespace-nowrap">{formatDateTime(booking.to_time)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative flex items-center gap-2">
                        <select
                          value={booking.status || 'Pending'}
                          onChange={e => handleStatusChange(booking.name, e.target.value)}
                          disabled={updating[booking.name]}
                          className="h-[36px] pl-3 pr-8 border border-outline-variant rounded-lg bg-white text-sm font-medium text-on-surface focus:outline-none focus:border-indigo-400 appearance-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-indigo-300"
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">
                          {updating[booking.name] ? 'progress_activity' : 'expand_more'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer row count */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400 font-medium">
            Showing {filtered.length} of {bookings.length} bookings
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminBookings;
