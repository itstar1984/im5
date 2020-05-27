'use strict';

// puestosList controller
angular.module('impuestos').controller('ImpuestosListController', ['$scope', '$http', '$mdDialog', 'costcenters', 'Impuestos', 'Presentacion', 'ServiceNavigation', "$rootScope",
    function ($scope, $http, $mdDialog, costcenters, Impuestos, Presentacion, ServiceNavigation, $rootScope) {
        this.costcenters = costcenters;
        var originatorEv;
        if (localStorage.getItem("dateImpuestos")) {
            var date = JSON.parse(localStorage.getItem("dateImpuestos"));
            $scope.year = Object.keys(date).length !== 0 ? date.year : (new Date()).getFullYear();
            $scope.month = Object.keys(date).length !== 0 ? date.month : (new Date()).getMonth();
        } else {
            $scope.year = (new Date()).getFullYear();
            $scope.month = (new Date()).getMonth();
        }

        //it initializes and gets the current name of inner page in view.
        //ServiceNavigation.navInit();


        $scope.getName = function (name) {
            ServiceNavigation.addNav({ name: name });
            $rootScope.$broadcast("nav change", true);
        }

        $scope.$watchCollection("year", function (newVal, oldval) {
            localStorage.setItem("year", JSON.stringify({ yearName: newVal }))

        })

        $scope.$watchCollection("month", function (newVal, oldval) {
            var elemPos = $scope.monthList.map(function (x) { return x.id }).indexOf(newVal);
            localStorage.setItem("month", JSON.stringify({ monthName: $scope.monthList[elemPos].name }))

        })

        $scope.monthList = [
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
        $scope.yearList = [];
        $scope.totalImpuestos = {};

        // It returns current year. And fill the yearList array with options from 2016 to the current year.
        var endYear = (new Date()).getFullYear();
        for (var startYear = 2016; startYear <= endYear; startYear++) {
            $scope.yearList.push(String(startYear));
        }
        $rootScope.findImpuestos = function () {
            $scope.totalImpuestos = {};
            var totalIVA = 0;
            Impuestos.query({ centroDeCosto: null, month: $scope.month, year: $scope.year }, function (impuestos) {
              for (var i = 0; i < costcenters.length; i++) {
                calcCosto(impuestos, costcenters[i]);
              }

            });

            function calcCosto(impuestos, costcenter) {
                if(!$scope.totalImpuestos[costcenter.id])
                    $scope.totalImpuestos[costcenter.id] = 0;

                var elemPos = impuestos.map(function(x){return x.name})
                var ventas = elemPos.indexOf('IVA Ventas');
                var compras = elemPos.indexOf('IVA Compras');
                $http.get('/api/impuestos/ajustar', {
                  params: {
                      //impuestoId: ivaType['IVA Ventas'],
                      year: $scope.year,
                      month: $scope.month,
                      costCenter: costcenter.id,
                      IVA: "IVA",
                      ivaVentas: (impuestos[ventas]) ? impuestos[ventas]._id : null,
                      ivaCompras: (impuestos[compras]) ? impuestos[compras]._id : null
                  }
                }).then(function (data) {
                    //this block adds or subtracts the IVAs
                    var arr = data.data;
                    for (var i = 0; i < arr.length; i++) {
                      if (arr[i].costCenter == costcenter.id) {

                          //$scope.totalImpuestos[costcenter.id] += arr[i].ivaTotal;

                          if (arr[i].adjType == 'IVA Compras') {
                           $scope.totalImpuestos[costcenter.id] -= arr[i].price;
                          } 

                          if (arr[i].adjType == 'IVA Ventas') {
                            $scope.totalImpuestos[costcenter.id] += arr[i].price;
                          } 
                      } 

                      
                      
                      /*if (arr[i].totalTax) {
                          $scope.totalImpuestos[costcenter.id] -= arr[i].totalTax;
                      } 
                      if (arr[i].montoE) {
                          pagado = pagado - arr[i].montoE;
                      }*/                    
                    }
                });
                impuestos.forEach(function (impuesto) {
                    if (costcenter._id === impuesto.centroDeCosto) {
                      if (impuesto.type !== "Default") {
                        $scope.totalImpuestos[costcenter.id] += impuesto.total;
                      }
                    } 
                });
                $scope.totalImpuestos[costcenter.id] = Math.round($scope.totalImpuestos[costcenter.id] * 100) / 100;
            }
            /*$http.post('/api/impuestos/updateTotal', {
                month: $scope.month,
                year: $scope.year
            }).then(function () {
                localStorage.setItem("dateImpuestos", JSON.stringify({year:$scope.year, month:$scope.month}));
                costcenters.forEach(function(costcenter) {
                    Impuestos.query({centroDeCosto: costcenter._id}, function (impuestos) {
                        $scope.totalImpuestos[costcenter.name] = 0;
                        impuestos.forEach(function(impuesto) {
                            if(impuesto.name == "IVA Compras")
                            {
                                $scope.totalImpuestos[costcenter.name] -= impuesto.total;
                            }
                            else{
                                $scope.totalImpuestos[costcenter.name] += impuesto.total;
                            }
                            
                        });
                        $scope.totalImpuestos[costcenter.name] = Math.round($scope.totalImpuestos[costcenter.name] * 100) / 100;
                    });
                })
            }).catch(function (error) {
                console.log("Error: " + error);
            });*/
        };
        $scope.openMenu = function ($mdOpenMenu, ev) {
            sessionStorage.setItem('centroDeCosto', this.item._id);
            localStorage.setItem('centroDeCosto', this.item._id);
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        $scope.showDialogNewPresentation = function ($event, item) {
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: 'modules/impuestos/views/nueva-presentacion.client.view.html',
                locals: {
                    item: item
                },
                controller: DialogControllerNewPre
            })
        };
        function DialogControllerNewPre($scope, $mdDialog, $http, item) {
            $scope.item = item;
            $scope.apagarBoton = false;
            $scope.present = {}

            $scope.present.ventas = 0;
            $scope.present.iva = 0;
            $scope.present.netas = 0;

            $scope.closeDialog = function () {
                $mdDialog.hide();
            };

            $scope.calc_netas = function () {
                $scope.present.netas = $scope.present.ventas - $scope.present.iva;
            }

            $scope.addPresent = function ($event, item) {
                if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {
                    if (($scope.present.date !== undefined) && ($scope.present.date !== null) &&
                        ($scope.present.cant !== undefined) && ($scope.present.cant !== null) &&
                        ($scope.present.ult !== undefined) && ($scope.present.ult !== null) &&
                        ($scope.present.nro !== undefined) && ($scope.present.nro !== null) &&
                        ($scope.present.ventas !== undefined) && ($scope.present.ventas !== null) &&
                        ($scope.present.iva !== undefined) && ($scope.present.iva !== null) &&
                        ($scope.present.netas !== undefined) && ($scope.present.netas !== null)
                    ) {

                        // Create new presentacion
                        var presentacion = new Presentacion({
                            presentacionDate: $scope.present.date,
                            cantComprobantes: $scope.present.cant,
                            ultComprobante: $scope.present.ult,
                            nroCierre: $scope.present.nro,
                            ventasTotal: $scope.present.ventas,
                            ivaTotal: $scope.present.iva,
                            ventasNetas: $scope.present.netas,
                            //costCenter: sessionStorage.getItem('centroDeCosto'),
                            costCenter: localStorage.getItem('centroDeCosto'),
                            month: (new Date($scope.present.date)).getMonth(),
                            year: (new Date($scope.present.date)).getFullYear()
            
                        });
                        // Redirect after save
                        presentacion.$save(function (response) {
                            if (response._id) {
                                $rootScope.findImpuestos()
                            }
                        }, function (errorResponse) {
                            console.log('this is error')
                            $scope.error = errorResponse.data.message;
                        });

                        $mdDialog.hide();
                    } else {
                        alert("Please complete the fields")
                    }


                }
            }
        }
        $rootScope.findImpuestos();
    }
]);
