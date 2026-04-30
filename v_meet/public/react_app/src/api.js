import axios from 'axios';

// Since the React app runs on the same domain as Frappe, we can use relative paths or just the base URL.
// We enable withCredentials so that Frappe's session cookies are automatically sent with each request.
axios.defaults.withCredentials = true;

// Add CSRF token to all requests if available
axios.interceptors.request.use((config) => {
  if (window.csrf_token && window.csrf_token !== 'None') {
    config.headers['X-Frappe-CSRF-Token'] = window.csrf_token;
  }
  return config;
});

const BASE_URL = '';

/**
 * Fetch a list of all rooms
 * @returns {Promise<Array>} List of rooms
 */
export const getRooms = async () => {
  try {
    // fields=["*"] is used to fetch all fields for each room instead of just the name
    const response = await axios.get(`${BASE_URL}/api/resource/Room?fields=["*"]&limit_page_length=0`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
};

/**
 * Fetch details of a specific room
 * @param {string} roomName - The ID (name) of the room
 * @returns {Promise<Object>} Room details
 */
export const getRoomDetails = async (roomName) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/resource/Room/${roomName}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching details for room ${roomName}:`, error);
    throw error;
  }
};

/**
 * Create a new room
 * @param {Object} roomData - Object containing room fields (e.g., room_name, capacity, room_type, etc.)
 * @returns {Promise<Object>} The created room document
 */
export const postRoom = async (roomData) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/resource/Room`, roomData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};

/**
 * Fetch a list of all bookings, including room details from the linked Room doctype
 * @returns {Promise<Array>} List of bookings
 */
export const getBookings = async () => {
  try {
    const fields = encodeURIComponent(JSON.stringify([
      "name", "user", "room",
      "room.room_name as room_name",
      "room.location as room_location",
      "room.capacity as room_capacity",
      "room.floor as room_floor",
      "room.block as room_block",
      "room.room_type as room_type",
      "from_time", "to_time", "status", "modified"
    ]));
    const response = await axios.get(`${BASE_URL}/api/resource/Bookings?fields=${fields}&limit_page_length=0`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};

/**
 * Create a new booking
 * @param {Object} bookingData - Object containing booking fields (e.g., user, room, from_time, to_time, status)
 * @returns {Promise<Object>} The created booking document
 */
export const postBooking = async (bookingData) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/resource/Bookings`, bookingData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

/**
 * Get current logged in user details
 * @returns {Promise<Object>} Current user info
 */
export const getCurrentUser = async () => {
  try {
    // First get the user id
    const userRes = await axios.get(`${BASE_URL}/api/method/frappe.auth.get_logged_user`);
    const userId = userRes.data.message;
    
    // If not logged in properly or Administrator, we can fetch their details from User doctype
    if (userId) {
      try {
        const detailsRes = await axios.get(`${BASE_URL}/api/resource/User/${userId}`);
        return detailsRes.data.data;
      } catch (detailsErr) {
        // If we don't have permission to fetch User details, just return the name
        return { name: userId, full_name: userId, email: userId };
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

/**
 * Get current user info with a reliable server-side is_admin flag.
 * Uses a dedicated backend endpoint so the admin check cannot be spoofed.
 * @returns {Promise<{user: string, is_admin: boolean}>}
 */
export const getCurrentUserInfo = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/method/v_meet.v_meet.api.get_current_user_info`);
    return response.data.message;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return { user: null, is_admin: false };
  }
};

/**
 * Logout current user
 */
export const logoutUser = async () => {
  try {
    await axios.post(`${BASE_URL}/api/method/logout`);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

/**
 * Update the status of a booking — calls a server-side whitelisted method
 * that enforces Administrator/System Manager role before allowing the change.
 * @param {string} bookingName - The ID (name) of the booking
 * @param {string} status - The new status value
 * @returns {Promise<Object>} The updated booking info
 */
export const updateBookingStatus = async (bookingName, status) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/method/v_meet.v_meet.api.update_booking_status`,
      { booking_name: bookingName, status }
    );
    return response.data.message;
  } catch (error) {
    console.error(`Error updating booking status for ${bookingName}:`, error);
    throw error;
  }
};

/**
 * Delete a room
 * @param {String} roomName 
 */
export const deleteRoom = async (roomName) => {
  try {
    await axios.delete(`${BASE_URL}/api/resource/Room/${roomName}`);
  } catch (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
};
