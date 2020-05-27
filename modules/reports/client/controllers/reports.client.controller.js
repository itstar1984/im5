'use strict';

// Reportes controller
angular.module('reports', ['ngWebworker']).controller('ReportsController', [
    '$scope',
    '$location',
    'user',
    'reports',
    'Webworker',
    function($scope, $location ,user, reports, Webworker) {
        $scope.type = $location.search().type;
        const ctrl = this;
        ctrl.date = new Date();
        ctrl.week = new Date();
        ctrl.month = new Date();
        ctrl.from = new Date();
        ctrl.until = new Date();
        ctrl.backupCostCenters;

        $scope.from = '';
        $scope.until = '';
        $scope.isFetching = false;
        $scope.costCenters = [];
        $scope.timeFilters = [
            {
                label: 'Dia',
                id: 'day',
            },
            {
                label: 'Semana',
                id: 'week',
            },
            {
                label: 'Mes',
                id: 'month',
            },
            {
                label: 'Periodo',
                id: 'period',
            }
        ];
        $scope.costCentersFilters = [];
        $scope.salesConditions = [];
        $scope.voucherTypes = [];
        $scope.productsCategories = [];
        $scope.products = [];
        $scope.clients = [];

        $scope.showProductsCategories = false;
        $scope.showProducts = false;
        $scope.showClients = false;
        $scope.showProviders = false;

        $scope.getReport = async () => {
            const { enterprise: { id } } = user;
            $scope.isFetching = true;
            const { type } = $scope;
            let response;
            if (type === 'sales') response = await reports.getSalesReportByRange(id, $scope.from, $scope.until);
            if (type === 'purchases') response = await reports.getPurchasesReportByRange(id, $scope.from, $scope.until);
            $scope.costCenters = response.data;
            $scope.getCostCenterFilters();
            ctrl.backupCostCenters = $scope.costCenters;
            $scope.getSalesCondition();
            $scope.getVoucherTypes();
            $scope.getProductsCategories();
            $scope.getProducts();
            if (type === 'sales') $scope.getClients();
            else $scope.providers = $scope.getProviders();
            $scope.resetDateFilters();
            window.dispatchEvent(new Event('resize'));
        }

        $scope.handleClickTimeFilter = (type) => {
            const { getReport, getDay, getWeek, getMonth } = $scope;
            switch(type) {
                case 'day': {
                    ctrl.date = new Date();
                    getDay(ctrl.date);
                    getReport();
                    $scope.resetButtons();
                    break;
                }
                case 'week': {
                    ctrl.week = new Date();
                    getWeek(ctrl.week);
                    getReport();
                    $scope.resetButtons();
                    break;
                }
                case 'month': {
                    ctrl.month = new Date();
                    getMonth(ctrl.month);
                    getReport();
                    $scope.resetButtons();
                    break;
                }
                case 'period': {
                    $scope.costCenters = [];
                    $scope.getCostCenterFilters();
                    $scope.getSalesCondition();
                    $scope.getVoucherTypes();
                    $scope.resetButtons();
                    break;
                }
                default:
                    break;
            }
        };

        $scope.resetButtons = () => {
            $scope.showProductsCategories = false;
            $scope.showProducts = false;
            $scope.showClients = false;
            $scope.showProviders = false;
            $scope.showProductsCategories = false;
            $scope.showProducts = false;
            $scope.showClients = false;
            $scope.showProviders = false;
        }

        $scope.handleClickButton = (type) => {
            switch(type) {
                case 'category': {
                    $scope.showProductsCategories = true;
                    $scope.showProducts = false;
                    $scope.showClients = false;
                    break;
                }
                case 'products': {
                    $scope.showProductsCategories = false;
                    $scope.showProducts = true;
                    $scope.showClients = false;
                    break;
                }
                case 'clients': {
                    $scope.showProductsCategories = false;
                    $scope.showProducts = false;
                    $scope.showClients = true;
                    break;
                }
                case 'providers': {
                    $scope.showProductsCategories = false;
                    $scope.showProducts = false;
                    $scope.showClients = false;
                    $scope.showProviders = true;
                    break;
                }
                default:
                    break;
            }
        }

        $scope.handleClickCostCentersFilter = (id) => {
            const { type } = $scope;
            $scope.costCenters = ctrl.backupCostCenters;
            if (id !== 'general') $scope.costCenters = $scope.costCenters.filter(costCenter => costCenter.id === id);
            $scope.resetButtons();
            $scope.getSalesCondition();
            $scope.getVoucherTypes();
            $scope.getProductsCategories();
            $scope.getProducts();
            if (type === 'sales') $scope.getClients();
            else $scope.getProviders();
        };

        $scope.getTotal = () => {
            return $scope.costCenters.reduce((previous, current) => (previous + current.total) ,0);
        };

        $scope.getTotalProducts = () => {
            return $scope.costCenters.reduce((previous, current) => {
                let acu = previous
                current.products.forEach((product) => {
                    acu+=product.cantidad;
                });
                return acu;
            } ,0);
        };

        $scope.getCostCenterFilters = async () => {
            function getCostCenterFilters(costCenters) {
                return [
                    {
                        id: 'general',
                        label: 'General',
                    },
                    ...costCenters.map(costCenter => ({
                        id: costCenter.id,
                        label: costCenter.name,
                    })),
                ];
            }
            const worker = Webworker.create(getCostCenterFilters);
            const result = await worker.run($scope.costCenters);
            $scope.costCentersFilters = result;
            $scope.isFetching = false;
        }

        $scope.onDatePickerChange = () => {
            const { getReport, getDay } = $scope;
            getDay(ctrl.date);
            getReport();
        }

        $scope.onChangeWeek = () => {
            const { getReport, getWeek } = $scope;
            getWeek(ctrl.week);
            getReport();
        }

        $scope.onChangeMonth = () => {
            const { getReport, getMonth } = $scope;
            getMonth(ctrl.month);
            getReport();
        }

        $scope.onChangePeriod = () => {
            const { getReport, getPeriod } = $scope;
            getPeriod();
            getReport();
        }

        $scope.getDay = (date) => {
            $scope.from = new Date(date.setHours(0,0,0,0)).toISOString();
            $scope.until = new Date(new Date($scope.from).getTime() + 60 * 60 * 24 * 1000).toISOString();
        }

        $scope.getMonth = (date) => {
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            $scope.from =  firstDay.toISOString();
            $scope.until = lastDay.toISOString();

        }

        $scope.getWeek = (date) => {
            const firstDay = new Date(date.setDate(date.getDate()-date.getDay()));
            const lastDay = new Date(date.setDate(date.getDate()+6-date.getDay()));

            $scope.from = new Date (firstDay.setHours(0,0,0,0)).toISOString();
            $scope.until = new Date (lastDay.setHours(0,0,0,0)).toISOString();
        };

        $scope.getPeriod = () => {
            $scope.from = ctrl.from;
            $scope.until = ctrl.until;
        };

        $scope.resetDateFilters = () => {
            $scope.day = undefined;
            $scope.week = undefined;
            $scope.month = undefined;
        };

        $scope.getSalesCondition = async () => {
            function getSalesCondition(costCenters) {
                return costCenters.reduce((previous, current) => {
                    let acu = previous
                    current.salesCondition.forEach((sale) => {
                        const { name, quantity, total } = sale;
                        acu[name] = {
                            name,
                            quantity: !acu[name] ? quantity : acu[name].quantity + quantity,
                            total: !acu[name] ? total : acu[name].total + total,
                        }
                    });
                    return {
                        ...previous,
                        ...acu,
                    }
                }, {})
            }
            $scope.isSalesConditionProcessing = true;
            const worker = Webworker.create(getSalesCondition);
            const result = await worker.run($scope.costCenters);
            $scope.salesConditions = result;
            $scope.isSalesConditionProcessing = false;
        }

        $scope.getVoucherTypes = async () => {
            function getVoucherTypes(costCenters) {
                return costCenters.reduce((previous, current) => {
                    let acu = previous
                    current.vouchers.forEach((voucher) => {
                        const { name, quantity, total } = voucher;
                        acu[name] = {
                            name,
                            quantity: !acu[name] ? quantity : acu[name].quantity + quantity,
                            total: !acu[name] ? total : acu[name].total + total,
                        }
                    });
                    return {
                        ...previous,
                        ...acu,
                    }
                }, {})
            }
            $scope.isVoucherTypesProcessing = true;
            const worker = Webworker.create(getVoucherTypes);
            const result = await worker.run($scope.costCenters);
            $scope.voucherTypes = result;
            $scope.isVoucherTypesProcessing = false;
        }

        $scope.getProductsCategories = async () => {
            function getProductsCategories(costCenters) {
                const productsCategories = costCenters.reduce((previous, current) => {
                    let acu = previous
                    current.products.forEach((voucher) => {
                        const { cantidad, total, product: { category2: { id, name }} } = voucher;
                        acu[id] = {
                            name,
                            quantity: !acu[id] ? cantidad : acu[id].quantity + cantidad,
                            total: !acu[id] ? total : acu[id].total + total,
                        }
                    });
                    return {
                        ...previous,
                        ...acu,
                    }
                },{});
                return Object.keys(productsCategories)
                    .map(key => productsCategories[key])
                    .sort((a, b) => b.total - a.total );
            }
            const worker = Webworker.create(getProductsCategories);
            const result = await worker.run($scope.costCenters);
            $scope.productsCategories = result;
        }

        $scope.getProducts = async () => {
            function getProducts(costCenters) {
                const products = costCenters.reduce((previous, current) => {
                    let acu = previous
                    current.products.forEach((voucher) => {
                        const { cantidad, total, product: { id, name } } = voucher;
                        acu[id] = {
                            name,
                            quantity: !acu[id] ? cantidad : acu[id].quantity + cantidad,
                            total: !acu[id] ? total : acu[id].total + total,
                        }
                    });
                    return {
                        ...previous,
                        ...acu,
                    }
                },{});
                return Object.keys(products)
                    .map(key => products[key])
                    .sort((a, b) => b.total - a.total );
            }
            const worker = Webworker.create(getProducts);
            const result = await worker.run($scope.costCenters);
            $scope.products = result;
        }

        $scope.getClients = async () => {
            function getClients(costCenters) {
                return costCenters.reduce((previous, current) => {
                    let acu = previous
                    current.products.forEach((product) => {
                        const { total, cantidad, cliente:{ _id, name } } = product;
                        acu[_id] = {
                            name,
                            quantity: !acu[_id] ? cantidad : acu[_id].quantity + cantidad,
                            total: !acu[_id] ? total : acu[_id].total + total,
                        }
                    });
                    return {
                        ...previous,
                        ...acu,
                    }
                },{});
            }
            const worker = Webworker.create(getClients);
            const result = await worker.run($scope.costCenters);
            $scope.clients = result;
        }

        $scope.getProviders = async () => {
            function getProviders(costCenters) {
                return costCenters.reduce((previous, current) => {
                    let acu = previous
                    current.products.forEach((product) => {
                        const { total, cantidad, proveedor:{ _id, name } } = product;
                        acu[_id] = {
                            name,
                            quantity: !acu[_id] ? cantidad : acu[_id].quantity + cantidad,
                            total: !acu[_id] ? total : acu[_id].total + total,
                        }
                    });
                    return {
                        ...previous,
                        ...acu,
                    }
                },{});
            }
            const worker = Webworker.create(getProviders);
            const result = await worker.run($scope.costCenters);
            $scope.providers = result;
        }
    }
]);