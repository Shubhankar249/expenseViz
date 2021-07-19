const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const port = 9000;

const app = express();

connectDB();
app.use((req, res, next) => {setTimeout(next, 1000)});
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const transactions = [], balance = [0, 0, 0, 0, 0, 0, 0, 0, 0];

app.get('/home', (req, res)=> {
    // console.log("Req came sending", {transactions : transactions, balance: balance});
    res.send({transactions : transactions, balance: balance});
});


app.post('/transaction', (req, res)=> {
    let new_transaction = req.body;
    console.log(new_transaction);
    transactions.push(new_transaction);

    balance[new_transaction.from] -= parseInt(new_transaction.amt);
    balance[new_transaction.to] += parseInt(new_transaction.amt);

    res.redirect('/home');
});

app.listen(port, (err) => {
    if (err) console.log(`Error starting the server ${err}`);
    console.log(`Server is running on localhost:${port}`);
})