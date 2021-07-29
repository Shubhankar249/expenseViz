const User = require('../models/users');

module.exports.Register = async (req, res) => {
    try {
        // console.log(req.body);
        const user = await User.findOne({email: req.body.email});
        if (user) return res.send('User already exists!');
        await User.create(req.body);
        res.redirect('/');
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Server Error'});
    }
}

// module.exports.signin = function (req, res) {
//     return res.redirect('posts');
// }
// module.exports.signOut = function (req, res) {
//     req.logOut();
//     return res.redirect('/');
// }