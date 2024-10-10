// const Movie = require('../models/movieModel');
// const mongoose = require('mongoose');
// const logger = require('../utils/logger');
// const { produceMessage } = require('../utils/kafka');


// // Admin - Get all movies
// exports.getAllMovies = async (req, res) => {
//     try {
//         const movies = await Movie.find();
//         res.status(200).json({
//             status: 'success',
//             results: movies.length,
//             data: { movies }
//         });
//     } catch (err) {
//         res.status(400).json({ status: 'fail', message: err.message });
//     }
// };

// // Admin - Get a single movie by ID
// exports.getMovie = async (req, res) => {
//     try {
//         const movie = await Movie.findById(req.params.id);
//         if (!movie) {
//             return res.status(404).json({
//                 status: 'fail',
//                 message: 'No movie found with that ID'
//             });
//         }
//         res.status(200).json({
//             status: 'success',
//             data: { movie }
//         });
//     } catch (err) {
//         res.status(400).json({ status: 'fail', message: err.message });
//     }
// };

// // Admin - Create a new movie
// exports.createMovie = async (req, res) => {
//     try {
//         const newMovie = await Movie.create(req.body);
//         res.status(201).json({
//             status: 'success',
//             data: { movie: newMovie }
//         });
//     } catch (err) {
//         res.status(400).json({ status: 'fail', message: err.message });
//     }
// };

// // Admin - Update a movie by ID
// exports.updateMovie = async (req, res) => {
//     try {
//         const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
//             new: true,
//             runValidators: true
//         });
//         if (!movie) {
//             return res.status(404).json({
//                 status: 'fail',
//                 message: 'No movie found with that ID'
//             });
//         }
//         res.status(200).json({
//             status: 'success',
//             data: { movie }
//         });
//     } catch (err) {
//         res.status(400).json({ status: 'fail', message: err.message });
//     }
// };

// // Admin - Delete a movie by ID
// exports.deleteMovie = async (req, res) => {
//     try {
//         const movie = await Movie.findByIdAndDelete(req.params.id);
//         if (!movie) {
//             return res.status(404).json({
//                 status: 'fail',
//                 message: 'No movie found with that ID'
//             });
//         }
//         res.status(204).json({ status: 'success', message: 'Movie Deleted' });
//     } catch (err) {
//         res.status(400).json({ status: 'fail', message: err.message });
//     }
// };


// // User - Get movie by name
// exports.getMovieByName = async (req, res) => {
//     try {
//         const movie = await Movie.findOne({ title: req.params.moviename });
//         res.status(200).json({
//             status: 'success',
//             data: { movie }
//         });
//     } catch (err) {
//         res.status(400).json({ status: 'fail', message: err.message });
//     }
// };


// exports.bookTicket = async (req, res) => {
//     try {
//         const movie = await Movie.findOne({ title: req.params.moviename });
//         if (!movie) {
//             return res.status(404).json({ status: 'fail', message: 'Movie not found' });
//         }

//         // Check if the seat number is already booked
//         const isSeatTaken = movie.tickets.some(ticket => ticket.seatNumber === req.body.seatNumber);
//         if (isSeatTaken) {
//             return res.status(400).json({ status: 'fail', message: 'Seat is already booked' });
//         }

//         // Check if there are available tickets
//         if (movie.ticketsAvailable <= 0) {
//             return res.status(400).json({ status: 'fail', message: 'No tickets available' });
//         }

//         // Generate a unique ID for the ticket
//         const ticketId = new mongoose.Types.ObjectId();

//         const newTicket = {
//             _id: ticketId,
//             theatre:req.body.theatre,
//             seatNumber: req.body.seatNumber,
//             status: 'booked'
//         };

//         movie.tickets.push(newTicket);
//         movie.ticketsAvailable -= 1;  // Reduce the available tickets count
//         await movie.save();

//         // Logging the booking action
//         logger.info(`Ticket booked for movie: ${movie.title}, Seat: ${newTicket.seatNumber},theatre:${newTicket.theatre}`);

