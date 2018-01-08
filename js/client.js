var activeRoom;
var activeUser;
var you = getCookie("username");
if(you=='')
{
	window.location ="/";
}
var yourInfo;
var d = $('#history');
d.scrollTop(d.prop("scrollHeight"));

var socket = io.connect();
socket.on('connect' , function(){
	socket.emit('newUser' , you);
});
socket.on('yourInfo', function(msg){
	yourInfo = msg;

	document.getElementById('logo').innerHTML = (' Hi ' + yourInfo.nick);
	document.getElementById('friendlist').innerHTML = '';
	var len;
	if(yourInfo.friends == undefined)
		yourInfo.friends = [];
	else
		activeUser = yourInfo.friends[0];
	for(i=0;i<yourInfo.friends.length;i++)
	{
		document.getElementById('friendlist').innerHTML += ('<a href="#" class="list-group-item text-left" onclick=request_db("'+yourInfo.friends[i]+'")>'+yourInfo.friends[i]+'</a>');
	}
	if(yourInfo.pendingRequests == undefined)
	{
		yourInfo.pendingRequests = [];
	}
	for(i=0; i<yourInfo.pendingRequests.length;i++)
	{
		document.getElementById('pendingfriendlist').innerHTML += ('<li class="list-group-item text-left" id="request-'+yourInfo.pendingRequests[i]+'">'+yourInfo.pendingRequests[i]+'<div class="btn-group btn-group-xs" style="float:right;"><button class="btn btn-primary" onclick=acceptRequest("'+yourInfo.pendingRequests[i]+'")>Accept</button><button class="btn" onclick=declineRequest("'+yourInfo.pendingRequests[i]+'")>Decline</button></div></li>');
	}
	if(activeUser != undefined)
	{
		request_db(activeUser);
	}
});

$('#msging').submit(function(){
          
	var msgObj = {
		to : "",
		msg : ""
	};
	msgObj.to = activeUser;
	msgObj.msg = $('#m').val();
	socket.emit('toserver' , msgObj);
    $('#m').val('');
    document.getElementById('history').innerHTML += '<li class="list-group-item text-right">'+msgObj.msg+'</li>';
    d.animate({ scrollTop: d.prop("scrollHeight")}, 1000);
    return false;
});
function signout()
{
	document.cookie = "username=";
	window.location = "/";
}
$('#addFriend').submit(function(){
	var friendRequest = {
		to : "",
		from : ""
	};
	friendRequest.from = you;
	friendRequest.to = $('#friendSearch').val();
	socket.emit('newFriendRequest', friendRequest);
	$('#friendSearch').val('');
	return false;
});
function acceptRequest(user){
	socket.emit('acceptRequest' , user);
	var element = document.getElementById('request-'+user);
	element.parentNode.removeChild(element);
	document.getElementById('friendlist').innerHTML += ('<a href="#" class="list-group-item text-left">'+user+'</a>');

}
function declineRequest(user){
	socket.emit('declineRequest' , user);
	var element = document.getElementById('request-'+user);
	element.parentNode.removeChild(element);
	snack_alert("Friend request of "+user+" declined!");
}
socket.on('requestStatus', function(msg){
	snack_alert(msg);
});
function snack_alert(msg){
	var x = document.getElementById("snackbar");
	x.innerHTML = msg;
	x.className = "show";
	setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}
socket.on('requestAccepted', function(msg){
	document.getElementById('friendlist').innerHTML += ('<a href="#" class="list-group-item text-left">'+msg+'</a>');
	snack_alert(msg + ' accepted your friend request!');
})
socket.on('incomingRequest',function(msg){
	document.getElementById('pendingfriendlist').innerHTML += ('<li class="list-group-item text-left" id="request-'+msg+'">'+msg+'<div class="btn-group btn-group-xs" style="float:right;"><button class="btn btn-primary" onclick=acceptRequest("'+msg+'")>Accept</button><button class="btn" onclick=declineRequest("'+msg+'")>Decline</button></div></li>');
	snack_alert(msg + ' sent you a friend request!');
})
function request_db(user) {
	socket.emit('requestMessages',user);
	document.getElementById('activeuser').innerHTML = user;
	activeUser = user;
}
socket.on('yeLeMsg',function(msg){
	if(msg == -1 ){
		document.getElementById('history').innerHTML = '';
	} 
	else{
		document.getElementById('history').innerHTML = '';
		for(i=0;i<msg.msgdb.length;i++){
			if(msg.msgdb[i].type=='in')
				document.getElementById('history').innerHTML += '<li class="list-group-item">'+msg.msgdb[i].msg+'</li>';
			else
				document.getElementById('history').innerHTML += '<li class="list-group-item text-right">'+msg.msgdb[i].msg+'</li>';
		}
		d.scrollTop(d.prop("scrollHeight"));
	}
});
socket.on('newMessage',function(msgObj){
	if(msgObj.from == activeUser){
		document.getElementById('history').innerHTML += '<li class="list-group-item">'+msgObj.msg+'</li>';
		d.animate({ scrollTop: d.prop("scrollHeight")}, 1000);
	}
	else{
		snack_alert('New message from '+msgObj.from);
	}
})