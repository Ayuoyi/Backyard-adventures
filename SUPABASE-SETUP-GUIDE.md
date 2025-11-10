# 🚀 SUPABASE BACKEND INTEGRATION GUIDE
## Backyard Adventures

---

## 📋 TABLE OF CONTENTS
1. [Setup Instructions](#setup-instructions)
2. [Database Schema](#database-schema)
3. [Authentication Flow](#authentication-flow)
4. [Available Functions](#available-functions)
5. [Usage Examples](#usage-examples)
6. [Security & Best Practices](#security)

---

## 🔧 SETUP INSTRUCTIONS

### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up/login
3. Click "New Project"
4. Fill in:
   - **Name**: backyard-adventures
   - **Database Password**: (create a strong password - SAVE THIS!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine to start
5. Click "Create new project" (takes ~2 minutes)

### Step 2: Get Your API Credentials
1. In your Supabase dashboard, click "Settings" (gear icon)
2. Go to "API" section
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

### Step 3: Update Configuration
Open `js/supabase-config.js` and replace:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL'; // Paste your Project URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Paste your anon key
```

### Step 4: Create Database Tables
1. In Supabase dashboard, click "SQL Editor"
2. Click "New query"
3. Copy **ALL** content from `supabase-schema.sql`
4. Paste into the SQL Editor
5. Click "Run" (bottom right)
6. Wait for success message: "Success. No rows returned"

### Step 5: Enable Email Authentication
1. Go to "Authentication" → "Providers"
2. Enable "Email" provider (should be on by default)
3. Configure email templates (optional):
   - Go to "Email Templates"
   - Customize "Confirm signup", "Reset password" templates

### Step 6: Test Your Setup
1. Open `portal/signup.html` in browser
2. Create a test account
3. Check Supabase dashboard → "Authentication" → "Users"
4. You should see your new user!

---

## 📊 DATABASE SCHEMA

### Tables Created:

#### 1. **users** - User profiles
- `id` (UUID) - Primary key, links to auth.users
- `email` (VARCHAR) - User email
- `full_name` (VARCHAR) - User's full name
- `role` (VARCHAR) - client | admin | employee
- `phone` (VARCHAR) - Phone number
- `address` (TEXT) - Address
- `profile_image_url` (TEXT) - Profile picture URL
- `created_at`, `updated_at` (TIMESTAMP)

#### 2. **tours** - Tour packages
- `id` (UUID) - Primary key
- `name` (VARCHAR) - Tour name
- `description` (TEXT) - Tour description
- `type` (VARCHAR) - Tour category
- `duration` (VARCHAR) - e.g., "2 hours", "full day"
- `difficulty` (VARCHAR) - beginner | intermediate | advanced
- `price` (DECIMAL) - Tour price
- `max_participants` (INTEGER) - Max group size
- `included_items` (TEXT[]) - What's included
- `requirements` (TEXT[]) - Requirements
- `image_url` (TEXT) - Tour image
- `status` (VARCHAR) - active | inactive | seasonal

#### 3. **equipment** - Rental equipment
- `id` (UUID) - Primary key
- `name` (VARCHAR) - Equipment name
- `type` (VARCHAR) - Equipment category
- `description` (TEXT) - Description
- `hourly_rate` (DECIMAL) - Per hour price
- `daily_rate` (DECIMAL) - Per day price
- `availability` (VARCHAR) - available | rented | maintenance
- `quantity` (INTEGER) - Number available
- `badge` (VARCHAR) - popular | featured | premium
- `image_url` (TEXT) - Equipment image

#### 4. **tour_bookings** - Tour reservations
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `tour_id` (UUID) - Foreign key to tours
- `date` (DATE) - Booking date
- `time` (TIME) - Booking time
- `participants` (INTEGER) - Number of people
- `total_price` (DECIMAL) - Total cost
- `status` (VARCHAR) - pending | confirmed | completed | cancelled
- `payment_status` (VARCHAR) - pending | paid | refunded

#### 5. **equipment_rentals** - Equipment bookings
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `equipment_id` (UUID) - Foreign key to equipment
- `start_date`, `end_date` (TIMESTAMP) - Rental period
- `duration_hours` (INTEGER) - Total hours
- `total_price` (DECIMAL) - Total cost
- `status` (VARCHAR) - pending | active | completed | cancelled

#### 6. **inquiries** - Contact form submissions
- `id` (UUID) - Primary key
- `name`, `email`, `phone` - Contact info
- `subject`, `message` - Inquiry details
- `status` (VARCHAR) - new | in-progress | resolved
- `assigned_to` (UUID) - Staff member

#### 7. **reviews** - Tour reviews
- `id` (UUID) - Primary key
- `user_id`, `tour_id` (UUID) - Foreign keys
- `rating` (INTEGER) - 1-5 stars
- `comment` (TEXT) - Review text

---

## 🔐 AUTHENTICATION FLOW

### Sign Up Process:
1. User fills signup form (name, email, password, role)
2. `supabaseAuth.signUp()` called
3. Creates auth user + user profile in database
4. Sends verification email (Supabase automatic)
5. User clicks email link to verify
6. Can now login

### Login Process:
1. User enters email/password/role
2. `supabaseAuth.signIn()` validates credentials
3. Fetches user profile to verify role matches
4. Stores session in localStorage
5. Redirects to appropriate dashboard

### Protected Routes:
```javascript
// Add to any page requiring authentication
await supabaseAuth.requireAuth('/portal/login.html');
```

---

## 🛠️ AVAILABLE FUNCTIONS

### Configuration (`supabase-config.js`)
```javascript
// Access Supabase client globally
window.supabase

// Helper functions
supabaseHelpers.getCurrentUser()        // Get logged-in user
supabaseHelpers.isAuthenticated()       // Check if logged in
supabaseHelpers.getSession()            // Get current session
supabaseHelpers.showNotification(msg, type) // Show toast
supabaseHelpers.formatDate(dateString)  // Format date
supabaseHelpers.formatCurrency(amount)  // Format money
```

### Authentication (`supabase-auth.js`)
```javascript
// Sign up new user
await supabaseAuth.signUp(email, password, {
    full_name: "John Doe",
    role: "client"
})

// Sign in
await supabaseAuth.signIn(email, password)

// Sign out
await supabaseAuth.signOut()

// Reset password
await supabaseAuth.resetPassword(email)

// Update password
await supabaseAuth.updatePassword(newPassword)

// Get user profile
await supabaseAuth.getUserProfile(userId)

// Update profile
await supabaseAuth.updateUserProfile(userId, {
    full_name: "New Name",
    phone: "123-456-7890"
})

// Require authentication (redirect if not logged in)
await supabaseAuth.requireAuth()
```

### Database Queries (`supabase-queries.js`)

#### Tours
```javascript
// Get all tours
await supabaseQueries.getAllTours()

// Get specific tour
await supabaseQueries.getTourById(tourId)

// Filter tours
await supabaseQueries.filterTours({
    duration: 'full day',
    difficulty: 'beginner',
    maxPrice: 100
})

// Create tour (admin)
await supabaseQueries.createTour({
    name: "Sunset Cruise",
    description: "Beautiful sunset experience",
    type: "cruise",
    duration: "2 hours",
    difficulty: "beginner",
    price: 75.00,
    max_participants: 15
})

// Update tour (admin)
await supabaseQueries.updateTour(tourId, { price: 85.00 })

// Delete tour (admin)
await supabaseQueries.deleteTour(tourId)
```

#### Equipment
```javascript
// Get all equipment
await supabaseQueries.getAllEquipment()

// Get available equipment only
await supabaseQueries.getAvailableEquipment()

// Filter equipment
await supabaseQueries.filterEquipment({
    type: 'kayak',
    availability: 'available',
    maxPrice: 50
})

// Update availability
await supabaseQueries.updateEquipmentAvailability(equipmentId, 'rented')
```

#### Bookings & Rentals
```javascript
// Create tour booking
await supabaseQueries.createTourBooking({
    tourId: 'uuid-here',
    date: '2025-12-01',
    participants: 4,
    totalPrice: 300.00
})

// Create equipment rental
await supabaseQueries.createEquipmentRental({
    equipmentId: 'uuid-here',
    startDate: '2025-12-01T10:00:00',
    endDate: '2025-12-01T14:00:00',
    durationHours: 4,
    totalPrice: 100.00
})

// Get user's bookings
await supabaseQueries.getUserBookings(userId)

// Get user's rentals
await supabaseQueries.getUserRentals(userId)

// Cancel booking
await supabaseQueries.cancelBooking(bookingId)

// Cancel rental
await supabaseQueries.cancelRental(rentalId, equipmentId)
```

#### Contact/Inquiries
```javascript
// Submit contact form
await supabaseQueries.submitContactForm({
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
    subject: "Question about tours",
    message: "I'd like to know..."
})

// Get all inquiries (admin)
await supabaseQueries.getAllInquiries()

// Update inquiry status (admin)
await supabaseQueries.updateInquiryStatus(inquiryId, 'resolved')
```

---

## 💡 USAGE EXAMPLES

### Example 1: Display Tours on Page
```javascript
// In tours.html
async function loadTours() {
    const result = await supabaseQueries.getAllTours();
    
    if (result.success) {
        const toursContainer = document.getElementById('tours-grid');
        toursContainer.innerHTML = result.data.map(tour => `
            <div class="tour-card">
                <img src="${tour.image_url}" alt="${tour.name}">
                <h3>${tour.name}</h3>
                <p>${tour.description}</p>
                <p class="price">$${tour.price}</p>
                <button onclick="bookTour('${tour.id}')">Book Now</button>
            </div>
        `).join('');
    }
}

loadTours();
```

### Example 2: Book a Tour
```javascript
async function bookTour(tourId) {
    // Check if user is logged in
    const user = await supabaseHelpers.getCurrentUser();
    if (!user) {
        window.location.href = '/portal/login.html';
        return;
    }

    // Get booking details from form
    const date = document.getElementById('bookingDate').value;
    const participants = parseInt(document.getElementById('participants').value);
    
    // Get tour to calculate price
    const tourResult = await supabaseQueries.getTourById(tourId);
    const tour = tourResult.data;
    const totalPrice = tour.price * participants;

    // Create booking
    const result = await supabaseQueries.createTourBooking({
        tourId: tourId,
        date: date,
        participants: participants,
        totalPrice: totalPrice
    });

    if (result.success) {
        supabaseHelpers.showNotification('Booking successful!', 'success');
        window.location.href = '/portal/dashboard.html';
    } else {
        supabaseHelpers.showNotification('Booking failed: ' + result.error, 'error');
    }
}
```

### Example 3: Filter Equipment
```javascript
// Listen to filter changes
document.getElementById('typeFilter').addEventListener('change', async (e) => {
    const type = e.target.value;
    
    const result = await supabaseQueries.filterEquipment({
        type: type === 'all' ? null : type,
        availability: 'available'
    });

    if (result.success) {
        displayEquipment(result.data);
    }
});
```

### Example 4: Contact Form Submission
```javascript
// In contact.html
document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    const result = await supabaseQueries.submitContactForm({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message')
    });

    if (result.success) {
        supabaseHelpers.showNotification('Message sent successfully!', 'success');
        e.target.reset();
    } else {
        supabaseHelpers.showNotification('Failed to send message', 'error');
    }
});
```

---

## 🔒 SECURITY & BEST PRACTICES

### Row Level Security (RLS)
✅ All tables have RLS enabled
✅ Users can only see/edit their own data
✅ Admins have special permissions
✅ Public can view tours/equipment (read-only)

### Security Tips:
1. **Never expose your service_role key** - only use anon key in frontend
2. **Validate all inputs** - check data before sending to database
3. **Use RLS policies** - already configured in schema
4. **Enable email verification** - users must verify email
5. **Strong passwords** - enforce 8+ characters minimum

### Error Handling:
Always check `result.success` before using data:
```javascript
const result = await supabaseQueries.getAllTours();
if (result.success) {
    // Use result.data
} else {
    // Handle result.error
    console.error(result.error);
}
```

### Performance Tips:
1. **Use indexes** - already created in schema
2. **Limit queries** - use filters to reduce data
3. **Cache data** - store frequently used data locally
4. **Lazy load** - load data when needed, not all at once

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Create Supabase project
- [ ] Copy API credentials to config file
- [ ] Run database schema SQL
- [ ] Test signup/login functionality
- [ ] Add sample tours and equipment
- [ ] Configure email templates
- [ ] Test booking flow
- [ ] Test rental flow
- [ ] Set up custom domain (optional)
- [ ] Enable database backups

---

## 📞 SUPPORT & RESOURCES

- **Supabase Docs**: https://supabase.com/docs
- **JavaScript Client**: https://supabase.com/docs/reference/javascript
- **Authentication**: https://supabase.com/docs/guides/auth
- **Database**: https://supabase.com/docs/guides/database

---

## 🎉 YOU'RE READY TO GO!

Your Backyard Adventures app now has:
✅ Complete authentication system
✅ Database with all necessary tables
✅ Ready-to-use query functions
✅ User dashboard
✅ Secure data access

**Next Steps:**
1. Integrate booking forms on tours.html
2. Integrate rental forms on rentals.html
3. Add contact form integration
4. Create admin dashboard (if needed)
5. Add payment integration (Stripe/PayPal)

Happy coding! 🏖️🚤
