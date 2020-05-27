'use strict';

// Comprobantes controller
angular.module('products').controller('ProductosEditController', ['$rootScope', '$scope', '$location', '$timeout', 'user', 'product', 'tipoProducto', '$filter', 'productos', 'categories', 'clienteCategories', 'costCenters', 'enterprises', 'providers', '$state',
	function($rootScope, $scope, $location, $timeout, user, product, tipoProducto, $filter, productos, categories, clienteCategories, costCenters, enterprises, providers, $state) {

		$rootScope.tipoProducto = tipoProducto;

		// asignacion de modelos
		this.user = user;
		this.product = product;
		this.tipoProducto = tipoProducto;
		this.productos = productos;
		this.categories = categories;
		this.clienteCategories = clienteCategories;
		this.enterprises = enterprises;
		this.providers = providers;
		this.editicon = 'add';
		this.editname = 'crear';
		this.providertax - undefined;
		this.productprovider = undefined;
		this.costPerUnitProvider = undefined;
		$scope.modificar = false;
		$scope.verListado = false;
		$scope.errorRepetido = [];
		$scope.errorProducto = false;
		$scope.stocks = [];

		$scope.cambioProveedor = false;

		this.selectedMode = 'md-scale';
	    this.selectedDirection = 'left';

		// asignacion de funciones
		this.update = update;
		this.findTaxes = findTaxes;
		this.findMetrics = findMetrics;
		this.findCategoriesCliente = findCategoriesCliente;
		this.initCostCenters = initCostCenters;
		this.verTax = verTax;
		this.asignarTipos = asignarTipos;
		this.habilitarEdicion = habilitarEdicion;
		this.habilitoLista = habilitoLista;
		this.modificoProducto = modificoProducto;
		this.eliminar = eliminar;
		this.addMateriaPrima = addMateriaPrima;
		this.borrarError = borrarError;
		this.rutaVolver = rutaVolver;
		this.createprovider = createprovider;
		this.deleteprovider = deleteprovider;
		this.editprovider = editprovider;
		this.canceledit = canceledit;
		this.cambiarProveedor = cambiarProveedor;

		verTax();
		asignarTipos();
		initproduct();

		function createprovider()
		{
			if(this.productprovider)
			{
				for(var index=0; index<this.product.provider.length; index++)
				{
					if(index == this.edititem)
					{
						continue;
					}
					if(this.productprovider == this.product.provider[index].id)
					{
						alert('El proveedor ya existe.');
						return;
					}
				}

				var name = '';
				for(var index=0; index<this.providers.length; index++)
				{
					if(this.providers[index]._id == this.productprovider)
					{

						name = this.providers[index].name;
					}
				}

				if(this.editicon == 'check')
				{
					var providerUnits = {};
					this.product.provider[this.edititem].name = name;
					this.product.provider[this.edititem].id = this.productprovider;
					this.product.provider[this.edititem].price = this.costPerUnitProvider;
					this.product.provider[this.edititem].tax = this.providertax;
				}
				else
				{
					this.product.provider.push({
						id:this.productprovider,
						name:name,
						price:this.costPerUnitProvider,
						tax:this.providertax
					});
				}

				this.product.costPerUnit = this.costPerUnitProvider;

			}

			this.edititem = undefined;
			this.editicon = 'add';
			this.editname = 'crear';
		}

		function initproduct(){
			providers.$promise.then(function(res){
	    		for(var index = 0;index<product.provider.length;index++)
				{
					if(!product.provider[index].id)
					{
						var provider_array = {};
						var id = '';
						for(var index_provider in product.provider[index])
						{
							if(!isNaN(index_provider))
							{
								id += product.provider[index][index_provider];
							}
						}
						
						provider_array.id = id;
						
						for(var index_providers in res)
						{

							if(id == res[index_providers]._id)
							{
								provider_array.name = res[index_providers].name;
								break;
							}
						}

						provider_array.price = product.costPerUnit;
						provider_array.tax = product.tax;
						product.provider[index] = provider_array;
					}
				}
	    	})
		}

		function deleteprovider(index)
		{
			this.edititem = undefined;
			this.editicon = 'add';
			this.editname = 'crear';
			this.product.provider.splice(index,1);
		}

		function editprovider(index)
		{
			this.edititem = index;
			this.editicon = 'check';
			this.editname = 'editar';
			this.productprovider = this.product.provider[index].id;
			this.costPerUnitProvider = this.product.provider[index].price;
			this.providertax = this.product.provider[index].tax;
		}

		function canceledit(index)
		{
			this.edititem = undefined;
			this.editicon = 'add';
			this.editname = 'crear';
		} 
		// definicion de funciones

		function asignarTipos (){
			if($rootScope.estadoActualParams !== undefined){
				if (tipoProducto == 'p'){
					$rootScope.estadoActualParams.tipo = 'p';
				}
				else{
					if (tipoProducto == 'm'){
						$rootScope.estadoActualParams.tipo = 'm';
					}
					else{
						if(tipoProducto == 'i') {
								$rootScope.estadoActualParams.tipo = 'i';
						}
					}
				}
			}
		};

		function rutaVolver (){
	  //   	if (product.esProducto){
	  //   		$rootScope.estadoActualParams.tipo = 'p';
	  //   	}
	  //   	else{
	  //   		if (product.esMateriaPrima){
	  //   			$rootScope.estadoActualParams.tipo = 'm';
	  //   		}
	  //   		else{
		 //    		if (product.esInsumo){
		 //    			$rootScope.estadoActualParams.tipo = 'i';
		 //    		}
		 //    	}
	  //   	}
			// $state.go('home.products', $rootScope.estadoActualParams);
			history.back()
		};

		//tax para mostrar en la vista
		function verTax () {

			if (product.tax == 1){
				$scope.vistaTax = 'Iva Incluido';
			}
			else{
				$scope.vistaTax = product.tax;
			}
		};

		function cambiarProveedor (){
			$scope.cambioProveedor = true;
		}

		// Update existing Product
		function update (product2, prov) {
			var product = product2;

			//para cuando esdita MP y le saca el reseller 
			if ((product.esMateriaPrima == true) && (product.reseller == false)){
				product.esProducto = false;
			}

			//si es una materia prima para revender
			if (this.reseller2 == true){
					product.reseller = true;
					product.esProducto = true;
			}

			//si tiene una produccion
			if ((product.esProducto == true)&&(product.reseller == false)&&(product.produccion.length > 0)){
				var costo = 0;
				for (var i in product.produccion){
					costo = costo + product.produccion[i].total;
				}
				product.costPerUnit = costo;
				for (var i=0; i<product.produccion.length; i++){
					product.produccion[i].producto = product.produccion[i].producto._id;
				}
			}

			if (product.esProducto){
				$rootScope.estadoActualParams.tipo = 'p';
			}
			else{
				if (product.esMateriaPrima){
					$rootScope.estadoActualParams.tipo = 'm';
				}
				else{
					if(product.esInsumo) {
						$rootScope.estadoActualParams.tipo = 'i';
					}
				}
			}

			product.enterprise = product.enterprise._id;

			
			
			var newCatPrice = [];
			for(var i=0; i<product.catPrice.length; i++){
				if(product.catPrice[i].price !== '' && product.catPrice[i].price !== undefined){
					newCatPrice.push(product.catPrice[i]);
				}
			}
			product.catPrice = newCatPrice;
			product.stocks = $scope.stocks;

			product.$update(function(data) {
				if (product.esProducto){
					$rootScope.estadoActualParams.tipo = 'p';
					// $state.go('home.products', $rootScope.estadoActualParams);
					history.back();
				}
				else{
					if (product.esMateriaPrima){
						$rootScope.estadoActualParams.tipo = 'm';
						// $state.go('home.products', $rootScope.estadoActualParams);
						history.back();
					}
					else{
						if(product.esInsumo) {
							$rootScope.estadoActualParams.tipo = 'i';
							// $state.go('home.products', $rootScope.estadoActualParams);
							history.back();
						}
					}
				}
				if (product.esMateriaPrima){ actualizarReferencias(); };
			}, function(errorResponse) {
				console.log(errorResponse, 'error');
			});
		};

		//actualiza los productos por si cambio el precio de las MP que lo componen
		function actualizarReferencias(){
			for (var i in productos){
				if ((productos[i].esProducto == true)&&(productos[i].reseller == false)&&(productos[i].deleted == false)){
					if (productos[i].produccion.length > 0){
						var product = productos[i];
						product.enterprise = product.enterprise._id;
						product.provider = product.provider._id;
						product.$update(function(data) {
							console.log('update referencia ok');
						}, function(errorResponse) {
							this.error = errorResponse.data.message;
						});
					};
				}
			}
		};

		//habilito la edicion de cant de materias primas elegidas
		function habilitarEdicion (){
			$scope.modificar = true;
		};

		//listado para agregar nuevas materias primas
		function habilitoLista (){
			$scope.verListado = true;
		};

		//ng-change al cambiar cantidad
		function modificoProducto (id, cant){
			var costo = findProducto(id);
			for (var i in product.produccion){
				if (product.produccion[i].producto._id == id){
					product.produccion[i].total = costo*cant;
				}
			}
		}; //end modificoProducto


		function findProducto(id){
			for (var i in productos){
				if (productos[i]._id == id ){
					return productos[i].costPerUnit;
				}
			};
		};

		//elimina materias primas
		function eliminar (id,cant){
			var costo = findProducto(id);
			for (var i in product.produccion){
				if (product.produccion[i].producto._id === id){
					product.produccion.splice(i, 1);
					product.costPerUnit = product.costPerUnit - (costo*cant);
				}
			}
		}; //end eliminar

		//agrega nueva materia prima para la produccion
		function addMateriaPrima (item,cant,$index){
			var p = { producto: undefined, nombre:undefined, cantidad: undefined, total: undefined };
			var ok = false;
			for (var i in product.produccion){
				if ((product.produccion[i].producto !== undefined)&&(product.produccion[i].producto !== null)){
					if (product.produccion[i].producto._id === item._id){
						ok = true;
						$scope.errorRepetido[$index] = 'Materia Prima existente';
					}
				}
			}
			if (ok === false ){
				p.producto = item;
				p.nombre = item.name;
				p.cantidad = cant;
				p.total = cant * item.costPerUnit;
				product.produccion.push(p);
				product.costPerUnit = product.costPerUnit + p.total;
			}
		} //end addMateria

		function findTaxes () {
			this.taxes = [
				{value: 1, name: 'Iva incluido en el precio'},
				{value: 10.5, name: '10.50%'},
				{value: 21, name: '21.00%'},
				{value: 27, name: '27.00%'}];
		};

		function findMetrics () {
			this.metrics = [ 'Bultos','Cajas','Cajones','Cm3','Grs', 'Horas', 'Kg','Latas','Litros','Ml','Mts2','U.'];
		};

		function borrarError (){
			$scope.errorProducto = undefined;
		};

		function findCategoriesCliente () {
			$timeout(function(){
				var omittedCategory = clienteCategories.filter(function(category) {
					for(var i=0; i<product.catPrice.length; i++){
						if(category._id == product.catPrice[i].category){
							return false;
						}
					}
					return true;
				})
				
				for(var i=0; i<omittedCategory.length; i++){
					if(!omittedCategory[i].deleted){
						var p = {category: omittedCategory[i]._id, catName: omittedCategory[i].name, price: undefined};
						product.catPrice.push(p);
					}
				}
			}, 2000);
		}

		function initCostCenters () {
			$timeout(function(){
				var undeletedCostCenters = $filter('filter')(costCenters, {deleted:false});
				for(var i=0; i<undeletedCostCenters.length; i++){
					var stockItem = getStockByCostCenter(undeletedCostCenters[i]._id);
					var p = {costCenter: undeletedCostCenters[i]._id, costCenterName: undeletedCostCenters[i].name, 
						unitsInStock: 0, idealStock: 0, criticalStock: 0}
					if(stockItem != null){
						p = {costCenter: undeletedCostCenters[i]._id, costCenterName: undeletedCostCenters[i].name, 
							unitsInStock: stockItem.unitsInStock, idealStock: stockItem.idealStock, criticalStock: stockItem.criticalStock}
					}
					$scope.stocks.push(p)
				}
			}, 2000);
		}

		function getStockByCostCenter(costCenterId){
			if(product.stocks !== null){
				for(var i=0; i<product.stocks.length; i++){
					if(costCenterId == product.stocks[i].costCenter){
						return product.stocks[i];
					}
				}
			}
			return null;
		}
	}
]);
