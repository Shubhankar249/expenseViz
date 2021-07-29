const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const HomeController = require('./controllers/transactions');
const LoginController = require('./controllers/login');

const port = 9000;

const app = express();
connectDB();

app.use((req, res, next) => {setTimeout(next, 1000)});
app.use(express.urlencoded());
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.get('/home', HomeController.Home);

app.post('/transaction', HomeController.AddTransaction);
app.post('/register', LoginController.Register);

app.listen(port, (err) => {
    if (err) console.log(`Error starting the server ${err}`);
    console.log(`Server is running on localhost:${port}`);
})