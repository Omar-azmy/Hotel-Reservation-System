# City Business Hotel — Hotel Reservation Management System (HRMS)

This project is developed as part of a **Software Engineering** course. The goal is to design and implement a fully functional, web-based **Hotel Reservation Management System (HRMS)** for a city business hotel. The project simulates end‑to‑end software development including requirements analysis, system design, UI/UX planning, database modeling, implementation, testing, deployment, and documentation.

The system is developed collaboratively by a student team, following software engineering principles such as modularity, scalability, functional decomposition, component-based architecture, and proper documentation.

It includes:

* A customer-facing booking interface
* An internal admin hotel management dashboard
* A real database with persistent storage
* Frontend, backend, and API layers
* End‑to‑end booking logic with double‑booking prevention
* Responsive and professional UI

**Project URL (Lovable):** [https://lovable.dev/projects/815e1a28-98b5-47e3-9d4a-b30585204f14](https://lovable.dev/projects/815e1a28-98b5-47e3-9d4a-b30585204f14)

---

## Project Summary

This repository contains a modern, web-based Hotel Reservation Management System (HRMS) tailored for a single City Business Hotel. The HRMS is designed to deliver a professional booking experience for guests and a streamlined management dashboard for hotel staff. It focuses on reliability (preventing double-bookings), a polished user experience across devices, and operational features that hotel personnel need to manage rooms, reservations, and customers.

**Important:** This project is developed and managed with **Lovable**. You can run, edit, and publish the app directly from the Lovable dashboard using the project URL above — changes made in Lovable are committed automatically to this repo.

---

## What this README contains

* A feature overview (customer-facing and admin features)
* Functional and design requirements
* Suggested architecture and database design
* API surface and data integrity rules
* Local development and deployment instructions (including Lovable workflow)
* Optional enhancements and testing guidance

---

## Core Features

### Customer (Public) Interface

* **Home Page:** Professional landing page with hero imagery, a concise description of the hotel, and a prominent “Book Now” call-to-action.
* **Room Listings:** Visual cards for room types (Standard, Deluxe, Executive Suite) showing price per night, capacity, amenity highlights, and images.
* **Booking Flow:** Interactive booking form with date pickers (check-in/check-out), guest count, room selection, and live availability checks before confirmation.
* **Availability Verification:** Server-side check to prevent double-bookings for a given room and date range.
* **Booking Confirmation:** A dedicated confirmation screen showing a human-readable booking ID, stay dates, rate breakdown, and contact info.
* **Manage Booking:** Lookup and cancel bookings by booking ID and email (no account required for basic lookup/cancellation).

### Admin (Management Dashboard)

* **Secure Authentication:** Protected admin area with role-based access.
* **Room Management:** Add/edit/delete room types, upload images, set prices, and toggle room status (available, maintenance).
* **Reservation Management:** Full list of bookings with filters (date range, room type, status), and actions to modify or cancel bookings.
* **Customer Profiles:** View guest contact details and booking histories to support communication and reporting.
* **Analytics:** Key performance indicators (KPIs) such as total bookings, occupancy rate, revenue, and real-time room availability.

---

## Functional Requirements & Best Practices

* **Double-Booking Prevention:** All booking creation flows must include a server-side atomic check for overlapping bookings. Prefer database transactions or row-level locks to avoid race conditions.
* **Persistent Storage:** Store rooms, bookings, and customers in a managed database (e.g., Supabase/Postgres, Firebase). Use secure storage for images.
* **Responsive UI:** UI should be mobile-first and degrade gracefully on smaller screens.
* **UX Messaging:** Clear success and error feedback for user actions (e.g., booking confirmed, room unavailable, booking cancelled).
* **Security:** Admin endpoints must be authenticated and authorized. Never expose service or secret keys in the frontend.

---

## Tech Stack

* **Frontend:** Vite + React + TypeScript
* **UI Library:** shadcn-ui components + Tailwind CSS
* **State & Data:** React Query or SWR (recommended) for server synchronization
* **Backend / API:** Serverless functions or Next API routes (depending on deployment target)
* **Database / Auth:** Integrate with Supabase or Firebase for persistent storage and authentication
* **Deployment & Management:** Lovable (primary), with the option to deploy to Vercel/Netlify and connect a custom domain

---

## Suggested Database Schema

### `rooms`

* `id` (uuid)
* `name` (string)
* `slug` (string)
* `type` (enum: Standard, Deluxe, Suite)
* `price_per_night` (numeric)
* `capacity` (int)
* `amenities` (json array)
* `images` (array of strings)
* `status` (enum: available, maintenance)

### `customers`

* `id` (uuid)
* `name` (string)
* `email` (string)
* `phone` (string)
* `created_at` (timestamp)

### `bookings`

* `id` (uuid)
* `booking_id` (string, unique human-friendly code)
* `room_id` (uuid, foreign key -> rooms.id)
* `customer_id` (uuid, foreign key -> customers.id)
* `check_in` (date)
* `check_out` (date)
* `guest_count` (int)
* `status` (enum: pending, confirmed, cancelled, completed)
* `total_price` (numeric)
* `created_at` (timestamp)

**Constraint:** Ensure a server-side mechanism (query + transactional check) that disallows creation of `bookings` where `check_in`/`check_out` overlaps with existing confirmed bookings for the same `room_id`.

---

## Example API Endpoints

### Public

* `GET /api/rooms` — list rooms (optionally include availability windows)
* `GET /api/rooms/:id` — get room details
* `POST /api/bookings/check` — verify availability without creating a booking
* `POST /api/bookings` — create a booking (includes server-side availability verification)
* `GET /api/bookings/:bookingId` — fetch booking (requires booking ID + email)
* `POST /api/bookings/:bookingId/cancel` — cancel a booking (requires booking ID + email or admin auth)

### Admin (protected)

* `POST /api/admin/rooms` — create room
* `PATCH /api/admin/rooms/:id` — update room
* `DELETE /api/admin/rooms/:id` — delete room
* `GET /api/admin/bookings` — list and filter bookings
* `PATCH /api/admin/bookings/:id` — update booking (status changes, notes)
* `GET /api/admin/customers` — list customers and view details
* `GET /api/admin/metrics` — analytics data (bookings, revenue, occupancy)

---

## Recommended Booking Flow & Double-Booking Prevention

1. Client requests booking via `POST /api/bookings`.
2. Server begins a transaction:

   * Verify `room` exists and status is `available`.
   * Query for existing confirmed bookings where date ranges overlap.
   * If none, create or retrieve `customer`, then insert `booking` with `status: confirmed` (or `pending` if awaiting payment).
   * Commit the transaction.
3. Respond with `booking_id` and confirmation details.

This transactional approach prevents concurrent requests from creating overlapping bookings.

---

## Optional Enhancements

* **Email notifications:** Send confirmation/cancellation emails (SendGrid, Mailgun).
* **Payments:** Integrate Stripe for deposits or full payments (mark bookings as `pending` until captured).
* **Search & Filters:** Allow filtering by price range, capacity, and amenities.
* **Calendar view:** Visual booking calendar in admin for quick availability scanning.
* **Rate plans & promotions:** Support corporate rates and promo codes.

---

## Testing and QA

* Unit test availability logic and booking creation (Jest/Testing Library).
* End-to-end tests for booking flows and admin actions (Cypress/Playwright).
* Use contract tests for API reliability between frontend and backend.

---

