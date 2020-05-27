'use strict';

//Categories service used to communicate Categories REST endpoints
angular.module('impuestos').factory('Impuestos', ['$resource', '$http',
function($resource, $http) {
    return $resource('api/impuestos/:impuestoId', {
        impuestoId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}
]).factory('Presentacion', ['$resource', '$http',
function($resource, $http) {
    return $resource('api/presentacion/:presentacionId', {
        presentacionId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}
]).factory('ImpuestosTax', ['$http',
    function($http) {
        return {

            loadMoreImpuestos: function(impuesto, last, limit, year, month,iva,ivaVentas,ivaCompras,all) {
                return $http({
                    method: "get",
                    url: "/api/impuestos/ajustar",
                    params: {
                        impuestoId: impuesto,
                        last: last,
                        limit: limit,
                        year: year,
                        month: month,
                        IVA: iva,
                        ivaVentas: ivaVentas,
                        ivaCompras: ivaCompras,
                        all:all
                    }
                })
            }
        }
    }
]).factory('ServiceNavigation', ['$location',
    function($location) {
    var inneNavList = [];
    return {
      addNav : function(navObj) { 
        if(inneNavList.length > 0) {      
          var elempos = inneNavList.map(function(x){return x.name}).indexOf(navObj.name);
          if(elempos === -1)
            inneNavList.push(navObj);
        } else {
          inneNavList.push(navObj);
        }         
          
        window.localStorage.setItem("subNav",JSON.stringify(inneNavList));              
      },
      getNav : function() {        
          
        return (inneNavList.length > 0 ) ? inneNavList : JSON.parse(window.localStorage.getItem("subNav"));
      },
      navInit: function(val){
        
       inneNavList.splice(0);
       window.localStorage.removeItem("subNav");
      },
      back: function() {        
        if(window.localStorage.getItem("subNav")){
          inneNavList = JSON.parse(window.localStorage.getItem("subNav"))
          window.localStorage.removeItem("subNav");
        }      
        inneNavList.splice(inneNavList.length - 1, 1);
        window.localStorage.setItem("subNav",JSON.stringify(inneNavList)); 
      }
    }
  }
]).factory('Excel',function($window){
    var uri='data:application/vnd.ms-excel;base64,',
        template='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
        base64=function(s){return $window.btoa(unescape(encodeURIComponent(s)));},
        format=function(s,c){return s.replace(/{(\w+)}/g,function(m,p){return c[p];})};
    return {
        tableToExcel:function(tableId,worksheetName){
            var table=$(tableId),
                ctx={worksheet:worksheetName,table:table.html()},
                href=uri+base64(format(template,ctx));
            return href;
        }
    };
});