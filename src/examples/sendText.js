import whatsappClient from '../client.js';

/**
 * Example: Send a text message
 * 
 * Usage: node src/examples/sendText.js
 * 
 * Make sure to:
 * 1. Replace 'YOUR_PHONE_NUMBER' with the actual phone number
 * 2. Ensure the client is authenticated (scan QR code on first run)
 */

async function sendTextMessage() {
    try {
        // Initialize the client
        console.log('Initializing WhatsApp client...');
        await whatsappClient.initialize();

        // Wait for client to be ready
        console.log('Waiting for authentication...');
        await whatsappClient.waitForReady();

        // Replace with actual phone number
        // Format: country code + number (e.g., '1234567890' for US number)
        const phoneNumber = 'YOUR_PHONE_NUMBER'; // TODO: Replace this
        const message = 'Hello from WhatsApp Web automation! 👋';

        // Get chat ID
        const chatId = whatsappClient.getChatId(phoneNumber);
        console.log(`Sending message to: ${chatId}`);

        // Send the message
        const result = await whatsappClient.sendTextMessage(chatId, message);
        
        console.log('✓ Message sent successfully!');
        console.log('Message ID:', result.id._serialized);

        // Clean up (optional - uncomment if you want to close the client)
        // await whatsappClient.destroy();
        
    } catch (error) {
        console.error('Error sending message:', error);
        process.exit(1);
    }
}

// Run the example
sendTextMessage();
