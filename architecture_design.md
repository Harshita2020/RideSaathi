# RideSaathi - Architecture

## Project Goal

RideSaathi is a MERN-based ride-sharing platform that allows users to:

- Register and Login
- Offer rides
- Search rides
- Join rides
- Manage rides
- Track drivers live during active rides

This is a portfolio-focused MVP designed to demonstrate:

- React
- Node.js
- Express
- MongoDB
- JWT Authentication
- Socket.IO
- Geolocation APIs
- Real-Time Systems Design

---

# Features Included

## Authentication

- Register
- Login
- Persistent Authentication (JWT)

## Ride Offering

- Create Ride
- Edit Ride
- Cancel Ride

## Ride Discovery

- Search Ride
- View Ride Details
- Join Ride

## Ride Management

- My Offered Rides
- My Joined Rides
- Ride History
- Active Ride

## Live Tracking

- Driver GPS Tracking
- Passenger Driver Tracking
- Socket.IO Real-Time Updates
- Ride-Specific Rooms

## Ride Status

- CREATED
- ACTIVE
- COMPLETED
- CANCELLED

---

# Features Excluded From MVP

- Payments
- Ratings
- Reviews
- Chat
- Notifications
- Passenger Location Sharing
- Admin Panel
- Dynamic Pricing

---

# Database Collections

## Users

```js
{
  _id,
  name,
  email,
  password,
  createdAt,
  updatedAt
}
```

---

## Rides

```js
{
  _id,

  driverId,

  source: {
    name,
    coordinates
  },

  destination: {
    name,
    coordinates
  },

  departureTime,

  totalSeats,

  availableSeats,

  status,

  currentLocation,

  createdAt,
  updatedAt
}
```

### Ride Status

```text
CREATED
ACTIVE
COMPLETED
CANCELLED
```

---

## Bookings

```js
{
  _id,

  rideId,

  passengerId,

  status,

  createdAt
}
```

### Booking Status

```text
BOOKED
CANCELLED
```

---

# Backend Structure

```text
server
└── src
    ├── config
    │   ├── db.js
    │   └── socket.js
    │
    ├── models
    │   ├── User.js
    │   ├── Ride.js
    │   └── Booking.js
    │
    ├── controllers
    │   ├── authController.js
    │   ├── rideController.js
    │   └── bookingController.js
    │
    ├── routes
    │   ├── authRoutes.js
    │   ├── rideRoutes.js
    │   └── bookingRoutes.js
    │
    ├── middleware
    │   ├── authMiddleware.js
    │   └── errorMiddleware.js
    │
    ├── sockets
    │   └── rideTracking.js
    │
    ├── utils
    │
    └── server.js
```

---

# Frontend Structure

```text
client
└── src
    ├── pages
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   ├── Dashboard.jsx
    │   ├── OfferRide.jsx
    │   ├── SearchRide.jsx
    │   ├── RideDetails.jsx
    │   ├── MyRides.jsx
    │   └── RideTracking.jsx
    │
    ├── components
    │   ├── Map
    │   ├── RideCard
    │   ├── Navbar
    │   └── ProtectedRoute
    │
    ├── context
    │   ├── AuthContext.jsx
    │   └── SocketContext.jsx
    │
    ├── services
    │   ├── api.js
    │   └── socket.js
    │
    ├── hooks
    │
    ├── App.jsx
    └── main.jsx
```

---

# REST APIs

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## Rides

```text
POST   /api/rides
GET    /api/rides
GET    /api/rides/:id
PUT    /api/rides/:id
DELETE /api/rides/:id
```

## Bookings

```text
POST   /api/bookings
DELETE /api/bookings/:id
GET    /api/bookings/my-bookings
GET    /api/bookings/my-rides
```

---

# Real-Time Architecture

The most important feature of the project.

After a passenger joins a ride and the driver starts the ride, the system switches from REST APIs to Socket.IO.

## Flow

```text
Driver Browser
     ↓
Geolocation API
     ↓
Socket.IO Client
     ↓
Express + Socket.IO Server
     ↓
Ride Room
     ↓
Passengers
```

---

## Room Strategy

Each ride gets its own room.

```text
ride:<rideId>
```

Example:

```text
ride:68391abc123
```

Only:

- Driver
- Passengers of that ride

can join the room.

---

# Socket Events

## Client → Server

```text
join-ride-room

start-ride

update-location

complete-ride
```

---

## Server → Client

```text
location-updated

ride-status-changed
```

---

# Location Update Strategy

Driver location updates:

```text
Every 5 seconds
```

Flow:

```text
Driver GPS
      ↓
update-location
      ↓
Server
      ↓
location-updated
      ↓
Passengers
```

Only passengers belonging to that ride receive updates.

---

# Ride Lifecycle

```text
CREATED
    ↓
ACTIVE
    ↓
COMPLETED
```

Or:

```text
CREATED
    ↓
CANCELLED
```

---

# Booking Rules

When a passenger joins:

- Create Booking document
- Decrease availableSeats
- Prevent duplicate bookings
- Prevent joining own ride
- Prevent overbooking

---

# MVP User Flow

```text
Register
 ↓

Login
 ↓

Offer Ride
 ↓

Passenger Searches Ride
 ↓

Passenger Joins Ride
 ↓

Driver Starts Ride
 ↓

Driver Sends GPS Updates
 ↓

Passengers Track Driver
 ↓

Driver Ends Ride
```

---

# Future Enhancements

Not part of MVP.

- Payments
- Ratings
- Reviews
- Passenger Live Tracking
- Push Notifications
- In-App Chat
- Redis for Location Storage
- Route Optimization
- Vehicle Profiles
