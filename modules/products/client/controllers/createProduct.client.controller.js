'use strict';

// Comprobantes controller
angular.module('products').controller('ProductosCreateController', ['$rootScope', '$scope','user', 'product', 'enterprises', '$state', '$timeout', 'products', 'categories', 'clienteCategories', 'providers', 'costCenters', 'tipoProducto', '$filter', 'productos',
	function($rootScope, $scope, user, product, enterprises, $state, $timeout, products, categories, clienteCategories, providers, costCenters, tipoProducto, $filter, productos) {

		$rootScope.tipoProducto = tipoProducto;
		// asignacion de modelos
		this.user = user;
		this.product = product; //producto a crear
		this.enterprises = enterprises;
		this.products = products; //modelo para creacion de producto
		this.productos = productos; //array de productos en bbdd
		this.categories = categories;
		this.clienteCategories = clienteCategories;
		this.providers = providers;
		this.tipoProducto = tipoProducto;

		//variables de finds
		this.metrics = [];
		this.taxes = [];

		this.selectedMode = 'md-scale';
	    this.selectedDirection = 'left';

		this.proveedor = undefined;
		var idProveedor = 0; 
		var providername = '';
		var valorTax = 0; //valor del tax elegido
		var esProducto = false;
		var esInsumo = false;
		var esMateriaPrima = false;
		var category1 = 0;

		this.seleccionHabilitada = false;
		this.providerUnits = [];
		this.habilitarCheck = [];
		this.cantidad = []; //arreglo de cantidades seleccionadas por producto 
		this.selected = []; //arreglo que uso para comparar si una MP ya fue seleccionada
		this.hayCantidad = [];

		this.productosAgregados = []; //donde voy guardando las MP elegidas

		this.errorProducto = undefined;

		//var para la creacion de la produccion
		$scope.costoTotal = 0; //va calculando el costo del producto en base a las MP elegidas

		// asignacion de funciones
		this.editicon = 'add';
		this.editname = 'crear';
		this.edititem = undefined;
		this.deleteprovider = deleteprovider;
		this.createprovider = createprovider;
		this.create = create;
		this.findTaxes = findTaxes;
		this.findMetrics = findMetrics;
		this.findCategoriesCliente = findCategoriesCliente;
		this.initCostCenters = initCostCenters;
		this.searchTextChange = searchTextChange;
		this.selectedItemChange = selectedItemChange;
		this.asignarTax = asignarTax;
		this.asignarTipos = asignarTipos; //define las variables indicando el tipo de producto, para luego usaar en el create
		this.habilitoSeleccion = habilitoSeleccion;
		this.habilitoCheck = habilitoCheck;
		this.toggle = toggle;
		this.rutaVolver = rutaVolver;
		this.editprovider = editprovider;
		this.canceledit = canceledit;
		$scope.catPrice = []; //prices for each cliente category
		$scope.stocks = [];
		function rutaVolver (){
			$state.go('home.products', $rootScope.estadoActualParams);
		};

		function editprovider(index)
		{
			this.editicon = 'edit';
			this.editname = 'Editar';
			this.edititem = index;
			providername = undefined;
			idProveedor = undefined;
			this.costPerUnitProvider = this.providerUnits[index].price;
			this.providertax = this.providerUnits[index].tax;
		}

		function canceledit()
		{
			this.editicon = 'add';
			this.editname = 'crear';
			this.edititem = undefined;
			idProveedor = null;
			providername = null;
			this.costPerUnitProvider = 0;
			this.providertax = '';
		}
		// definicion de funciones

		function asignarTipos (){
			if (tipoProducto == 'p'){
				esProducto = true;
				for (var i in categories){
					if (categories[i].name == 'Productos Terminados'){
						category1 = categories[i]._id;
					}
				}
			}
			else{
				if (tipoProducto == 'm'){
					esMateriaPrima = true;
					for (var i in categories){
						if (categories[i].name == 'Materia Prima'){
							category1 = categories[i]._id;
						}
					}
				}
				else{
					esInsumo = true;
					for (var i in categories){
						if (categories[i].name == 'Insumo'){
							category1 = categories[i]._id;
						}
					}
				}
			}
			return category1;
		};

		function deleteprovider(item)
		{
			for(var index=0;index<this.providerUnits.length;index++)
			{
				if(this.providerUnits[index].id == item.id)
				{
					this.providerUnits.splice(index,1);
				}
			}
		}

		function createprovider()
		{
			if(providername || this.editicon== 'edit')
			{
				for(var index = 0;index<this.providerUnits.length;index++)
				{
					if(this.providerUnits[index].id == idProveedor)
					{
						if(this.editicon == 'edit')
						{
							if(index == this.edititem)
							{
								continue;
							}
						}
						alert('El proveedor ya existe.');
						return;
					}
				}

				if(!this.costPerUnitProvider)
				{
					alert('El precio no puede ser cero.');
					return;
				}

				if(!this.providertax)
				{
					alert('Debes indicar impuesto.');
					return;
				}
				if(this.editicon == 'edit')
				{
					if(providername != undefined)
					{
						this.providerUnits[this.edititem].id = idProveedor;
						this.providerUnits[this.edititem].name = providername;
					}

					this.providerUnits[this.edititem].price = this.costPerUnitProvider;
					this.providerUnits[this.edititem].tax = this.providertax;
					
				}
				else
				{
					this.providerUnits.push({
						name:providername,
						id:idProveedor,
						price:this.costPerUnitProvider,
						tax:this.providertax
					});
	
				}

			}
			else
			{
				alert('El nombre del proveedor no está incluido');
				return;
			}

			this.editicon  = 'add';
			this.editname = 'clear';
			this.edititem = undefined;

		}
		// Create new product
		function create() {
			var cat1 = asignarTipos(); 
			var costo = 0;
			var precio = undefined;
			
			if (this.reseller == true){
				if (this.unitPrice2 !== undefined){
					precio = this.unitPrice2;
				}
				else{
					precio = undefined;
				}
			}
			else{
				if (this.unitPrice !== undefined){
					precio = this.unitPrice;
				}
				else{
					if ((tipoProducto == 'm') || (tipoProducto == 'i')) {
						precio = 0;
					}
				}
			}

			if(this.name !== undefined){
					//if(precio !== undefined){
						if (this.metric !== undefined){			
									if(this.providerUnits.length !== 0 || this.tipoProducto == 'p'){
										var newCatPrice = [];
										for(var i=0; i<$scope.catPrice.length; i++){
											if($scope.catPrice[i].price !== '' && $scope.catPrice[i].price !== undefined){
												newCatPrice.push($scope.catPrice[i]);
											}
										}
									// Create new product object
										var product = new products ({
											name: this.name,
											description: this.description ? this.description : undefined,
											code: this.code ? this.code : 0,
											produccion: this.productosAgregados, 
											brandName: this.brandName ? this.brandName : undefined,
											unitPrice: precio,
											catPrice: newCatPrice,
											provider: this.providerUnits,
											stocks: $scope.stocks,
											storedIn: this.storedIn ? this.storedIn : undefined,
											metric: this.metric,
											reseller: this.reseller,
											esProducto: esProducto, 
											esMateriaPrima: esMateriaPrima,
											esInsumo: esInsumo,
											enterprise: this.enterprise ? this.enterprise._id : user.enterprise._id,
											category1: cat1, 
											category2: this.category2 ? this.category2._id : undefined
										});

										if (this.reseller === true){
											// createProduct(product);
											product.esProducto = true;
										}

										product.$save(function(response) {
											if(response._id) {
												// agregar sub al array
												$state.go('home.products', $rootScope.estadoActualParams);
												esProducto = false;
												esInsumo = false;
												esMateriaPrima = false;

											}
										}, function(errorResponse) {
											this.error = errorResponse.data.message;
										});
									}
									else{
										this.errorProducto = 'Se debe especificar el proveedor del producto';
									}
								}
								else{
									this.errorProducto = 'Se debe especificar el iva para el producto';		
								}
							}
							else{
								this.errorProducto = 'Se debe especificar la unidad de medida';	
							}
							
							
					/*}
					else{
						this.errorProducto = 'Se debe especificar un precio para el producto';	
					}*/	
			
		};

		//muestra el formulario para elegir materias primas en creacion de producto
		function habilitoSeleccion(){
			this.seleccionHabilitada = true;
		};

		//habilito el checkbox para seleccionar productos
		function habilitoCheck (i,p,cant){		
	    	this.habilitarCheck[i] = true;
		    // $scope.errorRepetido[i] = undefined;
	    }; //end addCant


	    function toggle (item, list, cant, index) {
	    	var p = { producto: undefined, nombre:undefined, cantidad: undefined, total: undefined };
    		var idx = list.indexOf(item);
    		if (idx > -1){
    			list.splice(idx, 1);
    			for ( var j in this.productosAgregados ){
    				if (this.productosAgregados[j].producto === item._id){
    					this.productosAgregados.splice(j, 1);	
    					this.cantidad[index] = 0;
    					this.hayCantidad[index] = false; 
    					calculoTotal(this.productosAgregados);
    				}	
    			}
    		}	    	
	    	else{
	    		list.push(item);
	    		p.producto = item._id;
	    		p.nombre = item.name
	    		p.cantidad = cant;
	    		p.total = cant * item.costPerUnit;
	    		this.productosAgregados.push(p);
	    		this.hayCantidad[index] = true;
	    		calculoTotal(this.productosAgregados);
	    	}
	    }; //end toggle

	    function calculoTotal (productos){
	    	$scope.costoTotal = 0;
	    	for (var i in productos){
	    		$scope.costoTotal = $scope.costoTotal + productos[i].total;
	    	}
	    };

		//autocomplete para seleccionar proveedor
		function searchTextChange (text){
			var lowercaseQuery = angular.lowercase(text);
			return $filter('filter')(providers, {name: text});
		};

		function selectedItemChange (item) {	
			this.proveedor = item;
			$rootScope.provider = item;
			selectProveedor(item);
			this.errorProducto = undefined;
		};

		function selectProveedor (item){
			if ((item !== null) && (item !== undefined)){
				idProveedor = item._id;
				providername = item.name;

			}	
			else{
				idProveedor = 0;
			}	
		};

		function findTaxes () {
			this.taxes = [ {value:1, name: 'Iva incluido en el precio'}, {value:10.5, name: '10.50%'}, {value:21, name: '21.00%'}, {value:27, name: '27.00%'}];
		};

		function asignarTax(){
			this.errorProducto = undefined;
			for (var i in this.taxes){
				if (this.taxes[i].name === this.tax){
					valorTax = this.taxes[i].value
				}
			}
		};

		function findMetrics () {
			this.metrics = [ 'Bultos','Cajas','Cajones','Cm3','Grs', 'Horas', 'Kg','Latas','Litros','Ml','Mts2','U.'];
		};

		function findCategoriesCliente () {
			$timeout(function(){
				$scope.catPrice = [];
				for(var i=0; i<clienteCategories.length; i++){
					if(!clienteCategories[i].deleted){
						var p = {category: clienteCategories[i]._id, catName: clienteCategories[i].name, price: undefined}
						$scope.catPrice.push(p);
					}
				}
			}, 2000);
		}

		function initCostCenters () {
			$timeout(function(){
				var undeletedCostCenters = $filter('filter')(costCenters, {deleted:false});
				for(var i=0; i<undeletedCostCenters.length; i++){
					var p = {costCenter: undeletedCostCenters[i]._id, costCenterName: undeletedCostCenters[i].name, 
						unitsInStock: 0, idealStock: 0, criticalStock: 0}
					$scope.stocks.push(p)
				}
			}, 2000);
		}
	}
]);