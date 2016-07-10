//requirements
var fs = require('fs');
var Twitter = require('twitter');
var spotify = require('spotify');
var request = require('request');

//command line arguments
var argvArray = process.argv.slice(0);
// console.log(argvArray);
var command = process.argv[2];
var argTwo = process.argv[3];

//keys
var twitterKeys = require('./keys.js').twitterKeys;
console.log(twitterKeys);

//clients
var client = new Twitter(twitterKeys);

//getSongName - I had issues doing this inside a function because the argvArray only showed the first two arguments
// console.log(argvArray);
// var songToSearch = '';
// if (argvArray.length === 3) {
// 	songToSearch = 'the sign';
// } else {
// 	// songToSearch = argvArray.splice(3).join(' ');
// }

//getMovieName
// var movieToSearch = '';
// if (argvArray.length === 3) {
// 	movieToSearch = 'Mr. Nobody';
// } else {
// 	movieToSearch = songToSearch;
// }

var functions = {
	'my-tweets': function() {
		var screenName = '';
		if (!argTwo) {
			screenName = 'ryanjarrell';
		} else {
			screenName = argTwo;
		}
		var params = {
			screen_name: screenName, 
			count: 20
		};

		//I had to declare the tweets array out here to get it to work in the console log in the for loop
		var myTweets = [];

		//call to Twitter
		client.get('statuses/user_timeline', params, function (error, tweets, response) {
			if (!error) {
				//set myTweets to array of tweet objects that Twitter gives me
				myTweets = tweets;

				//loops through tweeties and console logs them
				for (var i = 0; i < tweets.length; i++) {
					var messageToDisplay = myTweets[i].created_at.slice(0, 19)+": "+myTweets[i].text
					console.log(messageToDisplay);

					//appends tweeties to log.txt
					appendToFileExtra(messageToDisplay, false, '\n', i, tweets.length)
				}
				// appendNewLine();
			} else {
				console.error(error);
			}
		});
	},
	'spotify-this-song': function() {
		var songToSearch = getSearchTerm('song');
		spotify.search({
			type: 'track', 
			query: songToSearch, 
			limit: 5
		}, function (err, data) {
			if (!err) {
				// appendToFile(data);
				// appendToFile(JSON.stringify(data));
				if (data.tracks.items.length < 5) {
					// appendToFile('{\n');
					var prepend = '{\n';
					var append = '}\n';	
					for (var i = 0; i < data.tracks.items.length; i++) {
						songsToConsoleAndFile(data, prepend, append, i, data.tracks.items.length);
					}
					// appendToFile('}\n');
				} else {
					var prepend = '{\n';
					var append = '}\n';	
					for (var i = 0; i < 5; i++) {
						songsToConsoleAndFile(data, prepend, append, i, 5);
					}
					// appendToFile('}\n');
				}
			} else {
				console.error(err);
			}
		})
	}, 
	'movie-this': function() {
		var movieToSearch = getSearchTerm('movie');
		console.log(movieToSearch);
		var queryURL = 'http://www.omdbapi.com/?t=' + movieToSearch +'&y=&plot=short&r=json';
		request(queryURL, function (error, response, body) {
			if (!error) {
				// console.log(JSON.parse(body));
				moviesToConsoleAndFile(body);
			} else {
				console.error(error);
			}
		});
	}
}

//executes the functions based on command
if (typeof functions[command] === 'function') {
	appendToFileBasic(process.argv.splice(2).join(' '));
	functions[command]();
} else {
	console.log("you didn't type a valid function sir or madam");
}

function appendToFileBasic(log) {
	fs.appendFile('log.txt', log+'\n', function (error) {
		if (error) {
			console.error(error);
		}
	});
}

//I wanted to encase the artist info with brackets in the log.txt file
//Due to the asyncronous nature of JavaScript, sometimes the brackets were put in weird spots
//I tried to fix that issue and I think I did but I'm not sure
		//actually one time it still did it wrong but it seems to be improved
function appendToFileExtra(log, prepend, append, i, length) {
	if (prepend) {
		if (!i || i === 0) {
			fs.appendFile('log.txt', prepend+"\n", function (error) {
				if (error) {
					console.error(error);
				} else {
					fs.appendFile('log.txt', log+"\n", function (error) {
						if (error) {
							console.error(error);
						} else if (append) {
							if (i) {
								if (i === length - 1) {
									appendToFileBasic(append);
								} else {
									appendToFileBasic(log);
								}
							} else {
								appendToFileBasic(append);
							}
						}		
					});
				}	
			});
		} else {
			appendToFileBasic(log);
		}
	} else {
		fs.appendFile('log.txt', log+"\n", function (error) {
			if (error) {
				console.error(error);
			} else if (append) {
				if (i === length - 1) {
					appendToFileBasic(append);
				}
			}		
		});
	}
}

function appendNewLine() {
	appendToFileBasic('');
}

function songsToConsoleAndFile(data, prepend, append, i, length) {
	var songNameMessage = "Title: "+data.tracks.items[i].name; 
	var artistNameMessage = "Artist: "+data.tracks.items[i].artists[0].name  
	var songURLMessage = "Spotify Link: "+data.tracks.items[i].preview_url; 
	var albumNameMessage = "Album: "+data.tracks.items[i].album.name  

	console.log(songNameMessage+'\n'+artistNameMessage+'\n'+albumNameMessage+'\n'+songURLMessage+'\n');
	appendToFileExtra(songNameMessage+'\n'+artistNameMessage+'\n'+albumNameMessage+'\n'+songURLMessage+'\n', prepend, append, i, length);
}

function getSearchTerm(type) {
var searchTerm = '';
	if (argvArray.length === 3) {
		if (type === 'song') {
			searchTerm = 'the sign';
		} else if (type === 'movie') {
			searchTerm = 'Mr. Nobody';
		}
	} else {
		searchTerm = argvArray.splice(3).join(' ');
	}
	return searchTerm;
}

function moviesToConsoleAndFile(body) {
	var title = "Title: "+JSON.parse(body).Title;	
	var year = "Year: "+JSON.parse(body).Year;
	var imdbRating = "IMDB Rating: "+JSON.parse(body).imdbRating;
	var country = "Country: "+JSON.parse(body).Country;
	var language = "Language: "+JSON.parse(body).Language;
	var plot = "Plot: "+JSON.parse(body).Plot;
	var actors = "Actors: "+JSON.parse(body).Actors;
	// var rottenRating = 
	// var rottenURL = 
	console.log(title+'\n'+year+'\n'+imdbRating+'\n'+country+'\n'+language+'\n'+plot+'\n'+actors);
	appendToFileBasic(title+'\n'+year+'\n'+imdbRating+'\n'+country+'\n'+language+'\n'+plot+'\n'+actors+'\n');
}








