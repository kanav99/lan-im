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
	document.getElementById('friendlist').innerHTML +='<span style="position:fixed;right:0" width="100%">';
	for(i=0; i<yourInfo.pendingRequests.length;i++)
	{
		document.getElementById('friendlist').innerHTML += ('<li class="list-group-item text-left">'+yourInfo.pendingRequests[i]+'<button class="btn btn-xs btn-success" style="right:0;">Accept</button><button class="btn btn-danger" style="right:0;">Decline</button></li>');
	}
	document.getElementById('friendlist').innerHTML += '</span>';
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
	alert("Friend Request Sent!");
	return false;
})