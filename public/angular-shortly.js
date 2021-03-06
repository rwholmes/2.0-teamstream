var app = angular.module('app', ['ngRoute']);

app.run(function($rootScope) {
  $rootScope.userTeams = [];
  $rootScope.teamTracker = {};
});
var userTeams = {};

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
  when('/', {
    templateUrl: 'linksList.html',
    controller: 'appController'
  }).
  when('/create', {
    templateUrl: 'createLink.html',
    controller: 'Ctrl'
  }).
  otherwise({
    redirectTo: '/'
  });
}]);

app.factory('linkServices', ['$http', function($http) {
  var getLinks = function() {
    return $http({
      method: 'GET',
      url: '/links'
    }).then(function(data) {
      return data.data;
    });
  };

  var getTeams = function() {
    return $http({
      method: 'GET',
      url: '/teams'
    }).then(function(data) {
      userTeams = {};
      for (var i=0; i<data.data.length; i++) {
        userTeams[data.data[i].teamname] = true;
      }
      console.log('DATA: ', data.data);
      return data.data;
    });
  };
  return { getLinks: getLinks, getTeams: getTeams };
}]);

app.controller('appController', function($scope, linkServices) {
  // var links = linkServices.getLinks().then(function(data) {
  //   $scope.links = data;
  // });
});

app.controller('teamAppController', function($scope, $http, linkServices) {
  var teams = linkServices.getTeams().then(function(data) {
    $scope.teams = data;
  });
  $scope.remove = function() {
    console.log('trying to remove ang-shortly');
    $http({
      method: 'POST',
      url: '/removeTeams',
      data: {}
    });
  };
});

var newsOffset = 5;
var newsLimit = 0;

app.factory('dataServices', ['$http', function($http) {
  var getTeams = function() {
    var url = 'http://api.espn.com/v1/sports/soccer/eng.1/teams/?apikey=qw7zmfchttxkkkfw9anwa7q4&callback=JSON_CALLBACK';
    var data = {
        // enter your developer api key here
        apikey: 'qw7zmfchttxkkkfw9anwa7q4',
        // the type of data you're expecting back from the api
        _accept: 'application/json',
        // number of results to be shown
        limit: newsLimit,
        offset: newsOffset
      };
    return $http.jsonp(url)
      .success(function(data){})
      .error(function(data) {
        console.log('Error getting teams.');
      });
  };
  var getHeadlines = function() {
    var url = 'http://api.espn.com/v1/sports/soccer/eng.1/news/?limit=40&apikey=qw7zmfchttxkkkfw9anwa7q4&callback=JSON_CALLBACK';
    return $http.jsonp(url)
      .success(function(data){})
      .error(function(data) {
        console.log('Error getting headlines.');
      });
  };
  return {
    getTeams: getTeams,
    getHeadlines: getHeadlines
  };
}]);

app.controller('myHeadlinesController', function($scope, $rootScope, dataServices) {
  var headlines = dataServices.getHeadlines().then(function(data) {
    console.log('HEADLINES LENGTH: ', data.data.headlines.length);
    var articles = data.data.headlines;
    var filtered = [];
    if (articles) {
      for (var i=0; i<articles.length; i++) {
        for (var k=0; k<articles[i].keywords.length; k++) {
          if (userTeams[articles[i].keywords[k]]) {
            console.log('found team');
            filtered.push(articles[i]);
          }
        }
      }
      $scope.headlines = filtered;
    }
  });
});

app.controller('myTeamsController', function($scope, $rootScope, $http, dataServices) {
  var teams = dataServices.getTeams().then(function(data) {
    $scope.teams = data.data.sports[0].leagues[0].teams;
  });
  $scope.submit = function(team) {
    $http({
      method: 'POST',
      url: '/teams',
      data: {teamname: team.name, teamId: team.id}
    });
  };
});

app.controller('myScoresController', function($scope, $rootScope, dataServices) {
  var teams = dataServices.getTeams().then(function(data) {
    if (data.data.sports) {
      $scope.teams = data.data.sports[0].leagues[0].teams;
    }
  });
});







