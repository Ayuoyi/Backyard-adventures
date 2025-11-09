// About Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize map when the page loads
    initializeMap();

    // Set up team member image loading with fallbacks
    setupTeamImages();

    // Add smooth scrolling for navigation
    setupSmoothScrolling();

    // Initialize animations and interactive features
    initializeAnimations();

    // Set up parallax scrolling
    setupParallax();

    // Initialize counters for achievements
    initializeCounters();

    // Initialize interactive location cards (copy-to-clipboard tooltip)
    initializeLocationCards();
});

// Map initialization function
function initializeMap() {
    // Check if map container exists
    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer) return;

    // Replace this with actual coordinates for your location
    const coordinates = {
        lat: 34.0522, // Example: Los Angeles coordinates
        lng: -118.2437
    };

    // Initialize the map (using a mapping service of your choice)
    // This is a placeholder for the actual map implementation
    // You'll need to add your preferred mapping service's SDK and API key
    try {
        // Placeholder for map initialization code
        // Example using Google Maps (you'll need to add the Google Maps SDK):
        /*
        const map = new google.maps.Map(mapContainer, {
            center: coordinates,
            zoom: 15
        });

        const marker = new google.maps.Marker({
            position: coordinates,
            map: map,
            title: 'Backyard Adventures'
        });
        */

        // For now, show a placeholder message
        mapContainer.innerHTML = `
            <div class="map-placeholder">
                <p>Interactive map will be displayed here</p>
                <p>Location: ${coordinates.lat}, ${coordinates.lng}</p>
            </div>
        `;
    } catch (error) {
        console.error('Error initializing map:', error);
        mapContainer.innerHTML = '<div class="map-placeholder">Map loading error</div>';
    }
}

// Set up team member images with fallbacks
function setupTeamImages() {
    const teamImages = document.querySelectorAll('.member-image img');
    
    teamImages.forEach(img => {
        img.onerror = () => {
            // If image fails to load, use a placeholder
            img.src = '../assets/placeholder-profile.jpg';
        };
    });
}

// Smooth scrolling for navigation links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize animations and interactive features
function initializeAnimations() {
    // Add animation delays to team members
    document.querySelectorAll('.team-member').forEach((member, index) => {
        member.style.setProperty('--i', index);
    });

    // Add animation delays to value cards
    document.querySelectorAll('.value-card').forEach((card, index) => {
        card.style.setProperty('--i', index);
        
        // Add hover effects
        card.addEventListener('mouseenter', (e) => {
            const icon = card.querySelector('.value-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(10deg)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });

        card.addEventListener('mouseleave', (e) => {
            const icon = card.querySelector('.value-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });

    // Set up scroll reveal animation
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add reveal class to sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('reveal');
        observer.observe(section);
    });
}

// Set up parallax scrolling effect
function setupParallax() {
    const header = document.querySelector('.page-header');
    if (header) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            header.style.backgroundPositionY = (scrolled * 0.5) + 'px';
        });
    }
}

// Initialize counters for achievements
function initializeCounters() {
    const counterElements = document.querySelectorAll('.achievement-number');
    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const target = parseInt(element.getAttribute('data-count'));
                animateCounter(element, target);
                observer.unobserve(element);
            }
        });
    }, observerOptions);

    counterElements.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / (target / increment);

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current);
        }
    }, stepTime);
}

// Lazy loading for certification logos
document.addEventListener('DOMContentLoaded', () => {
    const certImages = document.querySelectorAll('.cert-item img');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        certImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        certImages.forEach(img => {
            img.src = img.dataset.src;
        });
    }
});

// Add animations for team member cards on scroll
document.addEventListener('DOMContentLoaded', () => {
    if ('IntersectionObserver' in window) {
        const teamMembers = document.querySelectorAll('.team-member');
        
        const teamObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.2
        });

        teamMembers.forEach(member => {
            teamObserver.observe(member);
        });
    }
});

// Weather information near location (if relevant for water activities)
async function fetchWeatherInfo() {
    const weatherContainer = document.querySelector('.weather-info');
    if (!weatherContainer) return;

    try {
        // Replace with actual weather API call
        const weatherData = await getWeatherData();
        updateWeatherDisplay(weatherData);
    } catch (error) {
        console.error('Error fetching weather:', error);
        weatherContainer.innerHTML = 'Weather information unavailable';
    }
}

// Helper function to format weather data
function updateWeatherDisplay(data) {
    // Implementation depends on your weather API response format
    const weatherContainer = document.querySelector('.weather-info');
    if (weatherContainer && data) {
        weatherContainer.innerHTML = `
            <div class="weather-current">
                <h3>Current Conditions</h3>
                <p>${data.temperature}°F</p>
                <p>${data.conditions}</p>
            </div>
        `;
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeMap,
        setupTeamImages,
        setupSmoothScrolling,
        updateWeatherDisplay
    };
}

// Interactive behavior for location detail cards: click to copy content and show tooltip
function initializeLocationCards() {
    const cards = document.querySelectorAll('.detail-item');
    if (!cards || cards.length === 0) return;

    cards.forEach(card => {
        // allow keyboard activation
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardActivation(card);
            }
        });

        card.addEventListener('click', () => {
            handleCardActivation(card);
        });
    });
}

function handleCardActivation(card) {
    const textToCopy = Array.from(card.querySelectorAll('p'))
        .map(p => p.textContent.trim())
        .join('\n');

    // copy to clipboard (fallbacks handled)
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showCopyTooltip(card, 'Copied');
        }).catch(() => {
            fallbackCopy(textToCopy, card);
        });
    } else {
        fallbackCopy(textToCopy, card);
    }
}

function fallbackCopy(text, card) {
    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showCopyTooltip(card, 'Copied');
    } catch (err) {
        showCopyTooltip(card, 'Unable to copy');
    }
}

function showCopyTooltip(card, message) {
    // remove any existing tooltip
    const existing = card.querySelector('.copy-tooltip');
    if (existing) existing.remove();

    const tip = document.createElement('div');
    tip.className = 'copy-tooltip';
    tip.textContent = message;
    tip.setAttribute('role', 'status');
    tip.style.position = 'absolute';
    tip.style.right = '12px';
    tip.style.top = '12px';
    tip.style.padding = '6px 10px';
    tip.style.background = 'rgba(3,60,120,0.92)';
    tip.style.color = '#fff';
    tip.style.borderRadius = '8px';
    tip.style.fontSize = '0.85rem';
    tip.style.boxShadow = '0 6px 18px rgba(2,40,80,0.28)';
    tip.style.zIndex = '40';

    card.appendChild(tip);
    setTimeout(() => {
        tip.style.transition = 'opacity 0.25s ease';
        tip.style.opacity = '0';
    }, 1100);
    setTimeout(() => tip.remove(), 1400);
}