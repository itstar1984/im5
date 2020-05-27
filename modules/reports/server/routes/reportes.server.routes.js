'use strict';
const { getSalesReport, getPurchasesReport } = require('../controllers/report.server.controller');
const { cache } = require('../../../core/cache/index.js');


module.exports = function(app) {
    app.route('/api/reports/sales').all()
        .get(cache(1000), getSalesReport)
    app.route('/api/reports/purchases').all()
        .get(cache(1000), getPurchasesReport)
};