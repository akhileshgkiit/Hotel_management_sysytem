# LuxeStay Hotel Booking System

Welcome to **LuxeStay**, a modern, full-featured MERN (MongoDB, Express, React, Node.js) hotel booking application. This repository is structured as a monorepo containing both the frontend client and the backend server.

---

## 🚀 Quick Start Guide

Follow these steps to set up and run the project locally.

### 1. Prerequisites
Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas URI)

### 2. Installation
Install dependencies for both the `frontend` and `backend` services using the root script helper:
```bash
npm run install-all
```

### 3. Environment Setup

#### Backend Configuration
Create a `.env` file inside the `backend` directory and add the following:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
KHALTI_SECRET_KEY=your_khalti_secret_key
ESEWA_SECRET_KEY=your_esewa_secret_key
```

### 4. Database Seeding
To populate the database with initial sample hotels, rooms, reviews, and test users (Regular, Hotel Admin, and Super Admin accounts):
```bash
npm run seed-db
```

### 5. Running the Application
You can spin up the client and server locally using the root NPM scripts:

* **Start Backend Server (Dev Mode)**:
  ```bash
  npm run backend
  ```
* **Start Frontend Client (Dev Mode)**:
  ```bash
  npm run frontend
  ```

---

## 🛠️ Monorepo Scripts Reference

All commands can be run from the root directory:

| Script | Description |
| :--- | :--- |
| `npm run install-all` | Installs NPM packages for both frontend & backend |
| `npm run seed-db` | Seeds the database with demo users, hotels, and rooms |
| `npm run backend` | Starts the backend development server using `nodemon` |
| `npm run frontend` | Starts the frontend client using `vite` |
| `npm run build-frontend` | Builds the React frontend application for production |
| `npm start` | Seeds the database and starts the production backend server |
