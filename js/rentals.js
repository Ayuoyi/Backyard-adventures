// Rentals Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize equipment display
    initEquipment();
    
    // Initialize rental system
    initRentalSystem();
    
    // Initialize filters
    initFilters();
    
    // Initialize weather widget
    initWeatherWidget();
});

// Initialize equipment display
function initEquipment() {
    const rentals = BA.storage.load(BA.STORAGE_KEYS.RENTALS) || [];
    const equipmentGrid = document.querySelector('.equipment-grid');
    
    if (equipmentGrid && rentals.length > 0) {
        rentals.forEach(rental => {
            const equipmentCard = createDetailedEquipmentCard(rental);
            equipmentGrid.appendChild(equipmentCard);
        });
    }
}

// Create a detailed equipment card
function createDetailedEquipmentCard(rental) {
    const card = document.createElement('div');
    card.className = 'equipment-card';
    
    const image = document.createElement('img');
    image.src = rental.imageUrl || 'assets/equipment-placeholder.jpg';
    image.alt = rental.type;
    
    const content = document.createElement('div');
    content.className = 'equipment-card-content';
    
    // Get availability status
    const availability = getEquipmentAvailability(rental);
    
    content.innerHTML = `
        <h3>${rental.type}</h3>
        <div class="rental-rates">
            <span>Hourly: ${UI.formatCurrency(rental.hourlyRate)}</span>
            <span>Daily: ${UI.formatCurrency(rental.dailyRate)}</span>
        </div>
        <div class="equipment-availability ${availability.class}">
            ${availability.text}
        </div>
        <button class="cta-button secondary rent-equipment-btn" 
                data-rental-id="${rental.id}"
                ${availability.class === 'unavailable' ? 'disabled' : ''}>
            Reserve Now
        </button>
    `;
    
    card.appendChild(image);
    card.appendChild(content);
    
    // Add rental button event listener
    const rentButton = content.querySelector('.rent-equipment-btn');
    if (!rentButton.disabled) {
        rentButton.addEventListener('click', () => openRentalModal(rental));
    }
    
    return card;
}

// Get equipment availability status gets the equipments more viable for the guest users 
function getEquipmentAvailability(rental) {
    const reservations = BA.storage.load(BA.STORAGE_KEYS.RESERVATIONS) || [];
    const today = new Date().toISOString().split('T')[0];
    
    const activeReservations = reservations.filter(r => 
        r.type === 'rental' &&
        r.details.rentalId === rental.id &&
        r.date === today &&
        r.status === 'confirmed'
    ).length;
    
    const availableCount = rental.quantityAvailable - activeReservations;
    
    if (availableCount <= 0) {
        return { class: 'unavailable', text: 'Currently Unavailable' };
    } else if (availableCount <= 2) {
        return { class: 'limited', text: 'Limited Availability' };
    } else {
        return { class: 'available', text: 'Available' };
    }
}

// Initialize rental system
function initRentalSystem() {
    const modal = document.getElementById('rental-modal');
    const closeBtn = modal.querySelector('.close-modal');
    const rentalForm = document.getElementById('rental-form');
    
    // Close modal when clicking the close button or outside the modal
    closeBtn.addEventListener('click', () => closeRentalModal());
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeRentalModal();
    });
    
    // Handle form submission
    rentalForm.addEventListener('submit', handleRentalSubmission);
    
    // Update rental summary when inputs change
    const inputs = rentalForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('change', updateRentalSummary);
    });
    
    // Populate pickup times
    populatePickupTimes();
}

// Open rental modal
function openRentalModal(rental) {
    const modal = document.getElementById('rental-modal');
    const form = document.getElementById('rental-form');
    
    // Store rental ID in form
    form.dataset.rentalId = rental.id;
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('rental-date').min = today;
    
    // Set maximum quantity
    const availability = getEquipmentAvailability(rental);
    const maxQuantity = rental.quantityAvailable - 
        (availability.class === 'limited' ? 2 : 0);
    document.getElementById('rental-quantity').max = maxQuantity;
    
    // Update rental summary
    updateRentalSummary();
    
    // Show modal
    modal.style.display = 'block';
}

// Close rental modal
function closeRentalModal() {
    const modal = document.getElementById('rental-modal');
    modal.style.display = 'none';
    
    // Reset form
    document.getElementById('rental-form').reset();
}

// Populate pickup times
function populatePickupTimes() {
    const timeSelect = document.getElementById('pickup-time');
    const openingTime = 8; // 8 AM
    const closingTime = 18; // 6 PM
    
    timeSelect.innerHTML = '';
    
    for (let hour = openingTime; hour < closingTime; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        const option = document.createElement('option');
        option.value = time;
        option.textContent = UI.formatTime(`${time}:00`);
        timeSelect.appendChild(option);
    }
}

