'use strict';

module.exports = function (app) {
    var presentacion = require('../controllers/presentacion.server.controller');
    var presentacionPolicy = require('../policies/presentacion.server.policy');

    app.route('/api/presentacion').all()
        .get(presentacion.list).all(presentacionPolicy.isAllowed)
        .post(presentacion.create);


    app.route('/api/presentacion/:presentacionId').all(presentacionPolicy.isAllowed)
        .get(presentacion.read)
        .put(presentacion.update)
        .delete(presentacion.delete);

    // Finish by binding the Presentacions middleware
    app.param('presentacionId', presentacion.presentacionByID);

};



