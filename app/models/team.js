var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');

var teamSchema = mongoose.Schema({
 teamname: String,
 espnId: Number,
 created_at: { type: Date, default: Date.now }
});

var Team = mongoose.model('Team', teamSchema);

module.exports = Team;
