# 🧪 Testing Guide - Supabase Integration

## Prerequisites

Before testing, make sure:
1. ✅ Supabase project is created
2. ✅ Database schema has been run (supabase-schema.sql)
3. ✅ SUPABASE_URL and SUPABASE_ANON_KEY are set in js/supabase-config.js
4. ✅ Sample data exists in tours and equipment tables

---

## 🚀 Quick Start Test

### Step 1: Add Your Supabase Credentials

Open `js/supabase-config.js` and update:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

**Where to find these**:
1. Go to your Supabase project dashboard
2. Click "Settings" → "API"
3. Copy the "Project URL" (SUPABASE_URL)
4. Copy the "anon public" key (SUPABASE_ANON_KEY)

---

### Step 2: Run the Database Schema

1. Open your Supabase project
2. Go to "SQL Editor"
3. Click "New Query"
4. Copy and paste the entire contents of `supabase-schema.sql`
5. Click "Run" or press Ctrl+Enter
6. Wait for success message

**This creates**:
- 7 database tables
- Row Level Security policies
- Sample data for testing

---

### Step 3: Start a Local Server

Open terminal in your project folder and run:

```bash
# Option 1: Python 3
python -m http.server 8000

# Option 2: Python 2
python -m SimpleHTTPServer 8000

# Option 3: Node.js (if you have http-server installed)
npx http-server -p 8000

# Option 4: PHP
php -S localhost:8000
```

Then open your browser to: `http://localhost:8000`

---

## 🧪 Testing Scenarios

### Test 1: User Registration (Signup)

**Steps**:
1. Open: `http://localhost:8000/portal/signup.html`
2. Fill the form:
   - Full Name: John Doe
   - Email: john.doe@example.com
   - Password: TestPassword123
   - Confirm Password: TestPassword123
3. Click "Sign Up"
4. Check your email for verification link
5. Click verification link

**Expected Results**:
- ✅ Success notification appears
- ✅ Redirects to login page
- ✅ Verification email received
- ✅ New user appears in Supabase users table

**Check in Supabase**:
- Go to "Authentication" → "Users" → See new user
- Go to "Table Editor" → "users" → See user profile

---

### Test 2: User Login

**Steps**:
1. Open: `http://localhost:8000/portal/login.html`
2. Fill the form:
   - Email: john.doe@example.com
   - Password: TestPassword123
   - Role: Client
3. Click "Login"

**Expected Results**:
- ✅ Success notification appears
- ✅ Redirects to dashboard
- ✅ Session stored in browser
- ✅ User details shown in dashboard

**Verify**:
- Check browser console (F12) → Application → Local Storage → Should see Supabase session
- Dashboard should show user's full name

---

### Test 3: Browse Tours (Database Loading)

**Steps**:
1. Open: `http://localhost:8000/tours.html`
2. Wait for page to load
3. Check browser console (F12)

**Expected Results**:
- ✅ Tours load from database (not hardcoded data)
- ✅ Tour cards display with images, difficulty badges, prices in KSh
- ✅ Console shows: "Loaded X tours from database"
- ✅ Filters work (duration, difficulty, price)

**Verify Database**:
- Go to Supabase → "Table Editor" → "tours"
- Tours on webpage should match database entries

**Test Filters**:
- Select "2 hours" duration → Only 2-hour tours show
- Select "Beginner" difficulty → Only beginner tours show
- Select "0-50" price → Only tours under KSh 50 show
- Click "Clear Filters" → All tours show again

---

### Test 4: Book a Tour (Full Workflow)

**Steps**:
1. Open: `http://localhost:8000/tours.html`
2. Click "Book Now" on any tour
3. If not logged in → Redirects to login
4. After login → Booking modal appears
5. Fill the form:
   - Date: Tomorrow's date
   - Time: 10:00 AM
   - Participants: 4
   - Special Requests: "Vegetarian lunch please"
6. Check the calculated total price
7. Click "Confirm Booking"

**Expected Results**:
- ✅ Authentication check works
- ✅ Modal appears with form
- ✅ Date picker only allows future dates
- ✅ Price calculates: Tour price × Participants
- ✅ Success notification appears
- ✅ Redirects to dashboard
- ✅ Booking appears in "My Bookings" section

**Verify in Database**:
- Go to Supabase → "Table Editor" → "tour_bookings"
- Should see new booking record with:
  - user_id (your user ID)
  - tour_id (selected tour ID)
  - booking_date (selected date)
  - participants (4)
  - total_price (calculated amount)
  - status ("pending")

---

### Test 5: Browse Equipment (Database Loading)

**Steps**:
1. Open: `http://localhost:8000/rentals.html`
2. Wait for page to load
3. Check browser console (F12)

**Expected Results**:
- ✅ Equipment loads from database
- ✅ Only available equipment shows
- ✅ Equipment cards display with hourly and daily rates in KSh
- ✅ Console shows: "Loaded X equipment items"
- ✅ Filters work (type, price)

**Test Filters**:
- Select "Kayak" type → Only kayaks show
- Select "0-25" price → Only items under KSh 25/hour show
- Click "Clear Filters" → All equipment shows

