var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var multer = require('multer');
var upload = multer();

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/img', express.static(__dirname + '/img'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(upload.array()); 

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

app.listen( 11022 , function () {
	console.log("Running on port 11022");
})