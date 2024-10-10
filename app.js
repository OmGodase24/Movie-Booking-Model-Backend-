const express = require('express');
const morgan = require('morgan');
const userRouter = require('./Routes/userRoutes');
const adminMovieRouter = require('./Routes/adminMovieRoutes');
const userMovieRouter = require('./Routes/userMovieRoute');
const cors = require('cors')

const app = express();


// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
// Routes
app.use('/api/v1.0/moviebooking', userRouter);
app.use('/api/v1.0/moviebooking/admin', adminMovieRouter);
app.use('/api/v1.0/moviebooking', userMovieRouter);

module.exports = app;
