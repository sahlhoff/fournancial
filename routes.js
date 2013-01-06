var passport = require('passport');
var csv = require('csv');
var fs = require('fs');

/*
var sankInfo = {
    fid: 1601
  , fidorg: 'Chase Bank'
  , url: 'https://onlineofx.chase.com/chase.ofx'
  , bankid: 074000010
  , user: 'lucidcreations90'
  , pass: 'Bremen321'
  , accid: 000000904381415
  , acctype: 'CHECKING'
  , date_start: 20121025 
  , date_end: 20121231 
};
*/


module.exports = function (app) {

	function ensureAuthenticated(req, res, next) {
	  if (req.isAuthenticated()) { return next(); }
	  res.redirect('/login')
	}


	app.get('/', function (req, res){
	  res.render('index', { user: req.user });
	});

/*
	app.get('/banking', function (req, res) {
		banking.getStatement(sankInfo, 'json', function(res, err){
		if(err) console.log(err)
		console.log(JSON.stringify(res, null, 2)); 
		});
	});
*/

	app.get('/account', function (req, res){
		console.log('\n\n\n' + req.body + '\n\n\n')
	  res.render('account', { user: req.body });
	});

	app.get('/login', function (req, res){
	  res.render('login', { user: req.user });
	});

	app.post('/login', function (req, res) {

	});

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
	



	app.get('/create', function (req, res) {
		res.render('create', {user: req.user})
	});


	app.post('/create',  function (req, res) {

		user = req.body


		var myUser = {
			  user: user.handle
			, pass: user.password1
			, acctype: user.acctype

		}

	    var temp_path = req.files.upload.path;
	    var save_path = './public/QIF/' + req.files.upload.name;
	     
	    fs.rename(temp_path, save_path, function(error){
	     	if(error) throw error;
	     	
	     	fs.unlink(temp_path, function(){
	     		if(error) throw error;
	     	});
	     	
	    });        

	    var account = [];

		csv()
		.from.path(save_path)
		.on('record', function(data, index){
		    var object = {};

		    
		    object['date'] = data[1];
		    object['amount'] = data[3];

		    account.push(object);
		})
		.on('end', function(count, data){
		    console.log('Number of lines: '+ count);
		    console.log(account);
		})
		.on('error', function(error){
		    console.log(error.message);
		});


		
		res.render('account', {accounts: account});
	});

}