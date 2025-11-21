/**
 * Autosave storage utility for managing form drafts in localStorage
 */
export const autosaveStorage = {
    /**
     * Save form data to localStorage
     */
    save: <T>(key: string, data: T): void => {
        try {
            localStorage.setItem(`autosave_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error("Failed to save to localStorage:", error);
        }
    },

    /**
     * Load form data from localStorage
     */
    load: <T>(key: string): T | null => {
        try {
            const item = localStorage.getItem(`autosave_${key}`);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error("Failed to load from localStorage:", error);
            return null;
        }
    },

    /**
     * Clear saved form data from localStorage
     */
    clear: (key: string): void => {
        try {
            localStorage.removeItem(`autosave_${key}`);
        } catch (error) {
            console.error("Failed to clear localStorage:", error);
        }
    },

    /**
     * Check if autosave data exists for a key
     */
    exists: (key: string): boolean => {
        try {
            return localStorage.getItem(`autosave_${key}`) !== null;
        } catch {
            return false;
        }
    },
};
