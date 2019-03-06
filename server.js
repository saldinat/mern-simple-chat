var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const path = require("path");

var mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'client/build')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

var Schema = mongoose.Schema;
var userSchema = new Schema({ name : String,
    room : String})
var User = mongoose.model('User', userSchema)
module.exports = mongoose.model('users', userSchema);

var eventsSchema = new Schema({ name : String,
  room : String})
var User = mongoose.model('User', userSchema)
module.exports = mongoose.model('users', userSchema);


var dbUrl = 'mongodb://admin:Hobotom2018@ds159263.mlab.com:59263/chat'


var users = {};
var name = '';
io.on('connection', (socket) =>{
  users[socket.id] = name;
  let handshake = socket.handshake;
  // node
  socket.on("nRoom", function(room){
      socket.join(room);
      socket.emit("node new user", users[socket.id] + " you joined room "+room+ " at " + handshake['time']);
      socket.broadcast.in(room).emit("node new user", users[socket.id] + " new user has joined");   
  });
  
  socket.on("node new message", function(data){
      io.sockets.in("nRoom").emit('node news', users[socket.id] + ": "+ data);
  });
  socket.on("node leave room", function(data){
    socket.broadcast.in("nRoom").emit('node news', users[socket.id] + " left ");
    socket.emit("node news", users[socket.id] + " you left this room at " + handshake['time']);

    socket.leave("nRoom");
  });
  // python
  socket.on("pRoom", function(room){
    socket.join(room);
    socket.emit("python new user", users[socket.id] + " you joined room "+room+ " at " + handshake['time']);
    socket.broadcast.in(room).emit("python new user", users[socket.id] + " new user has joined");   
});

socket.on("python new message", function(data){
    io.sockets.in("pRoom").emit('python news', users[socket.id] + ": "+ data);
});
socket.on("python leave room", function(data){
  socket.broadcast.in("pRoom").emit('python news', users[socket.id] + " left ");
  socket.emit("python news", users[socket.id] + " you left this room at " + handshake['time']);

  socket.leave("pRoom");
});
  //disconnect
  socket.on('disconnect', function () {
    io.emit('user disconnected');
    socket.broadcast.in("nRoom").emit('node news', users[socket.id] + " left ");
    socket.broadcast.in("pRoom").emit('node news', users[socket.id] + " left ");
  });
})


mongoose.connect(dbUrl ,{useMongoClient : true} ,(err) => {
  console.log('mongodb connected',err);
})
var server = http.listen(PORT, () => {
  console.log('server is running on port', server.address().port);
});


app.get('/users', (req, res) => {
  console.log('in /users');
  User.find({},(err, messages)=> {
    res.send(messages);
  })
});

app.post('/users', (req, res) => {
  var user = new User(req.body);
  user.save((err) =>{
    if(err)
      sendStatus(500);
    //io.emit('message', req.body);
    res.sendStatus(200);
  })
})

app.get('/rooms/:name', function(req, res){
  name = req.params.name;
  //console.log(name);
  res.sendFile(path.join(__dirname, "/client/rooms.html"));
});
// app.post('/rooms', function(req, res){
//   console.dir(req.body.name)
//   name = req.body.name;
//   //console.log(name);
//   res.redirect(307, "/client/rooms/"+name);
// });

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/index.html'))
});

