angular.module('tableApp', [])

    .controller('mainController', function($scope, $http) {
        $http({
            method: 'GET',
            url: 'data.json'
        }).then(function successCallback(response) {
            console.log(response);
            $scope.rows = response.data;
        });

    });