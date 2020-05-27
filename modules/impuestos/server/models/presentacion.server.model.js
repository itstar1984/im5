'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Presentacion Schema
 */
var PresentacionSchema = new Schema({
    enterprise: {
        type: String,
        ref: 'Enterprise'
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
    presentacionDate: {
        type: Date,
        default: Date.now
    }, 
    month: {
        type: String
    }, 
    year: {
        type: String
    },
    cantComprobantes: {
        type: Number,
        default: 0
    },
    ultComprobante: {
        type: Number,
        default: 0
    },
    nroCierre: {
        type: Number,
        default: 0
    },
    ventasTotal: {
        type: Number,
        default: 0
    },
    ivaTotal: {
        type: Number,
        default: 0
    },
    ventasNetas: {
        type: Number,
        enum: [5, 6]
    },
    costCenter: {
        type: Schema.ObjectId,
        ref: 'CostCenter'
    },
    operacion:{
        type:String
    }

});

mongoose.model('Presentacion', PresentacionSchema);