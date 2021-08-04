const Rooms = require('../models/rooms');
const Users = require('../models/users');

module.exports.Create = async (req, res) => {
    try {
        const room = await Rooms.create({name: req.body.name, members: [req.user._id]});
        await Users.findByIdAndUpdate(req.user._id, {$push: {rooms: {name: room.name, _id: room._id}}});
        res.redirect(`/`);
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Server Error'});
    }
}


module.exports.Home = async (req, res) => {
    try {
        const room = await Rooms.findById(req.params.roomId).select('members transactions');
        const users = await Users.find({_id : {$in: [room.members]}}).select('name balance');   // sending only users id(by default), name and balance
        res.send({transactions: room.transactions, users: users});
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Server Error'});
    }
}