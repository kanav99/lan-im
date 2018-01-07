var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var multer = require('multer');
var upload = multer();
var cookieParser = require('cookie-parser');

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/img', express.static(__dirname + '/img'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(upload.array());
app.use(cookieParser());

app.get('/' , function ( req , res ){
	res.sendFile( __dirname + '/html/index.htm');
});

app.post('/chat' , function ( req , res ){
	if(fs.existsSync('users/' + req.body.username + '.json'))
	{
		var creds = JSON.parse(fs.readFileSync('users/' + req.body.username + '.json', 'utf8'));
		if(creds.pwd == req.body.pwd) {
			if(req.body.remember == 'on')
				res.cookie('username', req.body.username , {maxAge : 31536000000});
			else
				res.cookie('username', req.body.username);
			res.sendFile( __dirname + '/html/chatroom.htm');
		}
		else
			res.redirect('/?valid=no');
	}
	else {
		res.redirect('/?valid=exist');
	}
});

app.post('/profile' , function ( req , res ){
	if(fs.existsSync('users/' + req.body.username + '.json'))
	{
		res.redirect('/?valid=nousername');
	}
	else {
		fs.writeFile('users/' + req.body.username + '.json' , JSON.stringify(req.body) );
		res.redirect('/?valid=loginagain');
	}
})
app.get('/chat', function( req, res){
	res.sendFile(__dirname + '/html/chatroom.htm');
})

io.on('connection' , function(socket){
	var current_username;
	console.log('connection!');
	socket.on('newUser', function(msg){
		current_username = msg;
		var data = JSON.parse(fs.readFileSync('users/' + msg + '.json', 'utf8'))
		socket.emit('yourInfo' , data);
		console.log(msg + ' connected!');
	});
	socket.on('newFriendRequest', function(friendRequest){
		console.log('New friendRequest from ' + friendRequest.from + ' to '+ friendRequest.to);
		fs.readFile('users/' + friendRequest.to + '.json', function( err, data){
			var userTo = JSON.parse(data);
			if(userTo.pendingRequests == undefined)
				userTo.pendingRequests = [];
			userTo.pendingRequests.push(friendRequest.from);
			fs.writeFile('users/' + friendRequest.to + '.json' , JSON.stringify(userTo));
		});
	});
	socket.on('toserver', function(msgObj) {
		console.log("New Message from " + msgObj.from + ' to '+ msgObj.to + ':' + msgObj.msg);
	});
	socket.on('disconnect' , function(){
		console.log(current_username + ' disconnected!');
	})
});

http.listen( 11022 , function () {
	console.log("Running on port 11022");
})