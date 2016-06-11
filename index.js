/*
 * grunt-tiles
 * https://github.com/dashukin/gulp-tiles
 *
 * Copyright (c) 2016 Vasili Molakhau
 * Licensed under the MIT license.
 */

var through 	= require('through2');
var util 		= require('gulp-util');
var assign		= require('object-assign');
var gulpGM 		= require('gulp-gm');
var mergeStream = require('merge-stream');


var PluginError = util.PluginError;

var PLUGIN_NAME = 'gulp-tiles';

function createTiles (configuration) {

	var baseOptions,
		options;

	baseOptions = {
		width: 256,
		height: 256,
		format: 'jpg'
	};

	options = assign(baseOptions, configuration);

	return through.obj(function (file, encoding, callback) {

		var _args = arguments.slice();

		gulpGM(function (gmFile, gmCallback) {

			var mergedStream = mergeStream();

			gmFile.size(function (error, size) {

				if (error) {
					return callback(new PluginError(PLUGIN_NAME, error));
				}

				console.log(size);

				var croppedFile;

				croppedFile = gmFile.crop(options.width, options.height);

				mergedStream.add(croppedFile);

				callback(null, mergedStream);

			});

		}).apply(null, _args);

	});

}

module.exports = createTiles;