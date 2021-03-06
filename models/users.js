const mongoose = require('mongoose');

const UserRoomsSchema = new mongoose.Schema({
    name : {type: String, required: true},
});

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    rooms : [UserRoomsSchema]
}, {timestamps: true});

module.exports = mongoose.model('User', UserSchema);