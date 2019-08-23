var express 				= require("express"),
	app 					= express(),
	bodyParser 				= require("body-parser"),
	mongoose				= require("mongoose"),
	passport 				= require("passport"), // Middleware
	passportLocalMongoose 	= require("passport-local-mongoose"),
	LocalStrategy 			= require("passport-local"),
	socket					= require("socket.io"),
	util = require("util"),
    fs = require('fs'),
    os = require('os'),
    url = require('url');

// Models For User
var User = require("./models/user");
var appRoot = require('app-root-path');
const morgan = require('morgan');
const winston = require('./winston/config');
app.use(morgan('combined', { stream: winston.stream }));
winston.info('You have successfully started working with winston and morgan');


mongoose.connect("mongodb://localhost:27017/techno", {useNewUrlParser : true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));


// Passport Configuration
app.use(require("express-session")({
	secret: "Rusty Wins Again!",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =================
// SETUP FOR SOCKET
// =================
var server = app.listen(3000, function(){
	console.log("The Musics Already Started!");
});
var io = socket(server);
var clients =[];
    io.sockets.on('connection', function (socket) {
        socket.on('storeClientInfo', function (data) {
            var clientInfo = new Object();
            clientInfo.customId     = data.customId;
            clientInfo.clientId     = socket.id;
			clients.push(clientInfo);
			console.log(clients);
		});
		socket.on("selection", function(data){
			socket.broadcast.emit("opponentSelection", data);
		});
        socket.on('disconnect', function (data) {
            for( var i=0, len=clients.length; i<len; ++i ){
                var c = clients[i];
                if(c.clientId == socket.id){
                    clients.splice(i,1);
                    break;
                }
            }
        });
    });

var levelNames = ['square', 'nonogram2', 'poll','nonogram', 'light','invisible','alphabet','crack','people','digits','logic34', 'pi'];

// ==================
// ROUTES FOR LEVELS
// ==================
app.get("/", function(req, res){
	res.sendFile(__dirname + "/public/home.html");
});

app.get("/level", isLoggedIn, function(req, res){
	var user = req.user;
	var level = user.currentLevel;
	if(level <= levelNames.length)
		res.sendFile(__dirname + "/public/" + levelNames[level - 1] +".html");
	else {
		console.log(user);
		res.send("GAME OVER");
	}

});

app.get("/building", isLoggedIn, function(req, res){
	var user = req.user;
	res.render("25floor.ejs", {user: user});
});

app.get('/getPass',function(req,res) {
	User.find({}).exec(function(err,users) {
		if(err) throw err;
		res.render('getpass.ejs',{"users" : users});
	});
});

// ============
// THE POST ROUTES
// ============
app.post("/invisible", function(req, res){
	var answer = req.body.answer;
	var user = req.user;
	if(answer.toLowerCase() == "german"){
		user.currentLevel += 1;
		user.score += 5;
		user.save();
 		res.redirect("/level");
	} else {
		user.score -= 5;
		user.save();
		res.redirect("/level");
	}
});

app.post("/light", function(req, res){
	var divId = req.body.divId;
	var user = req.user;
	if(divId == "div3"){
		user.currentLevel += 1;
		user.score += 5;
		user.save();
 		res.redirect("/level");
	} else {
		user.score -= 5;
		user.save();
		res.redirect("/level");
	}
});

app.post("/logic34", function(req, res){
	var clickCount = req.body.counter;
	var user = req.user;
	var newScore = (1/(clickCount-23))*5;
	user.currentLevel += 1;
	user.score += newScore;
	user.save();
	res.redirect("/level");
});

app.post("/alphabet", function(req, res){
	var answer = req.body.answer;
	var user = req.user;
	if(answer.toLowerCase() == "ha"){
		user.currentLevel += 1;
		user.score += 5;
		user.save();
 		res.redirect("/level");
	} else {
		user.score -= 5;
		user.save();
		res.redirect("/level");
	}
});

app.post("/crack", function(req, res){
	var x = req.body.x;
	var y = req.body.y;
	var z = req.body.z;
	var user = req.user;
	if(x == 0 && y== 4 && z == 2) {
		user.currentLevel += 1;
		user.score += 5;
		user.save();
		res.redirect("/level");
	} else {
		user.score -= 5;
		user.save();
		res.redirect("/level");
	}
});

app.post("/people", function(req, res){
	var user = req.user;
	var chosenPerson = req.body.chosenPerson;
	if(chosenPerson == "person13") {
		user.currentLevel += 1;
		user.score += 5;
		user.save();
		res.redirect("/level");
	} else {
		user.score -= 5;
		user.save();
		res.redirect("/level");
	}
});

app.post("/digits", function(req, res){
	var user = req.user;
	var form = req.body.form;
	if(form == "correct") {
		user.currentLevel += 1;
		user.score += 5;
		user.save();
		res.redirect("/level");
	} else {
		user.score -= 5;
		user.save();
		res.redirect("/level");
	}
});

app.post("/pi", function(req, res){
	var user = req.user;
	var answer = req.body.answer;
	if(answer.toLowerCase() == "pi") {
		user.currentLevel += 1;
		user.score += 5;
		user.save();
		res.redirect("/level");
	} else {
		user.score -= 5;
		user.save();
		res.redirect("/level");
	}
});

app.post("/nonogram1", function(req, res){
	var user = req.user;
	var answer = req.body.answer;
	if(answer == "1111011110110000001100001") {
		user.currentLevel += 1;
		user.score += 5;
		user.save();
		res.redirect("/level");
	} else {
		user.score -= 5;
		user.save();
		res.redirect("/level");
	}
});

app.post("/nonogram2", function(req, res){
	var user = req.user;
	var answer = req.body.answer;
	if(answer == "1111101111111100011111001000100100011100010100100111101011011111100111101100101110000001111001110111") {
		user.currentLevel += 1;
		user.score += 5;
		user.save();
		res.redirect("/level");
	} else {
		user.score -= 5;
		user.save();
		res.redirect("/level");
	}
});

app.post("/poll", function(req, res){
	var user = req.user;
	var answer = req.body.answer;
	if(answer == "122233123334122534111544555544") {
		user.currentLevel += 1;
		user.score += 5;
		user.save();
		res.redirect("/level");
	} else {
		user.score -= 5;
		user.save();
		res.redirect("/level");
	}
});

app.post("/square", function(req, res){
	var user = req.user;
	var c = req.body.c;
	if(c == 15) {
		user.currentLevel += 1;
		user.score += 5;
		user.save();
		res.redirect("/level");
	} else if(c == 14) {
		user.currentLevel += 1;
		user.score += 2.5;
		user.save();
		res.redirect("/level");
	} else {
		user.score -= 5;
		user.save();
		res.redirect("/level");
	}
});

// ==================
// ROUTES FOR AUTH
// ==================
app.get("/register", function(req, res){
	console.log('Hello World')
	res.sendFile(__dirname + "/public/register.html");
});

app.post("/register", function(req, res){
	var newUser = new User({username: req.body.username, hint1: false, hint2: false, currentLevel: 1, score: 0,attempts: 0});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.sendFile(__dirname + "/public/register.html");
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/");
		});
	});
});

app.get("/login", function(req, res){
	res.sendFile(__dirname + "/public/login.html");	
});

app.post("/login", passport.authenticate("local", {
	successRedirect: "/level",
	failureRedirect: "/login"
}), function(req, res){
	
});

app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

// ==================
// Route For * And Listener
// ==================
app.get("*", function(req, res){
	res.send("This Page Does Not Exist You Fool!");
});