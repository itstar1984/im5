'use strict';

// Reportes controller
angular.module('reportes').controller('ReportesController', [
    '$scope',
    '$stateParams',
    '$location',
    '$filter',
    'user',
    'tipoReporte',
    'reportesVentas',
    'ReportesCompras',
    'Puestos',
    'Costcenters',
    '$q',
    'lodash',
    function($scope, $stateParams, $location, $filter, user, tipoReporte, reportesVentas, ReportesCompras, Puestos, Costcenters, $q, lodash) {

        //var vm = this;
        this.user = user;

        this.isDayLoading = true;
        this.isWeekLoading = true;
        this.isMonthLoading = true;
        this.isRangeLoading = false;

        var now = new Date();
        var day = getDay(now);
        var month = getMonth(now);
        var week = getWeek(now);
        this.tipo = $stateParams.tipo;
        this.date = now;
        this.weekInput = now;
        this.monthInput = now;
        this.costcenteritem = null;

        this.category = null;
        this.products = null;
        this.clients = null;
        this.clientName = 'Clientes';
        if($stateParams.tipo == 'compra')
        {   
            this.clientName = 'Proveedors';
        }
        this.puesto = function(item_detail,item){
            if(item == 'initial')
            {
                this.costcenteritem = null;
                return;
            }
            else
            {
                this.costcenteritem = item.from;    
            }
            
            if (item_detail == 'rangepickerSelected') {
                this.rangepickerSelected();
            } else {
                this.loadReportes(item_detail);
            }
        }

        this.showByCategory = function(tab) {
            this.category = "category";
            this.costcenteritem = null;
            if (tab == 'rangepickerSelected') {
                this.rangepickerSelected();
            } else {
                this.loadReportes(tab);
            }
        };

        this.showByProducts = function(tab) {
            this.products = "product";
            this.costcenteritem = null;
            if (tab == 'rangepickerSelected') {
                this.rangepickerSelected();
            } else {
                this.loadReportes(tab);
            }
        };

        this.showByClients = function(tab)
        {
             this.clients = "clients";
             this.costcenteritem = null;
            if (tab == 'rangepickerSelected') {
                this.rangepickerSelected();
            } else {
                this.loadReportes(tab);
            }
        }

        this.showByPuestCategory = function(item,item_detail)
        {
            this.category = 'category';
            this.costcenteritem = item.from;
            if(item_detail == 'rangepickerSelected')
            {
                this.rangepickerSelected();
            }
            else
            {
                this.loadReportes(item_detail);    
            }
            
        }

        this.showByPuestProducts = function(item,item_detail)
        {
            this.products = 'product';
            this.costcenteritem = item.from;
            this.loadReportes(item_detail);
        }
        this.showByPuestClients = function(item,item_detail)
        {
            this.clients = 'client';
            this.costcenteritem = item.from;
            this.loadReportes(item_detail);
        }

        this.rangepickerSelected = function() {
            if (this.dateStart && this.dateEnd) {
                this.isRangeLoading = true;
                if ($stateParams.tipo === 'venta') {
                    reportesVentas.getDataRange(getDay(this.dateStart), getDay(this.dateEnd), this.user.enterprise._id, this.category, this.products,this.clients,this.costcenter)
                        .then(angular.bind(this, function(data) {
                            if(this.costcenteritem == null)
                            {
                                this.isRangeLoading = false;
                                this.range.balance = data.data.balance;
                                this.range.byCategory = data.data.byCategory;
                                this.range.byProduct = data.data.byProduct;
                                this.range.byPuesto = data.data.byPuesto;
                                this.range.byClients = data.data.byClients;
                                this.selectedIndex = 0;    
                            }
                            else if(this.costcenteritem != null)
                            {
                                this.isRangeLoading = false;
                                this.range.puestProduct = [];
                                this.range.puestCategory = [];
                                this.range.puestClients = [];
                                for(var index =0 ;index<data.data.byPuesto.length;index++)
                                {
                                    if(this.costcenteritem == data.data.byPuesto[index].from)
                                    {
                                        this.range.puestCategory = data.data.byPuesto[index].byCategory;
                                        this.range.puestProduct = data.data.byPuesto[index].byProduct;
                                        this.range.puestClients = data.data.byPuesto[index].byClients;
                                    }
                                }
                            }
                        }))

                    if(this.costcenteritem == null)
                    {
                        reportesVentas.getDataCategoriasRange(getDay(this.dateStart), getDay(this.dateEnd), this.user.enterprise._id)
                        .then(angular.bind(this, function(data) {
                            this.range.modelcat = data.data;
                        }))
                        reportesVentas.getDataCategoriasRangePuesto(getDay(this.dateStart), getDay(this.dateEnd), this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                this.range.modelcatPuesto = data.data;
                            }))


                        reportesVentas.getDataCondiVentaRange(getDay(this.dateStart), getDay(this.dateEnd), this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                this.range.modelCondiVenta = data.data;
                            }))
                        reportesVentas.getDataCondiVentaRangePuesto(getDay(this.dateStart), getDay(this.dateEnd), this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                this.range.modelCondiVentaPuesto = data.data;
                            }))

                        reportesVentas.getDataComprobanteRange(getDay(this.dateStart), getDay(this.dateEnd), this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                this.range.modelComprobante = data.data;
                            }))
                        reportesVentas.getDataComprobanteRangePuesto(getDay(this.dateStart), getDay(this.dateEnd), this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                this.range.modelComprobantePuesto = data.data;
                            }))
 
                    }
                   
                    this.category = null;
                    this.products = null;
                    this.clients = null;
                } else {
                    ReportesCompras.getDataRange(getDay(this.dateStart), getDay(this.dateEnd), this.user.enterprise._id, this.category, this.products)
                        .then(angular.bind(this, function(data) {
                            this.isRangeLoading = false;
                            this.range.balance = data.data.balance;
                            this.range.byCategory = data.data.byCategory;
                            this.range.byProduct = data.data.byProduct;
                            this.range.byPuesto = data.data.byPuesto;
                        }))

                    ReportesCompras.getDataCategoriasRange(getDay(this.dateStart), getDay(this.dateEnd), this.user.enterprise._id).then(angular.bind(this, function(data) {
                        this.range.modelcat = data.data;
                    }));

                    this.category = null;
                    this.products = null;
                }
            }
        };

        this.monthSelected = function() {
            if (this.monthInput) {
                this.costcenteritem = null;
                this.isMonthLoading = true;
                this.monthValue = getMonth(this.monthInput);
                this.loadReportes('mes');
            }
        };

        this.weekSelected = function() {
            if (this.weekInput) {
                this.costcenteritem = null;
                this.isWeekLoading = true;
                this.weekValue = getWeek(this.weekInput);
                this.loadReportes('semana');
            }
        };

        this.datepickerSelected = function() {
            if (this.date) {
                this.costcenteritem = null;
                this.isDayLoading = true;
                this.dayValue = getDay(this.date);
                this.loadReportes('dia');
            }
        }

        this.findPuestoById = function(puestoId) {
            return lodash.find($scope.puestos, function(puesto) {
                return puesto._id === puestoId;
            });
        };
        this.findCostcenterByPuesto = function(puesto) {
            return lodash.find($scope.costcenters, function(costcenter) {
                return costcenter._id === puesto.centroDeCosto;
            });
        };
        this.findTabName = function(puestoVetas) {
            if (puestoVetas.from === "others") {
                return puestoVetas.from;
            } else {
                return this.findCostcenterByPuesto(this.findPuestoById(puestoVetas.from)).name;
            }
        };


        this.dayValue = day;
        this.monthValue = month;
        this.weekValue = week;

        this.day = {};
        this.week = {};
        this.month = {};
        this.range = {};

        this.tipoReporte = tipoReporte;
        this.getPuestos = function() {
            var deferred = $q.defer();
            Puestos.query({}, function(res) {
                $scope.puestos = res;
                Costcenters.query({}, function(data) {
                    $scope.costcenters = data;
                    deferred.resolve(true);
                    // var relatedCostCenter = $filter('filter')(data, function(item) {
                    //     return item.id === puesto.centroDeCosto;
                    // })[0];


                });
            });
            return deferred.promise;

        };
        var ctrl = this;

        this.loadReportes = function(tab) {

            this.getPuestos().then(angular.bind(this, function() {

                if ($stateParams.tipo === 'venta') {
                    if (tab == 'dia') {
                        reportesVentas.getDataDay(this.dayValue, this.user.enterprise._id, this.category, this.products,this.clients, this.costcenter)
                            .then(angular.bind(this, function(data) {

                                if(this.costcenteritem == null)
                                {
                                    this.day.balance = data.data.balance;
                                    this.day.byCategory = data.data.byCategory;
                                    this.day.byProduct = data.data.byProduct;
                                    this.day.byPuesto = data.data.byPuesto;
                                    this.day.byClients = data.data.byClients;
                                    this.isDayLoading = false;    
                                }
                                else
                                {
                                    this.isRangeLoading = false;
                                    this.day.puestProduct = [];
                                    this.day.puestCategory = [];
                                    this.day.puestClients = [];
                                    for(var index =0 ;index<data.data.byPuesto.length;index++)
                                    {
                                        if(this.costcenteritem == data.data.byPuesto[index].from)
                                        {
                                            this.day.puestCategory = data.data.byPuesto[index].byCategory;
                                            this.day.puestProduct = data.data.byPuesto[index].byProduct;
                                            this.day.puestClients = data.data.byPuesto[index].byClients;
                                        }
                                    }
                                }
                                
                            }));

                            if(this.costcenteritem == null)
                            {
                                 reportesVentas.getDataCategoriasDay(this.dayValue, this.user.enterprise._id)
                                    .then(angular.bind(this, function(data) {
                                        this.day.modelcat = data.data;
                                    }));
                                reportesVentas.getDataCondiVentaDay(this.dayValue, this.user.enterprise._id)
                                    .then(angular.bind(this, function(data) {
                                        this.day.modelCondiVenta = data.data;
                                    }));
                                reportesVentas.getDataComprobanteDay(this.dayValue, this.user.enterprise._id)
                                    .then(angular.bind(this, function(data) {
                                        this.day.modelComprobante = data.data;
                                    }));
                                reportesVentas.getDataCondiVentaDayPuesto(this.dayValue, this.user.enterprise._id)
                                    .then(angular.bind(this, function(data) {
                                        this.day.modelCondiVentaPuesto = data.data;
                                    }));
                                reportesVentas.getDataComprobanteDayPuesto(this.dayValue, this.user.enterprise._id)
                                    .then(angular.bind(this, function(data) {
                                        this.day.modelComprobantePuesto = data.data;
                                    }));

                                reportesVentas.getDataCategoriasDayPuesto(this.dayValue, this.user.enterprise._id)
                                    .then(angular.bind(this, function(data) {
                                        this.day.modelcatPuesto = data.data;
                                    }));
                            }
                       

                        this.category = null;
                        this.products = null;
                        this.clients = null;
                    } else if (tab == 'semana') {
                        reportesVentas.getDataWeek(this.weekValue, this.user.enterprise._id, this.category, this.products,this.clients,this.costcenter)
                            .then(angular.bind(this, function(data) {
                                if(this.costcenteritem == null)
                                {
                                    this.week.balance = data.data.balance;
                                    this.week.byCategory = data.data.byCategory;
                                    this.week.byProduct = data.data.byProduct;
                                    this.week.byPuesto = data.data.byPuesto;
                                    this.week.byClients = data.data.byClients;
                                    this.isWeekLoading = false;    
                                }
                                else
                                {
                                    this.isWeekLoading = false;
                                    this.week.puestProduct = [];
                                    this.week.puestCategory = [];
                                    this.week.puestClients = [];
                                    for(var index =0 ;index<data.data.byPuesto.length;index++)
                                    {
                                        if(this.costcenteritem == data.data.byPuesto[index].from)
                                        {
                                            this.week.puestCategory = data.data.byPuesto[index].byCategory;
                                            this.week.puestProduct = data.data.byPuesto[index].byProduct;
                                            this.week.puestClients = data.data.byPuesto[index].byClients;
                                        }
                                    }
                                }
                            }));

                            if(this.costcenteritem == null)
                            {
                                  reportesVentas.getDataCategoriasWeek(this.weekValue, this.user.enterprise._id)
                                    .then(angular.bind(this, function(data) {
                                        this.week.modelcat = data.data;
                                    }));

                                reportesVentas.getDataCategoriasWeekPuesto(this.weekValue, this.user.enterprise._id)
                                    .then(angular.bind(this, function(data) {
                                        this.week.modelcatPuesto = data.data;
                                    }))
                                reportesVentas.getDataCondiVentaWeek(this.weekValue, this.user.enterprise._id)
                                    .then(angular.bind(this, function(data) {
                                        this.week.modelCondiVenta = data.data;
                                    }));

                                reportesVentas.getDataCondiVentaWeekPuesto(this.weekValue, this.user.enterprise._id)
                                    .then(angular.bind(this, function(data) {
                                        this.week.modelCondiVentaPuesto = data.data;
                                    }))
                                reportesVentas.getDataComprobanteWeek(this.weekValue, this.user.enterprise._id)
                                    .then(angular.bind(this, function(data) {
                                        this.week.modelComprobante = data.data;
                                    }));

                                reportesVentas.getDataComprobanteWeekPuesto(this.weekValue, this.user.enterprise._id)
                                    .then(angular.bind(this, function(data) {
                                        this.week.modelComprobantePuesto = data.data;
                                    }))
                            }
                      

                        this.category = null;
                        this.products = null;
                        this.clients = null;
                    } else {
                        reportesVentas.getDataDetailedMonth(this.monthValue, this.user.enterprise._id, this.category, this.products,this.clients,this.costcenter)
                            .then(angular.bind(this, function(data) {
                                if(this.costcenteritem == null)
                                {
                                    this.month.balance = data.data.balance;
                                    this.month.byCategory = data.data.byCategory;
                                    this.month.byProduct = data.data.byProduct;
                                    this.month.byPuesto = data.data.byPuesto;
                                    this.month.byClients = data.data.byClients;
                                    this.isMonthLoading = false;    
                                }
                                else
                                {
                                    this.month.puestProduct = [];
                                    this.month.puestCategory = [];
                                    this.month.puestClients = [];
                                    for(var index =0 ;index<data.data.byPuesto.length;index++)
                                    {
                                        if(this.costcenteritem == data.data.byPuesto[index].from)
                                        {
                                            this.month.puestCategory = data.data.byPuesto[index].byCategory;
                                            this.month.puestProduct = data.data.byPuesto[index].byProduct;
                                            this.month.puestClients = data.data.byPuesto[index].byClients;
                                        }
                                    }
                                }
                            }));

                            if(this.costcenteritem == null)
                            {
                                reportesVentas.getDataCategoriasMonth(this.monthValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                this.month.modelcat = data.data;
                            }))

                                reportesVentas.getDataCategoriasMonthPuesto(this.monthValue, this.user.enterprise._id)
                                    .then(angular.bind(this, function(data) {
                                        this.month.modelcatPuesto = data.data;
                                    }));


                                reportesVentas.getDataCondiVentaMonth(this.monthValue, this.user.enterprise._id)
                                    .then(angular.bind(this, function(data) {
                                        this.month.modelCondiVenta = data.data;
                                    }))

                                reportesVentas.getDataCondiVentaMonthPuesto(this.monthValue, this.user.enterprise._id)
                                    .then(angular.bind(this, function(data) {
                                        this.month.modelCondiVentaPuesto = data.data;
                                    }));


                                reportesVentas.getDataComprobanteMonth(this.monthValue, this.user.enterprise._id)
                                    .then(angular.bind(this, function(data) {
                                        this.month.modelComprobante = data.data;
                                    }))

                                reportesVentas.getDataComprobanteMonthPuesto(this.monthValue, this.user.enterprise._id)
                                    .then(angular.bind(this, function(data) {
                                        this.month.modelComprobantePuesto = data.data;
                                    }));
                            }
                            this.category = null;
                            this.products = null;
                            this.clients = null;
                    }
                } else {
                    if (tab == 'dia') {
                        ReportesCompras.getDataDay(this.dayValue, this.user.enterprise._id, this.category, this.products,this.clients)
                            .then(angular.bind(this, function(data) {
                                if(this.costcenteritem == null)
                                {
                                    this.day.balance = data.data.balance;
                                    this.day.byCategory = data.data.byCategory;
                                    this.day.byProduct = data.data.byProduct;
                                    this.day.byClients = data.data.byClients;
                                    this.day.byPuesto = data.data.byPuesto;
                                    this.isDayLoading = false;    
                                }
                                else
                                {
                                    this.day.puestProduct = [];
                                    this.day.puestCategory = [];
                                    this.day.puestClients = [];
                                    for(var index =0 ;index<data.data.byPuesto.length;index++)
                                    {
                                        if(this.costcenteritem == data.data.byPuesto[index].from)
                                        {
                                            this.day.puestCategory = data.data.byPuesto[index].byCategory;
                                            this.day.puestProduct = data.data.byPuesto[index].byProduct;
                                            this.day.puestClients = data.data.byPuesto[index].byClients;
                                        }
                                    }
                                }
                                
                            }));


                        ReportesCompras.getDataCategoriasDay(this.dayValue, this.user.enterprise._id).then(angular.bind(this, function(data) {
                            this.day.modelcat = data.data;
                        }));

                        this.category = null;
                        this.products = null;
                    } else if (tab == 'semana') {
                        ReportesCompras.getDataWeek(this.weekValue, this.user.enterprise._id, this.category, this.products,this.clients)
                            .then(angular.bind(this, function(data) {
                                if(this.costcenteritem == null)
                                {
                                    this.week.balance = data.data.balance;
                                    this.week.byCategory = data.data.byCategory;
                                    this.week.byProduct = data.data.byProduct;
                                    this.week.byPuesto = data.data.byPuesto;
                                    this.week.byClients = data.data.byClients;
                                    this.isWeekLoading = false;    
                                }
                                else
                                {
                                    this.isWeekLoading = false;    
                                    this.week.puestProduct = [];
                                    this.week.puestCategory = [];
                                    this.week.puestClients = [];
                                    for(var index =0 ;index<data.data.byPuesto.length;index++)
                                    {
                                        if(this.costcenteritem == data.data.byPuesto[index].from)
                                        {
                                            this.week.puestCategory = data.data.byPuesto[index].byCategory;
                                            this.week.puestProduct = data.data.byPuesto[index].byProduct;
                                            this.week.puestClients = data.data.byPuesto[index].byClients;
                                        }
                                    }
                                }
                            }));

                        ReportesCompras.getDataCategoriasWeek(this.weekValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                this.week.modelcat = data.data;
                            }));

                        this.category = null;
                        this.products = null;
                    } else {
                        ReportesCompras.getDataDetailedMonth(this.monthValue, this.user.enterprise._id, this.category, this.products,this.clients)
                            .then(angular.bind(this, function(data) {
                                if(this.costcenteritem == null)
                                {
                                    this.month.balance = data.data.balance;
                                    this.month.byCategory = data.data.byCategory;
                                    this.month.byProduct = data.data.byProduct;
                                    this.month.byPuesto = data.data.byPuesto;
                                    this.month.byClients = data.data.byClients;
                                    this.isMonthLoading = false;    
                                }
                                else
                                {
                                    this.month.puestProduct = [];
                                    this.month.puestCategory = [];
                                    this.month.puestClients = [];
                                    for(var index =0 ;index<data.data.byPuesto.length;index++)
                                    {
                                        if(this.costcenteritem == data.data.byPuesto[index].from)
                                        {
                                            this.month.puestCategory = data.data.byPuesto[index].byCategory;
                                            this.month.puestProduct = data.data.byPuesto[index].byProduct;
                                            this.month.puestClients = data.data.byPuesto[index].byClients;
                                        }
                                    }
                                }
                            }));

                        ReportesCompras.getDataCategoriasMonth(this.monthValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                this.month.modelcat = data.data;
                            }))

                        this.category = null;
                        this.products = null;
                    }
                }
            }));
        };


        function getDay(date) {
            var start = new Date(date.getFullYear(), 0, 0);
            var diff = date - start;
            var oneDay = 1000 * 60 * 60 * 24;
            var day = Math.floor(diff / oneDay);
            var year = date.getFullYear();
            return (year + '-' + day)
        }

        function getWeek(date) {
            var temp = new Date(date);
            temp.setHours(0, 0, 0);
            temp.setDate(temp.getDate() + 4 - (temp.getDay() || 7));
            var year = date.getFullYear();
            var week = Math.ceil((((temp - new Date(temp.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
            return (year + '-' + week)
        }

        function getMonth(date) {
            var month = date.getMonth();
            var year = date.getFullYear();
            return (year + '-' + month)
        }
    }
]);