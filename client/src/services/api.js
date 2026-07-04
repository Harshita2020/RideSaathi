import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach bearer token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ridesaathi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me')
};

export const rideAPI = {
  create: (data) => API.post('/rides', data),
  getAll: (params) => API.get('/rides', { params }),
  getDetails: (id) => API.get(`/rides/${id}`),
  update: (id, data) => API.put(`/rides/${id}`, data),
  cancel: (id) => API.delete(`/rides/${id}`),
  getMyOffered: () => API.get('/rides/my-offered'),
  start: (id) => API.put(`/rides/${id}/start`),
  complete: (id) => API.put(`/rides/${id}/complete`)
};

export const bookingAPI = {
  create: (rideId) => API.post('/bookings', { rideId }),
  cancel: (id) => API.delete(`/bookings/${id}`),
  getMyBookings: () => API.get('/bookings/my-bookings'),
  getMyRides: () => API.get('/bookings/my-rides')
};

export default API;
