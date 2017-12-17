var express = require('express');

var app = express();

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.get('/bingo', function(req, res) {
	res.render('pages/bingo');
});

app.listen(9001);

console.log('game has started at http://localhost:9000/bingo');