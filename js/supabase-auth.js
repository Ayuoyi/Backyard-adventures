// ===================================
// AUTHENTICATION FUNCTIONS
// ===================================

/**
 * Sign up new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {object} metadata - Additional user data (name, role, etc.)
 */
async function signUp(email, password, metadata = {}) {
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: metadata, // Store additional user info
                emailRedirectTo: `${window.location.origin}/portal/login.html`
            }
        });

        if (error) throw error;

        // Create user profile in database
        if (data.user) {
            await createUserProfile(data.user.id, {
                email: email,
                full_name: metadata.full_name,
                role: metadata.role || 'client',
                created_at: new Date().toISOString()
            });
        }

        return { success: true, user: data.user };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sign in existing user
 * @param {string} email - User email
 * @param {string} password - User password
 */
async function signIn(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        return { success: true, user: data.user, session: data.session };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sign out current user
 */
async function signOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;

        // Clear local storage
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Reset password via email
 * @param {string} email - User email
 */
async function resetPassword(email) {
    try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/portal/reset-password.html`
        });

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Reset password error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update user password
 * @param {string} newPassword - New password
 */
async function updatePassword(newPassword) {
    try {
        const { error } = await supabaseClient.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Update password error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create user profile in database
 * @param {string} userId - User ID
 * @param {object} profileData - Profile data
 */
async function createUserProfile(userId, profileData) {
    try {
        const { error } = await supabaseClient
            .from('users')
            .insert([{
                id: userId,
                ...profileData
            }]);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Create profile error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user profile from database
 * @param {string} userId - User ID
 */
async function getUserProfile(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        return { success: true, profile: data };
    } catch (error) {
        console.error('Get profile error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {object} updates - Profile updates
 */
async function updateUserProfile(userId, updates) {
    try {
        const { error } = await supabaseClient
            .from('users')
            .update(updates)
            .eq('id', userId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Update profile error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Check authentication and redirect if needed
 * @param {string} redirectUrl - URL to redirect if not authenticated
 */
async function requireAuth(redirectUrl = '/portal/login.html') {
    const user = await supabaseHelpers.getCurrentUser();
    if (!user) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

// Export auth functions
window.supabaseAuth = {
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    createUserProfile,
    getUserProfile,
    updateUserProfile,
    requireAuth
};
