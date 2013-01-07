var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var accountSchema = new Schema({
    userId: String,
    checkinId: {type: String, unique: true},
    balance: { type: Number, default: 0},
    createdAt: Number,
	menuType: String,
	menuUrl: String,
	menuMobilUrl: String,
	timeZoneOffset: Number,
	venueId: String,
	venueName: String,
	lat: Number,
	lng: Number,
	category: [String],
	menu: {
		type: { type: String, default: 'undefined'},
		url: { type: String, default: 'undefined'},
		mobileUrl: { type: String, default: 'undefined'}
	},
	spent: { type: Number, default: 0}
}, { collection: 'Account' });


module.exports = mongoose.model('Account', accountSchema, 'Account');