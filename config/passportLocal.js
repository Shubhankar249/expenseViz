const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/users');

// authentication using passport
passport.use(new LocalStrategy({
        usernameField: 'email'
    },
     function (email, password, done) { // verifying the user with passed on info from post req during sign-in
    User.findOne({email: email}, function (err, user) {
            if (err) {
                console.error(err);
                return done(err);
            }
            if (!user || user.password !== password) {
                console.log('Invalid Username/ Password');
                return done(null, false);
            }
            return done(null, user);
        });
    }
));

// serializing function - decide which key is to kept in the cookies
passport.serializeUser(function (user, done) {
    done(null, user._id);
});

// deserializing user - key to be used to authenticate coming from cookies
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        if (err) {
            console.error(err);
            return done(err);
        }
        if (!user) {
            console.log('Wrong Credentials');
            return done(null, false);
        }
        return done(null, user);
    })
});

// authenticate the session -> if user has signed-in or not
passport.checkAuthentication = function (req, res, next) {  // the created func will be a middleware used on req which need the user to be signed-in
    if (req.isAuthenticated()) {
        return next();  // if user is signed-in call the next method/action
    }
    res.redirect('/');
}

module.exports = passport;