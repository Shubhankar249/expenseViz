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
        let users = [];
        for (const member of room.members) {
            const user = await Users.findById(member).select('name balance');
            users.push(user);
        }
        res.send({transactions: room.transactions, users: users});
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Server Error'});
    }
}

module.exports.Join = async (req, res) => {
    try {
        const isRoomAdded = () => {
            for (const room of req.user.rooms)
                if (room._id == req.query.roomId) return true;

            return false;
        };

        if (isRoomAdded()) {
            res.redirect('/');
            return;
        }

        const room = await Rooms.findByIdAndUpdate(req.query.roomId, {$push : {members : req.user._id}});
        if (!room) {
            res.status(204).json({msg: "Not Found"});
            return;
        }
        await Users.findByIdAndUpdate(req.user._id, {$push: {rooms: {name: room.name, _id: room._id}}});
        res.redirect('/');
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Server Error'});
    }
}