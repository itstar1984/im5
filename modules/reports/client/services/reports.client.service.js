angular.module('reports').factory('reports', ['$http',
	function($http) {
		return {
			getSalesReportByRange: function(enterprise, from, until) {
				return $http({
					method: 'get',
					url: `/api/reports/sales?enterprise=${enterprise}&created>${from}&created<${until}&estado=Finalizada`,
				});
			},
			getPurchasesReportByRange: function(enterprise, from, until) {
				return $http({
					method: 'get',
					url: `/api/reports/purchases?enterprise=${enterprise}&fechaRecepcion>${from}&fechaRecepcion<${until}&estado=Finalizada`,
				});
			}
		}
	}
]);