// Update rental summary
function updateRentalSummary() {
    const form = document.getElementById('rental-form');
    const rentalId = form.dataset.rentalId;
    const rental = BA.storage.load(BA.STORAGE_KEYS.RENTALS).find(r => r.id === rentalId);
    
    if (!rental) return;
    
    const duration = parseInt(document.getElementById('rental-duration').value) || 1;
    const quantity = parseInt(document.getElementById('rental-quantity').value) || 1;
    const date = document.getElementById('rental-date').value;
    const time = document.getElementById('pickup-time').value;
    
    const summary = document.getElementById('rental-details');
    summary.innerHTML = `
        <p><strong>Equipment:</strong> ${rental.type}</p>
        <p><strong>Date:</strong> ${date ? UI.formatDate(date) : 'Not selected'}</p>
        <p><strong>Pickup Time:</strong> ${time ? UI.formatTime(time + ':00') : 'Not selected'}</p>
        <p><strong>Duration:</strong> ${duration} hour${duration > 1 ? 's' : ''}</p>
        <p><strong>Quantity:</strong> ${quantity}</p>
    `;
    
    // Calculate total price
    const rate = duration >= 8 ? rental.dailyRate : rental.hourlyRate;
    const totalPrice = rate * quantity * (duration >= 8 ? 1 : duration);
    document.getElementById('total-price').textContent = UI.formatCurrency(totalPrice);
}

// Handle rental form submission
async function handleRentalSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const rentalId = form.dataset.rentalId;
    
    // Get form data
    const formData = {
        rentalId: rentalId,
        date: document.getElementById('rental-date').value,
        duration: document.getElementById('rental-duration').value,
        quantity: document.getElementById('rental-quantity').value,
        pickupTime: document.getElementById('pickup-time').value,
        customerName: document.getElementById('customer-name').value,
        customerEmail: document.getElementById('customer-email').value,
        customerPhone: document.getElementById('customer-phone').value,
        specialRequests: document.getElementById('special-requests').value,
        source: document.getElementById('hear-about').value
    };
    
    // Validate form data
    const validation = UI.validateForm(new FormData(form), {
        'rental-date': { required: true },
        'rental-duration': { required: true },
        'rental-quantity': { required: true },
        'pickup-time': { required: true },
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
        'rental',
        rentalId
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
            'rental',
            formData.date,
            formData.pickupTime,
            {
                rentalId: rentalId,
                duration: parseInt(formData.duration),
                quantity: parseInt(formData.quantity),
                specialRequests: formData.specialRequests
            }
        );
        
        // Show success message and close modal
        UI.showSuccess(form, 'Reservation confirmed! Check your email for details.');
        setTimeout(() => {
            closeRentalModal();
            // Refresh equipment display to update availability
            initEquipment();
        }, 2000);
        
    } catch (error) {
        UI.showError(form, 'An error occurred while processing your reservation. Please try again.');
        console.error('Rental reservation error:', error);
    }
}

// Initialize filters
function initFilters() {
    const filters = document.querySelectorAll('.filter-container select');
    
    filters.forEach(filter => {
        filter.addEventListener('change', () => {
            filterEquipment();
        });
    });
}

// Filter equipment based on selected criteria
function filterEquipment() {
    const equipmentType = document.getElementById('equipment-type-filter').value;
    const duration = document.getElementById('duration-filter').value;
    const priceRange = document.getElementById('price-filter').value;
    
    const rentals = BA.storage.load(BA.STORAGE_KEYS.RENTALS) || [];
    const filteredRentals = rentals.filter(rental => {
        // Equipment type filter
        if (equipmentType && !rental.type.toLowerCase().includes(equipmentType)) {
            return false;
        }
        
        // Duration filter (affects price calculation)
        const relevantRate = duration === 'daily' ? rental.dailyRate : rental.hourlyRate;
        
        // Price filter
        if (priceRange) {
            const [min, max] = priceRange.split('-').map(p => p === '+' ? Infinity : Number(p));
            if (relevantRate < min || relevantRate > max) {
                return false;
            }
        }
        
        return true;
    });
    
    // Update display
    const equipmentGrid = document.querySelector('.equipment-grid');
    equipmentGrid.innerHTML = '';
    
    filteredRentals.forEach(rental => {
        const equipmentCard = createDetailedEquipmentCard(rental);
        equipmentGrid.appendChild(equipmentCard);
    });
}

// Initialize weather widget
function initWeatherWidget() {
    const widget = document.getElementById('weather-widget');
    if (widget) {
        // This would typically integrate with a weather API
        widget.innerHTML = `
            <div class="weather-info">
                <h3>Today's Forecast</h3>
                <p>Weather data coming soon...</p>
            </div>
        `;
    }
}