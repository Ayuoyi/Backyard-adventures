# 📚 SUPABASE QUERIES QUICK REFERENCE
## Backyard Adventures - Copy & Paste Examples

---

## 🔐 AUTHENTICATION

### Check if User is Logged In
```javascript
const user = await supabaseHelpers.getCurrentUser();
if (user) {
    console.log('Logged in as:', user.email);
} else {
    console.log('Not logged in');
}
```

### Get User Profile
```javascript
const userId = (await supabaseHelpers.getCurrentUser()).id;
const result = await supabaseAuth.getUserProfile(userId);
if (result.success) {
    console.log('User profile:', result.profile);
}
```

### Logout
```javascript
await supabaseAuth.signOut();
window.location.href = '/portal/login.html';
```

---

## 🚤 TOURS

### Display All Tours
```javascript
async function displayTours() {
    const result = await supabaseQueries.getAllTours();
    
    if (result.success) {
        const container = document.getElementById('tours-container');
        container.innerHTML = result.data.map(tour => `
            <div class="tour-card">
                <img src="${tour.image_url}" alt="${tour.name}">
                <h3>${tour.name}</h3>
                <p>${tour.description}</p>
                <div class="tour-info">
                    <span><i class="fas fa-clock"></i> ${tour.duration}</span>
                    <span><i class="fas fa-users"></i> Max ${tour.max_participants}</span>
                    <span><i class="fas fa-signal"></i> ${tour.difficulty}</span>
                </div>
                <p class="price">$${tour.price}</p>
                <button onclick="bookTour('${tour.id}')">Book Now</button>
            </div>
        `).join('');
    }
}
```

### Filter Tours
```javascript
async function filterTours() {
    const duration = document.getElementById('durationFilter').value;
    const difficulty = document.getElementById('difficultyFilter').value;
    
    const result = await supabaseQueries.filterTours({
        duration: duration === 'all' ? null : duration,
        difficulty: difficulty === 'all' ? null : difficulty
    });
    
    if (result.success) {
        displayTours(result.data);
    }
}
```

### Book a Tour
```javascript
async function bookTour(tourId) {
    // Check login
    const user = await supabaseHelpers.getCurrentUser();
    if (!user) {
        supabaseHelpers.showNotification('Please login to book', 'error');
        window.location.href = '/portal/login.html';
        return;
    }
    
    // Get form data
    const date = document.getElementById('tourDate').value;
    const participants = parseInt(document.getElementById('participants').value);
    
    // Get tour details for price
    const tourResult = await supabaseQueries.getTourById(tourId);
    if (!tourResult.success) return;
    
    const totalPrice = tourResult.data.price * participants;
    
    // Create booking
    const result = await supabaseQueries.createTourBooking({
        tourId: tourId,
        date: date,
        participants: participants,
        totalPrice: totalPrice
    });
    
    if (result.success) {
        supabaseHelpers.showNotification('Booking successful!', 'success');
        setTimeout(() => {
            window.location.href = '/portal/dashboard.html';
        }, 1500);
    } else {
        supabaseHelpers.showNotification('Booking failed: ' + result.error, 'error');
    }
}
```

---

## 🏄 EQUIPMENT

### Display Available Equipment
```javascript
async function displayEquipment() {
    const result = await supabaseQueries.getAvailableEquipment();
    
    if (result.success) {
        const container = document.getElementById('equipment-grid');
        container.innerHTML = result.data.map(item => `
            <div class="equipment-card">
                <div class="equipment-image">
                    <img src="${item.image_url}" alt="${item.name}">
                    ${item.badge ? `<span class="badge ${item.badge}">${item.badge}</span>` : ''}
                </div>
                <div class="equipment-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="pricing">
                        <span>$${item.hourly_rate}/hour</span>
                        <span>$${item.daily_rate}/day</span>
                    </div>
                    <button onclick="rentEquipment('${item.id}')">Rent Now</button>
                </div>
            </div>
        `).join('');
    }
}
```

### Filter Equipment by Type
```javascript
async function filterEquipment() {
    const type = document.getElementById('typeFilter').value;
    
    const result = await supabaseQueries.filterEquipment({
        type: type === 'all' ? null : type,
        availability: 'available'
    });
    
    if (result.success) {
        displayEquipmentList(result.data);
    }
}
```

