const Transactions = require('../models/transactions');
const Users = require('../models/users');

module.exports.Home = async (req, res) => {
    try {
        const transactions = await Transactions.find();
        const users = await Users.find().select('name balance');   // sending only users id(by default), name and balance
        res.send({transactions: transactions, users: users});
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Server Error'});
    }
}

module.exports.AddTransaction = async (req, res) => {
    let new_transaction = req.body;
    try {
        await Transactions.create(new_transaction);
        await Users.findByIdAndUpdate(new_transaction.from, {$inc: {balance: 0 - parseInt(new_transaction.amt)}});
        await Users.findByIdAndUpdate(new_transaction.to, {$inc: {balance: parseInt(new_transaction.amt)}});
        res.redirect('/home');
    }catch (e) {
        console.error(e);
        res.status(501).json({error:'Server Error'});
    }
}