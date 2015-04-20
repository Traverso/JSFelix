module.exports = function(app, io) {
	var bodyParser = require('body-parser'),
		consolePrefix = 'Felix Control: ',
		requestPrefix = '/felix',
		five = require('johnny-five'),
    felix = require('./lib/felix.js'),
		board = new five.Board();


  felix = new felix.Felix(five); 
	app.use(bodyParser.json());

	board.on('ready', function() {
		console.log(consolePrefix + 'Board ready');
    felix.SetServos({FR:[1,2],BR:[4,6],FL:[8,10],BL:[12,14]});
	});

	console.log('\n' + consolePrefix + 'Waiting for device to connect...');

	io.sockets.on('connection', function(socket) {
		console.log(consolePrefix + 'Socket io is ready.');

		socket.on('status', function(action) {
      console.log('status request');
      socket.emit('status',{status:(board.isReady)?'ok':'ko'});
    });

		socket.on('calibrate', function(action) {
      console.log('calibrating');
      if(felix) felix.Calibrate();
    });

		socket.on('walk', function(action) {
      if(felix) felix.Walk(action.x,action.y);
    });

		socket.on('stop', function(action) {
      if(felix) felix.Stop();
    });

	});
};
