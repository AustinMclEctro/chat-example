var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;
var path = (require("path"));

var messages = {};  // message: timestamp
var users = [];     // all users in the order they connected

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
    app.use(express.static(path.join(__dirname, "public")));
    app.get(__dirname + "/mainStyle.css");
});

io.on("connection", function(socket){
    console.log("\nUser "+socket.id+" connected");
    socket.nickname = undefined;
    socket.emit("updateWelcome", "user "+socket.id);
    
    if(!users.includes(socket.id)){
        users.push(socket.id);
        io.emit("refreshUsersList", users);
        console.log(users);
    }

    socket.on("sendNickname", function(nickname){
        // First trim to max nickname length
        if(nickname.length > 20){ nickname = nickname.substring(0, 20); }
        if(!users.includes(nickname))
        {
            if(socket.nickname === undefined){
                var n = users.indexOf(socket.id);
                if(n > -1){
                    users[n] = nickname;
                    socket.nickname = nickname;
                    io.emit("refreshUsersList", users);
                    socket.emit("updateWelcome", socket.nickname);
                }              
            }
            else{
                var n = users.indexOf(socket.nickname);
                if(n > -1){
                    users[n] = nickname;
                    socket.nickname = nickname;
                    io.emit("refreshUsersList", users);
                    socket.emit("updateWelcome", socket.nickname);
                }              
            }
        }
        console.log(users);
    });
    
    socket.on("chat message", function(t, msg){
        t = getTimeStamp();
        messages[msg] = t;
        var accessor = undefined;
        if(socket.nickname === undefined){
            msg = "user "+socket.id+": "+msg;
        } else{
            msg = socket.nickname+": "+msg;
        } 
        io.emit("chat message", t, msg);
    });
    
    socket.on("disconnect", function(){
        var accessor = undefined;
        var log = "";
        if(socket.nickname === undefined){
            accessor = socket.id;
            log = "\nUser "+socket.id+" disconnected";
        }
        else{
            accessor = socket.nickname;
            log = "\n"+socket.nickname+" disconnected";
        }
        
        var n = users.indexOf(accessor);
        if(n > -1){
            users.splice(n, 1);
            io.emit("refreshUsersList", users);
        }

        console.log(users);
        console.log(log);
    });
});

http.listen(port, function(){
    console.log("listening on *:" + port);
});

// Calculate and set up timestamp
getTimeStamp = function(){
    var d = new Date();
    var month = d.getMonth();
    var day = d.getDate();
    var hours = d.getHours();
    var mins = d.getMinutes();
    var period = "AM";
    
    month = (month < 10) ? "0"+month : month;
    day = (day < 10) ? "0"+day : day;
    
    var hh = hours;
    if(hh >= 12) {
        hh = hours - 12;
        period = "PM";
    }
    hh = (hh == 0) ? 12 : hh;
    hh = (hh<10) ? "0"+hh : hh;
    mins = (mins < 10) ? "0"+mins : mins;
    
    var calculatedTime = d.getFullYear()+"-"+month+"-"+day;
    calculatedTime += " "+hh+":"+mins+" "+period;
    return calculatedTime;
};