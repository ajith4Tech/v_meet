import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BookRoom from './pages/BookRoom';
import MyBookings from './pages/MyBookings';
import ManageRooms from './pages/ManageRooms';
import Profile from './pages/Profile';
import AdminBookings from './pages/AdminBookings';

function App() {
  return (
    <Router basename="/v_meet_app">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="book-room" element={<BookRoom />} />
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="manage-rooms" element={<ManageRooms />} />
          <Route path="admin-bookings" element={<AdminBookings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
