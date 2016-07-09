var command = process.argv[2];
var song = process.argv[3];

var twitterKeys = require('./keys.js');
console.log(twitterKeys);

var functions = {
	function1: function() {
		console.log("i'm function 1");
	}, 
	function2: function() {
		console.log("i'm function 2");
	}
}

if (typeof functions[command] === 'function') {
	console.log('its a function');
	functions[command]();
} else {
	console.log("you didn't type a valid function sir or madam");
}