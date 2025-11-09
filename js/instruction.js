// Instruction Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize lessons display
    initLessons();
    
    // Initialize booking system
    initBookingSystem();
});

// Sample lesson data (in a real application, this would come from the database)
const lessons = [
    {
        id: 'kayak-basic',
        name: 'Kayaking Basics',
        description: 'Learn fundamental kayaking skills and safety procedures',
        image: 'assets/kayak-lesson.jpg',
        duration: '2 hours',
        price: 79.99,
        maxParticipants: 4,
        requirements: ['Basic swimming ability', 'Minimum age: 12'],
        includes: ['Equipment rental', 'Safety gear', 'Basic instruction manual']
    },
    {
        id: 'sup-intro',
        name: 'Stand-Up Paddleboarding Intro',
        description: 'Master the basics of SUP in a friendly, supportive environment',
        image: 'assets/sup-lesson.jpg',
        duration: '1.5 hours',
        price: 69.99,
        maxParticipants: 4,
        requirements: ['Basic swimming ability', 'Minimum age: 10'],
        includes: ['Paddleboard rental', 'Safety gear', 'Basic instruction manual']
    },
    {
        id: 'kayak-advanced',
        name: 'Advanced Kayaking Skills',
        description: 'Advanced techniques for experienced kayakers',
        image: 'assets/kayak-advanced.jpg',
        duration: '3 hours',
        price: 99.99,
        maxParticipants: 3,
        requirements: ['Intermediate kayaking experience', 'Strong swimming ability', 'Minimum age: 16'],
        includes: ['Equipment rental', 'Safety gear', 'Advanced technique guide']
    }
];

// Initialize lessons display
function initLessons() {
    const lessonsGrid = document.querySelector('.lessons-grid');
    
    if (lessonsGrid) {
        lessons.forEach(lesson => {
            const lessonCard = createLessonCard(lesson);
            lessonsGrid.appendChild(lessonCard);
        });
    }
}

// Create a lesson card
function createLessonCard(lesson) {
    const card = document.createElement('div');
    card.className = 'lesson-card';
    
    const image = document.createElement('img');
    image.src = lesson.image;
    image.alt = lesson.name;
    
    const content = document.createElement('div');
    content.className = 'lesson-content';
    content.innerHTML = `
        <h3>${lesson.name}</h3>
        <p>${lesson.description}</p>
        <div class="lesson-details">
            <p><strong>Duration:</strong> ${lesson.duration}</p>
            <p><strong>Price:</strong> ${UI.formatCurrency(lesson.price)} per person</p>
            <p><strong>Group Size:</strong> Up to ${lesson.maxParticipants} participants</p>
        </div>
        <ul class="requirements">
            ${lesson.requirements.map(req => `<li>${req}</li>`).join('')}
        </ul>
        <button class="cta-button primary book-lesson-btn" data-lesson-id="${lesson.id}">
            Book Lesson
        </button>
    `;
    
    card.appendChild(image);
    card.appendChild(content);
    
    // Add booking button event listener
    const bookButton = content.querySelector('.book-lesson-btn');
    bookButton.addEventListener('click', () => openBookingModal(lesson));
    
    return card;
}

// Initialize booking system
function initBookingSystem() {
    const modal = document.getElementById('booking-modal');
    const closeBtn = modal.querySelector('.close-modal');
    const lessonForm = document.getElementById('lesson-form');
    
    // Close modal when clicking the close button or outside the modal
    closeBtn.addEventListener('click', () => closeBookingModal());
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeBookingModal();
    });
    
    // Handle form submission
    lessonForm.addEventListener('submit', handleLessonBooking);
    
    // Update booking summary when inputs change
    const inputs = lessonForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('change', updateLessonSummary);
    });
    
    // Populate available times
    populateAvailableTimes();
}

