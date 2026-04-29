import { HashRouter, Routes, Route, Link } from "react-router-dom";

function Dashboard() {
  return <h2>Dashboard</h2>;
}

function Booking() {
  return <h2>Booking Page</h2>;
}

function MyBookings() {
  return <h2>My Bookings</h2>;
}

function App() {
  return (
    <HashRouter>
      <nav>
        <Link to="/">Dashboard</Link> |{" "}
        <Link to="/book">Book</Link> |{" "}
        <Link to="/my-bookings">My Bookings</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/book" element={<Booking />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Routes>
    </HashRouter>
  );
}

export default App;