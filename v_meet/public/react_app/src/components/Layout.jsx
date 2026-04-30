import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../api';

const Layout = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser().then(data => setUser(data));
  }, []);

  const isAdmin = user?.name === 'Administrator';
  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className="bg-background font-body-md text-on-background min-h-screen">

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full p-4 gap-2 w-64 bg-slate-50 border-r border-slate-200 z-[60]">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white">meeting_room</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-600">VMeet</h2>
            <p className="text-[10px] text-slate-400 font-sans tracking-widest uppercase">Workspace</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 flex flex-col gap-1">
          <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/') ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1'}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-sans text-sm tracking-tight">Dashboard</span>
          </Link>
          <Link to="/book-room" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/book-room') ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1'}`}>
            <span className="material-symbols-outlined">calendar_add_on</span>
            <span className="font-sans text-sm tracking-tight">Book Room</span>
          </Link>
          <Link to="/my-bookings" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/my-bookings') ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1'}`}>
            <span className="material-symbols-outlined">event_note</span>
            <span className="font-sans text-sm tracking-tight">My Bookings</span>
          </Link>
          {isAdmin && (
            <>
              <Link to="/manage-rooms" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/manage-rooms') ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1'}`}>
                <span className="material-symbols-outlined">meeting_room</span>
                <span className="font-sans text-sm tracking-tight">Manage Rooms</span>
              </Link>
              <Link to="/admin-bookings" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin-bookings') ? 'bg-red-50 text-red-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1'}`}>
                <span className="material-symbols-outlined">admin_panel_settings</span>
                <span className="font-sans text-sm tracking-tight">Manage Bookings</span>
              </Link>
            </>
          )}
        </nav>

        {/* New Booking CTA */}
        <Link to="/book-room" className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-button text-sm shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Booking
        </Link>

        {/* Bottom: User + Logout */}
        <div className="mt-auto border-t border-slate-200 pt-4 flex flex-col gap-1">
          {/* User info chip */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-100 mb-1">
            {user?.user_image ? (
              <img alt="avatar" src={user.user_image} className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {getInitials(user?.full_name || user?.name || 'U')}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-on-surface truncate">{user?.full_name || user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{isAdmin ? 'Administrator' : 'Member'}</p>
            </div>
          </div>
          <Link to="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/profile') ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1'}`}>
            <span className="material-symbols-outlined">person</span>
            <span className="font-sans text-sm tracking-tight">My Profile</span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all rounded-xl cursor-pointer">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-sans text-sm tracking-tight">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content area — offset by sidebar width */}
      <div className="md:ml-64 min-h-screen">
        <Outlet />
      </div>

      {/* Mobile FAB */}
      <Link to="/book-room" className="fixed bottom-8 right-8 w-14 h-14 bg-primary rounded-full text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-[70] md:hidden">
        <span className="material-symbols-outlined">add</span>
      </Link>
    </div>
  );
};

export default Layout;
