var passport = require('passport')
	, csv = require('csv')
	, fs = require('fs')
	, User = require('./models/user')
	, config = require('./config')
	, Account = require('./models/account');


	var config = {
  'secrets' : {
    'clientId' : config.secrets.clientId,
    'clientSecret' : config.secrets.clientSecret,
    'redirectUrl' : config.secrets.redirectUrl
  }
}

var foursquare = require('node-foursquare')(config);



module.exports = function (app) {

	function ensureAuthenticated(req, res, next) {
	  if (req.isAuthenticated()) { return next(); }
	  res.redirect('/')
	}

	function updateAccount(req, res, next){
		var userId, accessToken;

		userId = req.session.userId;
		accessToken = req.session.accessToken;

		Account.findOne({userId: userId}, function(err, doc) {
			if(err){console.log(err)}
			if(doc){
				console.log(doc);
			}
		})
		
		/*
		var accessToken, userId;

		User.findOne({ userId: user}, function (err, doc){
			if(err){console.log(err)}
			if(doc){
				accessToken = doc.accessToken;
				req.session.accessToken = accessToken;
			}

			console.log(req.session);


			foursquare.Users.getCheckins(user, null, accessToken, function(err, data) {
				if(err){console.log(err)}
				else {
				return(data);
			}
			});

		});
		
		*/	
		res.redirect('/account');
	}




/*========================= Account ==========================*/



	app.get('/', function (req, res){
	  res.render('index', { layout: 'loginlayout' });
	});







	app.get('/account', ensureAuthenticated, function (req, res){

		
		console.log(req.session)
		
		res.render('account', { layout: 'layout' })
	});








/*=========================== Login ===============================*/


	app.get('/login', function (req, res){
	  res.render('login', { 
	  						 layout: 'loginlayout'
	  					   });
	});

	app.post('/login', passport.authenticate('local'), 
		function(req, res) {
			var accessToken;

			User.findOne({ userId: req.user}, function (err, doc){
			if(err){console.log(err)}
			if(doc){
				accessToken = doc.accessToken;
				req.session.accessToken = accessToken;
				req.session.userId = req.user;
			}

			updateAccount(req, res);
		});
	});





/*======================== Auth =============================*/


	app.get('/auth/foursquare', passport.authenticate('foursquare'),
	  function(req, res){
	    // The request will be redirected to Foursquare for authentication, so this
	    // function will not be called.
	  });


	app.get('/auth/foursquare/callback', passport.authenticate('foursquare', { failureRedirect: '/' }),
	  function(req, res) {
	    res.redirect('/create');
	  });

	app.get('/logout', function (req, res){
	  req.logout();
	  res.redirect('/');
	});



//========================Create Account=====================//
	

	app.get('/create', ensureAuthenticated, function (req, res) {
		res.render('create', {
								  user: req.user
							})
	});


	app.post('/create', function (req, res) {
		console.log(req);

		var handle, password;

		handle = req.body.handle;
		pass = req.body.password1;


		User.findOne({ userId: req.user.id }, function (err, doc){
		  doc.handle = handle;
		  doc.pass = pass;
		  doc.save();

		  req.session.accessToken = doc.accessToken;
		  req.session.userId = doc.userId;



		});

		updateAccount(req, res);

	});

}