// Open booking modal
function openBookingModal(lesson) {
    const modal = document.getElementById('booking-modal');
    const form = document.getElementById('lesson-form');
    
    // Store lesson ID in form
    form.dataset.lessonId = lesson.id;
    
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('lesson-date').min = tomorrow.toISOString().split('T')[0];
    
    // Set maximum group size
    document.getElementById('group-size').max = lesson.maxParticipants;
    
    // Update lesson summary
    updateLessonSummary();
    
    // Show modal
    modal.style.display = 'block';
}

// Close booking modal
function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    modal.style.display = 'none';
    
    // Reset form
    document.getElementById('lesson-form').reset();
}

// Populate available times
function populateAvailableTimes() {
    const timeSelect = document.getElementById('lesson-time');
    const startTime = 9; // 9 AM
    const endTime = 16; // 4 PM (to allow for last lesson)
    
    timeSelect.innerHTML = '';
    
    for (let hour = startTime; hour <= endTime; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        const option = document.createElement('option');
        option.value = time;
        option.textContent = UI.formatTime(`${time}:00`);
        timeSelect.appendChild(option);
    }
}

// Update lesson summary
function updateLessonSummary() {
    const form = document.getElementById('lesson-form');
    const lessonId = form.dataset.lessonId;
    const lesson = lessons.find(l => l.id === lessonId);
    
    if (!lesson) return;
    
    const groupSize = parseInt(document.getElementById('group-size').value) || 1;
    const date = document.getElementById('lesson-date').value;
    const time = document.getElementById('lesson-time').value;
    const skillLevel = document.getElementById('skill-level').value;
    
    const summary = document.getElementById('lesson-details');
    summary.innerHTML = `
        <p><strong>Lesson:</strong> ${lesson.name}</p>
        <p><strong>Date:</strong> ${date ? UI.formatDate(date) : 'Not selected'}</p>
        <p><strong>Time:</strong> ${time ? UI.formatTime(time + ':00') : 'Not selected'}</p>
        <p><strong>Skill Level:</strong> ${skillLevel ? skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1) : 'Not selected'}</p>
        <p><strong>Group Size:</strong> ${groupSize}</p>
        <p><strong>Duration:</strong> ${lesson.duration}</p>
    `;
    
    // Update total price
    const totalPrice = lesson.price * groupSize;
    document.getElementById('total-price').textContent = UI.formatCurrency(totalPrice);
}

// Handle lesson booking submission
async function handleLessonBooking(e) {
    e.preventDefault();
    
    const form = e.target;
    const lessonId = form.dataset.lessonId;
    const lesson = lessons.find(l => l.id === lessonId);
    
    if (!lesson) return;
    
    // Get form data
    const formData = {
        lessonId: lessonId,
        date: document.getElementById('lesson-date').value,
        time: document.getElementById('lesson-time').value,
        skillLevel: document.getElementById('skill-level').value,
        groupSize: document.getElementById('group-size').value,
        customerName: document.getElementById('customer-name').value,
        customerEmail: document.getElementById('customer-email').value,
        customerPhone: document.getElementById('customer-phone').value,
        specialRequests: document.getElementById('special-requests').value,
        source: document.getElementById('hear-about').value
    };
    
    // Validate form data
    const validation = UI.validateForm(new FormData(form), {
        'lesson-date': { required: true },
        'lesson-time': { required: true },
        'skill-level': { required: true },
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
            'instruction',
            formData.date,
            formData.time,
            {
                lessonId: lessonId,
                skillLevel: formData.skillLevel,
                groupSize: parseInt(formData.groupSize),
                specialRequests: formData.specialRequests
            }
        );
        
        // Show success message and close modal
        UI.showSuccess(form, 'Lesson booked successfully! Check your email for confirmation.');
        setTimeout(() => {
            closeBookingModal();
        }, 2000);
        
    } catch (error) {
        UI.showError(form, 'An error occurred while booking your lesson. Please try again.');
        console.error('Lesson booking error:', error);
    }
}