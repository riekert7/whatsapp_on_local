import whatsappClient from '../client.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

/**
 * Example: Send an image message
 * 
 * Usage: node src/examples/sendImage.js
 * 
 * Make sure to:
 * 1. Replace 'YOUR_PHONE_NUMBER' with the actual phone number
 * 2. Replace 'path/to/image.jpg' with the actual image path
 * 3. Ensure the client is authenticated (scan QR code on first run)
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function sendImageMessage() {
    try {
        // Initialize the client
        console.log('Initializing WhatsApp client...');
        await whatsappClient.initialize();

        // Wait for client to be ready
        console.log('Waiting for authentication...');
        await whatsappClient.waitForReady();

        // Replace with actual phone number
        const phoneNumber = 'YOUR_PHONE_NUMBER'; // TODO: Replace this
        
        // Replace with actual image path
        // You can use absolute path or relative path from project root
        const imagePath = 'path/to/image.jpg'; // TODO: Replace this
        
        // Check if file exists
        if (!existsSync(imagePath)) {
            throw new Error(`Image file not found: ${imagePath}`);
        }

        // Get chat ID
        const chatId = whatsappClient.getChatId(phoneNumber);
        console.log(`Sending image to: ${chatId}`);
        console.log(`Image path: ${imagePath}`);

        // Optional caption for the image
        const caption = 'Check out this image! 📷';

        // Send the image
        const result = await whatsappClient.sendMedia(chatId, imagePath, caption);
        
        console.log('✓ Image sent successfully!');
        console.log('Message ID:', result.id._serialized);

        // Clean up (optional)
        // await whatsappClient.destroy();
        
    } catch (error) {
        console.error('Error sending image:', error);
        process.exit(1);
    }
}

// Run the example
sendImageMessage();
