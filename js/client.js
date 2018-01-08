var activeRoom;
var activeUser;
var you = getCookie("username");
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
		document.getElementById('friendlist').innerHTML += ('<li class="list-group-item text-left" id="request-'+yourInfo.pendingRequests[i]+'">'+yourInfo.pendingRequests[i]+'<div class="btn-group btn-group-xs" style="float:right;"><button class="btn btn-primary" onclick=acceptRequest("'+yourInfo.pendingRequests[i]+'")>Accept</button><button class="btn">Decline</button></div></li>');
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
socket.on('requestStatus', function(msg){
	alert(msg);
})