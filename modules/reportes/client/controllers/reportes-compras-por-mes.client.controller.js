'use strict';

// Reportes controller
angular.module('reportes')
	.controller('ReportesComprasPorMesController',
		[
			'$scope',
			'$stateParams',
			'$location',
			'Authentication',
			'ReportesCompras',
			'Comprobantes',
			'Products',
			'Enterprises',
			'Condicionventas',
			'Clients',
			'$rootScope',
			'$state',
			'$filter',
			'$mdDialog',
			'$http',
			'$timeout',
			'Subs',
			'Providers',
			'Reportes',
			'$q',
	function ($scope,
		$stateParams,
		$location,
		Authentication,
		ReportesCompras,
		Comprobantes,
		Products,
		Enterprises,
		Condicionventas,
		Clients,
		$rootScope,
		$state,
		$filter,
		$http,
		$timeout,
		Subs,
		Providers,
		Reportes,
		$q)
	{
		var vm = this;
		$scope.authentication = Authentication;
		console.log('[+] ReportesComprasController::fired!');

		// watch for SEARCH to update value
		$scope.$watchCollection('authentication', function (){
			vm.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
			//vm.find();
			activate();
			});

		$scope.$watchCollection(angular.bind(this, function () {
		  return this.modelo;
		}), function () {
		  console.log('modelo changed to ' + vm.modelo);
		});

		vm.find = function() {
			if (vm.SEARCH !== undefined) {
				vm.reportes = Reportes.query({ e: vm.SEARCH.enterprise });
			}
		};

			// Find existing Venta
		vm.findOne = function() {
			Reportes.get({}, function(res){
					// success
				},
				function(err){
					//error
				}
			);
		};

		vm.performanceChartData = [];
    vm.performancePeriod = 'month';
    vm.changePeriod = changePeriod;
		vm.yearValue = '2015';
		vm.quarterValue = '2015-4Q';
		vm.monthValue = '2015-10';

		vm.chartOptions = {
            chart: {
                //type: 'multiBarHorizontalChart',
								type: 'lineChart',
								objectequality: true,
                height: 350,
								duration: 500,
								isArea: true,
                //margin: { left: 50, right: 50 },
                //x: function (d) { return d[0] },
                //y: function (d) { return d[1] },
								x: function(d){return d.label;},
                y: function(d){return d.value;},
                showLabels: false,
                showLegend: false,
								//useInteractiveGuideline: true,
                title: 'Compras año ' + vm.yearValue,
								xAxis: {
						      showMaxMin: false,
									axisLabel: 'Día',
									tickFormat: function(d){
											//console.log('[+] el valor de d es: ', d);
											//console.log('[+] fecha para mostrar: ', d3.time.format('%Y/%m/%d')(new Date(d)));
											return d3.time.format('%Y-%m-%d')(new Date(d))
									}
						    },
								yAxis: {
                    axisLabel: 'Ingresos ($)',
                    tickFormat: function(d){
                        return d3.format(',.2f')(d);
                    }
                },

                //showYAxis: false,
                //showXAxis: false,
                //color: ['rgb(0, 150, 136)', 'rgb(204, 203, 203)', 'rgb(149, 149, 149)', 'rgb(44, 44, 44)'],
                //tooltip: { contentGenerator: function (d) { return '<div class="custom-tooltip">' + d.point.y + '%</div>' + '<div class="custom-tooltip">' + d.series[0].key + '</div>' } },
                showControls: false
            }
        };








    function activate() {
				//loadData();
				var queries = [loadData(vm.performancePeriod)];
        //$q.all(queries);
    }


    function loadData(periodo) {
			//vm.modelo = [];
			if(vm.SEARCH !== undefined) {
				switch (periodo) {
					case 'year':
					ReportesCompras.getDataYear(vm.yearValue, vm.SEARCH.enterprise)
					.then(function(data){
						//vm.performanceChartData = data.data;

						vm.performanceChartData = data.data.map(function(item){
							var p = item.resultado.month.split('-');
							var year = parseInt(p[0]);
							var month = parseInt(p[1]);
							var d = new Date(year, month);

							return {
								label: d,
								value: item.balance || 0//,
								//estado: item.resultado.estado
							};
						});

						vm.performanceChartData2 = data.data.map(function(item){
							var p = item.resultado.month.split('-');
							var year = parseInt(p[0]);
							var month = parseInt(p[1]);
							var d = new Date(year, month);

							return {
								label: d,
								value: item.balance || 0//,
								//estado: item.resultado.estado
							};
						});

						if(vm.performanceChartData !== undefined) {
							vm.filteredData1 = $filter('orderBy')($filter('filter')(vm.performanceChartData, function(item){
								//if(item.estado !== 'Finalizada') { item.value = 0};
								return item;
							}), 'label');//{ estado: 'Finalizada'}),'label')
							vm.filteredData2 = $filter('orderBy')($filter('filter')(vm.performanceChartData2, function(item){
								//if(item.estado === 'Finalizada') {item.value = 0}
								return item;
							}), 'label');

							vm.modelo = [
								{
									key: 'Finalizadas',
									color: '#1f77b4',
									values: vm.filteredData1,
								}];
						 } else {
						}

					});
						break;

					case 'quarter':
					vm.modelo = undefined;
					ReportesCompras.getDataQuarter(vm.quarterValue, vm.SEARCH.enterprise)
					.then(function(data){
						console.log('[+] getDataQuarter::data: ', data);
						//vm.performanceChartData = data.data;

						vm.performanceChartData = data.data.map(function(item){
							var p = item.resultado.week.split('-');
							var year = parseInt(p[0]);
							var w = parseInt(p[1]);
							var d = new Date(year, 0, (1 + (w) * 7));

							return {
								label: d,
								value: item.balance || 0//,
								//estado: item.resultado.estado
							};
						});
						//console.log('[+] vm.performanceChartData: ', vm.performanceChartData);

						vm.performanceChartData2 = data.data.map(function(item){

								var p = item.resultado.week.split('-');
								var year = parseInt(p[0]);
								var w = parseInt(p[1]);
								var d = new Date(year, 0, (1 + (w) * 7));

								return {
									label: d,
									value: item.balance || 0//,
									//estado: item.resultado.estado
								};
						});
						//console.log('[+] vm.performanceChartData2: ', vm.performanceChartData2);

						if(vm.performanceChartData !== undefined) {
							vm.filteredData1 = $filter('orderBy')($filter('filter')(vm.performanceChartData, function(item){
								//if(item.estado !== 'Finalizada') { item.value = 0};
								return item;
							}), 'label');//{ estado: 'Finalizada'}),'label')
							vm.filteredData2 = $filter('orderBy')($filter('filter')(vm.performanceChartData2, function(item){
								//if(item.estado === 'Finalizada') {item.value = 0}
								return item;
							}), 'label');

							vm.modelo1 = [
								{
									key: 'Finalizadas',
									color: '#1f77b4',
									values: vm.filteredData1,
								}];
						 } else {
						}


					});

						break;

					case 'month':
					ReportesCompras.getDataMonth(vm.monthValue, vm.SEARCH.enterprise)
					.then(function(data){
						//vm.performanceChartData = data.data;
						console.log('data in month is: ', data);
						vm.performanceChartData = data.data.resultado.balanceDia.map(function(item){
							var p = item.resultado.day.split('-');
							var year = parseInt(p[0]);
							var w = parseInt(p[1]);
							var d = new Date(year, 0);

							d = d.setDate(w);

							return {
								label: d,
								value: item.balance || 0//,
								//estado: item.resultado.estado
							};
						});

						vm.performanceChartData2 = data.data.resultado.balanceDia.map(function(item){
							var p = item.resultado.day.split('-');
							var year = parseInt(p[0]);
							var w = parseInt(p[1]);
							var d = new Date(year, 0);

							d = d.setDate(w);

							//console.log('[+] mapeando: ', d);
							return {
								label: d,
								value: item.balance || 0//,
								//estado: item.resultado.estado
							};
						});

						if(vm.performanceChartData !== undefined) {
							vm.filteredData1 = $filter('orderBy')($filter('filter')(vm.performanceChartData, function(item){
								//if(item.estado !== 'Finalizada') { item.value = 0};
								return item;
							}), 'label');//{ estado: 'Finalizada'}),'label')
							vm.filteredData2 = $filter('orderBy')($filter('filter')(vm.performanceChartData2, function(item){
								//if(item.estado === 'Finalizada') {item.value = 0}
								return item;
							}), 'label');

							vm.modelo2 = [
								{
									key: 'Finalizadas',
									color: '#1f77b4',
									values: vm.filteredData1,
								}];
						} else {
						}

					});
						break;
					default:

				}

				//});
				};
	};

    function changePeriod() {
				console.log('[+] changePeriod::fired! ', vm.performancePeriod);
        //loadData(vm.performancePeriod);
				var queries = [loadData(vm.performancePeriod)];
    }
	}
]);
