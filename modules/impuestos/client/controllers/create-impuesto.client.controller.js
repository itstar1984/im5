'use strict';

// Create Impuesto controller
angular.module('impuestos').controller('ImpuestosCreateController', ['$state', '$scope', '$stateParams', 'Impuestos', '$rootScope',
    function ($state, $scope, $stateParams, Impuestos, $rootScope) {


        $scope.resetCoefficient = function resetCoefficient() {
            if(!$scope.type) {
                $scope.coefficient = undefined;
                $scope.automaticoType = undefined;
            }
        };
        var getMonth = JSON.parse(localStorage.getItem("month"));
        var getYear = JSON.parse(localStorage.getItem("year"));
        var year = getYear.yearName;
        var month = 0;
        var monthList = [
            { id: 0, name: 'enero' },
            { id: 1, name: 'febrero' },
            { id: 2, name: 'marzo' },
            { id: 3, name: 'abril' },
            { id: 4, name: 'mayo' },
            { id: 5, name: 'junio' },
            { id: 6, name: 'julio' },
            { id: 7, name: 'agosto' },
            { id: 8, name: 'septiembre' },
            { id: 9, name: 'octubre' },
            { id: 10, name: 'noviembre' },
            { id: 11, name: 'diciembre' }
        ];

        for (var idx = 0; idx < monthList.length; idx++) {
            if (monthList[idx].name == getMonth.monthName) {
                month = idx;
                break;
            }
        }

        // Create new impuesto
        $scope.create = function create() {
            if($scope.type) {
                for(var i = 0; i < $rootScope.costCenters.length; i++) {
                    var impuesto = new Impuestos({
                        name: $scope.name,
                        descripcion: $scope.descripcion ? $scope.descripcion : undefined,
                        total: 0.0,
                        coefficient: $scope.coefficient,
                        type: $scope.type,
                        automaticoType: $scope.automaticoType,
                        centroDeCosto: $stateParams.centroDeCosto,
                        month: month,
                        year: year,
                        costcenters: $rootScope.costCenters[i]
                    });          

                    // Redirect after save;
                    impuesto.$save(function (response) {
                        if (response._id) {
                            //$state.go('home.viewImpuesto', {centroDeCosto: $stateParams.centroDeCosto});
                        }
                    }, function (errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });
                }

                $state.go('home.viewImpuesto', {centroDeCosto: $stateParams.centroDeCosto});

            } else {
                var impuesto = new Impuestos({
                    name: $scope.name,
                    descripcion: $scope.descripcion ? $scope.descripcion : undefined,
                    total: 0.0,
                    coefficient: $scope.coefficient,
                    type: $scope.type,
                    automaticoType: $scope.automaticoType,
                    centroDeCosto: $stateParams.centroDeCosto,
                    month: month,
                    year: year,
                    costcenters: null
                });          

                // Redirect after save;
                impuesto.$save(function (response) {
                    if (response._id) {
                        $state.go('home.viewImpuesto', {centroDeCosto: $stateParams.centroDeCosto});
                    }
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
        }
    }]);

