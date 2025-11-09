// Data Management Module
const BA = {
    // Data Storage Keys
    STORAGE_KEYS: {
        CUSTOMERS: 'ba_customers',
        RESERVATIONS: 'ba_reservations',
        TOURS: 'ba_tours',
        RENTALS: 'ba_rentals',
        AVAILABILITY: 'ba_availability',
        ANALYTICS: 'ba_analytics'
    },

    // Data Models
    models: {
        // Customer Model
        Customer: class {
            constructor(name, email, phone, source) {
                this.id = 'CUS_' + Date.now();
                this.name = name;
                this.email = email;
                this.phone = phone;
                this.source = source;
                this.preferences = [];
                this.dateCreated = new Date();
            }
        },

        // Reservation Model
        Reservation: class {
            constructor(customerId, type, date, time, details) {
                this.id = 'RES_' + Date.now();
                this.customerId = customerId;
                this.type = type; // 'tour', 'rental', or 'instruction'
                this.date = date;
                this.time = time;
                this.details = details;
                this.status = 'confirmed';
                this.dateCreated = new Date();
            }
        },

        // Tour Model
        Tour: class {
            constructor(name, description, duration, capacity, price, requirements) {
                this.id = 'TOUR_' + Date.now();
                this.name = name;
                this.description = description;
                this.duration = duration;
                this.capacity = capacity;
                this.price = price;
                this.requirements = requirements;
                this.imageUrl = ''; // Placeholder for tour image
            }
        },

        // Rental Equipment Model
        Rental: class {
            constructor(type, hourlyRate, dailyRate, quantity) {
                this.id = 'RENT_' + Date.now();
                this.type = type;
                this.hourlyRate = hourlyRate;
                this.dailyRate = dailyRate;
                this.quantityAvailable = quantity;
                this.imageUrl = ''; // Placeholder for equipment image
            }
        }
    },

    // Data Storage Methods
    storage: {
        save(key, data) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (error) {
                console.error('Storage Error:', error);
                return false;
            }
        },

        load(key) {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            } catch (error) {
                console.error('Loading Error:', error);
                return null;
            }
        },

        // Initialize with sample data if storage is empty
        initializeIfEmpty() {
            // Sample Tours
            if (!this.load(BA.STORAGE_KEYS.TOURS)) {
                const sampleTours = [
                    new BA.models.Tour(
                        'Sunset Kayak Tour',
                        'Experience the beautiful Jacksonville sunset from the water',
                        '2 hours',
                        8,
                        79.99,
                        ['Basic swimming ability', 'Minimum age: 12']
                    ),
                    new BA.models.Tour(
                        'Morning Wildlife Tour',
                        'Explore local wildlife in their natural habitat',
                        '3 hours',
                        6,
                        89.99,
                        ['Early morning start', 'Camera recommended']
                    ),
                    // Add more sample tours as needed
                ];
                this.save(BA.STORAGE_KEYS.TOURS, sampleTours);
            }

            // Sample Rental Equipment
            if (!this.load(BA.STORAGE_KEYS.RENTALS)) {
                const sampleRentals = [
                    new BA.models.Rental('Kayak - Single', 25, 80, 10),
                    new BA.models.Rental('Kayak - Tandem', 35, 100, 5),
                    new BA.models.Rental('Stand-up Paddleboard', 20, 70, 8),
                    // Add more sample rentals as needed
                ];
                this.save(BA.STORAGE_KEYS.RENTALS, sampleRentals);
            }
        }
    },

    // Business Logic Methods
    service: {
        // Customer Management
        createCustomer(name, email, phone, source) {
            const customer = new BA.models.Customer(name, email, phone, source);
            const customers = BA.storage.load(BA.STORAGE_KEYS.CUSTOMERS) || [];
            customers.push(customer);
            BA.storage.save(BA.STORAGE_KEYS.CUSTOMERS, customers);
            return customer;
        },

        // Reservation Management
        createReservation(customerId, type, date, time, details) {
            const reservation = new BA.models.Reservation(customerId, type, date, time, details);
            const reservations = BA.storage.load(BA.STORAGE_KEYS.RESERVATIONS) || [];
            reservations.push(reservation);
            BA.storage.save(BA.STORAGE_KEYS.RESERVATIONS, reservations);
            return reservation;
        },

        // Availability Checking
        checkAvailability(date, type, itemId) {
            const reservations = BA.storage.load(BA.STORAGE_KEYS.RESERVATIONS) || [];
            const availability = BA.storage.load(BA.STORAGE_KEYS.AVAILABILITY) || [];

            // Check staff availability first
            const staffAvailable = availability.find(a => 
                a.date === date && ['both', 'harry'].includes(a.staffAvailable)
            );

            if (!staffAvailable && type === 'tour') {
                return { available: false, reason: 'No guide available for this date' };
            }

            // Check existing reservations
            const existingReservations = reservations.filter(r => 
                r.date === date && r.type === type && r.status === 'confirmed'
            );

            if (type === 'tour') {
                const tour = this.getTourById(itemId);
                if (existingReservations.length >= tour.capacity) {
                    return { available: false, reason: 'Tour is fully booked' };
                }
            } else if (type === 'rental') {
                const rental = this.getRentalById(itemId);
                const rentedCount = existingReservations.length;
                if (rentedCount >= rental.quantityAvailable) {
                    return { available: false, reason: 'No equipment available for this date' };
                }
            }

            return { available: true };
        },

        // Analytics
        generateAnalytics() {
            const reservations = BA.storage.load(BA.STORAGE_KEYS.RESERVATIONS) || [];
            const customers = BA.storage.load(BA.STORAGE_KEYS.CUSTOMERS) || [];

            return {
                totalCustomers: customers.length,
                totalReservations: reservations.length,
                reservationsByType: reservations.reduce((acc, res) => {
                    acc[res.type] = (acc[res.type] || 0) + 1;
                    return acc;
                }, {}),
                customerSources: customers.reduce((acc, cus) => {
                    acc[cus.source] = (acc[cus.source] || 0) + 1;
                    return acc;
                }, {})
            };
        }
    },

    // Initialize the application
    init() {
        this.storage.initializeIfEmpty();
        console.log('Backyard Adventures System Initialized');
    }
};

// Initialize the system when the script loads
BA.init();