### Rent Equipment
```javascript
async function rentEquipment(equipmentId) {
    // Check login
    const user = await supabaseHelpers.getCurrentUser();
    if (!user) {
        window.location.href = '/portal/login.html';
        return;
    }
    
    // Get rental details
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const hours = document.getElementById('duration').value;
    
    // Calculate price
    const equipmentResult = await supabaseQueries.getAllEquipment();
    const equipment = equipmentResult.data.find(e => e.id === equipmentId);
    const totalPrice = equipment.hourly_rate * hours;
    
    // Create rental
    const result = await supabaseQueries.createEquipmentRental({
        equipmentId: equipmentId,
        startDate: startDate,
        endDate: endDate,
        durationHours: parseInt(hours),
        totalPrice: totalPrice
    });
    
    if (result.success) {
        supabaseHelpers.showNotification('Rental successful!', 'success');
        window.location.href = '/portal/dashboard.html';
    } else {
        supabaseHelpers.showNotification('Rental failed: ' + result.error, 'error');
    }
}
```

---

## 📧 CONTACT FORM

### Submit Contact Form
```javascript
document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
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
    
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
});
```

---

## 📊 USER DASHBOARD

### Load User's Bookings
```javascript
async function loadMyBookings() {
    const user = await supabaseHelpers.getCurrentUser();
    const result = await supabaseQueries.getUserBookings(user.id);
    
    if (result.success && result.data.length > 0) {
        const container = document.getElementById('bookings-list');
        container.innerHTML = result.data.map(booking => `
            <div class="booking-card">
                <h3>${booking.tours.name}</h3>
                <p><strong>Date:</strong> ${supabaseHelpers.formatDate(booking.date)}</p>
                <p><strong>Participants:</strong> ${booking.participants}</p>
                <p><strong>Total:</strong> ${supabaseHelpers.formatCurrency(booking.total_price)}</p>
                <span class="status ${booking.status}">${booking.status}</span>
                ${booking.status === 'pending' || booking.status === 'confirmed' ? 
                    `<button onclick="cancelBooking('${booking.id}')">Cancel</button>` : ''}
            </div>
        `).join('');
    } else {
        document.getElementById('bookings-list').innerHTML = 
            '<p>No bookings yet. <a href="/tours.html">Book a tour!</a></p>';
    }
}
```

### Load User's Rentals
```javascript
async function loadMyRentals() {
    const user = await supabaseHelpers.getCurrentUser();
    const result = await supabaseQueries.getUserRentals(user.id);
    
    if (result.success && result.data.length > 0) {
        const container = document.getElementById('rentals-list');
        container.innerHTML = result.data.map(rental => `
            <div class="rental-card">
                <h3>${rental.equipment.name}</h3>
                <p><strong>Duration:</strong> ${rental.duration_hours} hours</p>
                <p><strong>Dates:</strong> ${supabaseHelpers.formatDate(rental.start_date)} - ${supabaseHelpers.formatDate(rental.end_date)}</p>
                <p><strong>Total:</strong> ${supabaseHelpers.formatCurrency(rental.total_price)}</p>
                <span class="status ${rental.status}">${rental.status}</span>
                ${rental.status !== 'completed' && rental.status !== 'cancelled' ? 
                    `<button onclick="cancelRental('${rental.id}', '${rental.equipment_id}')">Cancel</button>` : ''}
            </div>
        `).join('');
    } else {
        document.getElementById('rentals-list').innerHTML = 
            '<p>No rentals yet. <a href="/rentals.html">Rent equipment!</a></p>';
    }
}
```

### Cancel Booking
```javascript
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    const result = await supabaseQueries.cancelBooking(bookingId);
    
    if (result.success) {
        supabaseHelpers.showNotification('Booking cancelled', 'success');
        loadMyBookings(); // Reload list
    } else {
        supabaseHelpers.showNotification('Failed to cancel', 'error');
    }
}
```

### Cancel Rental
```javascript
async function cancelRental(rentalId, equipmentId) {
    if (!confirm('Are you sure you want to cancel this rental?')) return;
    
    const result = await supabaseQueries.cancelRental(rentalId, equipmentId);
    
    if (result.success) {
        supabaseHelpers.showNotification('Rental cancelled', 'success');
        loadMyRentals(); // Reload list
    } else {
        supabaseHelpers.showNotification('Failed to cancel', 'error');
    }
}
```

---

## 🔍 SEARCH & FILTER PATTERNS

### Search Tours by Name
```javascript
async function searchTours(searchTerm) {
    const result = await supabaseQueries.getAllTours();
    
    if (result.success) {
        const filtered = result.data.filter(tour => 
            tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tour.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        displayTours(filtered);
    }
}

// Usage
document.getElementById('searchInput').addEventListener('input', (e) => {
    searchTours(e.target.value);
});
```

