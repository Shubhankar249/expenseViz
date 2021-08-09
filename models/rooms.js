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

const MemberSchema = new mongoose.Schema({
    name : String,
    balance: {type: Number, default: 0}
})

const RoomSchema = new mongoose.Schema({
    name : {type: String, required: true},
    members : [MemberSchema],
    transactions : [TransactionSchema],
}, {timestamps: true});

module.exports = mongoose.model('Rooms', RoomSchema);