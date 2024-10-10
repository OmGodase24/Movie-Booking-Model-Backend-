// consumer.js
const { consumeMessages } = require('./utils/kafka');

consumeMessages('ticket-booked', async (message) => {
    try {
        console.log(`Received ticket booked event: ${JSON.stringify(message)}`);
        // Handle the message, such as sending a confirmation email
    } catch (error) {
        console.error('Error processing ticket booked event:', error);
    }
});
