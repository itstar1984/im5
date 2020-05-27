'use strict';

// Comprobantes controller
angular.module('sucursales').controller('SucursalesViewController', ['PagosExtra','ComprasExtra','TransferenciasExtra','ArqueosExtra','user', 'sucursal', '$mdDialog', 'cajas', 'Socket', 'Cajas','MovimientosExtra','$http','CajasExtra','Arqueos',
    function(PagosExtra,ComprasExtra,TransferenciasExtra,ArqueosExtra,user, sucursal, $mdDialog, cajas, Socket, Cajas,MovimientosExtra,$http,CajasExtra,Arqueos) {

        // asignacion de modelos
        this.user = user;
        this.sucursal = sucursal;
        this.cajas = cajas;

        this.arrayCajas = [];
        var originatorEv;
        this.editing = false;
        this.cueid  = true;
        this.selectedMode = 'md-scale';
        this.selectedDirection = 'up';

        this.cajasdata = {};
        // asignacion de funciones

        this.showDialog = showDialog;
        this.showDialogTransferencia = showDialogTransferencia;
        this.showDialogArqueo = showDialogArqueo;
        this.findUsuarios = findUsuarios;
        this.openMenu = openMenu;
        this.showConfirm = showConfirm;
        this.editingCaja = editingCaja;
        this.editCaja = editCaja;
        this.showDialogPuestos = showDialogPuestos;
        this.findFromArray = findFromArray;
        this.getdebe_from_cajaid = getdebe_from_cajaid;
        this.arqueo = {};
        this.Cierre = {};
        this.getsumcajatype = getsumcajatype;
        this.getcajasdata = getcajasdata;
        this.sumcajatype = sumcajatype;
        this.sumtransfer = sumtransfer;
        var enterprise = this.user ? this.user.enterprise.enterprise : authentication.user.enterprise.enterprise;
        
        this.sumingresos = sumingresos;
        this.sumeggresos = sumeggresos;
        this.getingressos = getingressos;
        this.getemgressos = getemgressos;

        this.sumcompras = sumcompras;
        this.getcompras = getcompras;

        this.sumpagos = sumpagos;
        this.getpagos = getpagos;
        this.getsumpago = getsumpago;

        this.sumcobos = sumcobos;
        this.getcobos = getcobos;
        this.getsumcobos = getsumcobos;


        this.pagos = {};
        this.compras = {};
        this.ingresos = {};
        this.egresos = {};
        this.cobos = {};
        this.findUsuarios(cajas);

        this.transfer = {};

        this.gettransfer = gettransfer;

        this.getcierre = getcierre;
        function getcierre(id)
        {
            let sum = 0;
            sum = this.arqueo[id];
            sum += (this.cajasdata[id] && this.cajasdata[id]['Efectivo'])?this.cajasdata[id]['Efectivo']:0;
            sum -= (this.transfer[id] && this.transfer[id]['effectivo'])?this.transfer[id]['effectivo']:0;
            sum -= (this.compras[id] && this.compras[id]['effectivo'])?this.compras[id]['effectivo']:0;
            sum -= (this.pagos[id] &&this.pagos[id]['Efectivo'])?this.pagos[id]['Efectivo']:0;
            sum += (this.cobos[id] && this.cobos[id]['Efectivo'])?this.cobos[id]['Efectivo']:0;
            return sum;
        }

        function sumpagos(id,name,total)
        {
            if(!this.pagos[id])
            {
                this.pagos[id] = {};
            }

            if(!this.pagos[id][name])
            {
                this.pagos[id][name] = 0;
            }

            this.pagos[id][name] += total;   
        }
        
        function getpagos(id)
        {
            let data = [];

            for(let item in this.pagos[id])
            {
                data.push(item);
            }

            return data;
        }

        function sumcobos(id,name,total)
        {
            if(!this.cobos[id])
            {
                this.cobos[id] = {};
            }

            if(!this.cobos[id][name])
            {
                this.cobos[id][name] = 0;
            }

            this.cobos[id][name] += total;   
        }
        
        function getcobos(id)
        {
            let data = [];

            for(let item in this.cobos[id])
            {
                data.push(item);
            }

            return data;
        }

        function getsumcobos(id)
        {
            var sum = 0;
            for(let item in this.cobos[id])
            {
                sum += this.cobos[id][item];
            }

            return sum;
        }

        function sumtransfer(id,name,total)
        {
            if(!this.transfer[id])
            {
                this.transfer[id] = {};
            }

            if(!this.transfer[id][name])
            {
                this.transfer[id][name] = 0;
            }

            this.transfer[id][name] += total;
        }

        function gettransfer(id)
        {
            let data = [];

            for(let item in this.transfer[id])
            {
                data.push(item);
            }

            return data;
        }

        function getsumpago(id)
        {
            var sum = 0;
            for(let item in this.pagos[id])
            {
                sum += this.pagos[id][item];
            }

            return sum;
        }

        function getingressos(id)
        {
            let sum = 0;

            for(let item in this.cajasdata[id])
            {
                sum += this.cajasdata[id][item];
            }

            for(let item in this.cobos[id])
            {
                sum+= this.cobos[id][item];
            }


            return sum;
        }   


        function getcompras(id)
        {
            let data = [];

            for(let item in this.compras[id])
            {
                data.push(item);
            }

            return data;
        }

        function sumcompras(id,name,total)
        {
            if(!this.compras[id])
            {
                this.compras[id] = {};
            }

            if(!this.compras[id][name])
            {
                this.compras[id][name] = 0;
            }

            this.compras[id][name] += total;
        }
        function getemgressos(id)
        {
            var total = 0;
            
            for(let item in this.pagos[id])
            {
                total += this.pagos[id][item];
            }

            for(let item in this.transfer[id])
            {
                total += this.transfer[id][item];
            }

            return -total;
        }

        function sumingresos(id,name,data)
        {
            if(!this.ingresos[id])
            {
                this.ingresos[id] = {};   
            }

            if(!this.ingresos[id][name])
            {
                this.ingresos[id][name] = 0;
            }
            
            if(data.servicios || data.impuestos || data.personal || data.cajaD)
            {
                this.ingresos[id][name] += data.montoE+data.montoC + data.montoD + data.montoTD + data.montoTC;
            }

            if(data.operacion && data.ajuste > 0)
            {
                this.ingresos[id][name] += data.ajuste;
            }
            else if(data.estado == 'haber')
            {
                this.ingresos[id][name] += data.saldoCaja;
            }
            else if(data.estado == 'debe')
            {
                this.ingresos[id][name] += data.saldoCaja;   
            }
            else if(data.cliente && data.estado == 'Finalizada')
            {
                this.ingresos[id][name] += data.total; 
            }

        }

        function getsumcajatype(id)
        {
            var sum = 0;
            if(!this.cajasdata[id])
            {
                return sum;
            }

            for(let item in this.cajasdata[id])
            {
                sum += this.cajasdata[id][item];
            }

            return sum;
        }

        function getcajasdata(id)
        {
            var data = [];
            for(let item in this.cajasdata[id])
            {
                data.push(item);
            }

            return data;
        }

        function sumcajatype(id,name,total)
        {
            if(!this.cajasdata[id])
            {
                this.cajasdata[id] = {};
            }

            if(!this.cajasdata[id][name])
            {
                this.cajasdata[id][name] = 0;
            }

            this.cajasdata[id][name] += total;
        }



        function sumeggresos(id,name,data)
        {
            if(!this.egresos[id])
            {
                this.egresos[id] = {};   
            }

            if(!this.egresos[id][name])
            {
                this.egresos[id][name] = 0;
            }
            if(data.servicios || data.impuestos || data.personal || data.cajaD)
            {
                this.egresos[id][name] += data.montoE+data.montoC + data.montoD + data.montoTD + data.montoTC;
            }
            else if(data.operacion && data.ajuste < 0)
            {
                this.egresos[id][name] -= data.ajuste;
            }
            else if(data.cliente && data.estado == 'Anulada')
            {
                this.egresos[id][name] += data.total;   
            }
            else if(data.proveedor)
            {
                this.egresos[id][name] += data.total;      
            }
            else if(data.estado == 'debe')
            {
                this.egresos[id][name] += data.monto;         
            }
        }

        // definicion de funciones
        function getdebe_from_cajaid(id_array, date_array)
        {
            var end_date = new Date();
            var start_date = findAperturasMinDate(date_array);
            

            ArqueosExtra.loadMoreByDate(enterprise, start_date, end_date, id_array ).then(
                angular.bind(this, function (res) {
                    var data = res.data;

                    for (var i = 0; i < data.length; i++) {
                          if(!date_array[data[i]['caja']] || new Date(data[i].created) > new Date(date_array[data[i]['caja']]))
                          {
                            this.sumeggresos(data[i]['caja'],'arque',data[i]);
                            this.sumingresos(data[i]['caja'],'arque',data[i]);  
                          }                              
                    }
                })
            );

            TransferenciasExtra.loadMoreByDate(enterprise, start_date, end_date, id_array).then(
                angular.bind(this, function (res) {
                    var data = res.data;
             
                    for (var i = 0; i < data.length; i++) {
                          if(!date_array[data[i].cajaO._id] || new Date(data[i].created) > new Date(date_array[data[i].cajaO._id]))
                          {
                            this.sumeggresos(data[i].cajaO._id,'arque',data[i]);
                            data[i].montoD = data[i].montoD?data[i].montoD:0;
                            data[i].montoC = data[i].montoC?data[i].montoC:0;
                            data[i].montoE = data[i].montoE?data[i].montoE:0;
                            data[i].montoTD = data[i].montoTD?data[i].montoTD:0;
                            data[i].montoTC = data[i].montoTC?data[i].montoTC:0;
                            this.sumtransfer(data[i].cajaO._id,data[i].transType,data[i].montoC + data[i].montoE + data[i].montoD + data[i].montoTC + data[i].montoTD);
                          }

                          if(!date_array[data[i].cajaD._id] || new Date(data[i].created) > new Date(date_array[data[i].cajaD._id]))
                          {
                            this.sumingresos(data[i].cajaD._id,'arque',data[i]);  
                            data[i].montoD = data[i].montoD?data[i].montoD:0;
                            data[i].montoC = data[i].montoC?data[i].montoC:0;
                            data[i].montoE = data[i].montoE?data[i].montoE:0;
                            data[i].montoTD = data[i].montoTD?data[i].montoTD:0;
                            data[i].montoTC = data[i].montoTC?data[i].montoTC:0;
                            this.sumtransfer(data[i].cajaD._id,data[i].transType,data[i].montoC + data[i].montoE + data[i].montoD + data[i].montoTC + data[i].montoTD);
                          }


                    }
                })
            )

            MovimientosExtra.loadMoreByDate(enterprise, 'haber', id_array, start_date, end_date).then(
                angular.bind(this, function (res) {
                    var data = res.data;
                    for (var i = 0; i < data.length; i++) {
                          if(!date_array[data[i].caja] || new Date(data[i].created) > new Date(date_array[data[i].caja]))
                          {
                            this.sumeggresos(data[i]['caja'],'arque',data[i]);
                            this.sumingresos(data[i]['caja'],'arque',data[i]);  
                            if(data[i].estado == 'haber')
                            {
                                this.sumpagos(data[i].caja,data[i].condicion.name,data[i].monto);    
                            }
                            else if(data[i].estado == 'debe')
                            {
                                this.sumcobos(data[i].caja,data[i].condicion.name,data[i].monto);
                            }
                            
                          }                              
                    }
                })
            );

            MovimientosExtra.loadMoreByDate(enterprise, 'debe', id_array, start_date, end_date).then(
                angular.bind(this, function (res) {
                    var data = res.data;

                   for (var i = 0; i < data.length; i++) {
                          if(!date_array[data[i].caja] || new Date(data[i].created) > new Date(date_array[data[i].caja]))
                          {
                            this.sumeggresos(data[i]['caja'],'arque',data[i]);
                            this.sumingresos(data[i]['caja'],'arque',data[i]);  
                            if(data[i].estado == 'haber')
                            {
                                this.sumpagos(data[i].caja,data[i].condicion.name,data[i].monto);    
                            }
                            else if(data[i].estado == 'debe')
                            {
                                this.sumcobos(data[i].caja,data[i].condicion.name,data[i].monto);
                            }
                          }                              
                    }
                })
            );  
        

            ComprasExtra.loadMoreByCajaDate(enterprise, 'Finalizada', start_date, end_date, id_array).then(
                angular.bind(this, function (res) {
                    var data = res.data;
                    
                    for (var i = 0; i < data.length; i++) {
                          if(!date_array[data[i].caja] || new Date(data[i].created) > new Date(date_array[data[i].caja]))
                          {
                            this.sumeggresos(data[i].caja,'arque',data[i]);
                            this.sumingresos(data[i].caja,'arque',data[i]);  
                            this.sumcompras(data[i].caja,data[i].condicionVenta.name,data[i].total);
                          }                              
                    }
                })
            );

            PagosExtra.loadMoreByCajaDate(enterprise, start_date, end_date, id_array).then(
                angular.bind(this, function (res) {
                    var data = res.data;
                    for (var i = 0; i < data.length; i++) {
                          if(!date_array[data[i].cajaD._id] || new Date(data[i].created) > new Date(date_array[data[i].cajaD._id]))
                          {
                            data[i].montoD = data[i].montoD?data[i].montoD:0;
                            data[i].montoC = data[i].montoC?data[i].montoC:0;
                            data[i].montoE = data[i].montoE?data[i].montoE:0;
                            data[i].montoTD = data[i].montoTD?data[i].montoTD:0;
                            data[i].montoTC = data[i].montoTC?data[i].montoTC:0;
                            this.sumeggresos(data[i].cajaD._id,'arque',data[i]);
                            this.sumingresos(data[i].cajaD._id,'arque',data[i]);  
                            if(data[i].condicionVentas)
                            {
                                this.sumpagos(data[i].cajaD._id,data[i].condicionVentas.name,data[i].montoC + data[i].montoE + data[i].montoD + data[i].montoTC + data[i].montoTD);    
                            }
                            
                          }                              
                    }

                })
            );

            //  CajasExtra.loadMoreByDate(enterprise, 'Pendiente de pago y entrega', start_date, end_date, id_array ).then(
            //     angular.bind(this, function (res) {
            //         var data = res.data;
                    
            //         for (var i = 0; i < data.length; i++) {
            //               if(!date_array[data[i]._id] || new Date(data[i].created) > new Date(date_array[data[i]._id]))
            //               {
            //                 this.sumeggresos(data[i]._id,'arque',data[i]);
            //                 this.sumingresos(data[i]._id,'arque',data[i]);  
            //               }                              
            //         }

            //     })
            // );

            // CajasExtra.loadMoreByDate(enterprise, 'Pendiente de entrega', start_date, end_date, id_array ).then(
            //     angular.bind(this, function (res) {
            //         var data = res.data;

            //       for (var i = 0; i < data.length; i++) {
            //               if(!date_array[data[i]._id] || new Date(data[i].created) > new Date(date_array[data[i]._id]))
            //               {
            //                 this.sumeggresos(data[i]._id,'arque',data[i]);
            //                 this.sumingresos(data[i]._id,'arque',data[i]);  
            //               }                              
            //         }

            //     })
            // );

            CajasExtra.loadMoreByDate(enterprise, 'Anulada', start_date, end_date, id_array ).then(
                angular.bind(this, function (res) {
                    var data = res.data;
                   for (var i = 0; i < data.length; i++) {
                          if(!date_array[data[i].caja] || new Date(data[i].created) > new Date(date_array[data[i].caja]))
                          {
                            this.sumeggresos(data[i].caja,'arque',data[i]);
                            this.sumingresos(data[i].caja,'arque',data[i]);
                            if(data[i].cliente)
                            {
                               this.sumcajatype(data[i].caja,data[i].condicionVenta.name,data[i].total); 
                            }  
                          }                              
                    }
                })
            );

            CajasExtra.loadMoreByDate(enterprise, 'Finalizada', start_date, end_date, id_array ).then(
                angular.bind(this, function (res) {      
                    var data = res.data;

                    for (var i = 0; i < data.length; i++) {
                        if(!date_array[data[i].caja] || new Date(data[i].created) > new Date(date_array[data[i].caja]))
                            {
                                this.sumeggresos(data[i].caja,'arque',data[i]);
                                this.sumingresos(data[i].caja,'arque',data[i]);
                                if(data[i].cliente)
                                {
                                   this.sumcajatype(data[i].caja,data[i].condicionVenta.name,data[i].total); 
                                }  
                            }                              
                    }                  
                })            
            );
     }

     function findAperturasMinDate(date_array) {
        var allHaveAperturaDate = true;
        var minDate = new Date();

        var oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        for(var idProperty in date_array) {
            if(idProperty && date_array.hasOwnProperty(idProperty) && date_array[idProperty]) {
                if(new Date(date_array[idProperty]) < new Date(minDate)) {
                    minDate = date_array[idProperty];
                }
                allHaveAperturaDate = allHaveAperturaDate && true;
            } else {
                allHaveAperturaDate = allHaveAperturaDate && false;
            }
        }

        if(allHaveAperturaDate) {
            return minDate;
        } else {
            return oneWeekAgo;
        }
     }

        function findFromArray(array, object) {

            if (!array) return false;
            if (!object) return false;

            var checker = false;

            array.forEach(function(entry) {
                if (entry._id === object._id) checker = true;
            })

            return checker;
        }

        function findLastAperturaDeCajaByDate(data) {
            data = data ? data : [];
            var lastAperturaDeCajaDate = new Date('0');
            var lastAperturaDeCaja = {};

            for(var index = data.length - 1; index >=0; index--)
            {
                if(data[index].operacion === "Apertura de Caja" && new Date(data[index].created) > lastAperturaDeCajaDate) {
                    lastAperturaDeCaja = data[index];
                }
            }

            return lastAperturaDeCaja;
        }

        function findLastCierreDeCajaByDate(data) {
            data = data ? data : [];
            var lastCierreDeCajaDate = new Date('0');
            var lastCierreDeCaja = {};

            for(var index = data.length - 1; index >=0; index--)
            {
                if(data[index].operacion === "Cierre de Caja" && new Date(data[index].created) > lastCierreDeCajaDate) {
                    lastCierreDeCaja = data[index];
                }
            }

            return lastCierreDeCaja;
        }

        function groupDataByCajaId(data) {
            var groupedData = data.reduce(function(results, item) {
                (results[item.caja] = results[item.caja] || []).push(item);
                return results;
            }, {})

            return groupedData;
        }

        function findUsuarios(cajas) {
            if ((this.user.roles[0] !== 'admin') && (this.user.roles[0] !== 'groso')) {
                cajas.$promise.then(angular.bind(this, function(data) {
                    for (var i in data) {
                        if (data[i].puestos !== undefined) {
                            if (data[i].puestos.length !== 0) {
                                for (var j in data[i].puestos) {
                                    if (data[i].puestos[j]._id === user.puesto) {
                                        this.arrayCajas.push(data[i]);
                                    }
                                }
                            }
                        }
                    }
                }));
            } else {
                this.arrayCajas = cajas;
                this.arqueo = {};                
                 
                $http.get('api/condicionventas/loadmore',{enterprise:enterprise,name:'Cuenta Corriente'}).then(function(res){
                      angular.bind(this, function (res) {
                            if (res.data.length > 0) {
                                this.cueid = res.data[0]._id;
                            }                          
                        })                      
                 })
                this.ingresos = {}; this.egresos ={};
                this.Cierre = {};
                this.arrayCajas.$promise.then(angular.bind(this,function(data){

                    var id_array = []; var update_array = {};
                    for(var i in data)
                    {
                        if(!data[i].deleted && data[i].sucursal == this.sucursal._id)
                        {
                            id_array.push(data[i]._id);
                            update_array[data[i]._id] = data[i].updated;
                        }
                    }

                    Arqueos.query({e:enterprise}).$promise.then(angular.bind(this,function(data){    
                        var groupedDataByCajaId = groupDataByCajaId(data);
    
                        for(var index = id_array.length - 1; index >=0; index--)
                        {
                            var lastCierreDeCajaByDate = findLastCierreDeCajaByDate(groupedDataByCajaId[id_array[index]]);
                            var lastAperturaDeCajaByDate = findLastAperturaDeCajaByDate(groupedDataByCajaId[id_array[index]]);

                            if(lastAperturaDeCajaByDate && lastAperturaDeCajaByDate.total){
                                this.arqueo[lastAperturaDeCajaByDate.caja] = lastAperturaDeCajaByDate.total;
                                this.Cierre[lastCierreDeCajaByDate.caja] = lastAperturaDeCajaByDate.total;
                            }

                            if (lastAperturaDeCajaByDate &&
                                lastCierreDeCajaByDate &&
                                lastAperturaDeCajaByDate.created &&
                                lastCierreDeCajaByDate.created &&
                                (new Date(lastAperturaDeCajaByDate.created) < (new Date(lastCierreDeCajaByDate.created)))) {
                                this.arqueo[lastAperturaDeCajaByDate.caja] = 0;
                                this.Cierre[lastAperturaDeCajaByDate.caja] = 0;
                            }
                        }
                    }));

                    this.getdebe_from_cajaid(id_array,update_array);
                }))
            }
        };

        function showDialog($event, item) {
            var parentEl = angular.element(document.body);
            $mdDialog.show({
                    parent: parentEl,
                    targetEvent: $event,
                    templateUrl: 'modules/cajas/views/create-caja.client.view.html',
                    locals: {
                        item: item,
                        user: this.user
                    },
                    controller: DialogController
                })
                .then(function(answer) {
                    //$scope.alert = 'You said the information was "' + answer + '".';
                    // $scope.find();
                }, function() {
                    //$scope.alert = 'You cancelled the dialog.';
                });;
        }; //end showDialog

        function showDialogTransferencia($event, item) {
            $mdDialog.show({
                    targetEvent: $event,
                    templateUrl: 'modules/transferencias/views/create-transferencia.client.view.html',
                    locals: {
                        item: item,
                        user: this.user
                    },
                    controller: DialogController
                })
                .then(function(answer) {
                    //$scope.alert = 'You said the information was "' + answer + '".';
                    // $scope.find();
                }, function() {
                    //$scope.alert = 'You cancelled the dialog.';
                });;
        }; //end showDialog

        function showDialogArqueo($event, item) {
            $mdDialog.show({
                    targetEvent: $event,
                    templateUrl: 'modules/arqueos/views/create-arqueo.client.view.html',
                    locals: {
                        item: item,
                        user: this.user
                    },
                    controller: DialogController
                })
                .then(function(answer) {
                    //$scope.alert = 'You said the information was "' + answer + '".';
                    // $scope.find();
                }, function() {
                    //$scope.alert = 'You cancelled the dialog.';
                });;
        }; //end showDialog

        function showDialogPuestos($event, item) {
            $mdDialog.show({
                    targetEvent: $event,
                    templateUrl: 'modules/sucursales/views/add-puesto.client.view.html',
                    locals: {
                        item: item,
                        user: this.user
                    },
                    controller: DialogController
                })
                .then(function(answer) {
                    //$scope.alert = 'You said the information was "' + answer + '".';
                    // $scope.find();
                }, function() {
                    //$scope.alert = 'You cancelled the dialog.';
                });;
        }; //end showDialog

        function openMenu($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        function showConfirm(ev, item) {
            var confirm = $mdDialog.confirm()
                .title('¿Eliminar la caja?')
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .ok('Aceptar')
                .cancel('Cancelar');
            $mdDialog.show(confirm).then(function() {
                deleteCaja(item);
            }, function() {
                //cancelo
            });
        };

        function deleteCaja(item) {
            if (item) {
                item.$remove();

                for (var i in cajas) {
                    if (cajas[i] === item) {
                        cajas.splice(i, 1);
                    }
                }
            } else {
                cajas.$remove(function() {

                });
            }
        };

        //habilito edicion
        function editingCaja(item) {
            this.editing = item;
        };

        //edita nombre de la caja
        function editCaja(item) {
            this.editing = false;
            item.enterprise = item.enterprise._id;
            for (var i in item.puestos) {
                item.puestos[i] = item.puestos[i]._id;
            };
            item.$update(function() {
            }, function(errorResponse) {
                console.log('error');
            });
        };


        // actualizaciones en tiempo real.

        Socket.on('sucursal.update', angular.bind(this, function(message) {
            if (message.enterprise === this.user.enterprise.enterprise) {
                this.cajas = Cajas.query({ e: this.user.enterprise.enterprise })
                    .$promise.then(angular.bind(this, function(data) {
                        this.findUsuarios(data);
                    }));
            }
        }));

        let self = this;
        // fin actualizaciones en tiempo real.
        function DialogController($scope, $mdDialog, item, user, Puestos, Cajas, Transferencias, Arqueos, $filter, $location, Socket) {

            $scope.apagarBoton = false; //desahbilita boton de crear para evitar que se presione dos veces

            $scope.$watchCollection('Cajas', function() {
                $scope.findCajas();
                $scope.findCajasTotal();
                $scope.findTransferencias();
                $scope.findArqueos();
            });

            $scope.operaciones = [{
                id: 3,
                name: 'Ajustes'
            }, {
                id: 1,
                name: 'Apertura de Caja'
            }, {
                id: 2,
                name: 'Cierre de Caja'
            }];

            $scope.efectivo = item.efectivo;
            $scope.cheques = item.cheques;
            $scope.credito = item.credito;
            $scope.debito = item.debito;
            $scope.dolares = item.dolares;
            $scope.totalCaja = item.total;
            $scope.efectivoAjuste = 0;
            $scope.chequeAjuste = 0;
            $scope.creditoAjuste = 0;
            $scope.debitoAjuste = 0;
            $scope.dolaresAjuste = 0;

            $scope.mostrar = true;

            $scope.item = item;
            $scope.puestosAgregados = [];

            $scope.montoE = 0;
            $scope.montoC = 0;
            $scope.montoD = 0;
            $scope.montoTD = 0;
            $scope.montoTC = 0;
            $scope.newSaldo = roundToTwo(item.total);

            $scope.errorCaja = undefined;

            $scope.closeDialog = function() {
                $mdDialog.hide();
            };

            $scope.findPuestos = function() {
                $scope.puestos = Puestos.query({ e: user.enterprise._id });
            };

            //esta funcion es para seleccionar la caja destino en la transferencia, y que no aparezca la caja origen
            $scope.findCajas = function() {
                Cajas.query({ e: user.enterprise._id }, function(data) {
                    $scope.cajas = $filter('filter')(data, function(item) {
                        return (item._id !== $scope.item._id);
                    })
                });
            };
            $scope.cajasIDArray = [];
            // function for get caja id array of sucursals
            /*			$scope.findCajaID = function(){
            				Cajas.query({ e: user.enterprise._id }, function(data){
            					for (var i in data ) {
            						if(data[i].sucursal == $scope.item._id && data[i].deleted == false){
            							$scope.cajasIDArray.push(data[i]._id);
            						}
            					}
            					var sucursal = $scope.item;					
            					sucursal.cajas = $scope.cajasIDArray;
            					sucursal.$update(function() {
            					}, function(errorResponse) {
            						console.log('sucursal error');
            					});

            				});

            			};
            */ //devuelve todas la cajas
            $scope.findCajasTotal = function() {
                $scope.cajasTotal = Cajas.query({ e: user.enterprise._id });
            };

            $scope.findTransferencias = function() {
                $scope.transferencias = Transferencias.query({ e: user.enterprise._id });
            };

            $scope.findArqueos = function() {
                $scope.arqueos = Arqueos.query({ e: user.enterprise._id });
            };

            $scope.addEfectivo = function(value) {
                $scope.errorCaja = undefined;
                $scope.montoE = value;

                $scope.newSaldo = roundToTwo($scope.item.total - value - $scope.montoC - $scope.montoTD - $scope.montoTC - $scope.montoD);
            };

            $scope.addCheque = function(value) {
                $scope.errorCaja = undefined;
                $scope.montoC = value;

                $scope.newSaldo = roundToTwo($scope.item.total - value - $scope.montoE - $scope.montoTD - $scope.montoTC - $scope.montoD);
            };

            $scope.addTarCre = function(value) {
                $scope.errorCaja = undefined;
                $scope.montoTC = value;

                $scope.newSaldo = roundToTwo($scope.item.total - value - $scope.montoE - $scope.montoTD - $scope.montoC - $scope.montoD);
            };

            $scope.addtarDeb = function(value) {
                $scope.errorCaja = undefined;
                $scope.montoTD = value;

                $scope.newSaldo = roundToTwo($scope.item.total - value - $scope.montoE - $scope.montoTC - $scope.montoC - $scope.montoD);
            };

            $scope.addDolares = function(value) {
                $scope.errorCaja = undefined;
                $scope.montoD = value;

                $scope.newSaldo = roundToTwo($scope.item.total - value - $scope.montoE - $scope.montoTC - $scope.montoC - $scope.montoTD);
            };

            //funcion que rendondea a 2 decimales
            function roundToTwo(num) {
                return +(Math.round(num + "e+2") + "e-2");
            };

            $scope.createCaja = function($event) {

                $scope.apagarBoton = true; //desahbilita boton de crear para evitar que se presione dos veces
                var c = { caja: {} };
                var name = 'Caja '
                var num = $scope.cajasTotal.length + 1;
                var res = name.concat(num);

                var caja = {
                    name: res,
                    descripcion: this.descripcion,
                    puestos: $scope.puestosAgregados,
                    sucursal: $scope.item._id,
                    enterprise: user.enterprise._id
                };

                var sucursal = $scope.item;
                sucursal.enterprise = sucursal.enterprise._id;

                Socket.emit('caja.create', caja);
                $mdDialog.hide();
                Cajas.query({ e: user.enterprise._id }, function(data) {
                    for (var i in data) {
                        if (data[i].sucursal == $scope.item._id && data[i].deleted == false) {
                            $scope.cajasIDArray.push(data[i]._id);
                        }
                    }
                    sucursal.cajas = $scope.cajasIDArray;
                    sucursal.$update(function() {
                    }, function(errorResponse) {
                        console.log('sucursal error');
                    });

                });
            };
            //agrega puestos en el create de caja
            $scope.agregarPuesto = function(puesto) {
                var ok = false;
                if ((puesto !== undefined) && (puesto !== null)) {
                    for (var i in $scope.puestosAgregados) {
                        if ($scope.puestosAgregados[i]._id === puesto._id) {
                            var ok = true;
                        }
                    }
                    if (!ok) {
                        $scope.puestosAgregados.push(puesto);
                    }
                }
            };

            //agrega puestos en el edit de caja
            $scope.addPuestoCaja = function(puesto) {

                var ok = false;
                if ((puesto !== undefined) && (puesto !== null)) {
                    for (var i in item.puestos) {
                        if (item.puestos[i]._id === puesto._id) {
                            var ok = true;
                        }
                    }
                    if (!ok) {
                        item.puestos.push(puesto);
                    }
                }
            }

            //borrar puestos elegidos cuando esta creando una caja
            $scope.borrarPuesto = function(item) {
                if (item) {

                    for (var i in $scope.puestosAgregados) {
                        if ($scope.puestosAgregados[i] === item) {
                            $scope.puestosAgregados.splice(i, 1);
                        }
                    }
                } else {
                }
            };

            //borra puestos en el editar de cajas
            $scope.suprimirPuesto = function(p) {
                if (p) {

                    for (var i in item.puestos) {
                        if (item.puestos[i]._id === p._id) {
                            item.puestos.splice(i, 1);
                        }
                    }
                } else {
                }
            };
            $scope.transType = "";
            //acepta la edicion de agregar/quitar puestos de una caja
            $scope.editPuestosCaja = function(item) {
                item.enterprise = item.enterprise._id;
                for (var i in item.puestos) {
                    item.puestos[i] = item.puestos[i]._id;
                }
                item.$update(function() {
                    $mdDialog.hide();
                }, function(errorResponse) {
                    console.log('error');
                });
            }
            $scope.changeTrans = function() {
                // $scope.montoE = 0;
                // $scope.montoC = 0;
                // $scope.montoD = 0;
                // $scope.montoTC = 0;
                // $scope.montoTD = 0;
            }

            $scope.createTransferencia = function($event, item) {
                if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {
                    if (($scope.caja !== undefined) && ($scope.caja !== null)) {

                        $scope.apagarBoton = true; //desahbilita boton de crear para evitar que se presione dos veces

                        var newSaldoDestino = $scope.caja.total + $scope.montoE + $scope.montoC + $scope.montoD + $scope.montoTD + $scope.montoTC;

                        var numero = $scope.transferencias.length + 1;

                        var transferencia = {
                            numero: numero,
                            cajaO: item._id,
                            cajaD: $scope.caja._id,
                            montoE: $scope.montoE,
                            montoC: $scope.montoC,
                            montoD: $scope.montoD,
                            montoTD: $scope.montoTD,
                            montoTC: $scope.montoTC,
                            transType:$scope.transType,
                            saldo: $scope.newSaldo,
                            saldoDestino: newSaldoDestino,
                            observaciones: $scope.observaciones,
                            enterprise: user.enterprise._id
                        };
                        Socket.emit('transferencia.create', transferencia);
                        window.location.reload();
                        $mdDialog.hide();
                    } else {
                        $scope.errorCaja = 'Se debe seleccionar la caja destino'
                    }
                }
            };

            $scope.createArqueo = function($event, item) {
                if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {
                    if ($scope.operacion !== undefined) {

                        $scope.apagarBoton = true; //desahbilita boton de crear para evitar que se presione dos veces

                        var ajuste = $scope.efectivoAjuste + $scope.chequeAjuste + $scope.creditoAjuste + $scope.debitoAjuste + $scope.dolaresAjuste;

                        var numero = $scope.arqueos.length + 1;
                        
                        if($scope.operacion == 'Cierre de Caja')
                        {
                            $scope.observaciones  = "<h1>Apertura de Caja : " + self.arqueo[item._id] + "</h1>" + "<h1> Ventas Totales : " + self.getsumcajatype(item._id) + '</h1>';

                            let cajasdata = self.getcajasdata(item._id);
                            for(let itemdetail in cajasdata)
                            {
                                $scope.observaciones +=  "<h1>Ventas " + cajasdata[itemdetail] + " : " + self.cajasdata[item._id][cajasdata[itemdetail]] + '</h1>';
                            }

                            let compras = self.getcompras(item._id);
                            for(let itemdetail in compras)
                            {
                                $scope.observaciones += "<h1>Compras " + compras[itemdetail] + " : " + self.compras[item._id][compras[itemdetail]] + '</h1>';
                            }

                            let transfer = self.gettransfer(item._id);
                            for(let itemdetail in transfer)
                            {
                                $scope.observaciones += "<h1>Transferencias " + transfer[itemdetail] + " : " + self.transfer[item._id][transfer[itemdetail]] + '</h1>';
                            }

                            let pagos = self.getpagos(item._id);

                            for(let itemdetail in pagos)
                            {
                                $scope.observaciones += "<h1>Transferencias " + pagos[itemdetail] + " : " + self.pagos[item._id][pagos[itemdetail]] + '</h1>';   
                            }

                            $scope.observaciones += "<h1>Ingressors del turno : " + self.getingressos(item._id) + '</h1>';

                            $scope.observaciones += "<h1>Egresos del turno : " + self.getemgressos(item._id)  + '</h1>';

                            $scope.observaciones += "<h1>Cierre de Caja Efectivo: " + self.getcierre(item._id)  + '</h1>';
                        }

                        var arqueo = {
                            caja: item._id,
                            numero: numero,
                            operacion: $scope.operacion,
                            observaciones: $scope.observaciones,
                            efectivo: $scope.efectivo,
                            cheques: $scope.cheques,
                            debito: $scope.debito,
                            credito: $scope.credito,
                            dolares: $scope.dolares,
                            efectivoAjuste: $scope.efectivoAjuste,
                            chequeAjuste: $scope.chequeAjuste,
                            debitoAjuste: $scope.debitoAjuste,
                            creditoAjuste: $scope.creditoAjuste,
                            dolaresAjuste: $scope.dolaresAjuste,
                            ajuste: ajuste,
                            total: $scope.totalCaja,
                            enterprise: user.enterprise._id
                        };

                        Socket.emit('arqueo.create', {data:arqueo,operacion:$scope.operacion});
                        $mdDialog.hide();
                        window.location.reload();
                    } else {
                        $scope.errorOperacion = 'Se debe indicar la operacion'
                    }
                }
            };

            $scope.addAjuste = function(tipo) {
                if (tipo == 'efectivo') {
                    $scope.efectivo = item.efectivo + $scope.efectivoAjuste;
                } else {
                    if (tipo == 'cheque') {
                        $scope.cheques = item.cheques + $scope.chequeAjuste;
                    } else {
                        if (tipo == 'credito') {
                            $scope.credito = item.credito + $scope.creditoAjuste;
                        } else {
                            if (tipo == 'debito') {
                                $scope.debito = item.debito + $scope.debitoAjuste;
                            } else {
                                if (tipo == 'dolares') {
                                    $scope.dolares = item.dolares + $scope.dolaresAjuste;
                                }
                            }
                        }
                    }
                }
                $scope.totalCaja = $scope.efectivo + $scope.cheques + $scope.credito + $scope.debito + $scope.dolares;
            }
        }
    }
]);