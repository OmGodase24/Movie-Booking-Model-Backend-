const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

// Utility function to create JWT
const createSendToken = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(statusCode).json({
        status: 'success',
        token,
        role: user.role, // Include user role in the response
        data: {
            user
        }
    });
};


// // Register a new user
// exports.register = async (req, res) => {
//     try {
//         const { firstName, lastName, email, password, confirmPassword, contactNumber, roles } = req.body; // Change role to roles
        
//         // Create unique loginId (you can enhance this logic if needed)
//         const loginId = firstName.toLowerCase() + Date.now();

//         // Create a new user with firstName, lastName, etc.
//         const newUser = await User.create({
//             firstName,
//             lastName,
//             loginId, // Add loginId
//             email,
//             password,
//             confirmPassword,
//             contactNumber,
//             role: roles || 'user'// Ensure you are setting the role here
//         });

//         // Further processing (like sending token, etc.)
//         createSendToken(newUser, 201, res);
//     } catch (error) {
//         res.status(400).json({
//             status: 'fail',
//             message: error.message
//         });
//     }
// };

exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, contactNumber, role } = req.body;

        // Check if password and confirmPassword are the same
        if (password !== confirmPassword) {
            return res.status(400).json({
                status: 'fail',
                message: 'Passwords do not match!'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'fail',
                message: 'Email is already in use!'
            });
        }

        // Generate unique loginId based on firstName and current timestamp
        const loginId = firstName.toLowerCase() + Date.now();

        // Create new user
        const newUser = await User.create({
            firstName,
            lastName,
            loginId,
            email,
            password, // Only password will be hashed, confirmPassword is not saved
            contactNumber,
            role: role || 'user' // Default role is 'user'
        });

        // Send token to the user
        createSendToken(newUser, 201, res);
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};




// Login a user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if firstName and password are provided
        if (!email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide email and password!'
            });
        }

        // Check if user exists and password is correct
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Incorrect email or password!'
            });
        }

        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};


// Forgot password
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: 'There is no user with that email address.' });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetURL = `${req.protocol}://${req.get('host').replace(':3000', ':4200')}/reset-password/${resetToken}`;
        const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Your password reset token (valid for 10 minutes)',
                message
            });

            res.status(200).json({
                status: 'success',
                message: 'Token sent to email!'
            });
        } catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                status: 'fail',
                message: 'There was an error sending the email. Try again later!'
            });
        }
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};



// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: 'fail',
                message: 'Token is invalid or has expired'
            });
        }
        console.log(req.body.password);

        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};
