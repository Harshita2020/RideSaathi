# RideSaathi 🚗

A full-stack MERN ride-sharing platform that allows users to offer rides, book available seats, and track drivers in real time using Socket.IO.

## Features

### Authentication

* User Registration
* User Login
* JWT-based Authentication
* Protected Routes

### Ride Management

* Offer a Ride
* View Available Rides
* Update Ride Details
* Cancel Ride
* Ride Status Management

### Booking System

* Book Available Seats
* Prevent Duplicate Bookings
* Prevent Booking Own Ride
* Cancel Bookings
* Driver View of Passengers

### Real-Time Tracking

* Socket.IO Integration
* Secure Ride Rooms
* Driver Live Location Updates
* Passenger Real-Time Tracking
* Ride Status Broadcasts
* Driver-Only Tracking Controls

## Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcryptjs
* Socket.IO

### Frontend (In Progress)

* React
* Vite
* React Router
* Axios
* React Leaflet
* Socket.IO Client

## Project Structure

```text
RideSaathi/
├── client/
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── sockets/
│   │   └── server.js
│   │
│   ├── tests/
│   └── package.json
│
└── README.md
```

## API Modules

### Auth APIs

* Register User
* Login User
* Get Current User

### Ride APIs

* Create Ride
* Get All Rides
* Get Ride Details
* Update Ride
* Cancel Ride

### Booking APIs

* Create Booking
* Cancel Booking
* Get My Bookings
* Get Passenger List

## Real-Time Events

### Client → Server

* join-ride-room
* leave-ride-room
* start-ride
* update-location
* complete-ride

### Server → Client

* location-updated
* ride-status-changed
* ride-error

## Business Rules

* Only authenticated users can access APIs.
* Drivers cannot book their own rides.
* Passengers cannot join rides without available seats.
* Duplicate bookings are prevented.
* Only ride participants can join tracking rooms.
* Only drivers can start, update, or complete rides.

## Testing

The backend includes an automated Socket.IO integration test that validates:

* Authentication
* Room Authorization
* Ride Lifecycle
* Live Location Updates
* Database Persistence
* Driver/Passenger Permissions

## Current Status

### Backend Phase 1 ✅

* Authentication
* Ride CRUD
* Booking System
* Socket.IO Integration
* Live Tracking
* Integration Tests

### Frontend Phase ⏳

* React Setup
* Ride Search UI
* Offer Ride UI
* Maps Integration
* Live Tracking Screens

## Future Improvements

* Ride Search Optimization
* Route Visualization
* Driver Ratings
* Ride History
* Notifications
* Mobile PWA Support

---

Built as a portfolio project to demonstrate full-stack MERN development, real-time communication with Socket.IO, and scalable backend architecture.
