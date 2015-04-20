var five,felix,board;

five = require('johnny-five');
felix = require('./felix.js');
board = new five.Board();

var felix = new felix.Felix(five); 

board.on("ready",function(){

  felix.SetServos({FR:[1,2],BR:[4,6],FL:[8,10],BL:[12,14]});
  this.repl.inject({f:felix});
  
});
