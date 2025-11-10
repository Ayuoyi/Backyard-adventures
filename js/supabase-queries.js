// ===================================
// DATABASE QUERIES - TOURS
// ===================================

/**
 * Get all tours
 */
async function getAllTours() {
    try {
        const { data, error } = await supabaseClient
            .from('tours')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Get tours error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get tour by ID
 */
async function getTourById(tourId) {
    try {
        const { data, error } = await supabaseClient
            .from('tours')
            .select('*')
            .eq('id', tourId)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Get tour error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Filter tours by criteria
 */
async function filterTours(filters = {}) {
    try {
        let query = supabaseClient
            .from('tours')
            .select('*');

        // Apply filters
        if (filters.duration) {
            query = query.eq('duration', filters.duration);
        }
        if (filters.difficulty) {
            query = query.eq('difficulty', filters.difficulty);
        }
        if (filters.type) {
            query = query.eq('type', filters.type);
        }
        if (filters.maxPrice) {
            query = query.lte('price', filters.maxPrice);
        }

        const { data, error } = await query.order('price', { ascending: true });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Filter tours error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create new tour (Admin only)
 */
async function createTour(tourData) {
    try {
        const { data, error } = await supabaseClient
            .from('tours')
            .insert([tourData])
            .select();

        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Create tour error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update tour (Admin only)
 */
async function updateTour(tourId, updates) {
    try {
        const { data, error } = await supabaseClient
            .from('tours')
            .update(updates)
            .eq('id', tourId)
            .select();

        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Update tour error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete tour (Admin only)
 */
async function deleteTour(tourId) {
    try {
        const { error } = await supabaseClient
            .from('tours')
            .delete()
            .eq('id', tourId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Delete tour error:', error);
        return { success: false, error: error.message };
    }
}

// ===================================
// DATABASE QUERIES - EQUIPMENT RENTALS
// ===================================

/**
 * Get all equipment
 */
async function getAllEquipment() {
    try {
        const { data, error } = await supabaseClient
            .from('equipment')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Get equipment error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get available equipment
 */
async function getAvailableEquipment() {
    try {
        const { data, error } = await supabaseClient
            .from('equipment')
            .select('*')
            .eq('availability', 'available')
            .order('name', { ascending: true });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Get available equipment error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Filter equipment by type
 */
async function filterEquipment(filters = {}) {
    try {
        let query = supabaseClient
            .from('equipment')
            .select('*');

        if (filters.type) {
            query = query.eq('type', filters.type);
        }
        if (filters.availability) {
            query = query.eq('availability', filters.availability);
        }
        if (filters.maxPrice) {
            query = query.lte('hourly_rate', filters.maxPrice);
        }

        const { data, error } = await query.order('hourly_rate', { ascending: true });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Filter equipment error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create equipment (Admin only)
 */
async function createEquipment(equipmentData) {
    try {
        const { data, error } = await supabaseClient
            .from('equipment')
            .insert([equipmentData])
            .select();

        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Create equipment error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update equipment availability
 */
async function updateEquipmentAvailability(equipmentId, availability) {
    try {
        const { data, error } = await supabaseClient
            .from('equipment')
            .update({ availability })
            .eq('id', equipmentId)
            .select();

        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Update equipment availability error:', error);
        return { success: false, error: error.message };
    }
}

// ===================================
// DATABASE QUERIES - BOOKINGS
// ===================================

/**
 * Create tour booking
 */
async function createTourBooking(bookingData) {
    try {
        const user = await supabaseHelpers.getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const booking = {
            user_id: user.id,
            tour_id: bookingData.tourId,
            date: bookingData.date,
            participants: bookingData.participants,
            total_price: bookingData.totalPrice,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabaseClient
            .from('tour_bookings')
            .insert([booking])
            .select();

        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Create tour booking error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create equipment rental
 */
async function createEquipmentRental(rentalData) {
    try {
        const user = await supabaseHelpers.getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const rental = {
            user_id: user.id,
            equipment_id: rentalData.equipmentId,
            start_date: rentalData.startDate,
            end_date: rentalData.endDate,
            duration_hours: rentalData.durationHours,
            total_price: rentalData.totalPrice,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabaseClient
            .from('equipment_rentals')
            .insert([rental])
            .select();

        if (error) throw error;

        // Update equipment availability
        await updateEquipmentAvailability(rentalData.equipmentId, 'rented');

        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Create equipment rental error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user bookings
 */
async function getUserBookings(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('tour_bookings')
            .select(`
                *,
                tours (*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Get user bookings error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user rentals
 */
async function getUserRentals(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('equipment_rentals')
            .select(`
                *,
                equipment (*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Get user rentals error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Cancel booking
 */
async function cancelBooking(bookingId) {
    try {
        const { error } = await supabaseClient
            .from('tour_bookings')
            .update({ status: 'cancelled' })
            .eq('id', bookingId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Cancel booking error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Cancel rental and update equipment availability
 */
async function cancelRental(rentalId, equipmentId) {
    try {
        const { error } = await supabaseClient
            .from('equipment_rentals')
            .update({ status: 'cancelled' })
            .eq('id', rentalId);

        if (error) throw error;

        // Make equipment available again
        await updateEquipmentAvailability(equipmentId, 'available');

        return { success: true };
    } catch (error) {
        console.error('Cancel rental error:', error);
        return { success: false, error: error.message };
    }
}

// ===================================
// DATABASE QUERIES - CONTACT/INQUIRIES
// ===================================

/**
 * Submit contact form
 */
async function submitContactForm(formData) {
    try {
        const { data, error } = await supabaseClient
            .from('inquiries')
            .insert([{
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                subject: formData.subject,
                message: formData.message,
                status: 'new',
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Submit contact form error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all inquiries (Admin only)
 */
async function getAllInquiries() {
    try {
        const { data, error } = await supabaseClient
            .from('inquiries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Get inquiries error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update inquiry status (Admin only)
 */
async function updateInquiryStatus(inquiryId, status) {
    try {
        const { error } = await supabaseClient
            .from('inquiries')
            .update({ status })
            .eq('id', inquiryId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Update inquiry status error:', error);
        return { success: false, error: error.message };
    }
}

// ===================================
// EXPORT ALL QUERY FUNCTIONS
// ===================================

window.supabaseQueries = {
    // Tours
    getAllTours,
    getTourById,
    filterTours,
    createTour,
    updateTour,
    deleteTour,
    
    // Equipment
    getAllEquipment,
    getAvailableEquipment,
    filterEquipment,
    createEquipment,
    updateEquipmentAvailability,
    
    // Bookings
    createTourBooking,
    createEquipmentRental,
    getUserBookings,
    getUserRentals,
    cancelBooking,
    cancelRental,
    
    // Contact/Inquiries
    submitContactForm,
    getAllInquiries,
    updateInquiryStatus
};
