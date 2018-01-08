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

var online_users = [];
io.on('connection' , function(socket){
	var current_username;
	console.log('connection!');
	socket.on('newUser', function(msg){
		current_username = msg;
		var data = JSON.parse(fs.readFileSync('users/' + msg + '.json', 'utf8'))
		socket.emit('yourInfo' , data);
		console.log(msg + ' connected!');
		online_users.push({username:current_username,sock:socket});
	});
	socket.on('newFriendRequest', function(friendRequest){
		console.log('New friendRequest from ' + friendRequest.from + ' to '+ friendRequest.to);
		if(friendRequest.to == friendRequest.from){
			socket.emit('requestStatus', 'Invalid Request! You are already your friend -_-');
		}
		else if(fs.existsSync('users/' + friendRequest.to + '.json')){
			fs.readFile('users/' + friendRequest.from + '.json', function(err1,str){
				var userFrom = JSON.parse(str);
				if(userFrom.pendingRequests == undefined)
					userFrom.pendingRequests = [];
				if(userFrom.pendingRequests.indexOf(friendRequest.to)==-1){
					fs.readFile('users/' + friendRequest.to + '.json', function( err, data){
						var userTo = JSON.parse(data);
						if(userTo.pendingRequests == undefined)
							userTo.pendingRequests = [];
						if(userTo.friends == undefined)
							userTo.friends = [];
						if((userTo.friends.indexOf(friendRequest.from)==-1)&&(userTo.pendingRequests.indexOf(friendRequest.from)==-1)){
							userTo.pendingRequests.push(friendRequest.from);
							fs.writeFile('users/' + friendRequest.to + '.json' , JSON.stringify(userTo));
							socket.emit('requestStatus', 'Yay! Friend Request Sent!');
							var idx = online_users.findIndex( x => x.username === friendRequest.to);
							if(idx!=-1)
							{
								online_users[idx].sock.emit('incomingRequest',friendRequest.from);
							}
						}
						else{
							socket.emit('requestStatus','Invalid Request!');
						}
						
					});
				}
				else{
					socket.emit('requestStatus', "He already sent you a request");
				}
			});
			
		}
		else{
			socket.emit('requestStatus', 'No such user!');
		}
		
	});
	socket.on('toserver', function(msgObj) {
		console.log("New Message from " + msgObj.from + ' to '+ msgObj.to + ':' + msgObj.msg);
	});
	socket.on('acceptRequest',function(user){
		fs.readFile('users/'+current_username + '.json', function(err,str){
			var data = JSON.parse(str);
			data.pendingRequests.splice(data.pendingRequests.indexOf(user),1);
			if(data.friends==undefined)
				data.friends=[];
			data.friends.push(user);
			fs.writeFile('users/'+current_username + '.json',JSON.stringify(data));
		});
		fs.readFile('users/'+user + '.json',function(err,str){
			var data = JSON.parse(str);
			if(data.friends==undefined)
				data.friends=[];
			data.friends.push(current_username);
			fs.writeFile('users/'+user + '.json',JSON.stringify(data));
			var idx = online_users.findIndex( x => x.username === user);
			if(idx!=-1){
				online_users[idx].sock.emit('requestAccepted',current_username);
			}
		});
	});
	socket.on('declineRequest', function(msg){
		fs.readFile('users/'+current_username+'.json',function(err,str){
			var data = JSON.parse(str);
			data.pendingRequests.splice(data.pendingRequests.indexOf(msg),1);
			fs.writeFile('users/'+current_username + '.json',JSON.stringify(data));
		})
	})
	socket.on('disconnect' , function(){
		console.log(current_username + ' disconnected!');
		var idx = online_users.findIndex( x => x.username === current_username);
		online_users.splice(idx , 1);
	});
});

http.listen( 11022 , function () {
	console.log("Running on port 11022");
})