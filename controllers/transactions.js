const Rooms = require('../models/rooms');
const Users = require('../models/users');


module.exports.AddTransaction = async (req, res) => {
    const new_transaction = req.body.transaction;
    const roomId = req.body.roomId;
    try {
        await Rooms.findByIdAndUpdate(roomId, {$push : {transactions : new_transaction}});
        await Users.findByIdAndUpdate(new_transaction.from, {$inc: {balance: 0 - parseInt(new_transaction.amt)}});
        await Users.findByIdAndUpdate(new_transaction.to, {$inc: {balance: parseInt(new_transaction.amt)}});
        res.redirect('/home/'+roomId);
    }catch (e) {
        console.error(e);
        res.status(501).json({error:'Server Error'});
    }
}