var express = require('express');

var app = express();

app.set('port', process.env.PORT || 5001);

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
	res.send('Visit /bingo to play the game');
});

app.get('/bingo', function(req, res) {
	res.render('pages/bingo');
});

app.listen(app.get('port'), function () {
	console.log('html bningo game is running on port: ', app.get('port'));
});
