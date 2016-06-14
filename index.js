/*
 * gulp-tiles
 * https://github.com/dashukin/gulp-tiles
 *
 * Copyright (c) 2016 Vasili Molakhau
 * Licensed under the MIT license.
 */

var through 	= require('through2');
var util 		= require('gulp-util');
var assign		= require('object-assign');
var gm 			= require('gm');
var path 		= require('path');
var Promise		= require('promise');


var PluginError = util.PluginError;

var PLUGIN_NAME = 'gulp-tiles';

function createTiles (configuration) {

	'use strict';

	var baseConfiguration,
		baseValidationData,
		pluginConfiguration;

	baseConfiguration = {
		width: 256,
		height: 256,
		format: 'jpg',
		imageMagick: false
	};

	baseValidationData = {
		isValid: true,
		messages: []
	};

	/**
	 * @name pluginConfiguration
	 * @type {Object}
	 */

	pluginConfiguration = assign(baseConfiguration, configuration);

	return through.obj(function (file, encoding, callback) {

		var self = this,
			configurationValidation,
			_gm,
			gmFile,
			promises,
			tilePromise;

		if (file.isNull()) {
			return callback(null, file);
		}

		// TODO: check for Stream support
		if (file.isStream()) {
			return callback(new PluginError(PLUGIN_NAME, 'Streaming might not be supported.'));
		}

		configurationValidation = validateConfiguration(pluginConfiguration);

		if (!configurationValidation.isValid) {
			return callback(new PluginError(PLUGIN_NAME, configurationValidation.messages.join(' ')));
		}

		_gm = gm;

		if (pluginConfiguration.imageMagick === true) {
			_gm = gm.subClass({
				imageMagick: true
			});
		}

		promises = [];

		gmFile = createGmFile(file);

		gmFile.size(function (error, size) {

			var tilesX,
				tilesY,
				xIndex,
				yIndex;

			if (error) {
				return callback(error);
			}

			tilesX = Math.floor(size.width / pluginConfiguration.width);
			tilesY = Math.floor(size.height / pluginConfiguration.height);

			if (tilesX === 0 || tilesY === 0) {
				return callback(new PluginError(PLUGIN_NAME, 'Original image does not contain desired size of tiles.'));
			}

			for (yIndex = 0; yIndex < tilesY; yIndex += 1) {
				for (xIndex = 0; xIndex < tilesX; xIndex += 1) {

					tilePromise = createTile(file, {
						xIndex: xIndex,
						yIndex: yIndex
					}).catch(function (error) {
						return callback(error);
					});

					promises.push(tilePromise);

				}
			}

			Promise.all(promises).then(function () {
				callback(null);
			}).catch(function (error) {
				callback(error);
			});

		});

		/**
		 * Create tile.
		 * @param file {Transform}
		 * @param options {Object}
		 * @param options.xIndex {Number} x index of created tile.
		 * @param options.yIndex {Number} y index of created tile.
		 * @returns {*}
		 */
		function createTile (file, options) {

			return new Promise(function (resolve, reject) {

				var _file,
					gmFile,
					tileW,
					tileH;

				_file = file.clone({contents: false});

				tileW = pluginConfiguration.width;
				tileH = pluginConfiguration.height;

				gmFile = createGmFile(file).crop(tileW, tileH, options.xIndex * tileW, options.yIndex * tileH);

				if (pluginConfiguration.format.length) {
					gmFile = gmFile.setFormat(pluginConfiguration.format);
				}

				gmFile.toBuffer(function (err, buffer) {

					var filePath,
						fileName,
						fileExt;

					if (err) {
						reject(err);
					}

					_file.contents = buffer;

					filePath = _file.path;

					fileName = path.parse(filePath).name;

					fileExt = path.parse(filePath).ext;

					filePath = filePath.replace(fileName, fileName + options.yIndex + '_' + options.xIndex);

					filePath = filePath.replace(fileExt, '.' + pluginConfiguration.format);

					_file.path = filePath;

					self.push(_file);

					resolve();

				});

			});

		}

		/**
		 * Create GraphicsMagick file.
		 * @param file
		 */
		function createGmFile (file) {

			var _file = file.clone({contents: false});

			return _gm(file.contents, file.path);

		}

		/**
		 * Validate options passed to plugin.
		 * @param options 			{Object} Plugin options.
		 * @param options.width 	{Number} Output tile width.
		 * @param options.height 	{Number} Output tile height.
		 * @param options.format	{String} Output file format.
		 * @returns 				{Object} Validation data.
		 */
		function validateConfiguration (options) {

			var output,
				widthValidation,
				heightValidation,
				formatValidation;

			output = assign({}, baseValidationData);

			options = options || {};

			widthValidation = validateDimensionValue(options.width);
			heightValidation = validateDimensionValue(options.height);
			formatValidation = validateOutputFormat(options.format);

			[widthValidation, heightValidation, formatValidation].forEach(function (data) {
				if (data.isValid === false) {
					output.isValid = false;
					output.messages = output.messages.concat(data.messages);
				}
			});

			return output;

		}

		/**
		 * Validate dimension value.
		 * @param value {Number} Dimension value.
		 * @returns 	{Object} Validation data.
		 */
		function validateDimensionValue (value) {

			var output = assign({}, baseValidationData);

			if (typeof value !== 'number' || isNaN(value)) {
				output.isValid = false;
				output.messages.push('Dimension value should be a number.');
			}

			if (Math.floor(value) < 1) {
				output.isValid = false;
				output.messages.push('Dimension value should be greater than 1.');
			}

			return output;

		}

		/**
		 * Validate output file format.
		 * @param format 	{String} Output file format.
		 * @returns 		{Object} Validation data.
		 */
		function validateOutputFormat (format) {

			var output,
				validFormats;

			output = assign({}, baseValidationData);

			validFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];

			format = (format || '').replace(/^\s+/, '').replace(/\s+$/, '');

			if (!format.length || !~validFormats.indexOf(format)) {
				output.isValid = false;
				output.messages.push('Invalid output format. Should be one of "' + validFormats.join(', ') + '".');
			}

			return output;

		}

	});

}

module.exports = createTiles;