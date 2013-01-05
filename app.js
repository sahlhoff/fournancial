var express = require('express')
  , http = require('http')
  , config = require('./config')
  , passport = require('passport')
  , mongoose = require('mongoose')
  , User = require('./models/user')
  , util = require('util')
  , FoursquareStrategy = require('passport-foursquare').Strategy;

var FOURSQUARE_CLIENT_ID = config.secrets.clientId
var FOURSQUARE_CLIENT_SECRET = config.secrets.clientSecret;


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Foursquare profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the FoursquareStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Foursquare
//   profile), and invoke a callback with a user object.
passport.use(new FoursquareStrategy({
    clientID: FOURSQUARE_CLIENT_ID,
    clientSecret: FOURSQUARE_CLIENT_SECRET,
    callbackURL: config.secrets.redirectUrl
  },
  function(accessToken, refreshToken, profile, done) {
    var userId = profile.id;
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
          User.findOne({userId : userId }, function(err, existingUser) {
            if (err || existingUser) {
                console.log('UserId ' + userId + ' exists')
                return done(err, userId);
            }

            var user = new User({ 
                  accessToken : accessToken
                , userId : profile.id
            });

            user.save(function(err) {
                if (err) {
                    console.log(err);
                //    return res.render('profile', { 
                //        host : username,
                //        title : 'host'
                //    });
                }

                //res.redirect('/index');
            });
          }); 
      return done(null, profile);
    });
  }
));




var app = express();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'dung30nh4cks' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});


// Connect mongoose
mongoose.connect('mongodb://localhost/fournancial');

// Setup routes
require('./routes')(app);

var port = process.env.PORT || 3000;

http.createServer(app).listen(port, '127.0.0.1', function() {
    console.log("Express server listening on %s:%d in %s mode", '127.0.0.1', port, app.settings.env);
});


