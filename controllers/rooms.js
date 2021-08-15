const Rooms = require('../models/rooms');
const Users = require('../models/users');

// Creating a new room
// @POST req with room name and creating user
// Redirect '/' after pushing a room in Rooms and updating rooms info in Users
module.exports.Create = async (req, res) => {
    try {
        const room = await Rooms.create({name: req.body.name, members: [{_id : req.user._id, name : req.user.name}]});
        await Users.findByIdAndUpdate(req.user._id, {$push: {rooms: {name: room.name, _id: room._id}}});    // storing room info in Users
        res.redirect(`/`);
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Server Error'});
    }
}

// Getting info of a room => transactions and users
// @GET req param - roomId
// Returns room
module.exports.Home = async (req, res) => {
    try {
        const room = await Rooms.findById(req.params.roomId);
        res.send(room);
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Server Error'});
    }
}

// Letting user join a room
// @GET req param - roomId
// Redirect '/'
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

        const room = await Rooms.findByIdAndUpdate(req.query.roomId, {$push : {members : {_id : req.user._id, name : req.user.name}}});
        if (!room) {
            res.status(204).json({msg: "Not Found"});
            return;
        }
        await Users.findByIdAndUpdate(req.user._id, {$push: {rooms: {name: room.name, _id: room._id}}});    // storing room info in Users
        res.redirect('/');
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Server Error'});
    }
}

// Adding a transaction to a room and updating user balance resp.
// @POST : transactions, roomId
// Redirect '/home/roomId'
module.exports.AddTransaction = async (req, res) => {
    const new_transaction = req.body.transaction;
    // console.log(new_transaction);
    const roomId = req.body.roomId;
    try {
        const room = await Rooms.findById(roomId);
        room.transactions.push(new_transaction);

        const updateMember = (members, id, amt, val = 1) => {
            for (let member of members)
                if (member._id == id)
                    member.balance += parseInt(amt) / val;
        }

        updateMember(room.members, new_transaction.from, new_transaction.amt);
        for (let m of new_transaction.to) updateMember(room.members, m, -new_transaction.amt, new_transaction.to.length);
        await room.save();

        res.redirect('/home/'+roomId);
    }catch (e) {
        console.error(e);
        res.status(501).json({error:'Server Error'});
    }
}