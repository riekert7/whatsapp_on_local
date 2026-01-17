import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { logger } from './utils/logger.js';

/**
 * Initialize and configure WhatsApp client
 */
class WhatsAppClient {
    constructor() {
        this.client = null;
        this.isReady = false;
        this.isAuthenticated = false;
    }

    /**
     * Initialize the WhatsApp client with authentication
     */
    async initialize() {
        try {
            logger.info('Initializing WhatsApp client...');

            // Create client with local auth (saves session to .session folder)
            this.client = new Client({
                authStrategy: new LocalAuth({
                    dataPath: './.session'
                }),
                puppeteer: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu'
                    ]
                }
            });

            // QR Code generation
            this.client.on('qr', (qr) => {
                logger.info('QR Code received! Scan with your phone:');
                qrcode.generate(qr, { small: true });
                console.log('\nAlternatively, scan the QR code above with WhatsApp:\n');
                console.log('1. Open WhatsApp on your phone');
                console.log('2. Go to Settings > Linked Devices');
                console.log('3. Tap "Link a Device"');
                console.log('4. Scan the QR code\n');
            });

            // Authentication successful
            this.client.on('ready', () => {
                this.isReady = true;
                this.isAuthenticated = true;
                logger.success('WhatsApp client is ready!');
                console.log('✓ Client is ready to send and receive messages');
            });

            // Authentication failed
            this.client.on('auth_failure', (msg) => {
                this.isAuthenticated = false;
                logger.error('Authentication failed:', msg);
                console.error('❌ Authentication failed. Please try scanning the QR code again.');
            });

            // Disconnected
            this.client.on('disconnected', (reason) => {
                this.isReady = false;
                logger.warn('Client disconnected:', reason);
                console.log('⚠️  Client disconnected:', reason);
            });

            // Initialize the client
            await this.client.initialize();

            return this.client;
        } catch (error) {
            logger.error('Failed to initialize WhatsApp client:', error);
            throw error;
        }
    }

    /**
     * Get the client instance
     */
    getClient() {
        if (!this.client) {
            throw new Error('Client not initialized. Call initialize() first.');
        }
        return this.client;
    }

    /**
     * Check if client is ready
     */
    isClientReady() {
        return this.isReady && this.client;
    }

    /**
     * Send a text message
     * @param {string} chatId - Phone number in format: "1234567890@c.us"
     * @param {string} message - Text message to send
     * @returns {Promise<Message>}
     */
    async sendTextMessage(chatId, message) {
        if (!this.isClientReady()) {
            throw new Error('Client is not ready. Wait for authentication.');
        }

        try {
            const msg = await this.client.sendMessage(chatId, message);
            logger.success(`Message sent to ${chatId}`);
            return msg;
        } catch (error) {
            logger.error(`Failed to send message to ${chatId}:`, error);
            throw error;
        }
    }

    /**
     * Send a message with media (image, video, document)
     * @param {string} chatId - Phone number in format: "1234567890@c.us"
     * @param {string} filePath - Path to the media file
     * @param {string} caption - Optional caption for the media
     * @returns {Promise<Message>}
     */
    async sendMedia(chatId, filePath, caption = '') {
        if (!this.isClientReady()) {
            throw new Error('Client is not ready. Wait for authentication.');
        }

        try {
            const { MessageMedia } = await import('whatsapp-web.js');
            const media = MessageMedia.fromFilePath(filePath);
            
            if (caption) {
                media.caption = caption;
            }

            const msg = await this.client.sendMessage(chatId, media);
            logger.success(`Media sent to ${chatId}`);
            return msg;
        } catch (error) {
            logger.error(`Failed to send media to ${chatId}:`, error);
            throw error;
        }
    }

    /**
     * Send media from base64 string
     * @param {string} chatId - Phone number in format: "1234567890@c.us"
     * @param {string} base64Data - Base64 encoded image/video data
     * @param {string} caption - Optional caption for the media
     * @param {string} mimetype - MIME type (default: image/jpeg)
     * @param {string} filename - Optional filename
     * @returns {Promise<Message>}
     */
    async sendMediaBase64(chatId, base64Data, caption = '', mimetype = 'image/jpeg', filename = null) {
        if (!this.isClientReady()) {
            throw new Error('Client is not ready. Wait for authentication.');
        }

        try {
            const { MessageMedia } = await import('whatsapp-web.js');
            const media = new MessageMedia(mimetype, base64Data, filename);
            
            if (caption) {
                media.caption = caption;
            }

            const msg = await this.client.sendMessage(chatId, media);
            logger.success(`Media (base64) sent to ${chatId}`);
            return msg;
        } catch (error) {
            logger.error(`Failed to send base64 media to ${chatId}:`, error);
            throw error;
        }
    }

    /**
     * Get chat ID from phone number
     * @param {string} phoneNumber - Phone number (with or without country code)
     * @returns {string} - Chat ID in format "1234567890@c.us"
     */
    getChatId(phoneNumber) {
        // Remove any non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');
        
        // Format as chat ID
        return `${cleaned}@c.us`;
    }

    /**
     * Wait for client to be ready (with timeout)
     * @param {number} timeoutMs - Timeout in milliseconds (default: 60000 = 1 minute)
     * @returns {Promise<void>}
     */
    async waitForReady(timeoutMs = 60000) {
        if (this.isClientReady()) {
            return;
        }

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Client ready timeout'));
            }, timeoutMs);

            const checkReady = setInterval(() => {
                if (this.isClientReady()) {
                    clearInterval(checkReady);
                    clearTimeout(timeout);
                    resolve();
                }
            }, 1000);
        });
    }

    /**
     * Destroy the client
     */
    async destroy() {
        if (this.client) {
            await this.client.destroy();
            this.client = null;
            this.isReady = false;
            this.isAuthenticated = false;
            logger.info('Client destroyed');
        }
    }
}

// Export singleton instance
export const whatsappClient = new WhatsAppClient();

// For direct usage
export default whatsappClient;
