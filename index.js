const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const LoginController = require('./controllers/login');
const RoomController = require('./controllers/rooms');

const passport = require('passport');
const passportLocal = require('./config/passportLocal');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const port = 9000;

const app = express();
connectDB();

// app.use((req, res, next) => {setTimeout(next, 0)});
app.use(express.urlencoded());
app.use(express.json());
app.use(cors());

app.use(session({
    name: 'expenseViz', // name of the key
    secret: 'HashFunction',    // cookie is encrypted using this key
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},   // this cookie will expire in 30days
    store: new MongoStore({
        mongoUrl: process.env.MONGO_URI,
        autoRemove: 'false'
    })
}));

app.use(passport.initialize());
app.use(passport.session());

app.post('/sign-in', passport.authenticate('local', {failureRedirect: 'back'}), LoginController.SignIn);
app.post('/register', LoginController.Register);

app.use('/', (req, res, next) => {
    if (req.user) next();
    else res.sendFile(__dirname + '/public/signin.html');
});
app.use(express.static('public'));

app.get('/sign-out', LoginController.SignOut);

app.get('/get-user', (req, res) => {
    let user = req.user;
    if (user) {
        user = {_id: user._id, name: user.name, rooms: user.rooms};
        res.send(user);
        return;
    }
    res.status(204).json("Not Signed In");
});

app.get('/home/:roomId', RoomController.Home);
app.post('/create-room', RoomController.Create);
app.get('/join-room/', RoomController.Join);
app.post('/transaction', RoomController.AddTransaction);

app.listen(process.env.PORT || port, (err) => {
    if (err) console.log(`Error starting the server ${err}`);
    console.log(`Server is running on localhost:${port}`);
})