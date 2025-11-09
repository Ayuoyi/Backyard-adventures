// Home Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Alternate hero background images every 3 seconds
    const hero = document.querySelector('.hero');
    if (hero) {
        const images = [
            'assets/pic1.jpeg',
            'assets/pic2.jpeg'
        ];
        let current = 0;
        function setHeroBg(idx) {
            hero.style.backgroundImage = `url('${images[idx]}')`;
            hero.style.backgroundSize = 'cover';
            hero.style.backgroundPosition = 'center center';
            hero.style.backgroundRepeat = 'no-repeat';
        }
        setHeroBg(current);
        setInterval(() => {
            current = (current + 1) % images.length;
            setHeroBg(current);
        }, 3000);
    }

    // Initialize featured tours
    initFeaturedTours();
    
    // Initialize equipment preview
    initEquipmentPreview();
    
    // Initialize testimonials
    initTestimonials();
});

// Load and display featured tours
function initFeaturedTours() {
    const tours = BA.storage.load(BA.STORAGE_KEYS.TOURS) || [];
    const tourGrid = document.querySelector('.tour-grid');
    
    if (tourGrid && tours.length > 0) {
        // Display up to 3 featured tours
        tours.slice(0, 3).forEach(tour => {
            const tourCard = UI.createTourCard(tour);
            tourGrid.appendChild(tourCard);
        });
    }
}

// Load and display equipment preview
function initEquipmentPreview() {
    const rentals = BA.storage.load(BA.STORAGE_KEYS.RENTALS) || [];
    const equipmentGrid = document.querySelector('.equipment-grid');
    
    if (equipmentGrid && rentals.length > 0) {
        // Display up to 4 rental items
        rentals.slice(0, 4).forEach(rental => {
            const equipmentCard = UI.createEquipmentCard(rental);
            equipmentGrid.appendChild(equipmentCard);
        });
    }
}

// Initialize testimonials slider
function initTestimonials() {
    // Sample testimonials (in a real application, these would come from a database)
    const testimonials = [
        {
            text: "The sunset kayak tour was absolutely amazing! Harry's knowledge of the local wildlife made it even more special.",
            author: "Sarah M."
        },
        {
            text: "Best paddleboard rental experience ever! The equipment was in great condition and the staff was super helpful.",
            author: "Mike R."
        },
        {
            text: "The morning wildlife tour exceeded all our expectations. We saw dolphins and so many birds!",
            author: "Lisa K."
        }
    ];

    const testimonialSlider = document.querySelector('.testimonials-slider');
    
    if (testimonialSlider) {
        let currentSlide = 0;
        const slides = testimonials.map(testimonial => UI.createTestimonialCard(testimonial));
        
        // Add first testimonial
        if (slides.length > 0) {
            testimonialSlider.appendChild(slides[0]);
        }

        // Rotate testimonials every 5 seconds
        setInterval(() => {
            testimonialSlider.innerHTML = '';
            currentSlide = (currentSlide + 1) % slides.length;
            testimonialSlider.appendChild(slides[currentSlide]);
        }, 5000);
    }
}

// Initialize map (placeholder for now)
function initMap() {
    // This would typically integrate with a mapping service like Google Maps
    const mapPlaceholder = document.getElementById('map');
    if (mapPlaceholder) {
        mapPlaceholder.textContent = 'Interactive Map Coming Soon';
    }
}