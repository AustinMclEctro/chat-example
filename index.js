var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var path = (require('path'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
    app.use(express.static(path.join(__dirname, 'public')));
    app.get(__dirname + '/mainStyle.css');
});

io.on('connection', function(socket){
    console.log('\nA user connected');
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
    socket.on('disconnect', function(){
       console.log('\nA user disconnected'); 
    });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
