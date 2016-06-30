'use strict';
angular.module('SignIn', ['ngRoute'])

    .config(['$routeProvider]', function($routeProvider){

        $routeProvider
            .when('/login', {
            templateUrl: 'login/templates/login.html',
            controller: 'SignInCtrl'
        });
    }])

    .controller('SignInCtrl', ['$scope', '$location', function($scope, $location){

    }]);
