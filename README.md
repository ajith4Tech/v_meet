# VMeet — Meeting Room Booking App

> A full-stack meeting room reservation platform built on **Frappe Framework** with a **React** frontend. VMeet enables co-workspace users to browse available rooms, make bookings, and manage reservations — all through a modern, glassmorphism-styled web interface.

---

## 📸 Overview

VMeet provides:
- A **Dashboard** showing all available meeting rooms with capacity and type.
- A **Booking Form** with real-time slot availability for the selected room and date.
- A **My Bookings** page where users can track their own reservations.
- An **Admin Panel** (Administrator-only) to manage and update the status of all bookings.
- A **Manage Rooms** page (Administrator-only) to create, edit, and delete rooms.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend Framework | [Frappe](https://frappeframework.com/) |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Database | MariaDB (via Frappe ORM) |

---

## 🗂️ Project Structure

```
v_meet/
├── v_meet/
│   ├── api.py                        # Whitelisted backend API endpoints
│   ├── hooks.py                      # Frappe app hooks & SPA route rules
│   └── v_meet/doctype/
│       ├── room/                     # Room DocType
│       └── bookings/                 # Bookings DocType (with validation)
├── www/
│   └── v_meet_app.html               # Frappe-served HTML entry point (auto-generated)
└── public/
    └── react_app/
        ├── vite.config.js            # Vite config with auto-sync plugin
        └── src/
            ├── api.js                # All frontend ↔ backend API calls
            ├── App.jsx               # Router & route definitions
            ├── components/
            │   └── Layout.jsx        # Sidebar, topnav, auth-gating
            └── pages/
                ├── Dashboard.jsx     # Room listing
                ├── BookRoom.jsx      # Booking form with slot visualiser
                ├── MyBookings.jsx    # Per-user booking history
                ├── AdminBookings.jsx # Admin-only booking status management
                ├── ManageRooms.jsx   # Admin-only room CRUD
                └── Profile.jsx      # User profile
```

---

## 📦 Data Model

### Room
| Field | Type | Description |
|---|---|---|
| `room_name` | Data | Display name of the room |
| `capacity` | Int | Maximum number of occupants |
| `room_type` | Select | e.g., Conference, Cabin, Open Space |

### Bookings
| Field | Type | Description |
|---|---|---|
| `user` | Link → User | The user who made the booking |
| `room` | Link → Room | The booked room |
| `from_time` | Datetime | Booking start time |
| `to_time` | Datetime | Booking end time |
| `status` | Select | `Pending` / `Approved` / `Occupied` / `Free To Use` |

> **Validation**: The `Bookings` controller automatically rejects overlapping bookings for the same room and enforces that `from_time < to_time`.

---

## 🔐 Roles & Permissions

| Feature | All Users | Administrator |
|---|---|---|
| View rooms (Dashboard) | ✅ | ✅ |
| Create a booking | ✅ | ✅ |
| View own bookings | ✅ | ✅ |
| Manage Rooms (CRUD) | ❌ | ✅ |
| Manage Bookings (change status) | ❌ | ✅ |

> Admin access is enforced on **both** the frontend (UI gating) and the **backend** (server-side role check before any status mutation).

---

## 🚀 Installation

### Prerequisites
- A working [Frappe Bench](https://frappeframework.com/docs/user/en/installation) setup
- Node.js ≥ 18

### 1. Get the app

```bash
cd frappe-bench
bench get-app https://github.com/ajith4Tech/v_meet.git
```

### 2. Install on your site

```bash
bench --site <your-site-name> install-app v_meet
bench --site <your-site-name> migrate
```

### 3. Build the React frontend

```bash
cd apps/v_meet/v_meet/public/react_app
npm install
npm run build
```

> The build automatically syncs `dist/index.html` into `www/v_meet_app.html` via a custom Vite plugin — no manual file editing required.

### 4. Clear cache & restart

```bash
bench --site <your-site-name> clear-cache
bench restart
```

---

## 🔧 Development

To run the React dev server (hot reload):

```bash
cd apps/v_meet/v_meet/public/react_app
npm run dev
```

To rebuild the production bundle and sync the Frappe HTML entry point:

```bash
npm run build
```

> Every `npm run build` automatically updates `www/v_meet_app.html` with the correct Vite-generated asset filenames (content-hashed). You never need to update that file manually.

---

## 🌐 Accessing the App

Once installed and built, navigate to:

```
https://<your-site>/v_meet_app
```

Log in with your Frappe credentials. The app uses Frappe's existing session cookie and CSRF token for secure API communication.

---

## 🔌 Backend API Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/resource/Room` | Session | List all rooms |
| `POST` | `/api/resource/Room` | Administrator | Create a room |
| `DELETE` | `/api/resource/Room/{name}` | Administrator | Delete a room |
| `GET` | `/api/resource/Bookings` | Session | List all bookings |
| `POST` | `/api/resource/Bookings` | Session | Create a booking |
| `POST` | `/api/method/v_meet.v_meet.api.update_booking_status` | Administrator | Change booking status |
| `GET` | `/api/method/v_meet.v_meet.api.get_current_user_info` | Session | Get current user + admin flag |

---

## 📋 SPA Routing

The app uses React Router for client-side navigation. To prevent 404 errors on page refresh, `hooks.py` registers a Frappe route rule that redirects all `/v_meet_app/*` paths to the React entry point:

```python
website_route_rules = [
    {"from_route": "/v_meet_app/<path:app_path>", "to_route": "v_meet_app"},
]
```

---

## 👤 Author

**Ajith B M**
- GitHub: [@ajith4Tech](https://github.com/ajith4Tech)
- Email: ajithbm01@gmail.com

---

## 📄 License

MIT
