import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load profile", err);
        setLoading(false);
      });
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return <div className="p-8 text-center pt-8 min-h-screen">Loading Profile...</div>;
  }

  const name = user?.full_name || user?.name || 'Administrator';
  const email = user?.email || user?.name || 'admin@example.com';
  const roles = user?.roles?.map(r => r.role) || ['Administrator'];

  return (
    <main className="pt-8 pb-12 px-6 max-w-4xl mx-auto w-full min-h-screen">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-shrink-0 flex flex-col items-center gap-4">
          {user && user.user_image ? (
            <img 
              src={user.user_image} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-md border-indigo-50 shadow-sm"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-4xl font-black font-sans shadow-sm border-md border-indigo-50">
              {getInitials(name)}
            </div>
          )}
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Active Member</span>
        </div>
        
        <div className="flex-1 w-full">
          <h1 className="font-h1 text-h1 text-on-surface mb-2">{name}</h1>
          <p className="text-on-surface-variant flex items-center gap-2 font-body-md mb-8">
            <span className="material-symbols-outlined text-lg">mail</span>
            {email}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-100 pt-8">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Roles & Permissions</h4>
              <div className="flex flex-wrap gap-2">
                {roles.map(role => (
                  <span key={role} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                    {role}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Account Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                  <span className="text-slate-500 text-sm">Timezone</span>
                  <span className="text-on-surface font-medium text-sm">{user?.time_zone || 'System Default'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                  <span className="text-slate-500 text-sm">Joined Date</span>
                  <span className="text-on-surface font-medium text-sm">{user?.creation ? new Date(user.creation).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                  <span className="text-slate-500 text-sm">Last Login</span>
                  <span className="text-on-surface font-medium text-sm">{user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;