//         // Produce Kafka message
//         await produceMessage('ticket-booked', {
//             movie: movie.title,
//             theatre: newTicket.theatre,
//             seatNumber: newTicket.seatNumber,
//             user: req.user.email,
//             ticketId: ticketId.toString()
//         });

//         res.status(201).json({
//             status: 'success',
//             data: { ticket: newTicket }
//         });
//     } catch (err) {
//         logger.error('Error booking ticket: ', err);
//         res.status(400).json({ status: 'fail', message: err.message });
//     }
// };


// // User - Update ticket status
// exports.updateTicketStatus = async (req, res) => {
//     try {
//         const movie = await Movie.findOne({ title: req.params.moviename });
//         if (!movie) return res.status(404).json({ status: 'fail', message: 'Movie not found' });

//         const ticket = movie.tickets.id(req.params.ticketId);
//         if (!ticket) return res.status(404).json({ status: 'fail', message: 'Ticket not found' });

//         // Prevent status from being set to 'cancelled' in this function
//         if (req.body.status === 'cancelled') {
//             return res.status(400).json({ status: 'fail', message: 'Ticket cannot be cancelled here.' });
//         }

//         ticket.status = req.body.status; // Allow status change to 'booked' or 'checked-in'
//         await movie.save();

//         res.status(200).json({
//             status: 'success',
//             data: { ticket }
//         });
//     } catch (err) {
//         res.status(400).json({ status: 'fail', message: err.message });
//     }
// };



// // User - Cancel a ticket (delete a movie ticket)
// exports.cancelTicket = async (req, res) => {
//     try {
//         const movie = await Movie.findOne({ title: req.params.moviename });
//         if (!movie) return res.status(404).json({ status: 'fail', message: 'Movie not found' });

//         // Find the index of the ticket to be removed
//         const ticketIndex = movie.tickets.findIndex(ticket => ticket._id.toString() === req.params.id);

//         if (ticketIndex === -1) return res.status(404).json({ status: 'fail', message: 'Ticket not found' });

//         // Remove the ticket using splice
//         movie.tickets.splice(ticketIndex, 1);

//         // Increase the tickets available count
//         movie.ticketsAvailable += 1;

//         await movie.save();

//         res.status(204).json({
//             status: 'success',
//             message: 'Ticket Cancelled'
//         });
//     } catch (err) {
//         res.status(400).json({ status: 'fail', message: err.message });
//     }
// };

const Movie = require('../models/movieModel');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { produceMessage } = require('../utils/kafka');

