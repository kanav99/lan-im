var activeRoom;
var activeUser;
var you = getCookie("username");
if(you=='')
{
	window.location ="/";
}
var yourInfo;

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
	for(i=0;i<yourInfo.friends.length;i++)
	{
		document.getElementById('friendlist').innerHTML += ('<a href="#" class="list-group-item text-left">'+yourInfo.friends[i]+'</a>');
	}
	if(yourInfo.pendingRequests == undefined)
	{
		yourInfo.pendingRequests = [];
	}
	for(i=0; i<yourInfo.pendingRequests.length;i++)
	{
		document.getElementById('pendingfriendlist').innerHTML += ('<li class="list-group-item text-left" id="request-'+yourInfo.pendingRequests[i]+'">'+yourInfo.pendingRequests[i]+'<div class="btn-group btn-group-xs" style="float:right;"><button class="btn btn-primary" onclick=acceptRequest("'+yourInfo.pendingRequests[i]+'")>Accept</button><button class="btn" onclick=declineRequest("'+yourInfo.pendingRequests[i]+'")>Decline</button></div></li>');
	}
});

$('#msging').submit(function(){
          
	var msgObj = {
		to : "",
		from : "",
		msg : ""
	};
	msgObj.to = activeUser;
	msgObj.from = you;
	msgObj.msg = $('#m').val();
	socket.emit('toserver' , msgObj);
          $('#m').val('');
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