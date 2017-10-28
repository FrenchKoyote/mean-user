var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mongojs = require('mongojs');


//Routing
var users = require('./routes/user');
var index = require('./routes/index');
var silent = require('./routes/silent');

var port = 3000;
var app = express();

//Please use your own MongoDB URL on mLab website 
var db = mongojs('mongodb://192.168.99.100:27017/meanuser', ['UserInfo']);
app.set("userdb", db);

app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, '../client/UserManagement/dist')));

app.use('/', index); 
app.use("/api", users);
app.use('/silent', silent);

// catch 404 and forward to error handler.
/*app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});*/
    
// If our applicatione encounters an error, we'll display the error and stacktrace accordingly.
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send(err);
});

app.get('*', function(req, res) {
    res.render(path.join(__dirname, '../client/UserManagement/dist/index.html')); // load our public/index.html file
});

app.listen(port, function(){
    console.log('Server started on port '+port);
});