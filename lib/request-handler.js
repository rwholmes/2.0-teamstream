var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
var Team = require('../app/models/team');



exports.removeTeams = function(req, res) {
  console.log('REMOVE TEAMS HANDLER');
  Team.find({}).remove().exec();
  res.redirect('/index.html');
}
exports.renderIndex = function(req, res) {
  res.render('index.html');
};

exports.signupUserForm = function(req, res) {
  res.render('signup.html');
};

exports.loginUserForm = function(req, res) {
  res.render('login.html');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login.html');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({}).exec(function(err,links) {
    res.send(200, links);
  })
};

exports.fetchTeams = function(req, res) {
  Team.find({}).exec(function(err,teams) {
    res.send(200, teams);
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.findOne({ url: uri }).exec(function(err, found) {
    if (found) {
      res.send(200, found);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        var newLink = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin,
          visits: 0
        });

        newLink.save(function(err,newEntry) {
          if (err) {
            res.send(500, err);
          } else {
            res.send(200,newEntry);
          }
        });
      })
    }
  });
};

exports.saveTeam = function(req, res) {
  var teamname = req.body.teamname;

  Team.findOne({ teamname: teamname }).exec(function(err, found) {
    if (found) {
      res.send(200, found);
    } else {
      var newTeam = new Team({
        teamname: teamname,
      });

      newTeam.save(function(err,newEntry) {
        if (err) {
          res.send(500, err);
        } else {
          res.send(200,newEntry);
        }
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username })
    .exec(function(err,user) {
      if (!user) {
        res.redirect('/login.html');
      } else {
        var savedPassword = user.password;
        User.comparePassword(password, savedPassword, function(err, match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login.html');
          }
        });
      }
  })
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username })
    .exec(function(err, user) {
      if (!user) {
        var newUser = new User({
          username: username,
          password: password
        });
        newUser.save(function(err, newUser) {
          if (err) {
            res.send(500, err);
          }
          util.createSession(req, res, newUser);
        });
      } else {
        console.log('Account already exists');
        res.redirect('/signup.html');
      }
    });
};

exports.navToLink = function(req, res) {
  Link.findOne({ code: req.params[0] }).exec(function(err,link) {
    if (!link) {
      res.redirect('/');
    } else {
      link.visits++;
      link.save(function(err,link){
        res.redirect(link.url);
        return;
      })
    }
  });
};
