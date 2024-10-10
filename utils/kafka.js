const { Kafka } = require('kafkajs');
const logger = require('./logger'); // Import the logger

// Initialize Kafka instance
const kafka = new Kafka({
    clientId: 'movie-booking-app',
    brokers: ['localhost:9092'] // Kafka broker addresses
});

// Kafka producer
const producer = kafka.producer();
async function produceMessage(topic, message) {
    try {
        await producer.connect();
        await producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }]
        });
        logger.info(`Message sent to Kafka topic ${topic}: ${JSON.stringify(message)}`);
    } catch (error) {
        logger.error(`Failed to send message to Kafka: ${error.message}`);
    } finally {
        await producer.disconnect();
    }
}

// Kafka consumer
const consumer = kafka.consumer({ groupId: 'movie-booking-group' });
async function consumeMessages(topic, messageHandler) {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic, fromBeginning: true });
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const msg = JSON.parse(message.value.toString());
                logger.info(`Received message from Kafka topic ${topic}: ${JSON.stringify(msg)}`);
                messageHandler(msg);
            }
        });
    } catch (error) {
        logger.error(`Failed to consume messages from Kafka: ${error.message}`);
    }
}

module.exports = { produceMessage, consumeMessages };
