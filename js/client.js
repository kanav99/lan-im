var activeRoom;
var activeUser;
var you = getCookie("username");//fetch name from cookie
var yourInfo;

var socket = io.connect();
socket.on('connect' , function(){
	socket.emit('newUser' , you);
});
socket.on('yourInfo', function(msg){
	yourInfo = msg;
	document.getElementById('logo').innerHTML = (' Hi ' + yourInfo.nick);
	for(i=0;i<yourInfo.friends.length;i++)
	{
		document.getElementById('friendlist').innerHTML += ('<a href="#" class="list-group-item text-left">'+yourInfo.friends[i]+'</a>');
	}
})
socket.on('toclient', function (msg) {
	if(activeUser==msg.name){

	}
	else {

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