### Multi-Filter Equipment
```javascript
async function applyFilters() {
    const type = document.getElementById('typeFilter').value;
    const maxPrice = document.getElementById('priceFilter').value;
    const availability = document.getElementById('availabilityFilter').value;
    
    const result = await supabaseQueries.filterEquipment({
        type: type === 'all' ? null : type,
        maxPrice: maxPrice || null,
        availability: availability === 'all' ? null : availability
    });
    
    if (result.success) {
        displayEquipment(result.data);
    }
}

// Attach to all filter inputs
document.querySelectorAll('.filter-input').forEach(input => {
    input.addEventListener('change', applyFilters);
});
```

---

## 🎨 UI HELPERS

### Show Loading State
```javascript
function showLoading(containerId) {
    document.getElementById(containerId).innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading...</p>
        </div>
    `;
}

// Usage
showLoading('tours-container');
const result = await supabaseQueries.getAllTours();
// Display results...
```

### Show Empty State
```javascript
function showEmptyState(containerId, message, actionText, actionLink) {
    document.getElementById(containerId).innerHTML = `
        <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>${message}</p>
            <a href="${actionLink}" class="btn">${actionText}</a>
        </div>
    `;
}

// Usage
showEmptyState(
    'bookings-list',
    'No bookings yet',
    'Book a Tour',
    '/tours.html'
);
```

### Format Display Date
```javascript
function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
```

---

## 🚨 ERROR HANDLING

### Standard Error Handler
```javascript
async function safeQuery(queryFunction, errorMessage = 'An error occurred') {
    try {
        const result = await queryFunction();
        
        if (result.success) {
            return result.data;
        } else {
            supabaseHelpers.showNotification(result.error || errorMessage, 'error');
            return null;
        }
    } catch (error) {
        console.error('Query error:', error);
        supabaseHelpers.showNotification(errorMessage, 'error');
        return null;
    }
}

// Usage
const tours = await safeQuery(
    () => supabaseQueries.getAllTours(),
    'Failed to load tours'
);
```

---

## 🔔 NOTIFICATIONS

### Success Notification
```javascript
supabaseHelpers.showNotification('Operation successful!', 'success');
```

### Error Notification
```javascript
supabaseHelpers.showNotification('Something went wrong', 'error');
```

### Info Notification
```javascript
supabaseHelpers.showNotification('Please check your email', 'info');
```

---

## 📱 RESPONSIVE PATTERNS

### Mobile Detection
```javascript
const isMobile = window.innerWidth <= 768;

if (isMobile) {
    // Mobile-specific code
    displayMobileView();
} else {
    // Desktop-specific code
    displayDesktopView();
}
```

### Infinite Scroll (Load More)
```javascript
let offset = 0;
const limit = 10;

async function loadMoreTours() {
    const result = await supabaseClient
        .from('tours')
        .select('*')
        .range(offset, offset + limit - 1);
    
    if (result.data.length > 0) {
        appendTours(result.data);
        offset += limit;
    } else {
        document.getElementById('loadMore').style.display = 'none';
    }
}
```

---

## 🎯 COMPLETE PAGE EXAMPLES

### Tours Page Integration
```html
<!-- Add to tours.html before closing </body> -->
<script src="js/supabase-config.js"></script>
<script src="js/supabase-auth.js"></script>
<script src="js/supabase-queries.js"></script>
<script>
    async function initToursPage() {
        const result = await supabaseQueries.getAllTours();
        if (result.success) {
            displayTours(result.data);
        }
    }
    
    initToursPage();
</script>
```

### Rentals Page Integration
```html
<!-- Add to rentals.html before closing </body> -->
<script src="js/supabase-config.js"></script>
<script src="js/supabase-auth.js"></script>
<script src="js/supabase-queries.js"></script>
<script>
    async function initRentalsPage() {
        const result = await supabaseQueries.getAvailableEquipment();
        if (result.success) {
            displayEquipment(result.data);
        }
    }
    
    initRentalsPage();
</script>
```

---

## 🎉 YOU'RE ALL SET!

Copy these examples and adapt them to your needs. All functions are ready to use!

**Pro Tips:**
- Always check `result.success` before using data
- Use `try/catch` for extra safety
- Show loading states for better UX
- Handle empty states gracefully
- Test error scenarios

Happy coding! 🏖️