---

### Test 6: Rent Equipment (Full Workflow)

**Steps**:
1. Open: `http://localhost:8000/rentals.html`
2. Click "Rent Now" on any equipment
3. If not logged in → Redirects to login
4. After login → Rental modal appears
5. Fill the form:
   - Start Date & Time: Today at 2:00 PM
   - End Date & Time: Today at 6:00 PM
   - Duration Type: Hourly
   - Units: 1
   - Special Requests: "First time kayaking"
6. Check the calculated cost
7. Click "Confirm Rental"

**Expected Results**:
- ✅ Authentication check works
- ✅ Modal appears with form
- ✅ Duration calculation works (4 hours)
- ✅ Cost calculates: Hourly rate × Hours × Units
- ✅ Success notification appears
- ✅ Redirects to dashboard
- ✅ Rental appears in "My Rentals" section

**Verify in Database**:
- Go to Supabase → "Table Editor" → "equipment_rentals"
- Should see new rental record with:
  - user_id (your user ID)
  - equipment_id (selected equipment ID)
  - start_date (2:00 PM)
  - end_date (6:00 PM)
  - duration_hours (4)
  - total_price (calculated amount)
  - status ("pending")

---

### Test 7: Submit Contact Form

**Steps**:
1. Open: `http://localhost:8000/contact.html`
2. Fill the form:
   - Name: Jane Smith
   - Email: jane.smith@example.com
   - Message: "Do you offer group discounts for 10+ people?"
3. Click "Send Message"

**Expected Results**:
- ✅ Button shows "Sending..." while processing
- ✅ Success notification appears
- ✅ Form clears after submission
- ✅ Button resets to "Send Message"

**Verify in Database**:
- Go to Supabase → "Table Editor" → "inquiries"
- Should see new inquiry with:
  - name ("Jane Smith")
  - email ("jane.smith@example.com")
  - message (your message text)
  - status ("pending")
  - created_at (current timestamp)

---

### Test 8: View Dashboard

**Steps**:
1. Login as a user who has bookings and rentals
2. Open: `http://localhost:8000/portal/dashboard.html`

**Expected Results**:
- ✅ User's full name displayed
- ✅ Statistics shown:
  - Total Bookings (count of tour_bookings)
  - Total Rentals (count of equipment_rentals)
  - Upcoming Activities (future bookings/rentals)
- ✅ "My Bookings" section shows all tour bookings
- ✅ "My Rentals" section shows all equipment rentals
- ✅ Each booking/rental card shows:
  - Item name
  - Date/time
  - Status badge (pending/confirmed/cancelled)
  - Total price
  - Cancel button
- ✅ Profile section shows user info

**Test Cancel Booking**:
1. Click "Cancel" on any booking
2. Confirm cancellation
3. Booking status updates to "cancelled"
4. Card updates to show cancelled status

**Verify in Database**:
- Go to Supabase → "Table Editor" → "tour_bookings"
- Cancelled booking should have status = "cancelled"

---

### Test 9: Homepage Features

**Steps**:
1. Open: `http://localhost:8000/index.html`

**Expected Results**:
- ✅ Featured tours section shows 3 tours from database
- ✅ Featured equipment section shows 4 items from database
- ✅ Login button shows "Login" for guests
- ✅ Login button shows "Dashboard" for logged-in users
- ✅ Clicking login button opens modal
- ✅ Modal login form works with Supabase

**Test Login Modal**:
1. Click "Login" button
2. Modal appears
3. Fill credentials
4. Submit
5. Successful login redirects to dashboard

---

### Test 10: Authentication Flow

**Test Scenario**: User not logged in tries to book

**Steps**:
1. Open tours.html in incognito/private window
2. Click "Book Now" on any tour
3. Observe redirect to login
4. Login with valid credentials
5. Should redirect back to tours page
6. Click "Book Now" again
7. Modal should appear (now authenticated)

**Expected Results**:
- ✅ Unauthenticated user redirected to login
- ✅ After login, can access booking functionality
- ✅ Session persists across page refreshes

---

## 🐛 Common Issues & Solutions

### Issue 1: "Supabase is not defined"

**Cause**: Supabase CDN script not loading
**Solution**: 
- Check internet connection
- Verify CDN script tag is present: `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`
- Check browser console for 404 errors

---

### Issue 2: Tours/Equipment Not Loading

**Cause**: No data in database or wrong credentials
**Solution**:
1. Check Supabase credentials in `js/supabase-config.js`
2. Verify tables exist in Supabase (Table Editor)
3. Run `supabase-schema.sql` to create sample data
4. Check browser console for error messages

---

### Issue 3: "Session expired" or "Not authenticated"

**Cause**: Session cleared or expired
**Solution**:
1. Clear browser cache and local storage
2. Logout and login again
3. Check Supabase → Authentication → Users → Session valid

---

### Issue 4: Booking Fails with Error

