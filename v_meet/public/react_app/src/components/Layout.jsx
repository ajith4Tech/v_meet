import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../api';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser().then(data => setUser(data));
  }, []);

  const isAdmin = user?.name === 'Administrator';

  const isActive = (path) => location.pathname === path;

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      // Redirect to Frappe login page
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed', err);
    }
  };


  return (
    <div className="bg-background font-body-md text-on-background min-h-screen">
      {/* TopNavBar */}
      <nav className="bg-white/80 backdrop-blur-md fixed top-0 z-50 w-full border-b border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-black text-indigo-600 tracking-tighter">VMeet</span>
            <div className="hidden md:flex items-center gap-6 h-16">
              <Link to="/" className={`${isActive('/') ? 'text-indigo-600 border-b-2 border-indigo-600 pb-5 mt-5' : 'text-slate-500 hover:text-indigo-500 transition-colors'} font-sans antialiased text-sm font-medium`}>Dashboard</Link>
              <Link to="/book-room" className={`${isActive('/book-room') ? 'text-indigo-600 border-b-2 border-indigo-600 pb-5 mt-5' : 'text-slate-500 hover:text-indigo-500 transition-colors'} font-sans antialiased text-sm font-medium`}>Book Room</Link>
              <Link to="/my-bookings" className={`${isActive('/my-bookings') ? 'text-indigo-600 border-b-2 border-indigo-600 pb-5 mt-5' : 'text-slate-500 hover:text-indigo-500 transition-colors'} font-sans antialiased text-sm font-medium`}>My Bookings</Link>
              {isAdmin && (
                <Link to="/admin-bookings" className={`${isActive('/admin-bookings') ? 'text-red-600 border-b-2 border-red-600 pb-5 mt-5' : 'text-slate-500 hover:text-red-500 transition-colors'} font-sans antialiased text-sm font-medium`}>Manage Bookings</Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-on-surface-variant hover:bg-slate-50 rounded-lg transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <Link to="/profile" className="p-2 text-on-surface-variant hover:bg-slate-50 rounded-lg transition-all">
              <span className="material-symbols-outlined">settings</span>
            </Link>
            
            <Link to="/profile" className="cursor-pointer">
              {user && user.user_image ? (
                <img 
                  alt="User avatar" 
                  className="w-8 h-8 rounded-full object-cover border border-slate-200" 
                  src={user.user_image}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold font-sans">
                  {getInitials(user?.full_name || user?.name || 'Administrator')}
                </div>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* SideNavBar (Desktop/Large view only) */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full p-4 gap-2 w-64 bg-slate-50 border-r border-slate-200 z-[60]">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white">meeting_room</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-600">VMeet</h2>
            <p className="text-[10px] text-slate-400 font-sans tracking-widest uppercase">Workspace</p>
          </div>
        </div>
        
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
        
        <Link to="/book-room" className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-button text-sm shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Booking
        </Link>
        
        <div className="mt-auto border-t border-slate-200 pt-4 flex flex-col gap-1">
          <Link to="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/profile') ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1'}`}>
            <span className="material-symbols-outlined">person</span>
            <span className="font-sans text-sm tracking-tight">My Profile</span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:translate-x-1 transition-all rounded-xl cursor-pointer">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-sans text-sm tracking-tight">Logout</span>
          </button>
        </div>
      </aside>

      <div className="md:ml-64">
        <Outlet />
      </div>

      {/* FAB for quick action */}
      <Link to="/book-room" className="fixed bottom-8 right-8 w-14 h-14 bg-primary rounded-full text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-[70] md:hidden">
        <span className="material-symbols-outlined">add</span>
      </Link>
    </div>
  );
};

export default Layout;
