const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Define the User schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please provide your first name!']
    },
    lastName: {
        type: String,
        required: [true, 'Please provide your last name!']
    },
    loginId: {
        type: String,
        unique: true,
        required: [true, 'Please provide a login ID!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false // Ensures the password is not returned in queries
    },
    contactNumber: {
        type: String,
        required: [true, 'Please provide your contact number'],
        validate: {
            validator: function (el) {
                return /^[0-9]{10}$/.test(el); // Validate for 10-digit contact number
            },
            message: 'Contact number must be a 10-digit number!'
        }
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
        required: true
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date
});

// Method to compare passwords
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to check if password was changed after JWT issued
userSchema.methods.isPasswordChanged = function (jwtIat) {
    if (this.passwordChangedAt) {
        const passwordChangedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return jwtIat < passwordChangedTimestamp;
    }
    // If passwordChangedAt is not set, assume password has not been changed
    return false;
};

// Middleware to hash the password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

// Check if the model already exists before defining it again
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
