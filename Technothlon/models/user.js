var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	currentLevel: Number,
	score: Number,
	hint1: Boolean,
	hint2: Boolean,
	attempts: Number,
	socketid: Number
}, {timestamps: true});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);