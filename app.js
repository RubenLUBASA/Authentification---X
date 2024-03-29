global.express = require('express');
global.app = express();
global.ejs = require('ejs');
global.passport = require('passport');
global.twitterStrategy = require('passport-twitter').Strategy;
global.session = require('express-session');
global.config = require('./config.js');

passport.use(new twitterStrategy({
    consumerKey: config.consumerKey,
    consumerSecret: config.consumerSecret,
    callbackURL: config.callbackURL,
},
    function (accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

const checkAuth = function (req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/twitter');
};

app.set('views', __dirname + '/X');
app.set('view engine', 'ejs');

app.use(session({ secret: config.secret, resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function (req, res) {
    if (req.isAuthenticated()) res.redirect('/profile'); 
    res.render('index'); 
});

app.get('/profile', checkAuth, function (req, res) {
    res.render('profile', { user: req.user });
});

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/callback',
    passport.authenticate('twitter', { failureRedirect: '/' }),
    function (req, res) {
        res.redirect('/profile');
    }
);

app.get("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err);
        res.redirect("/");
    });
});

app.listen(config.port, function () {
    console.log('Listening on port', config.port);
});