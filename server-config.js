var express = require('express');
var partials = require('express-partials');
var util = require('./lib/utility');

var handler = require('./lib/request-handler');

var app = express();

app.configure(function() {
  // app.set('views', __dirname + '/html');
  // app.set('view engine', 'jade');
  app.use(partials());
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser('shhhh, very secret'));
  app.use(express.session());
});

app.post('/removeTeams', handler.removeTeams);

app.get('/', handler.renderIndex);
app.get('/create', handler.renderIndex);

app.get('/links', handler.fetchLinks);
app.post('/links', handler.saveLink);

app.get('/teams', handler.fetchTeams);
app.post('/teams', handler.saveTeam);

app.get('/login', handler.loginUserForm);
app.post('/login', handler.loginUser);
app.get('/logout', handler.logoutUser);

app.get('/signup', handler.signupUserForm);
app.post('/signup', handler.signupUser);

app.get('/*', handler.navToLink);

module.exports = app;
