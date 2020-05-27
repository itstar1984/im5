'use strict';

// Comprobantes controller
angular.module('products').controller('ProductsViewController', ['user', 'product', '$mdDialog', '$state', '$rootScope', '$http','providers','Authentication','$timeout',
	function(user, product, $mdDialog, $state, $rootScope, $http,providers,Authentication,$timeout) {

		// asignacion de modelos
		this.user = user;
		this.product = product;
		this.selectedMode = 'md-scale';
	    this.selectedDirection = 'up';

	    this.rutaVolver = rutaVolver;

	    $timeout(initproduct(),4000);
	    function initproduct()
	    {
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
	    	// providers.foreach(function(value){
	    	// })
	    	// providers.Promise().then(function(res){
	    	// });
	    	
	    }

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

		// asignacion de funciones


		// definicion de funciones

	}
]);