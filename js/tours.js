// Tours Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize tours display
    initTours();
    
    // Initialize booking system
    initBookingSystem();
    
    // Initialize filters
    initFilters();
});

// Initialize tours display
function initTours() {
    const tours = BA.storage.load(BA.STORAGE_KEYS.TOURS) || [];
    const toursGrid = document.querySelector('.tours-grid');
    
    if (toursGrid && tours.length > 0) {
        tours.forEach(tour => {
            const tourCard = createDetailedTourCard(tour);
            toursGrid.appendChild(tourCard);
        });
    }
}

// Create a detailed tour card
function createDetailedTourCard(tour) {
    const card = document.createElement('div');
    card.className = 'tour-card';
    
    const image = document.createElement('img');
    image.src = tour.imageUrl || 'assets/tour-placeholder.jpg';
    image.alt = tour.name;
    
    const content = document.createElement('div');
    content.className = 'tour-card-content';
    content.innerHTML = `
        <h3>${tour.name}</h3>
        <p>${tour.description}</p>
        <div class="tour-info">
            <span>
                <i class="icon-time"></i>
                ${tour.duration}
            </span>
            <span>
                <i class="icon-group"></i>
                Max ${tour.capacity} people
            </span>
            <span>
                <i class="icon-price"></i>
                ${UI.formatCurrency(tour.price)}
            </span>
        </div>
        <button class="cta-button primary book-tour-btn" data-tour-id="${tour.id}">
            Book Now
        </button>
    `;
    
    card.appendChild(image);
    card.appendChild(content);
    
    // Add booking button event listener
    const bookButton = content.querySelector('.book-tour-btn');
    bookButton.addEventListener('click', () => openBookingModal(tour));
    
    return card;
}

// Initialize booking system
function initBookingSystem() {
    const modal = document.getElementById('booking-modal');
    const closeBtn = modal.querySelector('.close-modal');
    const bookingForm = document.getElementById('booking-form');
    
    // Close modal when clicking the close button or outside the modal
    closeBtn.addEventListener('click', () => closeBookingModal());
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeBookingModal();
    });
    
    // Handle form submission
    bookingForm.addEventListener('submit', handleBookingSubmission);
    
    // Update booking summary when inputs change
    const inputs = bookingForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('change', updateBookingSummary);
    });
}

// Open booking modal
function openBookingModal(tour) {
    const modal = document.getElementById('booking-modal');
    const form = document.getElementById('booking-form');
    
    // Store tour ID in form
    form.dataset.tourId = tour.id;
    
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('tour-date').min = tomorrow.toISOString().split('T')[0];
    
    // Set maximum group size
    document.getElementById('group-size').max = tour.capacity;
    
    // Update booking summary
    updateBookingSummary();
    
    // Show modal
    modal.style.display = 'block';
}

// Close booking modal
function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    modal.style.display = 'none';
    
    // Reset form
    document.getElementById('booking-form').reset();
}

// Update booking summary
function updateBookingSummary() {
    const form = document.getElementById('booking-form');
    const tourId = form.dataset.tourId;
    const tour = BA.storage.load(BA.STORAGE_KEYS.TOURS).find(t => t.id === tourId);
    
    if (!tour) return;
    
    const groupSize = parseInt(document.getElementById('group-size').value) || 1;
    const date = document.getElementById('tour-date').value;
    const time = document.getElementById('tour-time').value;
    
    const summary = document.getElementById('booking-details');
    summary.innerHTML = `
        <p><strong>Tour:</strong> ${tour.name}</p>
        <p><strong>Date:</strong> ${date ? UI.formatDate(date) : 'Not selected'}</p>
        <p><strong>Time:</strong> ${time ? time : 'Not selected'}</p>
        <p><strong>Group Size:</strong> ${groupSize}</p>
    `;
    
    // Update total price
    const totalPrice = tour.price * groupSize;
    document.getElementById('total-price').textContent = UI.formatCurrency(totalPrice);
}

// Handle booking form submission
async function handleBookingSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const tourId = form.dataset.tourId;
    
    // Get form data
    const formData = {
        tourId: tourId,
        date: document.getElementById('tour-date').value,
        time: document.getElementById('tour-time').value,
        groupSize: document.getElementById('group-size').value,
        customerName: document.getElementById('customer-name').value,
        customerEmail: document.getElementById('customer-email').value,
        customerPhone: document.getElementById('customer-phone').value,
        specialRequests: document.getElementById('special-requests').value,
        source: document.getElementById('hear-about').value
    };
    
    // Validate form data
    const validation = UI.validateForm(new FormData(form), {
        'tour-date': { required: true },
        'tour-time': { required: true },
        'group-size': { required: true },
        'customer-name': { required: true, minLength: 2 },
        'customer-email': { required: true, email: true },
        'customer-phone': { required: true, phone: true },
        'hear-about': { required: true }
    });
    
    if (!validation.isValid) {
        Object.keys(validation.errors).forEach(field => {
            UI.showError(document.getElementById(field), validation.errors[field]);
        });
        return;
    }
    
    // Check availability
    const availability = BA.service.checkAvailability(
        formData.date,
        'tour',
        tourId
    );
    
    if (!availability.available) {
        UI.showError(form, availability.reason);
        return;
    }
    
    try {
        // Create customer if doesn't exist
        let customer = BA.service.createCustomer(
            formData.customerName,
            formData.customerEmail,
            formData.customerPhone,
            formData.source
        );
        
        // Create reservation
        const reservation = BA.service.createReservation(
            customer.id,
            'tour',
            formData.date,
            formData.time,
            {
                tourId: tourId,
                groupSize: parseInt(formData.groupSize),
                specialRequests: formData.specialRequests
            }
        );
        
        // Show success message and close modal
        UI.showSuccess(form, 'Booking confirmed! Check your email for details.');
        setTimeout(() => {
            closeBookingModal();
        }, 2000);
        
    } catch (error) {
        UI.showError(form, 'An error occurred while processing your booking. Please try again.');
        console.error('Booking error:', error);
    }
}

// Initialize filters
function initFilters() {
    const filters = document.querySelectorAll('.filter-container select');
    
    filters.forEach(filter => {
        filter.addEventListener('change', () => {
            filterTours();
        });
    });
}

// Filter tours based on selected criteria
function filterTours() {
    const duration = document.getElementById('duration-filter').value;
    const difficulty = document.getElementById('difficulty-filter').value;
    const priceRange = document.getElementById('price-filter').value;
    
    const tours = BA.storage.load(BA.STORAGE_KEYS.TOURS) || [];
    const filteredTours = tours.filter(tour => {
        // Duration filter
        if (duration && !tour.duration.includes(duration)) {
            return false;
        }
        
        // Difficulty filter
        if (difficulty && tour.difficulty !== difficulty) {
            return false;
        }
        
        // Price filter
        if (priceRange) {
            const [min, max] = priceRange.split('-').map(p => p === '+' ? Infinity : Number(p));
            if (tour.price < min || tour.price > max) {
                return false;
            }
        }
        
        return true;
    });
    
    // Update display
    const toursGrid = document.querySelector('.tours-grid');
    toursGrid.innerHTML = '';
    
    filteredTours.forEach(tour => {
        const tourCard = createDetailedTourCard(tour);
        toursGrid.appendChild(tourCard);
    });
}