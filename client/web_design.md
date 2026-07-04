# RideSaathi UI Design System

## Core Philosophy

RideSaathi is not a marketing website.

RideSaathi is a real-time transportation product.

The design should combine:

* Uber's practicality
* Google Maps' clarity
* Modern SaaS polish
* Cinematic visual quality

Every screen should feel intentional, responsive, and premium.

Avoid generic AI dashboard layouts.

Avoid excessive animations that slow down workflows.

The map is the product.

---

## Visual Identity

### Design Direction

"Modern Mobility"

A premium transportation platform built for everyday commuters.

Keywords:

* Movement
* Reliability
* Trust
* Simplicity
* Real-time awareness

---

## Color System

Primary:
#0F172A

Secondary:
#1E293B

Accent:
#22C55E

Success:
#10B981

Warning:
#F59E0B

Error:
#EF4444

Background:
#F8FAFC

Surface:
#FFFFFF

Text:
#0F172A

Muted Text:
#64748B

---

## Typography

Headings:
Inter

Body:
Inter

Monospace:
JetBrains Mono

Large headings should feel confident and modern.

Avoid oversized marketing-style typography inside the application.

---

## Layout Principles

### Mobile

Primary target.

Patterns:

* Full-width layouts
* Bottom sheets
* Sticky actions
* Map-first interfaces

Examples:

* Ride search appears in a draggable bottom sheet.
* Live tracking uses a full-screen map.
* Ride details slide up from the bottom.

---

### Desktop

Do not center a mobile layout.

Use available screen space.

Patterns:

* Sidebar + Content
* Sidebar + Map
* Multi-column cards
* Split panels

Examples:

Ride Discovery:

[Filters]
[Ride List] [Map]

Live Tracking:

[Ride Info] [Live Map]

My Rides:

[Ride Grid]

---

## Motion Guidelines

Animation should communicate state.

Allowed:

* Smooth page transitions
* Hover elevation
* Card expansion
* Bottom sheet transitions
* Route transitions
* Map marker updates

Avoid:

* Long hero animations
* Scroll storytelling
* Decorative parallax
* Excessive GSAP sequences

Animation duration:

150ms - 300ms

Fast and responsive.

---

## Navigation

Mobile:

Bottom Navigation

* Home
* Offer Ride
* My Rides
* Bookings

Desktop:

Left Sidebar

* Home
* Offer Ride
* My Rides
* Bookings
* Logout

---

## Authentication Pages

Desktop:

Split screen layout.

Left:
Branding panel
Illustration
Trust messaging

Right:
Login/Register form

Mobile:

Single-column form

No tiny centered card floating in empty space.

---

## Maps

Maps are first-class citizens.

Rules:

* Maximize map visibility
* Never hide the map unnecessarily
* Use overlays instead of separate pages when possible
* Keep controls lightweight

---

## Ride Cards

Each card should clearly display:

* Source
* Destination
* Departure Time
* Available Seats
* Driver

Primary action:

Book Ride

Secondary action:

View Details

---

## Live Tracking

The most important screen.

Layout:

Mobile:
Full-screen map + ride bottom sheet

Desktop:
Ride info panel + live map

Real-time updates should feel smooth and immediate.

---

## PWA Rules

Must feel installable and app-like.

Requirements:

* Offline shell
* Fast startup
* Mobile responsiveness
* Touch-friendly controls

The user should forget they are using a website.
