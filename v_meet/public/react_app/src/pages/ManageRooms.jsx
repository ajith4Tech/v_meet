import React, { useState, useEffect } from 'react';
import { getRooms, postRoom, deleteRoom } from '../api';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    room_name: '',
    capacity: 10,
    room_type: 'Conference',
    floor: 1,
    block: 'A',
    location: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchRooms = () => {
    setLoading(true);
    getRooms().then(data => {
      setRooms(data || []);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load rooms", err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await postRoom(formData);
      setFormData({ room_name: '', capacity: 10, room_type: 'Conference', floor: 1, block: 'A', location: '' });
      fetchRooms();
    } catch (err) {
      console.error("Failed to add room", err);
      let msg = 'Failed to add room.';
      if (err.response?.data?._server_messages) {
        try {
          const messages = JSON.parse(err.response.data._server_messages);
          if (Array.isArray(messages) && messages.length > 0) {
            msg = JSON.parse(messages[0]).message || msg;
          }
        } catch(e) {}
      } else if (err.response?.data?.exc) {
          msg = "Server error occurred. Please check field values.";
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (roomName) => {
    if (!window.confirm(`Are you sure you want to delete ${roomName}?`)) return;
    try {
      await deleteRoom(roomName);
      fetchRooms();
    } catch (err) {
      console.error("Failed to delete room", err);
      alert("Failed to delete room.");
    }
  };

  if (loading && rooms.length === 0) {
    return <div className="p-8 text-center pt-24 min-h-screen">Loading Rooms...</div>;
  }

  return (
    <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter min-h-screen">
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-white rounded-xl level-1-card p-6 border border-slate-100">
          <h2 className="font-h3 text-h3 text-on-surface mb-4">Add New Room</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="room_name" className="font-body-sm text-on-surface-variant">Room Name</label>
              <input 
                type="text" 
                id="room_name" 
                name="room_name" 
                className="w-full h-[40px] px-4 py-2 border border-outline-variant rounded-lg bg-white focus:ring-sm focus:ring-primary/20 transition-all" 
                value={formData.room_name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label htmlFor="capacity" className="font-body-sm text-on-surface-variant">Capacity</label>
              <input 
                type="number" 
                id="capacity" 
                name="capacity" 
                min="1"
                className="w-full h-[40px] px-4 py-2 border border-outline-variant rounded-lg bg-white focus:ring-sm focus:ring-primary/20 transition-all" 
                value={formData.capacity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="floor" className="font-body-sm text-on-surface-variant">Floor</label>
                <input 
                  type="number" 
                  id="floor" 
                  name="floor" 
                  className="w-full h-[40px] px-4 py-2 border border-outline-variant rounded-lg bg-white focus:ring-sm focus:ring-primary/20 transition-all" 
                  value={formData.floor}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <label htmlFor="block" className="font-body-sm text-on-surface-variant">Block</label>
                <input 
                  type="text" 
                  id="block" 
                  name="block" 
                  className="w-full h-[40px] px-4 py-2 border border-outline-variant rounded-lg bg-white focus:ring-sm focus:ring-primary/20 transition-all" 
                  value={formData.block}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="room_type" className="font-body-sm text-on-surface-variant">Room Type</label>
              <input 
                type="text" 
                id="room_type" 
                name="room_type" 
                className="w-full h-[40px] px-4 py-2 border border-outline-variant rounded-lg bg-white focus:ring-sm focus:ring-primary/20 transition-all" 
                value={formData.room_type}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="location" className="font-body-sm text-on-surface-variant">Location Info</label>
              <input 
                type="text" 
                id="location" 
                name="location" 
                placeholder="e.g. Near reception"
                className="w-full h-[40px] px-4 py-2 border border-outline-variant rounded-lg bg-white focus:ring-sm focus:ring-primary/20 transition-all" 
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            {errorMsg && (
              <div className="bg-error-container/50 border border-error/20 p-2 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-sm">error</span>
                <p className="text-on-error-container text-xs font-medium">{errorMsg}</p>
              </div>
            )}

            <button type="submit" disabled={submitting} className="mt-2 bg-indigo-600 text-white px-4 h-[40px] rounded-lg font-button text-sm hover:bg-indigo-700 transition-all disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add Room'}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="bg-white rounded-xl level-1-card overflow-hidden border border-slate-100">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-h3 text-h3 text-on-surface">Manage Rooms</h2>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{rooms.length} Total</span>
          </div>
          
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Room ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Capacity</th>
                  <th className="px-6 py-4">Floor/Block</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-body-sm">
                {rooms.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No rooms found.</td>
                  </tr>
                )}
                {rooms.map(room => (
                  <tr key={room.name} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{room.name}</td>
                    <td className="px-6 py-4 font-bold text-on-surface">
                      {room.room_name}
                      <span className="block text-xs font-normal text-slate-400">{room.room_type}</span>
                    </td>
                    <td className="px-6 py-4">{room.capacity}</td>
                    <td className="px-6 py-4 text-slate-500">
                      Floor {room.floor || '-'}, Block {room.block || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(room.name)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-tight">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ManageRooms;
