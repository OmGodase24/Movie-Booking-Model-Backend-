const mongoose = require('mongoose');

// Ticket Schema
const ticketSchema = new mongoose.Schema({
    seatNumber: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['booked', 'unavailable', 'available'],
        default: 'unavailable'
    },
    theatre: {
        type: String,
        required: [true, 'Theatre is required']
    }
});

// Movie Schema
const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A movie must have a title']
    },
    genre: {
        type: String,
        required: [true, 'A movie must have a genre']
    },
    releaseDate: {
        type: Date,
        required: [true, 'A movie must have a release date']
    },
    rating: {
        type: Number,
        required: [true, 'A movie must have a rating'],
        min: 0,
        max: 10
    },
    theatre: {
        type: String,
        required: [true, 'Theatre Name must be specified']
    },
    ticketsAvailable: {
        type: Number,
        required: [true, 'Tickets available must be specified'],
        min: 0
    },
    tickets: [ticketSchema]
});

// Function to generate ticket names
const generateTickets = (count, theatre) => {
    const tickets = [];
    const rows = Math.ceil(count / 10);
    const maxSeatsPerRow = 10;

    for (let row = 0; row < rows; row++) {
        const rowLetter = String.fromCharCode(65 + row); // 65 is ASCII for 'A'
        for (let seat = 1; seat <= maxSeatsPerRow && (row * maxSeatsPerRow + seat) <= count; seat++) {
            tickets.push({
                seatNumber: `${rowLetter}${seat}`,
                status: 'available',
                theatre: theatre
            });
        }
    }
    return tickets;
};

// Pre-save middleware to generate tickets
movieSchema.pre('save', function(next) {
    if (this.tickets.length === 0) {
        const totalTickets = this.ticketsAvailable;
        const tickets = generateTickets(totalTickets, this.theatre);
        this.tickets.push(...tickets);
    }
    next();
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
