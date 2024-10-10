const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

// Load environment variables from config.env
dotenv.config({ path: './config.env' });

// MongoDB connection URL
const URL = process.env.DATABASE_LOCAL || "mongodb://127.0.0.1:27017/MovieBooking";

// Connect to MongoDB
async function connectToDatabase() {
    try {
        await mongoose.connect(URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process if the connection fails
    }
}

connectToDatabase();

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});


//Zookeeper : .\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties

//Kafka : .\bin\windows\kafka-server-start.bat .\config\server.properties

//ticket-booking : .\bin\windows\kafka-topics.bat --create --topic ticket-booking --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1

//To CHeck the message:kafka-console-consumer.bat --topic ticket-booked --bootstrap-server localhost:9092 --from-beginning



//backend testing ,JUST 

// # Start Zookeeper
// .\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties

// # Start Kafka (in a new command prompt)
// .\bin\windows\kafka-server-start.bat .\config\server.properties

// # Create a Topic (in a new command prompt)
// .\bin\windows\kafka-topics.bat --create --topic test-topic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1

// # Start a Producer (in a new command prompt)
// .\bin\windows\kafka-console-producer.bat --topic test-topic --bootstrap-server localhost:9092

// # Start a Consumer (in a new command prompt)
// .\bin\windows\kafka-console-consumer.bat --topic test-topic --from-beginning --bootstrap-server localhost:9092
