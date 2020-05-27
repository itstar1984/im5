'use strict';

// Create Impuesto controller
angular.module('impuestos').controller('ImpuestosPresentacionController', ['$state', '$scope', '$rootScope', "$filter", '$http', '$mdDialog', '$stateParams', '$timeout', 'VentasExtra', 'ComprasExtra', 'Presentacion', 'Excel',
    function ($state, $scope, $rootScope, $filter, $http, $mdDialog, $stateParams, $timeout, VentasExtra, ComprasExtra, Presentacion, Excel) {

        $scope.$watchCollection('authentication', function () {
            $scope.findImpuestos();
        });

        $scope.editing = false;

        var getMonth = JSON.parse(localStorage.getItem("month"));
        var getYear = JSON.parse(localStorage.getItem("year"));
        $rootScope.getPeriod = getMonth.monthName + ", " + getYear.yearName;

        var costCenter = sessionStorage.getItem('centroDeCosto');
        var costCenter = localStorage.getItem('centroDeCosto');
        var year = getYear.yearName;
        var month = 0;
        var monthList = [
            { id: 0, name: 'enero' },
            { id: 1, name: 'febrero' },
            { id: 2, name: 'marzo' },
            { id: 3, name: 'abril' },
            { id: 4, name: 'mayo' },
            { id: 5, name: 'junio' },
            { id: 6, name: 'julio' },
            { id: 7, name: 'agosto' },
            { id: 8, name: 'septiembre' },
            { id: 9, name: 'octubre' },
            { id: 10, name: 'noviembre' },
            { id: 11, name: 'diciembre' }
        ];

        for (var idx = 0; idx < monthList.length; idx++) {
            if (monthList[idx].name == getMonth.monthName) {
                month = idx;
                break;
            }
        }

        $scope.findImpuestos = function () {
            Presentacion.query({ costCenter: costCenter, month: month, year: year }, function (res) {
                var newArray = [];
                for (var i = 0; i < res.length; i++) {
                    newArray.push(res[i]);
                }

                $scope.impuestos = newArray;
                //$rootScope.impuestos = res;
            });
        };


        $scope.impuestosName = $stateParams.impuestosName;
        $scope.impuestosType = $stateParams.impuestosType;
        $scope.start = true;
        $scope.impuestos = [];
        $scope.ajustars = [];


        $scope.loadmore = function () {
            $scope.loading = true;
            $scope.start = false;
            var last = $scope.impuestos.length ? $scope.impuestos[$scope.impuestos.length - 1].created : null;
            var limit = $scope.impuestos.length < 40 ? 40 : 20;
        };

        $scope.deletePresentacion = function (ev, item) {
            var confirm = $mdDialog.confirm()
                .title('¿Eliminar la impuesto?')
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .ok('Aceptar')
                .cancel('Cancelar');
            $mdDialog.show(confirm).then(function () {
                deletePresentacionFromDB(item);
            }, function () {
                //cancelo
            });
        };

        function deletePresentacionFromDB(item) {
            if (item) {
                item.$remove();
                $state.go('home.detailsPresentacion', { impuestosId: item.costCenter }, { reload: true });
            }
        }

        $scope.change_calc_netas = function(){
            $scope.editing.ventasNetas = $scope.editing.ventasTotal - $scope.editing.ivaTotal;
        }

        $scope.editPresentacion = function(item) {
            $scope.editing = item;
        };


        $scope.updatePresentacion = function(item) {
            $scope.editing = false;

            item.user = item.user._id;

            item.$update(function() {
            }, function(errorResponse) {
                console.log('error');
            });
        };

        $scope.showDialogNewPresentation = function ($event, item) {
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: 'modules/impuestos/views/nueva-presentacion.client.view.html',
                locals: {
                    item: item
                },
                controller: DialogControllerNewPre
            })
        };
        function DialogControllerNewPre($scope, $mdDialog, $http, item) {
            $scope.item = item;
            $scope.apagarBoton = false;
            $scope.present = {}

            $scope.present.ventas = 0;
            $scope.present.iva = 0;
            $scope.present.netas = 0;

            $scope.closeDialog = function () {
                $mdDialog.hide();
            };

            $scope.calc_netas = function () {
                
                $scope.present.netas = $scope.present.ventas - $scope.present.iva;
            }


            $scope.addPresent = function ($event, item) {
                if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {
                    if (($scope.present.date !== undefined) && ($scope.present.date !== null) &&
                        ($scope.present.cant !== undefined) && ($scope.present.cant !== null) &&
                        ($scope.present.ult !== undefined) && ($scope.present.ult !== null) &&
                        ($scope.present.nro !== undefined) && ($scope.present.nro !== null) &&
                        ($scope.present.ventas !== undefined) && ($scope.present.ventas !== null) &&
                        ($scope.present.iva !== undefined) && ($scope.present.iva !== null) &&
                        ($scope.present.netas !== undefined) && ($scope.present.netas !== null)
                    ) {

                        // Create new presentacion
                        var presentacion = new Presentacion({
                            presentacionDate: $scope.present.date,
                            cantComprobantes: $scope.present.cant,
                            ultComprobante: $scope.present.ult,
                            nroCierre: $scope.present.nro,
                            ventasTotal: $scope.present.ventas,
                            ivaTotal: $scope.present.iva,
                            ventasNetas: $scope.present.netas,
                            // costCenter: sessionStorage.getItem('centroDeCosto'),
                            costCenter: localStorage.getItem('centroDeCosto'),
                            month: (new Date($scope.present.date)).getMonth(),
                            year: (new Date($scope.present.date)).getFullYear()

                        });
                        // Redirect after save
                        presentacion.$save(function (response) {
                            if (response._id) {
                            }
                            alert("ppppppp")
                            // $state.go('home.detailsPresentacion', { impuestosId: sessionStorage.getItem('centroDeCosto') }, { reload: true });
                            $state.go('home.detailsPresentacion', { impuestosId: localStorage.getItem('centroDeCosto') }, { reload: true });

                        }, function (errorResponse) {
                            console.log('this is error')
                            $scope.error = errorResponse.data.message;
                        });

                        $mdDialog.hide();
                    } else {
                        alert("Please complete the fields")
                    }


                }
            }
        }
        /////////////////////////// to export in excel//////////////////////////
        $scope.exportToExcel = function (tableId) { // ex: '#my-table'
            var uri = 'data:application/vnd.ms-excel;base64,'
                , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>'
                , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
                , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }

            if (!tableId.nodeType) var table = document.getElementById(tableId)
            var ctx = { worksheet: 'name' || 'Worksheet', table: table.innerHTML }
            window.location.href = uri + base64(format(template, ctx))
        }


    }
]);