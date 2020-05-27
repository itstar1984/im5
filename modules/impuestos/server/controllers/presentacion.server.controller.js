'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    Presentacion = mongoose.model('Presentacion'),
    Ventas = mongoose.model('Venta'),
    Pagos = mongoose.model('Pago'),
    Compras = mongoose.model('Compra'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
var Impuesto = mongoose.model('Impuesto');
var Venta = mongoose.model('Venta');
var Compra = mongoose.model('Compra');


/**
 * Create a presentacion
 */
exports.create = function (req, res) {
    var startDate = moment().startOf('month');
    var endDate = startDate.clone().endOf('month');
    var presentacion = new Presentacion(req.body);

    presentacion.user = req.user;
    var count = 0;

    presentacion.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {          
            res.jsonp(presentacion);
        }
    });

    var centroId = mongoose.Types.ObjectId(req.body.costCenter);
    var month = (req.body.month) ? req.body.month.toString() : null;
    var year = (req.body.year) ? req.body.year.toString() : null;


    Impuesto.find({type: 'Automatico',month: month, year: year,centroDeCosto: centroId})
    .exec(function(err,impuestos){
        if(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var total = 0;
            var coEffCalc;
            var prevTotal;

            for(var i = 0; i < impuestos.length; i++){
                if(impuestos[i].automaticoType == 'brutas'){
                    total += req.body.ventasTotal;
                } else if(impuestos[i].automaticoType == 'netas') {
                    total += req.body.ventasNetas;
                }

              var coEffCalc = impuestos[i].coefficient * total;
              var prevTotal = coEffCalc;
              impuestos[i].total += coEffCalc;
             
            
              if(!impuestos[i].ajustars) {
                  impuestos[i].ajustars = {};
                  impuestos[i].ajustars[req.body.year] = {};
                  impuestos[i].ajustars[req.body.year][req.body.month] = [];
                  impuestos[i].ajustars[req.body.year][req.body.month].push({
                    created: req.body.presentacionDate,
                    price: prevTotal,//impuestos[i].total,
                    ventasType: impuestos[i].automaticoType,
                    type: impuestos[i].type,
                    saldo: impuestos[i].total,
                  });
              } else {
                if(impuestos[i].ajustars[req.body.year]) {
                   
                    var lastIndex = impuestos[i].ajustars[req.body.year][req.body.month].length - 1;
                    var lastItem = impuestos[i].ajustars[req.body.year][req.body.month];
                    var autoSaldo = lastItem[lastIndex].saldo + prevTotal;//impuestos[i].total;
                    
                    impuestos[i].ajustars[req.body.year][req.body.month].push({
                        created: req.body.presentacionDate,
                        price: prevTotal,//impuestos[i].total,
                        ventasType: impuestos[i].automaticoType,
                        type: impuestos[i].type,
                        saldo: autoSaldo
                    });
                } else {
                    impuestos[i].ajustars = {};
                    impuestos[i].ajustars[req.body.year] = {};
                    impuestos[i].ajustars[req.body.year][req.body.month] = [];
                    impuestos[i].ajustars[req.body.year][req.body.month].push({
                      created: req.body.presentacionDate,
                      price: prevTotal,//impuestos[i].total,
                      ventasType: impuestos[i].automaticoType,
                      type: impuestos[i].type,
                      saldo:  impuestos[i].total
                    });
                }
              }

              impuestos[i].markModified('ajustars');

              impuestos[i].save(function (err) {
                  if (err) {
                      return res.status(400).send({
                          message: errorHandler.getErrorMessage(err)
                      });
                  } else {
                  }
              });
            }
        }
    })
}


/**
 * Show the current presentacion impuesto.markModified('ajustars');
 */
exports.read = function(req, res) {
    res.jsonp(req.presentacion);
};

/**
 * Update a presentacion
 */
exports.update = function(req, res) {
    var presentacion = req.presentacion;

    presentacion = _.extend(presentacion, req.body);

    presentacion.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(presentacion);
        }
    });
};
/**
 * Update the total value in an presentacion
 */
exports.updateTotal = function(req, res) {
    var presentacion = req.body;
    Presentacion.findOneAndUpdate({ costCenter: presentacion.costCenter, name: presentacion.name }, { $inc: { total: presentacion.total } })
        .exec(function(err, presentacion) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(presentacion);
            }
        });
};
/**
 * Delete an presentacion
 */
exports.delete = function(req, res) {
    var presentacion = req.presentacion;

    presentacion.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(presentacion);
        }
    });
};

/**
 * List of presentacions
 */
exports.list = function (req, res) {

    var costCenter = req.query.costCenter || null;
    var month;
    var year;
    var criteria;
    if(req.query.month && req.query.year)  {
        month = req.query.month.toString();
        year = req.query.year.toString();
        criteria = { costCenter: costCenter,year: year, month: month}
    } else {
        criteria = { costCenter: costCenter}
    }

    Presentacion.find({costCenter: costCenter, month: month, year: year})
    .sort('-created')
    .populate('user', 'displayName')
    .exec(function(err, impuestos) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(impuestos);
        }
    });

};
/**
 * presentacion middleware
 */
exports.presentacionByID = function(req, res, next, id) {
    Presentacion.findById(id)
        .exec(function(err, presentacion) {
            if (err) return next(err);
            if (!presentacion) return next(new Error('Failed to load presentacion ' + id));
            req.presentacion = presentacion;
            next();
        });
};
