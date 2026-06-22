# LUXESTAY HOTEL BOOKING SYSTEM
## Software Requirements Specification (SRS) – Research Report

**Submitted By:**  
Akhilesh Kumar Gupta  

**Technology Stack:**  
* MongoDB  
* Express.js  
* React.js  
* Node.js  

**Submitted To:**  
Rupa Khadka  
Nagarik Solution Pvt. Ltd.  

---

## CERTIFICATE

This is to certify that the project entitled **"LuxeStay Hotel Booking System"** submitted by **Akhilesh Kumar Gupta** is a record of work carried out during the internship period under proper guidance and supervision.

**Trainer Signature:** \_\_\_\_\_\_\_\_\_\_  
**Date:** \_\_\_\_\_\_\_\_\_\_  

---

## DECLARATION

I hereby declare that this report entitled **"LuxeStay Hotel Booking System"** is my original work and has not been submitted elsewhere for any academic or professional purpose.

**Akhilesh Kumar Gupta**  

---

## ACKNOWLEDGEMENT

I would like to express my sincere gratitude to my trainer, mentors, and Nagarik Solution Pvt. Ltd. for their continuous support and guidance throughout the development of the LuxeStay Hotel Booking System. Their valuable suggestions and encouragement helped me successfully complete this project.

---

## ABSTRACT

LuxeStay Hotel Booking System is a web-based platform developed to simplify hotel reservation and management processes. The system allows users to search hotels, view room details, make bookings, manage reservations, and submit reviews. Hotel administrators manage hotel information and room inventory, while Super Administrators oversee platform activities.

The project is developed using the MERN stack (MongoDB, Express.js, React.js, and Node.js) along with JWT authentication, Cloudinary integration, and role-based access control. The platform provides a secure, efficient, and user-friendly solution for hotel booking and management.

---

## TABLE OF CONTENTS

1. [Introduction](#chapter-1-introduction)
2. [Overall Description](#chapter-2-overall-description)
3. [System Requirements](#chapter-3-system-requirements)
4. [System Design](#chapter-4-system-design)
5. [Database Design](#chapter-5-database-design)
6. [Technology Stack & Implementation](#chapter-6-technology-stack--implementation)
7. [Testing & Results](#chapter-7-testing--results)
8. [Future Enhancements](#chapter-8-future-enhancements)
9. [Conclusion](#chapter-9-conclusion)

---

## CHAPTER 1: INTRODUCTION

### 1.1 Background
The hospitality industry has increasingly adopted digital technologies to improve customer experience and operational efficiency. Online hotel booking systems allow customers to search hotels, compare prices, and make reservations conveniently.

LuxeStay was developed to provide a centralized platform for hotel booking and management.

### 1.2 Purpose
The purpose of LuxeStay is to simplify hotel reservation processes and provide management tools for hotels through a secure web-based platform.

### 1.3 Objectives
* **Primary Objective**: Develop a hotel booking platform that allows users to search and reserve rooms online.
* **Secondary Objectives**:
  * User authentication
  * Hotel management
  * Room management
  * Booking management
  * Review management
  * Administrative control

### 1.4 Scope
The system supports hotel listings, room reservations, reviews, booking management, and administrative operations.

---

## CHAPTER 2: OVERALL DESCRIPTION

### 2.1 Product Perspective
LuxeStay is a MERN-stack application following a client-server architecture.

### 2.2 Product Functions
* **User Functions**:
  * Registration
  * Login
  * Search Hotels
  * Book Rooms
  * Wishlist Management
  * Submit Reviews
* **Hotel Admin Functions**:
  * Manage Hotels
  * Manage Rooms
  * View Reservations
* **Super Admin Functions**:
  * Approve Hotels
  * Manage Users
  * View Analytics

### 2.3 User Classes
* Regular User
* Hotel Administrator
* Super Administrator

---

## CHAPTER 3: SYSTEM REQUIREMENTS

### Functional Requirements

#### User Module
* User Registration
* User Login
* Profile Management

#### Hotel Module
* Create Hotel
* Update Hotel
* Hotel Approval

#### Room Module
* Add Room
* Update Room
* Delete Room

#### Booking Module
* Search Hotels
* View Hotel Details
* Book Rooms
* Cancel Bookings

#### Review Module
* Submit Review
* View Reviews

#### Wishlist Module
* Add to Wishlist
* Remove from Wishlist

### Non-Functional Requirements

#### Security
* JWT Authentication
* bcrypt Password Encryption
* RBAC (Role-Based Access Control)

#### Performance
* Fast API Response
* Optimized Queries

#### Scalability
* Support Growing Users and Hotels

---

## CHAPTER 4: SYSTEM DESIGN

### Architecture
The system follows a three-tier architecture:
* **Presentation Layer**: React.js, Tailwind CSS
* **Application Layer**: Node.js, Express.js
* **Data Layer**: MongoDB

### Authentication Flow
User → Login → JWT Token → Protected Routes

### Cloudinary Integration
Cloudinary is used for hotel and room image storage.

---

## CHAPTER 5: DATABASE DESIGN

### User Collection
* name
* email
* password
* role
* phone

### Hotel Collection
* hotelName
* address
* city
* amenities
* rating

### Room Collection
* roomType
* price
* capacity
* availability

### Booking Collection
* userId
* roomId
* bookingStatus
* totalAmount

### Review Collection
* rating
* comment

### Relationships
* User → Booking
* Hotel → Room
* Hotel → Review
* Room → Booking

---

## CHAPTER 6: TECHNOLOGY STACK & IMPLEMENTATION

### Frontend
* React.js
* Vite
* Tailwind CSS
* Axios

### Backend
* Node.js
* Express.js
* JWT
* bcrypt
* Nodemailer

### Database
* MongoDB
* Mongoose

### Cloud Services
* Cloudinary

---

## CHAPTER 7: TESTING & RESULTS

| Test Case | Expected Result | Status |
| :--- | :--- | :--- |
| Registration | Success | Pass |
| Login | Success | Pass |
| Hotel Search | Success | Pass |
| Room Booking | Success | Pass |
| Review Submission | Success | Pass |

### Results
The system successfully performed authentication, booking management, review handling, and hotel administration functions.

---

## CHAPTER 8: FUTURE ENHANCEMENTS
* AI-Based Recommendations
* Dynamic Pricing
* Mobile Application
* Loyalty Program
* Advanced Analytics

---

## CHAPTER 9: CONCLUSION
LuxeStay Hotel Booking System successfully provides a secure and efficient platform for hotel booking and management. The system improves customer convenience while helping hotels manage reservations and operations effectively. The use of MERN technologies ensures scalability, maintainability, and future expansion opportunities.
