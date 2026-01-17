import express from 'express';
import cors from 'cors';
import whatsappClient from './client.js';
import { logger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Handle large base64 images

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        whatsappReady: whatsappClient.isClientReady(),
        timestamp: new Date().toISOString()
    });
});

// Simple webhook endpoint for n8n (generic format)
// Accepts: { phoneNumber, message, imageBase64?, caption? }
app.post('/webhook/send', async (req, res) => {
    try {
        const { phoneNumber, message, imageBase64, caption } = req.body;

        // Validate required fields
        if (!phoneNumber || !message) {
            return res.status(400).json({
                success: false,
                error: 'phoneNumber and message are required'
            });
        }

        // Check if client is ready
        if (!whatsappClient.isClientReady()) {
            return res.status(503).json({
                success: false,
                error: 'WhatsApp client is not ready. Please wait for authentication.',
                ready: false
            });
        }

        // Get chat ID
        const chatId = whatsappClient.getChatId(phoneNumber);

        let result;

        // Send with image if provided
        if (imageBase64) {
            result = await whatsappClient.sendMediaBase64(chatId, imageBase64, caption || message);
        } else {
            // Send text message
            result = await whatsappClient.sendTextMessage(chatId, message);
        }

        logger.success(`Message sent to ${phoneNumber}`);

        res.json({
            success: true,
            messageId: result.id._serialized,
            chatId: chatId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


// Start server and initialize WhatsApp client
async function startServer() {
    try {
        // Initialize WhatsApp client
        logger.info('Starting WhatsApp client...');
        await whatsappClient.initialize();

        // Wait for client to be ready (with timeout)
        logger.info('Waiting for WhatsApp authentication...');
        await whatsappClient.waitForReady(120000); // 2 minute timeout

        // Start HTTP server
        app.listen(PORT, '0.0.0.0', () => {
            logger.success(`Server running on http://0.0.0.0:${PORT}`);
            logger.info(`Health: http://localhost:${PORT}/health`);
            logger.info(`Webhook: http://localhost:${PORT}/webhook/send`);
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        
        // Still start the server even if WhatsApp isn't ready
        // This allows the health endpoint to report status
        app.listen(PORT, '0.0.0.0', () => {
            logger.warn(`Server started but WhatsApp client not ready on port ${PORT}`);
            logger.info('Please check logs for QR code to authenticate');
        });
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    logger.info('\nShutting down gracefully...');
    await whatsappClient.destroy();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('\nShutting down gracefully...');
    await whatsappClient.destroy();
    process.exit(0);
});

// Start the server
startServer();
