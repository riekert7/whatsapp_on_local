/**
 * Simple logger utility with colored output
 */
export const logger = {
    info: (message, ...args) => {
        console.log(`ℹ️  [INFO] ${message}`, ...args);
    },

    success: (message, ...args) => {
        console.log(`✅ [SUCCESS] ${message}`, ...args);
    },

    warn: (message, ...args) => {
        console.warn(`⚠️  [WARN] ${message}`, ...args);
    },

    error: (message, ...args) => {
        console.error(`❌ [ERROR] ${message}`, ...args);
    },

    debug: (message, ...args) => {
        if (process.env.DEBUG === 'true') {
            console.log(`🔍 [DEBUG] ${message}`, ...args);
        }
    }
};
