const mongoose = require('mongoose');

const UserRoomsSchema = new mongoose.Schema({
    name : {type: String, required: true}
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
    balance: {
        type:Number,
        default: 0
    },
    rooms : [UserRoomsSchema]
}, {timestamps: true});

module.exports = mongoose.model('User', UserSchema);