var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var userSchema = new Schema({
    userId: String,
    accessToken : String
}, { collection: 'User' });


module.exports = mongoose.model('User', userSchema, 'User');