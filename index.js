var express = require('express');
var app = express();

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/img', express.static(__dirname + '/img'));

app.get('/' , function ( req , res ){
	res.sendFile( __dirname + '/html/index.htm');
});


app.listen( 11022 , function () {
	console.log("Running on port 11022");
})