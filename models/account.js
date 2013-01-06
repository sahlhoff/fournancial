var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var venueSchema = new Schema({
	createdAt: Number,
	timeZoneOffset: Number,
	venueId: String,
	venueName: String,
	lat: Number,
	lng: Number,
	category: String,
	spent: Number
})


var accountSchema = new Schema({
    userId: String,
    balance: String,
    venues: [venueSchema] 
}, { collection: 'Account' });


module.exports = mongoose.model('Account', accountSchema, 'Account');