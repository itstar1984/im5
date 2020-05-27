'use strict';

angular.module('reports').config(['$stateProvider',
	function($stateProvider) {
		$stateProvider
		.state('reports', {
			abstract: true,
			url: '/reports',
			template: '<ui-view/>'
		})
		.state('reports.list', {
			url: '',
			templateUrl: 'modules/reports/views/dashboard-reports.client.view.html'
		})
	}
]);
