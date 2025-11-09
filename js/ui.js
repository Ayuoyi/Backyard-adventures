// UI Utilities
const UI = {
    // DOM Element Creation
    createElement(tag, className, content) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    },

    // Create Tour Card
    createTourCard(tour) {
        const card = this.createElement('div', 'card tour-card');
        
        const image = this.createElement('img');
        image.src = tour.imageUrl || 'assets/tour-placeholder.jpg';
        image.alt = tour.name;

        const content = this.createElement('div', 'tour-card-content');
        content.innerHTML = `
            <h3>${tour.name}</h3>
            <p>${tour.description}</p>
            <div class="tour-details">
                <span>Duration: ${tour.duration}</span>
                <span>Price: $${tour.price}</span>
            </div>
            <a href="tours.html#${tour.id}" class="cta-button primary">Learn More</a>
        `;

        card.appendChild(image);
        card.appendChild(content);
        return card;
    },

    // Create Equipment Card
    createEquipmentCard(equipment) {
        const card = this.createElement('div', 'card equipment-card');
        
        const image = this.createElement('img');
        image.src = equipment.imageUrl || 'assets/equipment-placeholder.jpg';
        image.alt = equipment.type;

        const content = this.createElement('div', 'equipment-card-content');
        content.innerHTML = `
            <h3>${equipment.type}</h3>
            <div class="rental-rates">
                <span>Hourly: $${equipment.hourlyRate}</span>
                <span>Daily: $${equipment.dailyRate}</span>
            </div>
            <a href="rentals.html#${equipment.id}" class="cta-button secondary">Rent Now</a>
        `;

        card.appendChild(image);
        card.appendChild(content);
        return card;
    },

    // Create Testimonial Card
    createTestimonialCard(testimonial) {
        const card = this.createElement('div', 'testimonial-card');
        card.innerHTML = `
            <p class="testimonial-text">"${testimonial.text}"</p>
            <p class="testimonial-author">- ${testimonial.author}</p>
        `;
        return card;
    },

    // Form Validation
    validateForm(formData, rules) {
        const errors = {};
        
        for (const [field, value] of formData.entries()) {
            if (rules[field]) {
                const fieldRules = rules[field];
                
                if (fieldRules.required && !value) {
                    errors[field] = 'This field is required';
                    continue;
                }

                if (fieldRules.email && !this.isValidEmail(value)) {
                    errors[field] = 'Please enter a valid email address';
                    continue;
                }

                if (fieldRules.phone && !this.isValidPhone(value)) {
                    errors[field] = 'Please enter a valid phone number';
                    continue;
                }

                if (fieldRules.minLength && value.length < fieldRules.minLength) {
                    errors[field] = `Must be at least ${fieldRules.minLength} characters`;
                    continue;
                }
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // Email Validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Phone Validation
    isValidPhone(phone) {
        const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        return phoneRegex.test(phone);
    },

    // Display Error Message
    showError(element, message) {
        const errorDiv = this.createElement('div', 'error-message', message);
        element.parentNode.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    },

    // Display Success Message
    showSuccess(element, message) {
        const successDiv = this.createElement('div', 'success-message', message);
        element.parentNode.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 5000);
    },

    // Mobile Menu Toggle
    initMobileMenu() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');

        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                menuToggle.classList.toggle('active');
            });
        }
    },

    // Format Currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Format Date
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    },

    // Format Time
    formatTime(time) {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }).format(new Date(`1970-01-01T${time}`));
    },

    // Initialize UI Components
    init() {
        this.initMobileMenu();
        
        // Add smooth scrolling to all anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
};

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => UI.init());