const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true,
    },
    to: {
        type:String,
        required: true
    },
    amt: {
        type:Number,
        required: true
    },
    date: {
        type:Date
    }
});

const RoomSchema = new mongoose.Schema({
    name : {type: String, required: true},
    members : [String],
    transactions : [TransactionSchema],
}, {timestamps: true});

module.exports = mongoose.model('Rooms', RoomSchema);