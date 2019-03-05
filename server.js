var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const path = require("path");

var mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'client/build')))
//app.use(express.static(path.join(__dirname, 'frontend/build')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

var Schema = mongoose.Schema;
var messageSchema = new Schema({ name : String,
    message : String})
var Message = mongoose.model('Message', messageSchema)
module.exports = mongoose.model('messages', messageSchema);

var dbUrl = 'mongodb://admin:Hobotom2018@ds159263.mlab.com:59263/chat'
app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})


app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })

//   Message.find({}).sort({date: 'descending'}).exec(function(err, messages) {
//     res.send(messages);
//   });
})
app.post('/messages', (req, res) => {
  var message = new Message(req.body);
  message.save((err) =>{
    if(err)
      sendStatus(500);
    io.emit('message', req.body);
    res.sendStatus(200);
  })
})
app.get('*', (req, res) => {
res.sendFile(path.join(__dirname + '/client/index.html'))
});

io.on('connection', () =>{
  console.log('a user is connected')
})
mongoose.connect(dbUrl ,{useMongoClient : true} ,(err) => {
  console.log('mongodb connected',err);
})
var server = http.listen(PORT, () => {
  console.log('server is running on port', server.address().port);
});
