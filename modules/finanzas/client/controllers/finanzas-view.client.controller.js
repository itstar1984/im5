'use strict';

// Comprobantes controller
angular.module('finanzas').controller('FinanzasViewController', ['user', 'finanza', '$mdDialog', 'Movimientos', 'movimientos', 'tipoFinanza', '$rootScope', '$state',
	function(user, finanza, $mdDialog, Movimientos, movimientos, tipoFinanza, $rootScope, $state) {

		// asignacion de modelos
		this.user = user;
		this.finanza = finanza;
		this.tipoFinanza = tipoFinanza;
		// this.movimientos = movimientos;
		this.movimientos = Movimientos.query({ e: this.user.enterprise.enterprise});
		
		let self = this;
		this.movimientos.$promise.then(function(movimientos){
			self.movimientos = movimientos;
			self.calcuatesaldo();
		})
		// asignacion de funciones

		this.showDialog = showDialog;
		this.rutaVolver = rutaVolver;

	    this.selectedMode = 'md-scale';
	    this.selectedDirection = 'up';
	    this.openMenu = function($mdOpenMenu, ev) {
	      $mdOpenMenu(ev);
	    }
	   	
	   	this.calcuatesaldo = function()
	   	{
	
	   		let totalsaldo = finanza.saldo;
	   		console.log(totalsaldo);
	   		let index = 0; let previous = 0;
	   		console.log(movimientos);

	   		for(let item in movimientos)
	   		{
	   			if(movimientos[item].fechaAlta)
	   			{
	   				movimientos.fecha = movimientos[item].fechaAlta;	
	   			}
	   			
	   		}
	   		movimientos.sort(function(a,b){
	   			return  new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
	   		})

	   		for(let item in movimientos)
	   		{
	   			if(movimientos[item].finanza == finanza._id && !movimientos[item].deleted)
	   			{
	   				if(index == 0)
	   				{
	   					movimientos[item].saldo = totalsaldo;	
	   				}
	   				else
	   				{
	   					if(movimientos[previous].estado == 'haber')
	   					{
	   						movimientos[item].saldo = movimientos[previous].saldo + movimientos[previous].monto;	
	   					}
	   					else
	   					{
	   						movimientos[item].saldo = movimientos[previous].saldo - movimientos[previous].monto;		
	   					}
	   					
	   				}

	   				console.log(movimientos[item]);
	   				previous = item;

	   				index++;
	   				
	   			}
	   		}


	   		this.movimientos = movimientos;
	   	}

	    this.showAlert =  function(ev, obs) {
		      $mdDialog.show(
		        $mdDialog
		          .alert()
		          .parent(angular.element(document.querySelector("#popupContainer")))
		          .clickOutsideToClose(true)
		          .title(obs)
		          .ariaLabel("Alert Dialog Demo")
		          .targetEvent(ev)
		          .ok("Cerrar")
		      );
		    }

	    this.showConfirm = function($event,item)
	    {
	    	var self = this;
	    	var confirm = $mdDialog
		        .confirm()
		        .title("¿Eliminar la Asiento?")
		        .ariaLabel("Lucky day")
		        .targetEvent($event)
		        .ok("Aceptar")
		        .cancel("Cancelar");
		      $mdDialog.show(confirm).then(
		        function() {
		          // deletePago(item);
		          // deleteFactura(item);
		          //deleteSaldo(item);
		          item.deleted = true;
		          item.$update(function(){
					 if(item.estado == 'haber')
					 {
					 	self.finanza.saldo = self.finanza.saldo + item.monto;
					 }
					 else
					 {
					 	self.finanza.saldo = self.finanza.saldo - item.monto;
					 }

					 console.log(self.finanza);

					 let finanzadata = self.finanza;
					 finanzadata.provider = self.finanza.provider._id;
					 finanzadata.enterprise = self.finanza.enterprise._id;
					 finanzadata.user = self.finanza.user._id;

					 finanzadata.$update(function(){
					 	self.calcuatesaldo();
					 })
					 // self.finanza.$update(function(){

					 // })
		          })
		          // this.findMovimientos();
		        },
		        function() {
		          //cancelo
		        }
		      );
	    }
		// definicion de funciones
	
		function rutaVolver(){
			if (finanza.tipoFinanza == 'debe'){
				$rootScope.estadoActualParams.tipo = 'debe';
				$state.go('home.finanzas', $rootScope.estadoActualParams);
			}
			else{
				if (finanza.tipoFinanza == 'haber'){
					$rootScope.estadoActualParams.tipo = 'haber';
					$state.go('home.finanzas', $rootScope.estadoActualParams);
				}
			}
		}

		function showDialog($event,item,movimientos = {}) {
	       $mdDialog.show({
	         targetEvent: $event,
	         templateUrl: 'modules/finanzas/views/add-asiento.client.view.html',
	         locals: {
	         	movimientosD: this.movimientosDebe,
	         	movimientosH: this.movimientosHaber,
	         	movimientos: this.movimientos,
	            item: item,
	            user : this.user,
	            itemdata:movimientos
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

	   	function DialogController($scope, $mdDialog, item, user, Comprobantes, Movimientos, movimientos, Cajas, Condicionventas,$filter,itemdata) {

	   		$scope.item = item;
	   		$scope.itemdata = itemdata;
	   		console.log(itemdata);
	   		if($scope.itemdata.fecha)
	   		{
	   			$scope.itemdata.fecha = new Date($scope.itemdata.fecha);
	   		}

	   		if($scope.itemdata._id)
	   		{
	   			$scope.cajas = Cajas.query({ e:$scope.item.enterprise._id?$scope.item.enterprise._id:$scope.item.enterprise });
	   			$scope.condiciones = Condicionventas.query({ e: $scope.item.enterprise._id });
				$scope.filtrados = $filter('filter')($scope.condiciones, function(item){
					return (item.nombre !== 'Cuenta Corriente');
				})

				$scope.comprobantes = Comprobantes.query({ e: $scope.item.enterprise._id?$scope.item.enterprise._id:$scope.item.enterprise });
	   		}
	   		
	   		$scope.arrayMovs = movimientos;

	   		$scope.botonApagado = false;

	   		$scope.closeDialog = function() {
	         	$mdDialog.hide();
	        };



			$scope.findComprobantes = function(){
				$scope.comprobantes = Comprobantes.query({ e: $scope.item.enterprise._id?$scope.item.enterprise._id:$scope.item.enterprise });
			};

			$scope.findCajas = function(){
				console.log($scope.item);
				$scope.cajas = Cajas.query({ e:$scope.item.enterprise._id?$scope.item.enterprise._id:$scope.item.enterprise });
			};

			$scope.findCondiciones = function(){
				$scope.condiciones = Condicionventas.query({ e: $scope.item.enterprise._id });
				$scope.filtrados = $filter('filter')($scope.condiciones, function(item){
					return (item.nombre !== 'Cuenta Corriente');
				})
			};

			$scope.add = function(saldo, monto){
				$scope.itemdata.saldo = saldo - monto;
				$scope.itemdata.saldoCaja = saldo - monto;
			}

			function findCajas(id)
			{
				for(let item in $scope.cajas)
				{
					if($scope.cajas[item]._id == id)
					{
						return $scope.cajas[item];
					}
				}

				return {};
			}



			$scope.createAsiento = function($event){
				var caja = findCajas($scope.itemdata.caja);
				console.log(caja);
				if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)){
					if (($scope.itemdata.monto !== undefined) && ($scope.itemdata.monto !== null) && ($scope.itemdata.monto !== 0)){
						if (($scope.itemdata.caja !== undefined) && ($scope.itemdata.caja !== null)){
							if (($scope.itemdata.condicion !== undefined) && ($scope.itemdata.condicion !== null)){
								if (($scope.itemdata.comprobante !== undefined)&&($scope.itemdata.comprobante !== null)){
									if (($scope.itemdata.numero == undefined) || ($scope.itemdata.numero == null)){
										$scope.itemdata.numero = 0;
									}
									$scope.botonApagado = true;

									var nuevoSaldo = $scope.item.saldo - $scope.itemdata.monto; //saldo de la deuda de cliente/proveedor

									
									if ($scope.item.tipoFinanza == 'debe'){

										var nuevoSaldoCaja = caja.total - $scope.itemdata.monto;

										if(!$scope.itemdata._id)
										{
											var movimiento = new Movimientos({
												provider: $scope.item.provider._id,
												comprobante: $scope.itemdata.comprobante,
												numero: $scope.itemdata.numero,
												estado: 'haber',
												finanza: $scope.item._id,
												monto: $scope.itemdata.monto,
												saldo: nuevoSaldo,
												saldoCaja: nuevoSaldoCaja,
												caja: $scope.itemdata.caja,
												condicion: $scope.itemdata.condicion,
												enterprise: user.enterprise._id,
												fecha:$scope.itemdata.fecha,
												description:$scope.itemdata.description
											});

											$scope.item.saldo = nuevoSaldo;
											var finanza = $scope.item;
											finanza.enterprise = finanza.enterprise._id;
											finanza.user = finanza.user._id;
											finanza.provider = finanza.provider._id;

											movimiento.$save(function(response) {
												if(response._id) {
													movimientos.push(movimiento);
													$mdDialog.hide();
													self.calcuatesaldo();
													finanza.$update(function() {
														
													}, function(errorResponse) {
														console.log('saldo finanza error');
													});

												}
											}, function(errorResponse) {
												console.log(errorResponse);
											});
										}
										else
										{
											$scope.itemdata.saldo = nuevoSaldo;
											$scope.itemdata.saldoCaja = nuevoSaldoCaja;
											
											var finanza = $scope.itemdata;
											finanza.enterprise = finanza.enterprise._id;
											finanza.user = finanza.user._id;
											finanza.provider = finanza.provider._id;
											finanza.$update(function(){
												$mdDialog.hide();
											})
										}
										
									}
									else{
										var nuevoSaldoCaja = caja.total + $scope.monto;
										if(!$scope.itemdata._id)
										{
											
											var movimiento = new Movimientos({
												client: $scope.item.client._id,
												comprobante: $scope.itemdata.comprobante,
												numero: $scope.itemdata.numero,
												estado: 'debe',
												finanza: $scope.item._id,
												monto: $scope.itemdata.monto,
												saldo: nuevoSaldo,
												saldoCaja: nuevoSaldoCaja,
												caja: $scope.itemdata.caja,
												condicion: $scope.itemdata.condicion,
												enterprise: user.enterprise._id,
												fecha:$scope.itemdata.fecha,
												description:$scope.itemdata.description
											});

											$scope.item.saldo = nuevoSaldo;
											var finanza = $scope.item;
											finanza.client = finanza.client._id;
											finanza.enterprise = finanza.enterprise._id;
											finanza.user = finanza.user._id;
											movimiento.$save(function(response) {
												if(response._id) {
													movimientos.push(movimiento);
													self.calcuatesaldo();
													$mdDialog.hide();
													finanza.$update(function() {
														
													}, function(errorResponse) {
														console.log('saldo finanza error');
													});
												}
											}, function(errorResponse) {
												console.log(errorResponse);
											});
										}
										else
										{
											$scope.itemdata.saldo = nuevoSaldo;
											$scope.itemdata.saldoCaja = nuevoSaldoCaja;

											var finanza = $scope.itemdata;
											finanza.enterprise = finanza.enterprise._id;
											finanza.user = finanza.user._id;
											finanza.provider = finanza.provider._id;
											console.log($scope.itemdata);
											finanza.$update(function(){
												$mdDialog.hide();
											})
										}
										

									}
								}
								else{
									$scope.errorPago = 'Debe indicar el tipo de comprobante';
								}
							}
							else{
								$scope.errorPago = 'Debe indicar la condicion de pago';
							}
						}
						else{
							$scope.errorPago = 'Debe indicar la caja a utilizar';
						}
					}
					else{
						$scope.errorPago = 'Debe indicar un monto valido';
					}
				}
			}
	    };
	    //end DialogController

	}
]);
