'use strict';

// Comprobantes controller
angular.module('cajas').controller('CajasViewController', ['$http','$stateParams', 'user', 'Authentication', 'caja', 'TransferenciasExtra', /*'transferencias', 'arqueos'*/'ArqueosExtra', '$mdDialog',/* 'ventasPendientes', 'Compras',*/'ComprasExtra', 'MovimientosExtra','$state',
/* 'comprasFinalizadas', 'movimientos', 'ventasPendientesEntrega',  'ventasFinalizadas',*/ 'CondicionventasExtra', 'CajasExtra', '$scope', 'PagosExtra', /* 'pagosService','ventasAnuladas', */
function ($http,$stateParams, user, authentication, caja, TransferenciasExtra, /*transferencias, arqueos*/ ArqueosExtra, $mdDialog, /*ventasPendientes, Compras,*/ ComprasExtra, MovimientosExtra, $state,/*comprasFinalizadas, movimientos, ventasPendientesEntrega, ventasFinalizadas,*/ condicionventasExtra, CajasExtra, $scope, PagosExtra /*pagosService, ventasAnuladas*/) {

    // asignacion de modelos
    var global = this;
    this.user = user;
    this.caja = caja;
    this.cajaId = $stateParams.cajaId;

    //this.transferencias = transferencias;
    this.ventasFinalizada = [];
    this.movimientos = [];
    this.waiting = false;
    this.idCuenta;

    // loadmore
    this.startdate = new Date();
    this.startdate.setDate(this.startdate.getDate() - 5);    
    this.startdate.setHours(0,0,0);
    this.enddate = new Date();
    this.enddate.setHours(23,59,0);

    // asignacion de funciones

    this.findMovimientos = findMovimientos;
    this.commonService = commonService;
    this.showAlert = showAlert;
    
    var enterprise = this.user ? this.user.enterprise.enterprise : authentication.user.enterprise.enterprise;

    this.findMovimientos();
    
    $scope.back = function(item)
    {
        window.location.href = "/sucursales/view/" + item.sucursalId;
    }

    $scope.open = function(state)
    {
        if(state != 'compras')
        {
            window.location.href = '/ventas/create?cajaId=' + $stateParams.cajaId;    
        }
        else
        {
            window.location.href = "/compras/create?tipo=compra&cajaId=" + $stateParams.cajaId;
        }
        
        //console.log($stateParams.cajaId);
        //$state.go(state,$stateParams);
    }
    //global.loadmoreCondi = 0;
    
    /*
    function loadmoreCaja () {
        global.loadingCaja = true;
        
        setTimeout(function () {
            CajasExtra.loadMore(enterprise, 'Finalizada',global.ventasFinalizadaLength, 40).then(
                angular.bind(this, function (data) {
                    
                    data = data.data;                       
                    global.ventasFinalizadaLength += data.length;

                    if (data.length == 0) {
                        global.doneCaja = true;
                        return;
                    }
                    global.ventasFinalizada = global.ventasFinalizada.concat(data);
                    for (var i = 0; i < data.length; i++) {
                        if ((data[i].caja == caja._id) && (data[i].condicionVenta != global.idCuenta)) {
                            global.movimientos.push(data[i]);
                        }
                    }
                    global.loadingCaja = false; 
                    
                    loadmoreCaja();               
                })
            ).catch(
                function(err) { 
                    if (err.status == 400) {
                        global.doneCaja = true;                
                    }
                }
            );
        }, 1000);
    }
    loadmoreCaja();*/

    this.loadmore = function() {

        if (global.loadingCaja || global.doneCaja) return;        

        global.enddate = new Date(global.startdate);
        global.startdate.setDate(global.startdate.getDate() - 10);
        global.enddate.setDate(global.enddate.getDate() - 1);

        global.loadingCaja = true;  
        global.commonService();
    }


    global.ventasFinalizada = [];
    this.loadmoreCaja1 = function () {
        global.loadingCaja = true;
        global.movimientosList = global.movimientos;
        setTimeout(function () {

            // ventasFinalizadas.$promise.then(angular.bind(this, function(data) {
            //     for (var i = 0; i < data.length; i++) {
            //         if ((data[i].caja == caja._id) && (data[i].condicionVenta != global.idCuenta)) {
            //             global.movimientos.push(data[i]);
            //         }
            //     }
            // }));
            var p = global.ventasFinalizada.length ? global.ventasFinalizada.length : 0;
            var enterprise = this.user ? this.user.enterprise.enterprise : authentication.user.enterprise.enterprise;
            CajasExtra.loadMore(enterprise, 'Finalizada', p, 30).then(
                angular.bind(this, function (data) {
                    data = data.data;
                    global.ventasFinalizada = global.ventasFinalizada.concat(data);
                    for (var i = 0; i < data.length; i++) {
                        if ((data[i].caja == caja._id) && (data[i].condicionVenta != global.idCuenta)) {
                            global.movimientos.push(data[i]);
                        }

                    }
                    global.loadingCaja = false;
                    global.movimientosList = global.movimientos;
                })
            )

            // if(global.movimientosList.length === 0) {
            //     global.count = 40;
            //     global.movimientosList = global.movimientos.slice(0, 40);
            //     // global.doneCaja = true;
            // }
            //
            // if(global.movimientos.slice(global.count, global.count + 20).length >= 20) {
            //     global.movimientosList = global.movimientosList.concat(global.movimientos.slice(global.count, global.count + 20));
            //     global.loadingCaja = false;
            //     global.count += 20;
            // } else {
            //     global.movimientosList = global.movimientosList.concat(global.movimientos.slice(global.count));
            //     global.loadingCaja = false;
            //     global.count += 20;
            // }
        }, 1000);
    };

    this.new = function()
    {
        //alert();
        let cajaId = $stateParams.cajaId;
        $state.go('cajas.new',{cajaId:cajaId});

    }

    // definicion de funciones
    // this.showAlert = function(ev, obs) {
    // var parentEl = angular.element(document.body);
    //  $mdDialog.show({
    //         parent: parentEl,
    //         targetEvent: ev,
    //         template:
    //         '<md-dialog aria-label="List dialog">' +
    //         '  <md-dialog-content>'+
    //         '<h3>' +   obs + '</h3>'+
    //         '  </md-dialog-content>' +
    //         '  <md-dialog-actions>' +
    //         '    <md-button ng-click="closeDialog()" class="md-primary">' +
    //         '      Cerrar' +
    //         '    </md-button>' +
    //         '  </md-dialog-actions>' +
    //         '</md-dialog>'
    //     });
    // }

    $scope.closeDialog = function() {
        $mdDialog.hide();
    }

    var self = this;
    function sort()
    {
        $http.get('/api/cajas/' + $stateParams.cajaId).then(data=>{
            let movimientos = global.movimientos;
            let total = data.data.total;
            for(let item in movimientos)
            {
                if(movimientos[item].pagoDate)
                {
                    movimientos[item].created = movimientos[item].pagoDate;
                }
                if(movimientos[item].fecha)
                {
                    movimientos[item].created = movimientos[item].fecha;
                }
                if(movimientos[item].fechaAlta)
                {
                    movimientos[item].created = movimientos[item].fechaAlta;
                }
            }
            movimientos.sort(function(a,b){           
                return new Date(b.created).getTime() - new Date(a.created).getTime();
            })

            console.log(total);

            for(var itemdetail in movimientos)
            {
                if(itemdetail == 0)
                {
                    movimientos[itemdetail].saldo = total;    
                }
                else
                {
                    let item = itemdetail - 1;
                    var actiontotal = 0;
                    console.log(movimientos[item]);
                    movimientos[item].montoE = movimientos[item].montoE?movimientos[item].montoE:0;
                    movimientos[item].montoC = movimientos[item].montoC?movimientos[item].montoC:0;
                    movimientos[item].montoD = movimientos[item].montoD?movimientos[item].montoD:0;
                    movimientos[item].montoTD = movimientos[item].montoTD?movimientos[item].montoTD:0;
                    movimientos[item].montoTC = movimientos[item].montoTC?movimientos[item].montoTC:0;
                    if(movimientos[item].servicios || movimientos[item].impuestos || movimientos[item].personal || (movimientos[item].cajaO && movimientos[item].cajaO._id == self.caja._id))
                    {
                        actiontotal = -(movimientos[item].montoE+movimientos[item].montoC + movimientos[item].montoD + movimientos[item].montoTD + movimientos[item].montoTC);
                    }
                    else if(movimientos[item].operacion)
                    {
                        actiontotal = movimientos[item].ajuste;
                    }
                    else if(movimientos[item].cajaD && movimientos[item].cajaD._id == self.caja._id)
                    {
                        actiontotal = movimientos[item].montoE+movimientos[item].montoC + movimientos[item].montoD + movimientos[item].montoTD + movimientos[item].montoTC;
                    }
                    else if(movimientos[item].cliente && movimientos[item].estado == 'Anulada')
                    {
                        actiontotal = -movimientos[item].total;
                    }
                    else if(movimientos[item].cliente && movimientos[item].estado == 'Finalizada')
                    {
                        actiontotal = movimientos[item].total;
                    }
                    else if(movimientos[item].estado == 'haber')
                    {
                        actiontotal = - movimientos[item].monto;
                    }
                    else if(movimientos[item].estado == 'debe')
                    {
                        actiontotal = movimientos[item].monto;
                    }
                    else if(movimientos[item].proveedor)
                    {
                        actiontotal = -movimientos[item].total;
                    }

                    console.log(actiontotal);
                    movimientos[itemdetail].saldo = movimientos[item].saldo - actiontotal;
                }
            }   
            global.movimientos = movimientos;
        })
        
    }

    function commonService () {
        ArqueosExtra.loadMoreByDate(enterprise, global.startdate, global.enddate, global.cajaId ).then(
            angular.bind(this, function (res) {
                var data = res.data;

                for (var i = 0; i < data.length; i++) {
                    global.movimientos.push(data[i]);
                }

                sort(global.movimientos);
            })
        );

        TransferenciasExtra.loadMoreByDate(enterprise, global.startdate, global.enddate, global.cajaId).then(
            angular.bind(this, function (res) {
                var data = res.data;
                for (var i = 0; i < data.length; i++) {
                    global.movimientos.push(data[i]);
                }

                sort(global.movimientos);
            })
        )

        MovimientosExtra.loadMoreByDate(enterprise, 'haber', global.cajaId, global.startdate, global.enddate ).then(
            angular.bind(this, function (res) {
                var data = res.data;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].provider != undefined) {
                        global.movimientos.push(data[i]);
                    }
                }
                sort(global.movimientos);
            })
        );

        MovimientosExtra.loadMoreByDate(enterprise, 'debe', global.cajaId, global.startdate, global.enddate ).then(
            angular.bind(this, function (res) {
                var data = res.data;

                for (var i = 0; i < data.length; i++) {
                    if (data[i].client != undefined) {
                        global.movimientos.push(data[i]);
                    }
                }
                sort(global.movimientos);
            })
        );  
    
        CajasExtra.loadMoreByDate(enterprise, 'Pendiente de pago y entrega', global.startdate, global.enddate, global.cajaId ).then(
            angular.bind(this, function (res) {
                var data = res.data;
                
                for (var i = 0; i < data.length; i++) {     
                    if (data[i].condicionVenta !== global.idCuenta && data[i].caja === global.cajaId) {                        
                        global.movimientos.push(data[i]);               
                    }      
                }
                sort(global.movimientos);
            })
        );

        CajasExtra.loadMoreByDate(enterprise, 'Pendiente de entrega', global.startdate, global.enddate, global.cajaId ).then(
            angular.bind(this, function (res) {
                var data = res.data;

                for (var i = 0; i < data.length; i++) {             
                    if (data[i].condicionVenta != global.idCuenta && data[i].caja === global.cajaId) {
                        global.movimientos.push(data[i]);               
                    }      
                }
                sort(global.movimientos);

            })
        );

        CajasExtra.loadMoreByDate(enterprise, 'Anulada', global.startdate, global.enddate, global.cajaId ).then(
            angular.bind(this, function (res) {
                var data = res.data;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].condicionVenta !== global.idCuenta && data[i].caja === global.cajaId) {
                      global.movimientos.push(data[i]);
                    }
                }
                sort(global.movimientos);
            })
        );  

        ComprasExtra.loadMoreByCajaDate(enterprise, 'Finalizada', global.startdate, global.enddate, global.cajaId).then(
            angular.bind(this, function (res) {
                var data = res.data;
                
                for (var i = 0; i < data.length; i++) {
                  global.movimientos.push(data[i]);
                }
                sort(global.movimientos);

            })
        );

        PagosExtra.loadMoreByCajaDate(enterprise, global.startdate, global.enddate, global.cajaId).then(
            angular.bind(this, function (res) {
                var data = res.data;

                for (var i = 0; i < data.length; i++) {
                    if(data[i].pagoDate)
                    {
                        data[i].created = data[i].pagoDate;
                    }
                  global.movimientos.push(data[i]);
                }
                sort(global.movimientos);

            })
        );

        CajasExtra.loadMoreByDate(enterprise, 'Finalizada', global.startdate, global.enddate, global.cajaId ).then(
            angular.bind(this, function (res) {
                var data = res.data;
                for (var i = 0; i < data.length; i++) {
                  if (data[i].condicionVenta !== global.idCuenta && data[i].caja === global.cajaId) {
                    global.movimientos.push(data[i]);
                  }
                }
                sort(global.movimientos);
                global.loadingCaja = false;
            })
        );
    }

    function findMovimientos() {
        this.waiting = true;
       
        /*condicionventas.$promise.then(angular.bind(this, function (res) {
            for (var i = 0; i < res.length; i++) {
                if (res[i].name == 'Cuenta Corriente') {
                    global.idCuenta = res[i]._id;
                }
            }
        }));*/

        condicionventasExtra.loadMore(enterprise, 'Cuenta Corriente').then(
            angular.bind(this, function (res) {
                if (res.data.length > 0) {
                    global.idCuenta = res.data[0]._id;
                }                          
            })
        );

        global.enddate = new Date(8640000000000000);
        global.commonService();

        this.waiting = false;        
    }

    function showAlert($event, obs) {
        var parentEl = angular.element(document.body);
        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            template:
            '<md-dialog aria-label="List dialog">' +
            '  <md-dialog-content>'+
                obs +
            '  </md-dialog-content>' +
            '  <md-dialog-actions>' +
            '    <md-button ng-click="closeDialog()" class="md-primary">' +
            '      Cerrar' +
            '    </md-button>' +
            '  </md-dialog-actions>' +
            '</md-dialog>',
            locals: {
            items: global.movimientos,
            selectedCaja: global.caja,
            cierreDeCaja: obs
            },
            controller: DialogController
        });
        function DialogController($scope, $mdDialog, items, selectedCaja, cierreDeCaja) {
            $scope.aperturaValue = 0;
            $scope.ingresosSum = 0;
            $scope.egresosSum = 0;
            $scope.total = 0;

            $scope.items = items;
            $scope.total = cierreDeCaja.total;
            $scope.itemsSorted = [];

            function sortItemsByDate(itemsNotSorted) {
                var sortedItems = itemsNotSorted.sort(function(a, b) {
                    var dateA = new Date(a.created), dateB = new Date(b.created);
                    return dateA - dateB;
                });

                sortedItems.reverse();

                return sortedItems;
            }

            function calculateAllValues() {
                var sortedMovimientos = sortItemsByDate($scope.items);
                var oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                for(var i = 0; i < sortedMovimientos.length; i++) {
                    var item = sortedMovimientos[i];

                    if (new Date(item.created) < new Date(cierreDeCaja.created)) {
                        if ((item.operacion && item.operacion === 'Apertura de Caja') || (new Date(item.created) < oneWeekAgo)) {
                            $scope.aperturaValue = item.total;

                            return;
                        } else if (item.cajaD && item.cajaD._id === selectedCaja._id) {
                            $scope.ingresosSum += item.montoE + item.montoC + item.montoD + item.montoTD + item.montoTC;
                        } else if (item.estado == 'haber') {
                            $scope.ingresosSum += item.saldoCaja;
                        } else if (item.cliente && item.estado == 'Finalizada') {
                            $scope.ingresosSum += item.total;
                        } else if (item.operacion && item.ajuste > 0) {
                            $scope.ingresosSum += item.ajuste;
                        } else if (item.cajaO && item.cajaO._id === selectedCaja._id) {
                            $scope.egresosSum += item.montoE + item.montoC + item.montoD + item.montoTD + item.montoTC;
                        } else if (item.operacion && item.ajuste < 0) {
                            $scope.egresosSum -= item.ajuste;
                        } else if (item.cliente && item.estado == 'Anulada') {
                            $scope.egresosSum += item.total;
                        } else if (item.proveedor) {
                            $scope.egresosSum += item.total;
                        }else if (item.estado == 'debe') {
                            $scope.egresosSum += item.monto;
                        }
                    }
                }

                if (!$scope.egresosSum) {
                    $scope.egresosSum = 0;
                }

                if (!$scope.ingresosSum) {
                    $scope.ingresosSum = 0;
                }
            }

            calculateAllValues();
            
            $scope.closeDialog = function() {
                $mdDialog.hide();
            }
        }
    }

}
]);
