# LuxeStay User Guide & Portal Manual
**Platform Version:** 1.0.0  

---

## 1. Regular User Guide

### 1.1 Account Registration & Login
1. Click **Sign Up** in the top-right corner of the navigation bar.
2. Fill in your full name, email, phone number, and password. Click **Register**.
3. Upon registration, you are automatically logged in and redirected to the home screen.
4. If you have an existing account, click **Log In**, enter your email and password, and submit.
5. In development mode, mock email verification is auto-approved for an uninterrupted setup.

### 1.2 Searching & Filtering Hotels
1. From the Home page, type your destination city (e.g., *Mumbai*, *Delhi*, *Agra*) in the search box and click **Search**.
2. Alternatively, navigate to **Hotels** from the navbar to browse all properties.
3. Use the filter panel on the left to refine your results:
   * **City Search:** Filter by typing a specific city name.
   * **Price Range Slider:** Set the minimum and maximum price per night.
   * **Minimum Rating Selector:** Filter properties by average star ratings (1 to 5 stars).
   * **Amenities Checkboxes:** Filter properties that include amenities like WiFi, Pool, Gym, Spa, or Beachfront.

### 1.3 Booking & Checkout
1. Click on a hotel card to open its detail page.
2. Review the description, images, location, and guest reviews.
3. Enter your **Check-in** and **Check-out** dates in the sidebar booking form.
4. Select the desired room type (e.g., *Single Room*, *Double Room*, *Deluxe Room*, *Suite*) and click **Book Now**.
5. You will be redirected to the secure Checkout page.
6. Choose your payment method:
   * **Razorpay:** Launches the simulated card checkout.
   * **eSewa:** Redirects to the simulated eSewa merchant payment form.
   * **Khalti:** Redirects to the simulated Khalti wallet checkout.
7. Upon successful payment verification, you will see a confirmation screen and can review the booking in your dashboard.

---

## 2. Hotel Administrator Guide

### 2.1 Accessing the Hotel Admin Portal
1. Register/Log in with a user account that has been granted the **Hotel Admin** role.
2. The navbar dropdown under your name will show a link to the **Dashboard**. Click it to access the portal.
3. Your sidebar will contain tabs for **Dashboard** (analytics), **Hotel Profile**, **Room Inventory**, and **Manage Bookings**.

### 2.2 Updating Hotel Profile Details
1. Navigate to the **Hotel Profile** tab.
2. You can update the property name, description, address, city, state, and check/uncheck amenities.
3. Drag-and-drop or select new images to upload directly to Cloudinary.
4. Click **Save Changes** to publish updates.

### 2.3 Managing Room Inventory
1. Click **Room Inventory** in the sidebar.
2. To add a room type: Click **Add New Room**, specify the type (Single/Double/Deluxe/Suite), description, nightly price, max guest capacity, available count, and upload room images. Click **Submit**.
3. To edit: Click **Edit** next to any room row to modify pricing, description, or capacity.

### 2.4 Handling Bookings
1. Go to the **Manage Bookings** tab to view bookings made at your hotel.
2. Review the check-in/check-out dates, customer details, and total payment.
3. Update booking status (e.g., mark as checked-in or completed).

---

## 3. Super Administrator Guide

### 3.1 Platform Moderation & Statistics
1. Log in with the super admin credentials (`admin@luxestay.com` / `password123`).
2. Go to the **Dashboard** to see platform-wide statistics: total users, approved hotels, pending listings, and total revenue.

### 3.2 Hotel Approval Workflow
1. Navigate to **Manage Hotels** in the sidebar.
2. New hotel signups appear as "Pending". Review their application information.
3. Click **Approve** to make the hotel live on the search page, or **Reject** to decline.
4. You can also **Block** an existing approved hotel if it violates policy.

### 3.3 User Management
1. Click **Manage Users** in the sidebar to view all registered accounts.
2. You can review the roles assigned to accounts (User, Hotel Admin, Admin).
3. If an account is engaging in fraudulent bookings, click **Block User** to restrict access.