// Admin - Get all movies
exports.getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find();
        res.status(200).json({
            status: 'success',
            results: movies.length,
            data: { movies }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Admin - Get a single movie by ID
exports.getMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({
                status: 'fail',
                message: 'No movie found with that ID'
            });
        }
        res.status(200).json({
            status: 'success',
            data: { movie }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Admin - Create a new movie
exports.createMovie = async (req, res) => {
    try {
        const { title, genre, releaseDate, rating, theatre, ticketsAvailable } = req.body;

        // Validate the number of tickets
        if (ticketsAvailable <= 0) {
            return res.status(400).json({ status: 'fail', message: 'Tickets available must be greater than 0' });
        }

        const newMovie = await Movie.create({
            title,
            genre,
            releaseDate,
            rating,
            theatre,
            ticketsAvailable
        });

        res.status(201).json({
            status: 'success',
            data: { movie: newMovie }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Admin - Update a movie by ID
exports.updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!movie) {
            return res.status(404).json({
                status: 'fail',
                message: 'No movie found with that ID'
            });
        }
        res.status(200).json({
            status: 'success',
            data: { movie }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Admin - Delete a movie by ID
exports.deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) {
            return res.status(404).json({
                status: 'fail',
                message: 'No movie found with that ID'
            });
        }
        res.status(204).json({ status: 'success', message: 'Movie Deleted' });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// User - Get movie by name
exports.getMovieByName = async (req, res) => {
    try {
        const movie = await Movie.findOne({ title: req.params.moviename });
        res.status(200).json({
            status: 'success',
            data: { movie }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Book tickets for a movie
// exports.bookTicket = async (req, res) => {
//     try {
//         const movie = await Movie.findOne({ title: req.params.moviename });
//         if (!movie) {
//             return res.status(404).json({ status: 'fail', message: 'Movie not found' });
//         }

//         // Check if the seat number is available
//         const seat = movie.tickets.find(ticket => ticket.seatNumber === req.body.seatNumber);
//         if (!seat || seat.status !== "available") {
//             return res.status(400).json({ status: 'fail', message: 'Seat is already booked' });
//         }

//         // Check if there are available tickets
//         if (movie.ticketsAvailable <= 0) {
//             return res.status(400).json({ status: 'fail', message: 'No tickets available' });
//         }

//         // Generate a unique ID for the ticket
//         const ticketId = new mongoose.Types.ObjectId();

//         const newTicket = {
//             _id: ticketId,
//             theatre: req.body.theatre,
//             seatNumber: req.body.seatNumber,
//             status: 'booked'
//         };

//         // Update the existing seat's status to "booked"
//         seat.status = 'booked';
//         movie.ticketsAvailable -= 1;  // Reduce the available tickets count
//         await movie.save();

//         res.status(201).json({
//             status: 'success',
//             data: { ticket: newTicket }
//         });
//     } catch (err) {
//         res.status(400).json({ status: 'fail', message: err.message });
//     }
// };

// Book tickets for a movie
exports.bookTicket = async (req, res) => {
    try {
        const movie = await Movie.findOne({ title: req.params.moviename });
        if (!movie) {
            return res.status(404).json({ status: 'fail', message: 'Movie not found' });
        }

        // Check if the seat number is available
        const seat = movie.tickets.find(ticket => ticket.seatNumber === req.body.seatNumber);
        if (!seat || seat.status !== "available") {
            return res.status(400).json({ status: 'fail', message: 'Seat is already booked' });
        }

        // Check if there are available tickets
        if (movie.ticketsAvailable <= 0) {
            return res.status(400).json({ status: 'fail', message: 'No tickets available' });
        }

        // Generate a unique ID for the ticket
        const ticketId = new mongoose.Types.ObjectId();

        const newTicket = {
            _id: ticketId,
            theatre: req.body.theatre,
            seatNumber: req.body.seatNumber,
            status: 'booked'
        };

        // Update the existing seat's status to "booked"
        seat.status = 'booked';
        movie.ticketsAvailable -= 1;  // Reduce the available tickets count
        await movie.save();

        // Logging the booking action
        logger.info(`Ticket booked for movie: ${movie.title}, Seat: ${newTicket.seatNumber}, Theatre: ${newTicket.theatre}`);

        // Produce Kafka message
        await produceMessage('ticket-booked', {
            movie: movie.title,
            theatre: newTicket.theatre,
            seatNumber: newTicket.seatNumber,
            user: req.user.email, // Assuming req.user.email holds the user's email
            ticketId: ticketId.toString()
        });

        res.status(201).json({
            status: 'success',
            data: { ticket: newTicket }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};





// Cancel a ticket
// User - Cancel a ticket (update ticket status to 'available')
exports.cancelTicket = async (req, res) => {
    try {
        const movie = await Movie.findOne({ title: req.params.moviename });
        if (!movie) {
            return res.status(404).json({ status: 'fail', message: 'Movie not found' });
        }

        // Find the ticket by seatNumber instead of _id
        const ticket = movie.tickets.find(t => t.seatNumber === req.params.seatNumber);
        if (!ticket) {
            return res.status(404).json({ status: 'fail', message: 'Ticket not found' });
        }

        // Check if the ticket is already available
        if (ticket.status === 'available') {
            return res.status(400).json({ status: 'fail', message: 'Ticket is already available' });
        }

        // Update the ticket status to 'available' instead of removing it
        ticket.status = 'available';

        // Increase the available tickets count
        movie.ticketsAvailable += 1;

        await movie.save();

        res.status(200).json({
            status: 'success',
            message: 'Ticket cancelled and is now available',
            data: { ticket }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};


