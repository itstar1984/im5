'use strict';

// Create Impuesto controller
angular.module('impuestos').controller('ImpuestosDetailsController', ['$state', 'Condicionventas','$scope','Authentication' ,'$rootScope', "$filter", '$http', '$mdDialog', '$stateParams', 'VentasExtra', 'ComprasExtra', 'ImpuestosTax','Impuestos',
    function ($state,Condicionventas, $scope,Authentication, $rootScope, $filter, $http, $mdDialog, $stateParams, VentasExtra, ComprasExtra, ImpuestosTax,Impuestos) {

        this.showDialog = showDialog;
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
        if (localStorage.getItem("dateImpuestos")) {
            var date = JSON.parse(localStorage.getItem("dateImpuestos"));
            year = Object.keys(date).length !== 0 ? date.year : (new Date()).getFullYear();
            month = Object.keys(date).length !== 0 ? date.month : (new Date()).getMonth();
        }

        $scope.impuestosName = $stateParams.impuestosName;
        $scope.impuestosType = $stateParams.impuestosType;
        $scope.start = true;
        $scope.impuestos = [];
        $scope.ajustars = [];

        $scope.showAlert = function (ev, obs) {
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title(obs)
                    .ariaLabel('Alert Dialog Demo')
                    .targetEvent(ev)
                    .ok('Cerrar')
            );
        }

        function calculatecaja()
        {
            let saldo = $scope.impuestos[$scope.impuestos.length - 1].saldo;

            $scope.impuestos.sort(function(a,b){
                return new Date(a.created).getTime() - new Date(b.created).getTime();
            })
        }

        function showDialog($event,item,movimientos = {}) {
            console.log($stateParams);
           $mdDialog.show({
                targetEvent: $event,
                templateUrl: 'modules/pagos/views/create-pago.client.view.html',
                locals: {
                    item: {_id:$stateParams.impuestosId,name:$stateParams.impuestosName},
                    user: Authentication.user
                },
                controller: DialogController
            })
        }; //end showDialog

        function DialogController($scope, $mdDialog, Condicionventas, item, user, PagosService, $filter, Socket, Cajas,Impuestos) {
            $scope.title = "Neuva Pago";
            $scope.apagarBoton = false; //desahbilita boton de crear para evitar que se presione dos veces
            $scope.$watchCollection('ServiciosService', function () {
                $scope.findPago();
            });
            $scope.$watchCollection('Cajas', function () {
                $scope.findCajas();
            });

            $scope.item = item;

            $scope.montoE = 0;
            $scope.montoC = 0;
            $scope.pagoDate = new Date();
            $scope.errorCaja = undefined;

            $scope.Condicionventas = [];

            Condicionventas.query({e:user.enterprise.enterprise},function(res){
                $scope.condicionVentas = res;
            })

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
                          console.log(res);
                            Impuestos.get({ impuestoId: item._id }, function (impuesto) {
                                if (impuesto.type !== 'Default' && impuesto.name !== "IVA Compras") {
                                    total = impuesto.total + $scope.montoE;
                                    Impuestos.update({
                                        _id: item._id,
                                        total: total,
                                        price: $scope.montoE,
                                        observaciones: $scope.observaciones,
                                        type: "Manual",
                                        date: $scope.pagoDate,
                                        operacion:"Pagos"
                                    }, function () {
                                        $state.go('home.detailsImpuesto', {impuestosId: item._id, impuestosName: item.name}, { reload: true });
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

                        console.log($scope.pagoDate);
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

                        console.log(pago);
                        Socket.emit('pago.create', pago);
                        var total = 0;
                        Impuestos.get({ impuestoId: item._id }, function (impuesto) {
                            if (impuesto.type !== 'Default' && impuesto.name !== "IVA Compras") {
                                var totalimpuesto = impuesto.totalimpuesto > 0?impuesto.totalimpuesto:impuesto.total;
                                total = totalimpuesto - $scope.montoE - $scope.montoC;
                                Impuestos.update({
                                    _id: item._id,
                                    totalimpuesto: total
                                }, function () {
                                    $state.go('home.detailsImpuesto', {impuestosId: item._id, impuestosName: item.name}, { reload: true });
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
        //end DialogController

        function calcSaldo(arr,total) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].totalTax)
                    arr[i].filter_date = arr[i].fechaRecepcion;
                else if (arr[i].costCenter)
                    arr[i].filter_date = arr[i].presentacionDate;
                else if (arr[i].montoE)
                    arr[i].filter_date = arr[i].pagoDate;
                else
                    arr[i].filter_date = arr[i].created;
            }

            console.log(total);
            var amount = arr[arr.length - 1].saldo;
            var newArr = $filter('orderBy')(arr, '-filter_date');

            console.log(newArr);
            var nextItem;
            // for (var i = newArr.length - 1; i >= 0; i--) {
            //     nextItem = newArr[i + 1];
            //     //newArr[i].saldo = 0;

            //     /*if(nextItem){
            //       amount = newArr[i].totalTax || newArr[i].montoE || newArr[i].price || 0;
            //       newArr[i].saldo = (nextItem.cliente) ? ( nextItem.saldo + newArr[i].totalTax ) : (nextItem.proveedor) ? ( nextItem.saldo - newArr[i].totalTax ) : (nextItem.montoE) ?
            //       (nextItem.saldo - newArr[i].montoE) : (newArr[i].adjType == 'IVA Ventas') ? (nextItem.saldo + newArr[i].price) : (newArr[i].adjType == 'IVA Compras') ? (nextItem.saldo - newArr[i].price) : 0;
            //     } else {
            //       newArr[i].saldo = (newArr[i].montoE) ? newArr[i].montoE : (newArr[i].adjType) ? (newArr[i].price) : newArr[i].totalTax;
            //     }*/
            //     if (!nextItem) {
            //         newArr[i].saldo = (newArr[i].montoE) ? (-newArr[i].montoE) :
            //             (newArr[i].costCenter) ? (newArr[i].ivaTotal) :
            //                 (newArr[i].adjType == 'IVA Compras') ? (-newArr[i].price) :
            //                     (newArr[i].adjType == 'IVA Ventas') ? (newArr[i].price) :
            //                         (newArr[i].totalTax) ? (newArr[i].totalTax) : (0);
            //     } else {
            //         newArr[i].saldo = (newArr[i].montoE) ? (nextItem.saldo - newArr[i].montoE) :
            //             (newArr[i].costCenter) ? (nextItem.saldo + newArr[i].ivaTotal) :
            //                 (newArr[i].adjType == 'IVA Compras') ? (nextItem.saldo - newArr[i].price) :
            //                     (newArr[i].adjType == 'IVA Ventas') ? (nextItem.saldo + newArr[i].price) :
            //                         (newArr[i].totalTax) ? (nextItem.saldo - newArr[i].totalTax) : (nextItem.saldo);
            //     }
            //     //newArr[i].saldo = 50;

            // }
            for(var i = 0;i<newArr.length;i++)
            {
                if(i == 0)
                {
                    newArr[i].saldo = total;
                }
                else 
                {
                    if(newArr[i - 1].montoE)
                    {
                        newArr[i].saldo = newArr[i - 1].saldo + newArr[i - 1].montoE;    
                    }
                    else if(newArr[i - 1].type == 'Automatio' || newArr[i - 1].type == 'Automatio' == 'Manual' || newArr[i - 1].proveedor || newArr[i - 1].adjType == 'IVA Ventas' || newArr[i - 1].ivaType == 'IVA Ventas')
                    {
                        newArr[i].saldo = newArr[i - 1].saldo + newArr[i - 1].price;   
                    }
                    else
                    {
                        newArr[i].saldo = newArr[i - 1].saldo - newArr[i - 1].price;    
                    }
                    
                }
            }

             $scope.impuestos = newArr;
         }

        $scope.loadmore = function () {

            $scope.loading = true;
            $scope.start = false;
            var last = $scope.impuestos.length ? $scope.impuestos[$scope.impuestos.length - 1].created : null;
            var limit = $scope.impuestos.length < 40 ? 40 : 20;



            // if ($scope.impuestosName == 'IVA Ventas') {
            //     VentasExtra.loadMoreImpuestos($stateParams.impuestosId, last, limit, year, month).then(
            //         function(data) {

            //             $scope.impuestos = $scope.impuestos.concat(data.data);
            //             $scope.loading = false;
            //             $scope.start = false;
            //             if (data.data.length === 0)
            //                 $scope.done = true;
            //             else {
            //                 $http.get('/api/impuestos/ajustar', {
            //                     params: {
            //                         impuestoId: $stateParams.impuestosId,
            //                         year: year,
            //                         month: month,
            //                         last: data.data[data.data.length - 1].created
            //                     }
            //                 }).then(function(data) {

            //                     $scope.impuestos = $scope.impuestos.concat(data.data);
            //                 });
            //             }
            //         }
            //     )
            // } else if ($scope.impuestosName == 'IVA Compras') {
            //     ComprasExtra.loadMoreImpuestos($stateParams.impuestosId, last, limit, year, month).then(
            //         function(data) {
            //             $scope.impuestos = $scope.impuestos.concat(data.data);
            //             $scope.loading = false;
            //             $scope.start = false;
            //             if (data.data.length === 0)
            //                 $scope.done = true;
            //             else {
            //                 $http.get('/api/impuestos/ajustar', {
            //                     params: {
            //                         impuestoId: $stateParams.impuestosId,
            //                         year: year,
            //                         month: month,
            //                         last: data.data[data.data.length - 1].created
            //                     }
            //                 }).then(function(data) {
            //                     $scope.impuestos = $scope.impuestos.concat(data.data);
            //                 });
            //             }
            //         }
            //     )
            // }
            if ($scope.impuestosName == 'IVA Ventas') {
                ImpuestosTax.loadMoreImpuestos($stateParams.impuestosId, last, limit, year, month).then(
                    function (data) {
                        $scope.impuestos = $scope.impuestos.concat(data.data);
                        $scope.loading = false;
                        $scope.start = false;
                        if (data.data.length === 0)
                            $scope.done = true;
                        else {
                            $http.get('/api/impuestos/ajustar', {
                                params: {
                                    impuestoId: $stateParams.impuestosId,
                                    year: year,
                                    month: month,
                                    last: data.data[data.data.length - 1].created
                                }
                            }).then(function (data) {
                                $scope.impuestos = $scope.impuestos.concat(data.data);
                                $http.get('/api/impuestos/' + $stateParams.impuestosId).then(function(data){

                                    calcSaldo($scope.impuestos,data.data.total);
                                })
                                
                            });
                        }
                    }
                )
            } else if ($scope.impuestosName == 'IVA Compras') {
                ImpuestosTax.loadMoreImpuestos($stateParams.impuestosId, last, limit, year, month).then(
                    function (data) {
                        $scope.impuestos = $scope.impuestos.concat(data.data);
                        $scope.loading = false;
                        $scope.start = false;
                        if (data.data.length === 0)
                            $scope.done = true;
                        else {
                            $http.get('/api/impuestos/ajustar', {
                                params: {
                                    impuestoId: $stateParams.impuestosId,
                                    year: year,
                                    month: month,
                                    last: data.data[data.data.length - 1].created
                                }
                            }).then(function (data) {
                                $scope.impuestos = $scope.impuestos.concat(data.data);
                                $http.get('/api/impuestos/' + $stateParams.impuestosId).then(function(data){

                                    calcSaldo($scope.impuestos,data.data.totalimpuesto);
                                })
                            });
                        }
                    }
                )

            } else if ($scope.impuestosName == 'IVA') {
                var iva = JSON.parse(localStorage.getItem('ivaType'));
                var costCenter = sessionStorage.getItem('centroDeCosto');
                var costCenter = localStorage.getItem('centroDeCosto');
                $scope.isIVA = true;
                $http.get('/api/impuestos/ajustar', {
                    params: {
                        impuestoId: $stateParams.impuestosId,
                        year: year,
                        month: month,
                        costCenter: costCenter,
                        //last: data.data[data.data.length - 1].created,
                        IVA: $scope.impuestosName,
                        ivaVentas: iva['IVA Ventas'],
                        ivaCompras: iva['IVA Compras']
                    }
                }).then(function (data) {
                    $scope.impuestos = $scope.impuestos.concat(data.data);
                    Impuestos.query({_id:$stateParams.impuestosId},function(data){
                        calcSaldo($scope.impuestos,data.total);
                    })
                });
                /*ImpuestosTax.loadMoreImpuestos($stateParams.impuestosId, last, limit, year, month, $scope.impuestosName,iva['IVA Ventas'],iva['IVA Compras']).then(
                    function(data) {
                        //$scope.impuestos = $scope.impuestos.concat(data.data);
                        //calcSaldo(data.data)
                        $scope.loading = false;
                        $scope.start = false;
                        if (data.data.length === 0)
                            $scope.done = true;
                        else {
                            $http.get('/api/impuestos/ajustar', {
                                params: {
                                    impuestoId: $stateParams.impuestosId,
                                    year: year,
                                    month: month,
                                    last: data.data[data.data.length - 1].created,
                                    IVA: $scope.impuestosName,
                                    ivaVentas: iva['IVA Ventas'],
                                    ivaCompras: iva['IVA Compras']
                                }
                            }).then(function(data) {
                                calcSaldo(data.data)
                            });
                        }
                    }
                )*/
            } else {
                // ImpuestosTax.loadMoreImpuestos($stateParams.impuestosId, last, limit, year, month,true).then(
                //     function (data) {
                //         $scope.impuestos = $scope.impuestos.concat(data.data);
                //         $scope.loading = false;
                //         $scope.start = false;
                //         if (data.data.length === 0)
                //             $scope.done = true;
                //         else {
                            
                //         }
                //     }
                // )
                $http.get('/api/impuestos/ajustar', {
                    params: {
                        impuestoId: $stateParams.impuestosId,
                        year: year,
                        month: month,
                        all:true
                    }
                }).then(function (data) {
                    $scope.impuestos = $scope.impuestos.concat(data.data);

                    $http.get('/api/impuestos/' + $stateParams.impuestosId).then(function(data){

                        calcSaldo($scope.impuestos,data.data.totalimpuesto);
                    })
                });
            }
        };

    }
]);