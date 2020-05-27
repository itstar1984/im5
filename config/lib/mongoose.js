'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
	chalk = require('chalk'),
	path = require('path'),
	mongoose = require('mongoose');

// Load the mongoose models
module.exports.loadModels = function() {
	// Globbing model files
	config.files.server.models.forEach((modelPath)=>  {
		require(path.resolve(modelPath));
	});
};

// Initialize Mongoose
module.exports.connect = async(cb) => {
	var _this = this;
	try {
		_this.loadModels();
		const db = await mongoose.connect(config.db, { useNewUrlParser: true, useCreateIndex: true });
		if (cb) cb(db);
	} catch(error) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(error);
	}
};