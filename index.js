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

// app.use((req, res, next) => {setTimeout(next, 1000)});
app.use(express.urlencoded());
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.use(session({
    name: 'expenseViz', // name of the key
    secret: 'HashFunction',    // cookie is encrypted using this key
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: 1000 * 60 * 100},   // this cookie will expire in 100min
    store: new MongoStore({
        mongoUrl: "mongodb+srv://testUser:testPass@cluster0.njsgk.mongodb.net/test?retryWrites=true&w=majority",
        autoRemove: 'false'
    })
}));
app.use(passport.initialize());
app.use(passport.session());

app.post('/register', LoginController.Register);
app.post('/sign-in', passport.authenticate('local', {failureRedirect: 'back'}), LoginController.SignIn);
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

app.listen(process.env.PORT || port , (err) => {
    if (err) console.log(`Error starting the server ${err}`);
    console.log(`Server is running on localhost:${port}`);
})