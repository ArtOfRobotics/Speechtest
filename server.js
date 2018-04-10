const record = require('node-record-lpcm16');
const Detector = require('snowboy').Detector;
const Models = require('snowboy').Models;

const models = new Models();

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  //res.send('<h1>Hello World</h1>');
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});




models.add({
  file: 'resources/models/ja.pmdl',
  sensitivity: '0.45',
  hotwords : 'ja'
});

models.add({
  file: 'resources/models/nee.pmdl',
  sensitivity: '0.45',
  hotwords : 'nee'
});

const detector = new Detector({
  resource: "resources/common.res",
  models: models,
  audioGain: 2.0
});

detector.on('silence', function () {
  //console.log('silence');
});

detector.on('sound', function (buffer) {
  // <buffer> contains the last chunk of the audio that triggers the "sound"
  // event. It could be written to a wav stream.
  //console.log('sound');
});

detector.on('error', function () {
  console.log('error');
});

detector.on('hotword', function (index, hotword, buffer) {
  // <buffer> contains the last chunk of the audio that triggers the "hotword"
  // event. It could be written to a wav stream. You will have to use it
  // together with the <buffer> in the "sound" event if you want to get audio
  // data after the hotword.
  //console.log(buffer);
  console.log('hotword', index, hotword);
  io.emit('word', hotword);
});

const mic = record.start({
  threshold: 0,
  verbose: true
});

mic.pipe(detector);
