import whatsappClient from '../client.js';
import { existsSync } from 'fs';

/**
 * Example: Send a video message
 * 
 * Usage: node src/examples/sendVideo.js
 * 
 * Make sure to:
 * 1. Replace 'YOUR_PHONE_NUMBER' with the actual phone number
 * 2. Replace 'path/to/video.mp4' with the actual video path
 * 3. Ensure the client is authenticated (scan QR code on first run)
 * 
 * Note: WhatsApp has size limits for videos (~16MB for videos)
 */

async function sendVideoMessage() {
    try {
        // Initialize the client
        console.log('Initializing WhatsApp client...');
        await whatsappClient.initialize();

        // Wait for client to be ready
        console.log('Waiting for authentication...');
        await whatsappClient.waitForReady();

        // Replace with actual phone number
        const phoneNumber = 'YOUR_PHONE_NUMBER'; // TODO: Replace this
        
        // Replace with actual video path
        const videoPath = 'path/to/video.mp4'; // TODO: Replace this
        
        // Check if file exists
        if (!existsSync(videoPath)) {
            throw new Error(`Video file not found: ${videoPath}`);
        }

        // Get chat ID
        const chatId = whatsappClient.getChatId(phoneNumber);
        console.log(`Sending video to: ${chatId}`);
        console.log(`Video path: ${videoPath}`);

        // Optional caption for the video
        const caption = 'Check out this video! 🎥';

        // Send the video
        const result = await whatsappClient.sendMedia(chatId, videoPath, caption);
        
        console.log('✓ Video sent successfully!');
        console.log('Message ID:', result.id._serialized);

        // Clean up (optional)
        // await whatsappClient.destroy();
        
    } catch (error) {
        console.error('Error sending video:', error);
        process.exit(1);
    }
}

// Run the example
sendVideoMessage();
