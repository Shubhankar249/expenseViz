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

module.exports = mongoose.model('Transactions', TransactionSchema);