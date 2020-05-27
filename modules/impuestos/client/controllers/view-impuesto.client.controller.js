'use strict';

// puestosList controller
angular.module('impuestos').controller('ImpuestosViewController', ['Condicionventas','$rootScope', '$state', '$scope', '$http', '$stateParams', '$mdDialog', 'user', 'Impuestos', 'costcenters',
    function (Condicionventas,$rootScope, $state, $scope, $http, $stateParams, $mdDialog, user, Impuestos, costcenters) {
        var originatorEv;
        $scope.editing = false;
        $scope.coefficient = 0;
        $scope.ajustarPrice = 0;

        $scope.$watchCollection('authentication', function () {
            // if (!sessionStorage.getItem('centroDeCosto')) {
            //     sessionStorage.setItem('centroDeCosto', $stateParams.centroDeCosto);
            // } else if ($stateParams.centroDeCosto !== '' && $stateParams.centroDeCosto !== sessionStorage.getItem('centroDeCosto')) {
            //     sessionStorage.setItem('centroDeCosto', $stateParams.centroDeCosto);
            // }
            if (!localStorage.getItem('centroDeCosto')) {
                localStorage.setItem('centroDeCosto', $stateParams.centroDeCosto);
            } else if ($stateParams.centroDeCosto !== '' && $stateParams.centroDeCosto !== localStorage.getItem('centroDeCosto')) {
                localStorage.setItem('centroDeCosto', $stateParams.centroDeCosto);
            }

            $scope.findImpuestos();
        });

        var getMonth = JSON.parse(localStorage.getItem("month"));
        var getYear = JSON.parse(localStorage.getItem("year"));
        $rootScope.getPeriod = getMonth.monthName + ", " + getYear.yearName;

        $scope.total = 0;
        $scope.pagado = 0;

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
                month = idx.toString();
                break;
            }
        }


        var year = getYear.yearName || (new Date()).getFullYear();
        //var thisMonth = (month.id) ? month.id.toString() : (new Date()).getMonth().toString();
        
        $rootScope.getPeriod = getMonth.monthName + ", " + getYear.yearName; 

        function calcTotal(arr) {
            var total = 0;
            var pagado = 0;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].costCenter) {
                    total = total + arr[i].ivaTotal;
                }
                if (arr[i].adjType == 'IVA Compras') {
                    total = total - arr[i].price;
                } 
                if (arr[i].adjType == 'IVA Ventas') {
                    total = total + arr[i].price;
                } 
                if (arr[i].totalTax) {
                    total = total - arr[i].totalTax;
                }
                if (arr[i].montoE) {
                    pagado = pagado - arr[i].montoE;
                }
            }
            
            $scope.total = total;
            $scope.pagado = -pagado;
        }

        var tax = {};
        tax.total = 0;
        $rootScope.ivaFilter = {};
        $scope.findImpuestos = function () {
            Impuestos.get({ centroDeCosto: localStorage.getItem('centroDeCosto'), month: month, year: year }, function (response) {
                var newArray = [];
                var res = response.impuestos;
                var pagos = response.pagos;
                
                    /*for (var i = 0; i < res.length; i++) {
                              if (res[i].name == "IVA Compras" || res[i].name == "IVA Ventas") {
                                  getPago(res[i]);
                              } else {
                                newArray.push(res[i]);
                              }
                          }
                      } */

                function getPago(im) {
                    var objForm = im
                    for (var j = 0; j < pagos.length; j++) {
                      if (pagos[j].impuestos == im._id.toString()) {
                        objForm.pagado = (objForm.pagado) ? (objForm.pagado + pago[j].montoE) : pagos[j].montoE;
                      }
                    }
                    
                }

            

                //my edit Obinna
                
                for (var i = 0; i < res.length; i++) {
                     

                    if (res[i].name == 'IVA Ventas' || res[i].name == 'IVA Compras') {

                        getPago(res[i]);

                        if (res[i]) {
                            $rootScope.ivaFilter[res[i].name] = res[i]._id;
                            tax.total = (res[i].name == 'IVA Ventas') ? (tax.total + res[i].total) : (tax.total - res[i].total);

                            if (Object.keys($rootScope.ivaFilter).length == 2) { //                              
                                localStorage.setItem("ivaType", JSON.stringify($rootScope.ivaFilter));
                                var ivaType = JSON.parse(localStorage.getItem('ivaType'));
                                //var costCenter = sessionStorage.getItem('centroDeCosto');
                                var costCenter = localStorage.getItem('centroDeCosto');
                                $scope.isIVA = true;
                                $http.get('/api/impuestos/ajustar', {
                                    params: {
                                        impuestoId: ivaType['IVA Ventas'],
                                        year: year,
                                        month: month,
                                        costCenter: costCenter,
                                        //last: data.data[data.data.length - 1].created,
                                        IVA: "IVA",
                                        ivaVentas: ivaType['IVA Ventas'],
                                        ivaCompras: ivaType['IVA Compras']
                                    }
                                }).then(function (data) {
                                    calcTotal(data.data)
                                });


                                var iva = {
                                    _id: res[i]._id,
                                    name: "IVA",
                                    created: res[i].created,
                                    // type: res[i].type,
                                    centroDeCosto: res[i].centroDeCosto,
                                    month: res[i].month,
                                    year: res[i].year,
                                    type: 'Default'
                                    //adjustars:  res[i].ajustars
                                }

                                newArray.unshift(iva);
                            }
                        }
                    } else {
                        
                        newArray.push(res[i]);
                    }
                }

                $scope.impuestos = newArray;
                //$rootScope.impuestos = res;
            });
        };

        $scope.openMenu = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        $scope.deleteImpuesto = function (ev, item) {

            var confirm = $mdDialog.confirm()
                .title('¿Eliminar la impuesto?')
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .ok('Aceptar')
                .cancel('Cancelar');
            $mdDialog.show(confirm).then(function () {
                deleteImpuestoFromDB(item);
            }, function () {
                //cancelo
            });
        };

        function deleteImpuestoFromDB(item) {
            if (item) {
                item.$remove();
                $state.go('home.viewImpuesto', { centroDeCosto: item.centroDeCosto }, { reload: true });
            }
        }

        $scope.editImpuesto = function (item) {
            $scope.coefficient = item.coefficient;
            $scope.editing = item;
        };

        $scope.updateImpuesto = function (item) {
            $scope.editing = false;
            item.total = (item.total / $scope.coefficient) * item.coefficient;

            item.$update(function () {
            }, function (errorResponse) {
                console.log('error');
            });
        };

        $scope.createNewImpuesto = function () {
            // $state.go("home.createImpuesto", { centroDeCosto: sessionStorage.getItem('centroDeCosto') });
            $rootScope.costCenters = costcenters;
            $state.go("home.createImpuesto", { centroDeCosto: localStorage.getItem('centroDeCosto')});
        };

        $scope.showDialogAjustar = function ($event, item) {
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: 'modules/impuestos/views/ajustar-impuesto.client.view.html',
                locals: {
                    item: item
                },
                controller: DialogControllerAjustar
            })
        };




        $scope.showDialogPago = function ($event, item) {
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: 'modules/pagos/views/create-presentacion.client.view.html',
                locals: {
                    item: item,
                    user: user
                },
                controller: DialogController
            })
        }; //end showDialog

        function DialogControllerAjustar($scope, $mdDialog, $http, item) {
            $scope.item = item;


            $scope.apagarBoton = false;
            $scope.adjust = {};
            


            $scope.ivaType = function (iva, item) {
                if (iva == 'IVA Ventas') {
                    $scope.iva = iva;
                } else if (iva == 'IVA Compras') {
                    $scope.iva = iva
                }
            }



            $scope.closeDialog = function () {
                $mdDialog.hide();
            };

            $scope.addAjustar = function ($event, item) {
                if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {

                    if (($scope.adjust.ajustarPrice !== undefined) && ($scope.adjust.ajustarPrice !== null)) {
                        $http.put('/api/impuestos/ajustar', {
                            impuestoId: (item.type !== 'Automatico') ? $rootScope.ivaFilter[$scope.iva] : item._id,
                            month: $scope.adjust.date.getMonth(),
                            year: year,
                            created: $scope.adjust.date,
                            price: $scope.adjust.ajustarPrice,
                            observacion: $scope.adjust.observaciones,
                            costcenter: item.centroDeCosto,
                            ivaType: $scope.iva
                        })
                            .success(function (response) {
                                $state.go('home.viewImpuesto', { centroDeCosto: item.centroDeCosto }, { reload: true });
                            }).error(function (err) {
                                console.log("Error: " + err);
                            });

                        $scope.apagarBoton = true;
                    } else {
                        alert("Please complete the fields");
                    }

                    $mdDialog.hide();
                }
            }
        }

        function DialogController($scope, $mdDialog, item, user, PagosService, $filter, Socket, Cajas) {
            $scope.apagarBoton = false; //desahbilita boton de crear para evitar que se presione dos veces
            $scope.$watchCollection('ServiciosService', function () {
                $scope.findPago();
            });
            $scope.$watchCollection('Cajas', function () {
                $scope.findCajas();
            });

            $scope.Condicionventas = [];

            Condicionventas.query({e:user.enterprise.enterprise},function(res){
                $scope.condicionVentas = res;
            })
            $scope.item = item;

            $scope.montoE = 0;
            $scope.montoC = 0;

            $scope.errorCaja = undefined;

            $scope.findCajas = function () {
                Cajas.query({ e: user.enterprise._id }, function (data) {
                    $scope.cajas = $filter('filter')(data, function (item) {
                        return (item._id !== $scope.item._id);
                    })
                });
            };

            $scope.closeDialog = function () {
                $mdDialog.hide();
            };

            $scope.findPago = function () {
                $scope.pagos = PagosService.query({ e: user.enterprise._id });
            };


            $scope.createPrecentacion = function($event,item){
                  if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {
                    //if (($scope.caja !== undefined) && ($scope.caja !== null)) {

                        $scope.apagarBoton = true; //desahbilita boton de crear para evitar que se presione dos veces
                        var num =  $scope.numero || 0;
                        var numero = num.length + 1;

                        // var year = (new Date()).getFullYear();
                        //var month = (new Date()).getMonth();
                        if ($scope.pagoDate) {
                            year = (new Date($scope.pagoDate)).getFullYear();
                            month = (new Date($scope.pagoDate)).getMonth();
                        } else {
                            //$scope.pagoDate = new Date();
                            //year = (new Date($scope.pagoDate)).getFullYear()
                            //month = (new Date($scope.pagoDate)).getMonth()

                            var d = new Date();

                            var period = d.setMonth(month);

                            $scope.pagoDate = new Date(period);
                            year = (new Date($scope.pagoDate)).getFullYear();
                            month = (new Date($scope.pagoDate)).getMonth();

                        }

                        var costCenterpago = localStorage.getItem('centroDeCosto');

                        var sendObj = {
                            enterprise: user.enterprise._id,
                            created: new Date(),
                            month: month,
                            year: year,
                            ventasTotal: $scope.montoE,
                            costCenter: item._id,
                            presentacionDate: $scope.pagoDate
                        }

                       


                        $http.post('/api/presentacion',sendObj)
                        .then(successCallback,errorCallback)

                        
                        function successCallback(res) {
                          var total = 0;
                            Impuestos.get({ impuestoId: item._id }, function (impuesto) {
                                if (impuesto.type !== 'Default' && impuesto.name !== "IVA Compras") {
                                    total = impuesto.total + $scope.montoE;
                                    var totalimpuesto = impuesto.totalimpuesto + $scope.montoE;
                                    Impuestos.update({
                                        _id: item._id,
                                        total: total,
                                        price: $scope.montoE,
                                        observaciones: $scope.observaciones,
                                        type: "Manual",
                                        date: $scope.pagoDate,
                                        totalimpuesto:totalimpuesto
                                    }, function () {
                                        $state.go('home.viewImpuesto', { centroDeCosto: item.centroDeCosto }, { reload: true });
                                    }, function (errorResponse) {
                                        console.log('costo error');
                                    });
                                } else {
                                    //total = impuesto.total;
                                    item.total += $scope.montoE;
                                }

                            });
                        }

                        function errorCallback(err) {
                          console.log(err)
                        }
                       

                        $mdDialog.hide();
                   // } else {
                        //$scope.errorCaja = 'Se debe seleccionar la caja origin'
                    //}
                }

            }

            $scope.createPago = function ($event, item) {
                if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {
                    if (($scope.caja !== undefined) && ($scope.caja !== null)) {

                        $scope.apagarBoton = true; //desahbilita boton de crear para evitar que se presione dos veces

                        var numero = $scope.pagos.length + 1;

                        // var year = (new Date()).getFullYear();
                        //var month = (new Date()).getMonth();
                        if ($scope.pagoDate) {
                            year = (new Date($scope.pagoDate)).getFullYear()
                            month = (new Date($scope.pagoDate)).getMonth()
                        } else {
                            //$scope.pagoDate = new Date();
                            //year = (new Date($scope.pagoDate)).getFullYear()
                            //month = (new Date($scope.pagoDate)).getMonth()

                            var d = new Date();

                            var period = d.setMonth(month);

                            $scope.pagoDate = new Date(period);
                            year = (new Date($scope.pagoDate)).getFullYear();
                            month = (new Date($scope.pagoDate)).getMonth();

                        }

                        var costCenterpago = localStorage.getItem('centroDeCosto');

                        var pago = {
                            numero: numero,
                            impuestos: item._id,//compras id is used for IVA when pago is made on IVA
                            cajaD: $scope.caja._id,
                            costCenterpago: costCenterpago,
                            montoE: $scope.montoE,
                            montoC: $scope.montoC,
                            created: $scope.pagoDate,
                            pagoDate: $scope.pagoDate,
                            saldo: $scope.caja.total - ($scope.montoE + $scope.montoC),
                            observaciones: $scope.observaciones,
                            enterprise: user.enterprise._id,
                            condicionVentas:$scope.condicionVenta._id,
                            year: year,
                            month: month,
                            type: 'impuesto'
                        };
                        Socket.emit('pago.create', pago);
                        var total = 0;
                        Impuestos.get({ impuestoId: item._id }, function (impuesto) {
                            if (impuesto.type !== 'Default' && impuesto.name !== "IVA Compras") {
                                total = impuesto.total + $scope.montoE + $scope.montoC;
                                Impuestos.update({
                                    _id: item._id,
                                    total: total
                                }, function () {
                                    $state.go('home.viewImpuesto', { centroDeCosto: item.centroDeCosto }, { reload: true });
                                }, function (errorResponse) {
                                    console.log('costo error');
                                });
                            } else {
                                //total = impuesto.total;
                                item.pagado += $scope.montoE;
                            }

                        });

                        $mdDialog.hide();
                    } else {
                        $scope.errorCaja = 'Se debe seleccionar la caja origin'
                    }
                }
            }; //agrega puestos en el edit de caja

            $scope.addCheque = function (value) {
                $scope.errorCaja = false;
                if ($scope.caja) {
                    if ($scope.caja.cheques >= value) {
                        $scope.montoC = value;
                    } else {
                        $scope.errorCaja = 'amount is not available in selected caja';
                    }
                } else {
                    $scope.errorCaja = 'Se debe seleccionar la caja origin';
                }
            };
        }
    }
]);