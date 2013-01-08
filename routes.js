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

	function ToLocalDate (inDate) {
	    var date = new Date();
	    date.setTime(inDate.valueOf() - 60000 * inDate.getTimezoneOffset());
	    return date;
	}

	function updateAccount(req, res) {
		var userId, accessToken;
		userId = req.session.userId;
		accessToken = req.session.accessToken;

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

						var d = new Date(0); 
						d.setUTCSeconds(object.createdAt);

						account.checkinId = object.id;
						account.userId = userId;
						account.date = d;
						account.menu = object.venue.menu;
						account.createdAt = object.createdAt;
						account.timeZoneOffset = object.timeZoneOffset;
						account.venueId = object.id;
						account.venueName = object.venue.name;
						account.lat = object.venue.location.lat;
						account.lng = object.venue.location.lng;
						account.category = category;

		            	myAccount = new Account(account);

		            	myAccount.save(function(err) {
							if(err){
								console.log(err)
							}
							
						})

		            	
					}	

					res.redirect('/account');
				}



			});

	}




/*========================= Account ==========================*/



	app.get('/', function (req, res){
	  res.render('index', { layout: 'loginlayout' });
	});



	app.get('/account', ensureAuthenticated, function (req, res){
		account = [];

		var userId = req.session.userId;
		
		var query = Account.find({userId:userId});
		query.exec(function(error, docs){

			var userQuery = User.find({userId:userId});
				userQuery.exec(function(err, user) {

					res.render('account', {account: docs, user: user, balance: user[0].balance})

				});
		});

	
	});


	app.post('/save', function(req, res) {

	  Account.update({checkinId:req.body.checkinId}, {$inc: { spent: req.body.value }}, {upsert: true}, function(err){
	  	if(err){console.log(err)}
	  })

	  User.update({userId:req.session.userId}, {$inc: { balance: req.body.value }}, {upsert: true}, function(err){
	  	if(err){console.log(err)}
	  
	  		var userQuery = User.find({userId:req.session.userId});
				userQuery.exec(function(err, user) {

					res.contentType('json');

	  				res.send({ balance: user[0].balance});

				});

	  })
	  

	  

	  	});

/*=========================== Map ===============================*/

	app.get('/map', ensureAuthenticated, function (req, res){
		account = [];

		var userId = req.session.userId;
		
		var query = Account.find({userId:userId});
		query.exec(function(error, docs){

			var userQuery = User.find({userId:userId});
				userQuery.exec(function(err, user) {

					res.render('map', {account: docs, user: user, layout: 'maplayout'})

				});
		});

	
	});



/*=========================== spending ===============================*/




	app.get('/spending', ensureAuthenticated, function (req, res){
		account = [];
		var category;

		var userId = req.session.userId;
		
		var query = Account.find({userId:userId});
		query.exec(function(error, docs){

			var userQuery = User.find({userId:userId});
				userQuery.exec(function(err, user) {

					res.render('spending', {account: docs, user: user, layout: 'spendinglayout'})

				});
		});

	
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
								  user: req.user,
								  layout: 'createlayout'
							})
	});


	app.post('/create', function (req, res) {


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




