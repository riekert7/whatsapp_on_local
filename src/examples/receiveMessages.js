import whatsappClient from '../client.js';

/**
 * Example: Receive and handle incoming messages
 * 
 * Usage: node src/examples/receiveMessages.js
 * 
 * This script will:
 * 1. Initialize the WhatsApp client
 * 2. Listen for incoming messages
 * 3. Log all received messages
 * 4. Optionally respond to messages
 */

async function setupMessageReceiver() {
    try {
        // Initialize the client
        console.log('Initializing WhatsApp client...');
        const client = await whatsappClient.initialize();

        // Wait for client to be ready
        console.log('Waiting for authentication...');
        await whatsappClient.waitForReady();

        console.log('✓ Client ready! Listening for messages...\n');
        console.log('Press Ctrl+C to stop\n');

        // Listen for incoming messages
        client.on('message', async (msg) => {
            try {
                const contact = await msg.getContact();
                const chat = await msg.getChat();
                
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log(`📨 New message from: ${contact.pushname || contact.number}`);
                console.log(`   Number: ${contact.number}`);
                console.log(`   Chat: ${chat.name || 'Individual'}`);
                console.log(`   Message: ${msg.body}`);
                console.log(`   Time: ${msg.timestamp}`);
                
                // Check if message has media
                if (msg.hasMedia) {
                    console.log(`   📎 Has media: Yes`);
                    const media = await msg.downloadMedia();
                    if (media) {
                        console.log(`   Media type: ${media.mimetype}`);
                        console.log(`   Media filename: ${media.filename || 'N/A'}`);
                    }
                }
                
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

                // Example: Auto-reply (uncomment to enable)
                // if (msg.body.toLowerCase().includes('hello')) {
                //     await msg.reply('Hi! How can I help you?');
                //     console.log('✓ Auto-reply sent');
                // }

            } catch (error) {
                console.error('Error handling message:', error);
            }
        });

        // Listen for message acknowledgments
        client.on('message_ack', (msg, ack) => {
            if (ack === 3) {
                console.log(`✓ Message ${msg.id._serialized} read`);
            }
        });

        // Keep the process running
        process.on('SIGINT', async () => {
            console.log('\n\nStopping client...');
            await whatsappClient.destroy();
            process.exit(0);
        });

    } catch (error) {
        console.error('Error setting up message receiver:', error);
        process.exit(1);
    }
}

// Run the example
setupMessageReceiver();
