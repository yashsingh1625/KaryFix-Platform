# KaryFix Platform

## Overview

KaryFix Platform is a full-stack MERN application designed to connect customers with service providers through a centralized service management system. The platform supports service booking, user management, technician workflows, waste management services, and administrative controls.

## Features

### Authentication & Authorization

* User Registration
* User Login
* Role-Based Access Control
* Protected Routes

### User Roles

* Customer
* Technician
* Manager
* Waste Officer
* Administrator

### Service Management

* Service Categories
* Sub-Service Management
* Service Discovery

### Booking System

* Create Service Bookings
* View Booking History
* Booking Status Tracking
* Booking Administration

### Administration

* Dashboard Overview
* User Management
* Service Management
* Booking Management
* Analytics

### Additional Modules

* Waste Management
* Emergency Alert System
* Material Ordering System
* Technician Location Tracking

## Technology Stack

### Frontend

* React.js
* Vite
* Redux Toolkit
* React Router

### Backend

* Node.js
* Express.js
* JWT Authentication
* Socket.IO

### Database

* MongoDB Atlas
* Mongoose

## Project Structure

```text
client/   -> React Frontend
server/   -> Express Backend
```

## Installation

### Frontend

```bash
cd client
npm install
npm run dev
```

### Backend

```bash
cd server
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in the server directory and configure:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

## Current Status

* Frontend Running
* Backend Running
* MongoDB Connected
* Authentication Functional
* Admin Dashboard Functional
* Service Data Seeded

## Author

Yashashwi Singh
