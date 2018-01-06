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
			res.cookie('username', req.body.username );
			res.sendFile( __dirname + '/html/chatroom.htm');
		}
		else
			res.redirect('/');
	}
	else {
		res.redirect('/');
	}
});

app.post('/profile' , function ( req , res ){
	if(fs.existsSync('users/' + req.body.username + '.json'))
	{
		res.redirect('/');
	}
	else {
		fs.writeFile('users/' + req.body.username + '.json' , JSON.stringify(req.body) );
		res.redirect('/chat');
	}
})
app.get('/chat', function( req, res){
	res.sendFile(__dirname + '/html/chatroom.htm');
})

io.on('connection' , function(socket){
	console.log('new user');
	socket.on('newUser', function(msg){
		var data = JSON.parse(fs.readFileSync('users/' + msg + '.json', 'utf8'))
		socket.emit('yourInfo' , data);
		console.log('data sent');
	})
});

http.listen( 11022 , function () {
	console.log("Running on port 11022");
})