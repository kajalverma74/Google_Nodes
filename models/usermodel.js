
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    githubId: {
        type: String,
        required: false,
        default: null,
    },
    googleId: {
        type: String,
        required: false,
        default: null,
    },
    username: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        sparse: true, // Allows for null values to be treated as unique
        default: null,
    },
    facebookId: {
        type: String,
    }
});

// Create a sparse index for googleId
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

// Create a compound index for githubId and googleId
userSchema.index({ githubId: 1, googleId: 1 }, { unique: true, sparse: true });


module.exports = mongoose.model('User', userSchema);

