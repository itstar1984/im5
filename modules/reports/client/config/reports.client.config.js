'use strict';

angular.module('reports').run(['Menus',
	function(Menus) {
		Menus.addMenuItem('topbar', {
			title: 'Reports',
			state: 'reports',
			type: 'dropdown'
		});
		Menus.addSubMenuItem('topbar', 'reports', {
			title: 'Reports List',
			state: 'reports.list'
		});
		Menus.addSubMenuItem('topbar', 'reports', {
			title: 'Create report',
			state: 'report.create'
		});
	}
]);