**Cause**: Database permissions or missing fields
**Solution**:
1. Check browser console for exact error
2. Verify RLS policies are enabled in Supabase
3. Check user is authenticated (session exists)
4. Verify all required fields are filled

---

### Issue 5: Email Verification Not Received

**Cause**: Supabase email settings
**Solution**:
1. Check spam folder
2. In Supabase → Authentication → Email Templates → Verify template
3. For development, disable email verification:
   - Supabase → Authentication → Settings → Disable "Email Confirmations"
   - (Re-enable for production)

---

### Issue 6: Price Shows $0 or Incorrect

**Cause**: Currency formatting or calculation error
**Solution**:
- Check tour/equipment has valid price in database
- Verify `formatCurrency()` function in `supabase-config.js`
- Check calculation logic in booking/rental modal

---

## ✅ Success Criteria

After testing, you should verify:

### Database Verification
- [ ] Users table has test user
- [ ] Tours table has sample tours
- [ ] Equipment table has sample equipment
- [ ] tour_bookings table has your test booking
- [ ] equipment_rentals table has your test rental
- [ ] inquiries table has your test inquiry

### Functionality Verification
- [ ] User can signup and receive verification email
- [ ] User can login with correct credentials
- [ ] Tours load from database on tours page
- [ ] Equipment loads from database on rentals page
- [ ] Filters work on tours and rentals pages
- [ ] Booking button checks authentication
- [ ] Booking modal appears and submits to database
- [ ] Rental modal appears and submits to database
- [ ] Contact form submits to database
- [ ] Dashboard shows user's bookings and rentals
- [ ] Cancel booking/rental works
- [ ] Logout clears session

### UI/UX Verification
- [ ] Currency shows as KSh throughout
- [ ] Success notifications appear
- [ ] Error notifications appear for failures
- [ ] Loading states show on buttons
- [ ] Forms reset after submission
- [ ] Modal closes properly
- [ ] Responsive design works on mobile

---

## 🎯 Advanced Testing

### Test Security (Row Level Security)

**Scenario**: User A should not see User B's bookings

**Steps**:
1. Create User A, login, book a tour
2. Logout
3. Create User B, login
4. Open dashboard
5. Should only see User B's bookings (not User A's)

**Expected**: ✅ Users can only access their own data

---

### Test Concurrent Bookings

**Scenario**: Same equipment rented by multiple users

**Steps**:
1. User A rents Kayak #1 for 2-4 PM
2. User B tries to rent Kayak #1 for 3-5 PM (overlapping)
3. Currently: Both bookings succeed (no conflict checking)
4. Future enhancement: Add availability checking

---

### Test Data Validation

**Scenario**: Invalid data submission

**Steps**:
1. Try booking with past date → Should show error
2. Try booking with 0 participants → Should show error
3. Try renting with end date before start date → Should show error
4. Try contact form with invalid email → Should show error

**Expected**: ✅ Form validation prevents invalid submissions

---

## 📊 Test Results Template

Use this template to track your testing:

```
=== SUPABASE INTEGRATION TEST RESULTS ===

Date: _______________
Tester: _____________

[ ] Test 1: User Registration - PASSED / FAILED
    Notes: _________________________________

[ ] Test 2: User Login - PASSED / FAILED
    Notes: _________________________________

[ ] Test 3: Browse Tours - PASSED / FAILED
    Notes: _________________________________

[ ] Test 4: Book a Tour - PASSED / FAILED
    Notes: _________________________________

[ ] Test 5: Browse Equipment - PASSED / FAILED
    Notes: _________________________________

[ ] Test 6: Rent Equipment - PASSED / FAILED
    Notes: _________________________________

[ ] Test 7: Contact Form - PASSED / FAILED
    Notes: _________________________________

[ ] Test 8: View Dashboard - PASSED / FAILED
    Notes: _________________________________

[ ] Test 9: Homepage Features - PASSED / FAILED
    Notes: _________________________________

[ ] Test 10: Authentication Flow - PASSED / FAILED
    Notes: _________________________________

Overall Status: READY FOR PRODUCTION / NEEDS FIXES

Issues Found:
1. _________________________________
2. _________________________________
3. _________________________________
```

---

## 🎊 When Everything Works

You should be able to:
1. ✅ Create an account
2. ✅ Login with your credentials
3. ✅ Browse tours loaded from database
4. ✅ Filter tours by various criteria
5. ✅ Book a tour (with authentication)
6. ✅ See booking in your dashboard
7. ✅ Browse equipment loaded from database
8. ✅ Filter equipment by type and price
9. ✅ Rent equipment (with authentication)
10. ✅ See rental in your dashboard
11. ✅ Submit contact inquiry
12. ✅ Cancel bookings/rentals
13. ✅ Update your profile
14. ✅ Logout

**If all tests pass → Your booking platform is fully functional! 🚀**

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console (F12) for error messages
2. Check Supabase logs (Dashboard → Logs)
3. Verify database tables have data
4. Verify credentials are correct
5. Review the code in integrated files
6. Check this testing guide for solutions

**Remember**: The system is only as good as the data in your database. Make sure to populate tours and equipment tables with real data for production use!
