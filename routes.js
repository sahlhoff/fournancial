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







/*=========================== helpers=============================*/


	function ensureAuthenticated(req, res, next) {
	  if (req.isAuthenticated()) { return next(); }
	  res.redirect('/')
	}


	function updateAccount(req, res) {
		var userId, accessToken;
		userId = req.session.userId;
		accessToken = req.session.accessToken;

		console.log('in get all')
		foursquare.Users.getCheckins(userId, null, accessToken, function(err, data) {
				if(err){console.log(err)}
				else {
					items = data.checkins.items;
					for (i in items){	
						var object, categories, objectCategory, objectId, mgmt;
						var category = [];
						var account = {};


		            	object = items[i];


		                categories = object.venue.categories;

						category = [];
						for(e in categories){
							objectCategory = categories[e];
							category[e] = objectCategory.name;
						}

						account.checkinId = object.id;
						account.userId = userId;
						account.menu = object.venue.menu;
						account.createdAt = object.createdAt;
						account.timeZoneOffset = object.timeZoneOffset;
						account.venueId = object.id;
						account.venueName = object.venue.name;
						account.lat = object.venue.location.lat;
						account.lng = object.venue.location.lngr;
						account.category = category;
		            	
		            	myAccount = new Account(account);

		            	myAccount.save(function(err) {
							if(err){
								console.log(err)
							}
						})

		            	objectId = account.id


						Account.findOne({checkinId : objectId }, function(err, existingAccount) {
				            if(existingAccount === null) {
				            	console.log('existingAccount ' + existingAccount + ' shit')
				            		console.log
					            	account = new Account(account);
					            	account.save(function(err) {
										if(err){
											console.log(err)
										}
									})
					            
							}
					
						});


					}	
				}

			});
	res.redirect('/account');
	}




/*========================= Account ==========================*/



	app.get('/', function (req, res){
	  res.render('index', { layout: 'loginlayout' });
	});







	app.get('/account', ensureAuthenticated, function (req, res){


		var userId = req.session.userId;
		Account.find({userId: userId}.limit(20), function(err, doc) {
			if(err){console.log(err)}
			res.render('account', { 
									layout: 'layout'
									, account: doc 
								});
		})
	
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




